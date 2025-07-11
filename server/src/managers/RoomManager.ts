import { Room, Player } from '../types/game'
import { Game } from '../entities/Game'

export class RoomManager {
  private rooms: Map<string, Room> = new Map()
  private nextRoomId = 1

  createRoom(): string {
    const roomId = `room_${this.nextRoomId++}`
    const room: Room = {
      id: roomId,
      players: [],
      game: new Game().getGameState(),
      lastUpdate: Date.now()
    }
    
    this.rooms.set(roomId, room)
    return roomId
  }

  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId)
  }

  getAllRooms(): Room[] {
    return Array.from(this.rooms.values())
  }

  findAvailableRoom(): string | null {
    for (const room of this.rooms.values()) {
      if (room.players.length < 2) {
        return room.id
      }
    }
    return null
  }

  addPlayerToRoom(roomId: string, player: Player): boolean {
    const room = this.rooms.get(roomId)
    if (!room || room.players.length >= 2) {
      return false
    }

    room.players.push(player)
    room.lastUpdate = Date.now()
    return true
  }

  removePlayerFromRoom(roomId: string, playerId: string): boolean {
    const room = this.rooms.get(roomId)
    if (!room) return false

    const playerIndex = room.players.findIndex(p => p.id === playerId)
    if (playerIndex === -1) return false

    room.players.splice(playerIndex, 1)
    room.lastUpdate = Date.now()

    if (room.players.length === 0) {
      this.rooms.delete(roomId)
    }

    return true
  }

  getRoomPlayerCount(roomId: string): number {
    const room = this.rooms.get(roomId)
    return room ? room.players.length : 0
  }

  updateRoomGameState(roomId: string, gameState: any): boolean {
    const room = this.rooms.get(roomId)
    if (!room) return false

    room.game = gameState
    room.lastUpdate = Date.now()
    return true
  }

  cleanupOldRooms(maxAge: number = 3600000): void {
    const now = Date.now()
    for (const [roomId, room] of this.rooms.entries()) {
      if (now - room.lastUpdate > maxAge) {
        this.rooms.delete(roomId)
      }
    }
  }

  getRoomCount(): number {
    return this.rooms.size
  }

  getTotalPlayerCount(): number {
    return Array.from(this.rooms.values()).reduce((total, room) => total + room.players.length, 0)
  }
}
