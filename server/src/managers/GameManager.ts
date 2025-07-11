import { Server, Socket } from 'socket.io'
import { Game } from '../entities/Game'
import { 
  ServerToClientEvents, 
  ClientToServerEvents, 
  InterServerEvents, 
  SocketData,
  GameStatus 
} from '../types/game'

export class GameManager {
  private game: Game
  private io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>
  private gameStateInterval: NodeJS.Timeout | null = null

  constructor(io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>) {
    this.io = io
    this.game = new Game()
    this.startGameStatebroadcasting()
  }

  handlePlayerJoin(socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>): void {
    console.log(`Player ${socket.id} attempting to join game`)

    if (this.game.isFull()) {
      socket.emit('gameFull')
      socket.disconnect()
      return
    }

    const side = this.game.addPlayer(socket.id)
    if (!side) {
      socket.emit('gameFull')
      socket.disconnect()
      return
    }

    socket.data = {
      playerId: socket.id,
      side: side
    }

    console.log(`Player ${socket.id} joined as ${side} paddle`)

    // Send assignment only to the joining player
    socket.emit('playerJoined', { playerId: socket.id, side })

    const gameStatus = this.game.getStatus()
    switch (gameStatus) {
      case GameStatus.WAITING_FOR_OPPONENT:
        socket.emit('waitingForOpponent')
        break
      case GameStatus.PLAYING:
        this.io.emit('gameStart')
        break
    }

    this.setupPlayerEventListeners(socket)
  }

  private setupPlayerEventListeners(socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>): void {
    socket.on('paddleMove', (data) => {
      this.game.movePaddle(socket.id, data.direction)
    })

    socket.on('ready', () => {
      console.log(`Player ${socket.id} is ready`)
    })

    socket.on('disconnect', () => {
      console.log(`Player ${socket.id} disconnected`)
      this.handlePlayerLeave(socket)
    })
  }

  private handlePlayerLeave(socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>): void {
    this.game.removePlayer(socket.id)
    
    this.io.emit('playerLeft', { playerId: socket.id })

    const gameStatus = this.game.getStatus()
    switch (gameStatus) {
      case GameStatus.WAITING:
        break
      case GameStatus.WAITING_FOR_OPPONENT:
        this.io.emit('waitingForOpponent')
        break
    }
  }

  private startGameStatebroadcasting(): void {
    if (this.gameStateInterval) {
      clearInterval(this.gameStateInterval)
    }

    this.gameStateInterval = setInterval(() => {
      const gameState = this.game.getGameState()
      
      if (this.game.getPlayers().length > 0) {
        this.io.emit('gameState', gameState)
      }

      if (gameState.status === GameStatus.GAME_OVER) {
        const winner = this.game.getWinner()
        if (winner) {
          this.io.emit('gameOver', { winner })
        }
      }
    }, 50)
  }

  getGameState() {
    return this.game.getGameState()
  }

  getPlayersCount(): number {
    return this.game.getPlayers().length
  }

  destroy(): void {
    if (this.gameStateInterval) {
      clearInterval(this.gameStateInterval)
    }
    this.game.destroy()
  }
}
