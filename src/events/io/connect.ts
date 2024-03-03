import { Socket } from "socket.io"
import { handleSocketEvents } from "../../functions/handleEvents.js"

export default {
    name: "connect",
    execute(socket: Socket) {
        console.log("Socket connected")

        handleSocketEvents(socket)
    }
}