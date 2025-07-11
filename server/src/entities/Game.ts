import { GameState, GameStatus, Player, Score, GAME_CONFIG } from '../types/game'
import { Ball } from './Ball'
import { Paddle } from './Paddle'

export class Game {
  private ball: Ball
  private leftPaddle: Paddle
  private rightPaddle: Paddle
  private score: Score
  private status: GameStatus
  private players: Player[]
  private gameLoop: NodeJS.Timeout | null = null
  private lastUpdate: number = 0

  constructor() {
    this.ball = new Ball()
    this.leftPaddle = new Paddle('left')
    this.rightPaddle = new Paddle('right')
    this.score = { left: 0, right: 0 }
    this.status = GameStatus.WAITING
    this.players = []
  }

  addPlayer(playerId: string): 'left' | 'right' | null {
    if (this.players.length >= 2) {
      return null
    }

    const side = this.players.length === 0 ? 'left' : 'right'
    const player: Player = {
      id: playerId,
      side,
      ready: false
    }

    this.players.push(player)
    
    if (this.players.length === 1) {
      this.status = GameStatus.WAITING_FOR_OPPONENT
    } else if (this.players.length === 2) {
      this.status = GameStatus.PLAYING
      this.startGame()
    }

    return side
  }

  removePlayer(playerId: string): void {
    this.players = this.players.filter(p => p.id !== playerId)
    
    if (this.players.length === 0) {
      this.status = GameStatus.WAITING
      this.stopGame()
    } else if (this.players.length === 1) {
      this.status = GameStatus.WAITING_FOR_OPPONENT
      this.stopGame()
    }
  }

  movePaddle(playerId: string, direction: 'up' | 'down'): void {
    const player = this.players.find(p => p.id === playerId)
    if (!player || this.status !== GameStatus.PLAYING) return

    const paddle = player.side === 'left' ? this.leftPaddle : this.rightPaddle
    
    if (direction === 'up') {
      paddle.moveUp()
    } else {
      paddle.moveDown()
    }
  }

  private startGame(): void {
    if (this.gameLoop) {
      clearInterval(this.gameLoop)
    }

    this.resetGame()
    this.status = GameStatus.PLAYING
    this.lastUpdate = Date.now()

    this.gameLoop = setInterval(() => {
      this.update()
    }, GAME_CONFIG.TICK_RATE)
  }

  private stopGame(): void {
    if (this.gameLoop) {
      clearInterval(this.gameLoop)
      this.gameLoop = null
    }
  }

  private resetGame(): void {
    this.ball.reset()
    this.leftPaddle.reset()
    this.rightPaddle.reset()
    this.score = { left: 0, right: 0 }
  }

  private update(): void {
    if (this.status !== GameStatus.PLAYING) return

    this.ball.update()

    if (this.ball.checkPaddleCollision(this.leftPaddle)) {
      this.ball.handlePaddleCollision(this.leftPaddle)
    } else if (this.ball.checkPaddleCollision(this.rightPaddle)) {
      this.ball.handlePaddleCollision(this.rightPaddle)
    }

    const outOfBounds = this.ball.isOutOfBounds()
    if (outOfBounds) {
      if (outOfBounds === 'left') {
        this.score.right++
      } else {
        this.score.left++
      }

      if (this.score.left >= GAME_CONFIG.WINNING_SCORE || this.score.right >= GAME_CONFIG.WINNING_SCORE) {
        this.status = GameStatus.GAME_OVER
        this.stopGame()
      } else {
        this.ball.reset()
      }
    }

    this.lastUpdate = Date.now()
  }

  getGameState(): GameState {
    return {
      ball: {
        x: this.ball.x,
        y: this.ball.y,
        vx: this.ball.vx,
        vy: this.ball.vy,
        radius: this.ball.radius
      },
      leftPaddle: {
        x: this.leftPaddle.x,
        y: this.leftPaddle.y,
        width: this.leftPaddle.width,
        height: this.leftPaddle.height,
        speed: this.leftPaddle.speed
      },
      rightPaddle: {
        x: this.rightPaddle.x,
        y: this.rightPaddle.y,
        width: this.rightPaddle.width,
        height: this.rightPaddle.height,
        speed: this.rightPaddle.speed
      },
      score: { ...this.score },
      status: this.status
    }
  }

  getWinner(): 'left' | 'right' | null {
    if (this.status !== GameStatus.GAME_OVER) return null
    return this.score.left > this.score.right ? 'left' : 'right'
  }

  getPlayers(): Player[] {
    return [...this.players]
  }

  getStatus(): GameStatus {
    return this.status
  }

  isFull(): boolean {
    return this.players.length >= 2
  }

  destroy(): void {
    this.stopGame()
  }
}
