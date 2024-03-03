import v, { Vec3 } from "vec3";
import { createSocketEvent } from "../../functions/handleEvents.js";
import { io } from "../../index.js";
import { RoomConfig } from "../../utils/rooms.js";

export default createSocketEvent({
    name: "players",
    hostOnly: true,
    async execute(_socket, room, players) {
        room.players = players;
        const sockets = await io.in(room.owner).fetchSockets()

        for (let socket of sockets) {
            // All members on the room

            const { playerId: _playerId, username } = socket.handshake.auth ?? {}

            if (players[_playerId]) {
                let _players: Record<string, any> = {}
                const playerPos = v(players[_playerId].pos);
                const leftEar = playerPos.clone().subtract(v(players[_playerId].right).scale(0.5));
                const rightEar = playerPos.clone().add(v(players[_playerId].right).scale(0.5));
                for (let player in players) {
                    if (player == _playerId) continue;

                    const currentPlayerPos = v(players[player].pos)
                    
                    const stereoPannerValue = currentPlayerPos.distanceTo(leftEar) - currentPlayerPos.distanceTo(rightEar)
                    
                    const volume = calculateVolume(playerPos, currentPlayerPos, room.config)

                    const _socket = sockets.find(socket => socket.handshake.auth.playerId == player)

                    if (_socket) {
                        _players[player] = {
                            id: player,
                            username: _socket.handshake.auth.username,
                            audioConfig: {
                                stereoPannerValue,
                                volume
                            }
                        }
                    }
                }
                socket.emit("players", _players)
            }
        }
    }
})

function calculateVolume(p1: Vec3, p2: Vec3, config: RoomConfig) {
    if (config.maxDistance > config.falloffDistance) {
        return Math.min(Math.max(config.maxDistance - (p1.distanceTo(p2) - config.falloffDistance), 0) / config.maxDistance, 1)
    }
    return Math.max(config.maxDistance - p1.distanceTo(p2), 0) / config.maxDistance
}
