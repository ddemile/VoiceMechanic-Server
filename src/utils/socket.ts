import { RoomConfig } from "./rooms.js";

export type EventsMap = {
    players: (players: any) => unknown,
    room_config: (config: Partial<RoomConfig>) => unknown,
    peer_list: (peers: Record<string, any>[]) => unknown
}