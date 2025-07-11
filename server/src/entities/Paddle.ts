import { Paddle as PaddleInterface, GAME_CONFIG } from '../types/game'

export class Paddle implements PaddleInterface {
  public x: number
  public y: number
  public width: number
  public height: number
  public speed: number

  constructor(side: 'left' | 'right') {
    this.width = GAME_CONFIG.PADDLE_WIDTH
    this.height = GAME_CONFIG.PADDLE_HEIGHT
    this.speed = GAME_CONFIG.PADDLE_SPEED
    
    if (side === 'left') {
      this.x = 20
    } else {
      this.x = GAME_CONFIG.CANVAS_WIDTH - this.width - 20
    }
    
    this.y = (GAME_CONFIG.CANVAS_HEIGHT - this.height) / 2
  }

  moveUp(): void {
    this.y = Math.max(0, this.y - this.speed)
  }

  moveDown(): void {
    this.y = Math.min(GAME_CONFIG.CANVAS_HEIGHT - this.height, this.y + this.speed)
  }

  getCenterY(): number {
    return this.y + this.height / 2
  }

  reset(): void {
    this.y = (GAME_CONFIG.CANVAS_HEIGHT - this.height) / 2
  }
}
