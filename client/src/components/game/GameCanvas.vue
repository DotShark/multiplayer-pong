<template>
  <canvas
    ref="canvasRef"
    :width="GAME_CONFIG.CANVAS_WIDTH"
    :height="GAME_CONFIG.CANVAS_HEIGHT"
    class="border-2 border-white bg-black rounded"
    @keydown="handleKeyDown"
    tabindex="0"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import { useSocket } from '@/composables/useSocket'
import { GAME_CONFIG, GameStatus } from '@/types/game'

const gameStore = useGameStore()
const { movePaddle } = useSocket()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const ctx = ref<CanvasRenderingContext2D | null>(null)
const animationId = ref<number | null>(null)

onMounted(() => {
  if (canvasRef.value) {
    ctx.value = canvasRef.value.getContext('2d')
    canvasRef.value.focus()
    startRenderLoop()
  }
})

onUnmounted(() => {
  if (animationId.value) {
    cancelAnimationFrame(animationId.value)
  }
})

function handleKeyDown(event: KeyboardEvent) {
  event.preventDefault()
  
  if (gameStore.gameState.status !== GameStatus.PLAYING) return
  
  const key = event.key.toLowerCase()
    
  if ((key === 'w' || key === 'arrowup') && gameStore.playerSide) {
    movePaddle('up')
  } else if ((key === 's' || key === 'arrowdown') && gameStore.playerSide) {
    movePaddle('down')
  }
}

function startRenderLoop() {
  function render() {
    if (ctx.value && canvasRef.value) {
      drawGame()
    }
    animationId.value = requestAnimationFrame(render)
  }
  render()
}

function drawGame() {
  if (!ctx.value || !canvasRef.value) return

  const { gameState } = gameStore
  const canvas = canvasRef.value
  const context = ctx.value

  // Update interpolation before drawing
  gameStore.updateInterpolation()

  // Clear canvas
  context.clearRect(0, 0, canvas.width, canvas.height)

  // Draw center line
  context.strokeStyle = '#ffffff'
  context.lineWidth = 2
  context.setLineDash([10, 10])
  context.beginPath()
  context.moveTo(canvas.width / 2, 0)
  context.lineTo(canvas.width / 2, canvas.height)
  context.stroke()
  context.setLineDash([])

  // Draw paddles
  context.fillStyle = '#ffffff'
  
  // Left paddle
  context.fillRect(
    gameState.leftPaddle.x,
    gameState.leftPaddle.y,
    gameState.leftPaddle.width,
    gameState.leftPaddle.height
  )
  
  // Right paddle
  context.fillRect(
    gameState.rightPaddle.x,
    gameState.rightPaddle.y,
    gameState.rightPaddle.width,
    gameState.rightPaddle.height
  )

  // Draw ball using interpolated position
  const interpolatedBall = gameStore.interpolatedBall
  context.fillStyle = '#ffffff'
  context.beginPath()
  context.arc(
    interpolatedBall.x,
    interpolatedBall.y,
    interpolatedBall.radius,
    0,
    2 * Math.PI
  )
  context.fill()

  // Draw score
  context.fillStyle = '#ffffff'
  context.font = '32px Arial'
  context.textAlign = 'center'
  
  // Left score
  context.fillText(
    gameState.score.left.toString(),
    canvas.width / 4,
    50
  )
  
  // Right score
  context.fillText(
    gameState.score.right.toString(),
    (canvas.width * 3) / 4,
    50
  )

  // Draw game status overlay
  if (gameState.status !== GameStatus.PLAYING) {
    drawStatusOverlay()
  }
}

function drawStatusOverlay() {
  if (!ctx.value || !canvasRef.value) return

  const canvas = canvasRef.value
  const context = ctx.value
  
  // Semi-transparent overlay
  context.fillStyle = 'rgba(0, 0, 0, 0.7)'
  context.fillRect(0, 0, canvas.width, canvas.height)

  // Status text
  context.fillStyle = '#ffffff'
  context.font = '24px Arial'
  context.textAlign = 'center'
  
  let statusText = ''
  let subText = ''
  
  switch (gameStore.gameState.status) {
    case GameStatus.WAITING:
      statusText = 'Waiting for players...'
      subText = 'Connect to join the game'
      break
    case GameStatus.WAITING_FOR_OPPONENT:
      statusText = 'Waiting for opponent...'
      subText = `You are the ${gameStore.playerSide} player`
      break
    case GameStatus.GAME_OVER:
      statusText = 'Game Over!'
      subText = `${gameStore.winner === 'left' ? 'Left' : 'Right'} player wins!`
      break
  }
  
  context.fillText(statusText, canvas.width / 2, canvas.height / 2 - 20)
  
  if (subText) {
    context.font = '16px Arial'
    context.fillText(subText, canvas.width / 2, canvas.height / 2 + 20)
  }
}
</script>

<style scoped>
canvas {
  outline: none;
}
</style>
