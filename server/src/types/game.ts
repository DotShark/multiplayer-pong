export interface GameState {
  ball: Ball
  leftPaddle: Paddle
  rightPaddle: Paddle
  score: Score
  status: GameStatus
}

export interface Ball {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
}

export interface Paddle {
  x: number
  y: number
  width: number
  height: number
  speed: number
}

export interface Score {
  left: number
  right: number
}

export enum GameStatus {
  WAITING = 'waiting',
  WAITING_FOR_OPPONENT = 'waiting_for_opponent',
  PLAYING = 'playing',
  GAME_OVER = 'game_over'
}

export interface Player {
  id: string
  side: 'left' | 'right'
  ready: boolean
}

export interface Room {
  id: string
  players: Player[]
  game: GameState
  lastUpdate: number
}

export interface ServerToClientEvents {
  gameState: (gameState: GameState) => void
  waitingForOpponent: () => void
  gameStart: () => void
  gameOver: (data: { winner: 'left' | 'right' }) => void
  gameFull: () => void
  playerJoined: (data: { playerId: string; side: 'left' | 'right' }) => void
  playerLeft: (data: { playerId: string }) => void
}

export interface ClientToServerEvents {
  paddleMove: (data: { direction: 'up' | 'down' }) => void
  ready: () => void
  joinGame: () => void
}

export interface InterServerEvents {
}

export interface SocketData {
  playerId: string
  side?: 'left' | 'right'
}

export const GAME_CONFIG = {
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 400,
  PADDLE_WIDTH: 15,
  PADDLE_HEIGHT: 80,
  BALL_RADIUS: 7.5,
  BALL_SPEED: 5,
  PADDLE_SPEED: 8,
  WINNING_SCORE: 5,
  TICK_RATE: 50,
  BALL_SPEED_INCREASE: 0.1
}
