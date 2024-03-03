import fs, { existsSync } from 'node:fs';
import { Socket } from 'socket.io';
import { io, roomManager } from '../index.js';
import { Room } from '../utils/rooms.js';
import { EventsMap } from '../utils/socket.js';

const socketEvents = new Map()

export async function handleEvents() {
    if (!existsSync("./dist/events")) return;
    const eventFolders = fs.readdirSync(`./dist/events`)
    for (const folder of eventFolders) {
        const eventFiles = fs.readdirSync(`./dist/events/${folder}`).filter(file => file.endsWith('.js'))

        switch (folder) {
            case "io":
                for await (const file of eventFiles) {
                    const event = (await import(`../events/${folder}/${file}`)).default;
                    if (event.once) io.once(event.name, (...args: unknown[]) => event.execute(...args));
                    else io.on(event.name, (...args: unknown[]) => event.execute(...args));
                }
                break;

            case "socket":
                for await (const file of eventFiles) {
                    const event = (await import(`../events/${folder}/${file}`)).default;
                    socketEvents.set(event.name, event)
                }
                break;
        

            default:
                break;
        }
    }
}

export function handleSocketEvents(socket: Socket) {
    const { username, isHost, playerId } = socket.handshake.auth ?? {}
    console.log(`A user connected as ${username} | Is host: ${socket.handshake.auth.isHost}`)

    let room = isHost ? roomManager.get(username)! : Array.from(roomManager.values()).find(({ players }) => players[playerId])!;

    socketEvents.forEach((event, eventName) => {
        if (event.hostOnly && !isHost) return;

        if (event.once) {
            socket.once(eventName, (...args: unknown[]) => event.execute(socket, room, ...args))
        } else {
            socket.on(eventName, (...args: unknown[]) => event.execute(socket, room, ...args));
        }
    })
}

type SocketEvent<T extends keyof EventsMap = "players"> = {
    name: T;
    hostOnly?: boolean;
    once?: boolean;
    execute: (socket: Socket, room: Room, ...args: Parameters<EventsMap[T]>) => ReturnType<EventsMap[T]>
};

export function createSocketEvent<T extends keyof EventsMap>(event: SocketEvent<T>): SocketEvent<T> {
    return event;
}