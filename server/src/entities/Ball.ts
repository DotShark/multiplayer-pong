import { Ball as BallInterface, GAME_CONFIG } from '../types/game'

export class Ball implements BallInterface {
  public x: number = 0
  public y: number = 0
  public vx: number = 0
  public vy: number = 0
  public radius: number

  constructor() {
    this.radius = GAME_CONFIG.BALL_RADIUS
    this.reset()
  }

  reset(): void {
    this.x = GAME_CONFIG.CANVAS_WIDTH / 2
    this.y = GAME_CONFIG.CANVAS_HEIGHT / 2
    
    const direction = Math.random() < 0.5 ? -1 : 1
    this.vx = GAME_CONFIG.BALL_SPEED * direction
    this.vy = (Math.random() - 0.5) * GAME_CONFIG.BALL_SPEED
  }

  update(): void {
    this.x += this.vx
    this.y += this.vy

    if (this.y - this.radius <= 0 || this.y + this.radius >= GAME_CONFIG.CANVAS_HEIGHT) {
      this.vy = -this.vy
      this.y = Math.max(this.radius, Math.min(GAME_CONFIG.CANVAS_HEIGHT - this.radius, this.y))
    }
  }

  checkPaddleCollision(paddle: { x: number; y: number; width: number; height: number }): boolean {
    return (
      this.x - this.radius <= paddle.x + paddle.width &&
      this.x + this.radius >= paddle.x &&
      this.y - this.radius <= paddle.y + paddle.height &&
      this.y + this.radius >= paddle.y
    )
  }

  handlePaddleCollision(paddle: { x: number; y: number; width: number; height: number }): void {
    const relativeIntersectY = (this.y - (paddle.y + paddle.height / 2)) / (paddle.height / 2)
    const maxAngle = Math.PI / 4
    const angle = relativeIntersectY * maxAngle
    const direction = this.x < GAME_CONFIG.CANVAS_WIDTH / 2 ? 1 : -1
    
    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy)
    this.vx = Math.cos(angle) * speed * direction
    this.vy = Math.sin(angle) * speed
    
    this.vx *= (1 + GAME_CONFIG.BALL_SPEED_INCREASE)
    this.vy *= (1 + GAME_CONFIG.BALL_SPEED_INCREASE)
    
    if (direction === 1) {
      this.x = paddle.x + paddle.width + this.radius
    } else {
      this.x = paddle.x - this.radius
    }
  }

  isOutOfBounds(): 'left' | 'right' | null {
    if (this.x < 0) return 'left'
    if (this.x > GAME_CONFIG.CANVAS_WIDTH) return 'right'
    return null
  }
}
