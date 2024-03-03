import { PeerServer } from "peer";
import { Server } from "socket.io";
import { handleEvents } from "./functions/handleEvents.js";
import { RoomManager } from "./utils/rooms.js";
import { EventsMap } from "./utils/socket.js";

const PORT = Number(process.env.PORT) || 3000

const peerServer = PeerServer({ port: PORT, path: "/", host: "::" })

export const io = new Server<EventsMap>({
    cors: {
        origin: "*"
    }
})

export const roomManager = new RoomManager()


io.use((socket, next) => {
    const { username, isHost, playerId } = socket.handshake.auth ?? {}

    if (!isHost) {
        let room = Array.from(roomManager.values()).find(({ players }) => players[playerId])

        if (!room) return next(new Error("Room not found"))
    } else {
        roomManager.get(username) ?? roomManager.createRoom(username, {})
    }

    next()
})

io.on("connection", async (socket) => {
    const { username, isHost, playerId } = socket.handshake.auth ?? {}
    console.log(`A user connected as ${username} | Is host: ${socket.handshake.auth.isHost}`)

    let room = isHost ? roomManager.get(username)! : Array.from(roomManager.values()).find(({ players }) => players[playerId])!;

    socket.join(room.owner)
    emitPeers()

    socket.emit("room_config", room.config)

    socket.on("disconnect", async () => {
        console.log("A user disconnected")
        const sockets = await io.in(room.owner).fetchSockets()

        if (sockets.length == 0) {
            roomManager.deleteRoom(room.owner)
        }
    })

    async function emitPeers() {
        console.log("Emitting peers")

        const sockets = await io.in(room.owner).fetchSockets()

        const peers = sockets.filter(({ id, handshake }) => id != socket.id && handshake.auth.peerId).map(socket => socket.handshake.auth)

        socket.emit("peer_list", peers)
    }
})

handleEvents().then(() => {
    io.listen(7001)
    console.log("Server listening")
})