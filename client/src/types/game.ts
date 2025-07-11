// Shared types for multiplayer Pong game
export interface GameState {
  ball: { x: number; y: number; vx: number; vy: number }
  leftPaddle: { y: number }
  rightPaddle: { y: number }
  score: { left: number; right: number }
}

export interface Player {
  id: string
  side: 'left' | 'right'
  ready: boolean
}

export type GameStatus = 'waiting' | 'waitingForOpponent' | 'playing' | 'gameOver'
export type ConnectionState = 'disconnected' | 'connecting' | 'connected'

export interface SocketEvents {
  // Client → Server
  paddle_move: { direction: 'up' | 'down' }
  ready: {}
  
  // Server → Client
  game_state: GameState
  waiting_for_opponent: {}
  game_start: {}
  game_over: { winner: 'left' | 'right' }
  game_full: {}
}
