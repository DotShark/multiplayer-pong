import { ref, onMounted, onUnmounted } from 'vue'

interface InterpolationTarget {
  x: number
  y: number
  vx?: number
  vy?: number
}

export function useGameLoop() {
  const isRunning = ref(false)
  const lastTime = ref(0)
  const frameId = ref<number | null>(null)
  
  const interpolationFactor = 0.1 // Smooth interpolation factor

  const startLoop = (updateCallback: (deltaTime: number) => void) => {
    if (isRunning.value) return

    isRunning.value = true
    lastTime.value = performance.now()

    const gameLoop = (currentTime: number) => {
      const deltaTime = currentTime - lastTime.value
      lastTime.value = currentTime

      updateCallback(deltaTime)

      if (isRunning.value) {
        frameId.value = requestAnimationFrame(gameLoop)
      }
    }

    frameId.value = requestAnimationFrame(gameLoop)
  }

  const stopLoop = () => {
    isRunning.value = false
    if (frameId.value) {
      cancelAnimationFrame(frameId.value)
      frameId.value = null
    }
  }

  const interpolate = (current: InterpolationTarget, target: InterpolationTarget): InterpolationTarget => {
    return {
      x: current.x + (target.x - current.x) * interpolationFactor,
      y: current.y + (target.y - current.y) * interpolationFactor,
      vx: target.vx !== undefined ? current.vx! + (target.vx - current.vx!) * interpolationFactor : undefined,
      vy: target.vy !== undefined ? current.vy! + (target.vy - current.vy!) * interpolationFactor : undefined
    }
  }

  const calculateFPS = (() => {
    const frameTimes: number[] = []
    let lastFrameTime = 0

    return (currentTime: number) => {
      const deltaTime = currentTime - lastFrameTime
      lastFrameTime = currentTime
      
      frameTimes.push(deltaTime)
      if (frameTimes.length > 60) {
        frameTimes.shift()
      }
      
      const avgDelta = frameTimes.reduce((sum, time) => sum + time, 0) / frameTimes.length
      return Math.round(1000 / avgDelta)
    }
  })()

  onUnmounted(() => {
    stopLoop()
  })

  return {
    isRunning,
    startLoop,
    stopLoop,
    interpolate,
    calculateFPS
  }
}
