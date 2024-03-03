import { createSocketEvent } from "../../functions/handleEvents.js";

export default createSocketEvent({
    name: "room_config",
    hostOnly: true,
    async execute(socket, room, config) {
        console.log("Room config", config)
        room.config = { ...room.config, ...config }

        socket.broadcast.in(room.owner).emit("room_config", config)
    }
})