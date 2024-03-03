import { EventEmitter } from "node:events";

export class Room {
    public owner: string;
    public players: Record<string, any>
    public config = {
        maxDistance: 50,
        falloffDistance: 5
    }

    constructor(owner: string, players: typeof Room.prototype.players) {
        this.owner = owner;
        this.players = players;
    }
}

export type RoomConfig = typeof Room.prototype.config

export class RoomManager extends EventEmitter {
    public rooms = new Map<string, Room>()

    constructor() {
        super()
    }

    public createRoom(owner: string, players: typeof Room.prototype.players) {
        console.log(`Creating room with id: ${owner}`)

        const room = new Room(owner, players)

        this.rooms.set(owner, room)
        this.emit("roomCreated", room)
        return room;
    }

    public get(owner: string) {
        return this.rooms.get(owner)
    }

    public has(owner: string) {
        return this.rooms.has(owner)
    }

    public set(owner: string, room: Room) {
        this.rooms.set(owner, room)
    }

    public values() {
        return this.rooms.values()
    }

    public deleteRoom(owner: string) {
        console.log(`Deleting room with id: ${owner}`)

        this.rooms.delete(owner)
    }
}
