import { ref, reactive, computed } from 'vue'
import { GAME_CONFIG, type Ball } from '@/types/game'

interface InterpolationState {
  previousBall: Ball | null
  currentBall: Ball | null
  nextBall: Ball | null
  lastUpdateTime: number
  interpolationFactor: number
}

export function useInterpolation() {
  const state = reactive<InterpolationState>({
    previousBall: null,
    currentBall: null,
    nextBall: null,
    lastUpdateTime: 0,
    interpolationFactor: 0
  })

  // This will hold the interpolated ball position for rendering
  const interpolatedBall = computed(() => {
    if (!state.currentBall || !state.nextBall) {
      return state.currentBall || state.nextBall || { x: 400, y: 200, vx: 0, vy: 0, radius: 7.5 }
    }

    // If current and next are the same (teleported), don't interpolate
    if (state.currentBall.x === state.nextBall.x && state.currentBall.y === state.nextBall.y) {
      return state.nextBall
    }

    // Linear interpolation between current and next position
    const factor = Math.min(state.interpolationFactor, 1.0)
    
    return {
      x: lerp(state.currentBall.x, state.nextBall.x, factor),
      y: lerp(state.currentBall.y, state.nextBall.y, factor),
      vx: state.nextBall.vx,
      vy: state.nextBall.vy,
      radius: state.nextBall.radius
    }
  })

  function lerp(start: number, end: number, factor: number): number {
    return start + (end - start) * factor
  }

  function updateServerState(newBall: Ball) {
    const now = performance.now()
    
    // Check if ball was teleported (large distance jump)
    const TELEPORT_THRESHOLD = 100 // pixels
    const wasTeleported = state.nextBall && (
      Math.abs(newBall.x - state.nextBall.x) > TELEPORT_THRESHOLD ||
      Math.abs(newBall.y - state.nextBall.y) > TELEPORT_THRESHOLD
    )
    
    if (wasTeleported) {
      // Skip interpolation for teleported ball - jump directly
      state.previousBall = null
      state.currentBall = { ...newBall }
      state.nextBall = { ...newBall }
    } else {
      // Normal interpolation - shift the states
      state.previousBall = state.currentBall
      state.currentBall = state.nextBall
      state.nextBall = { ...newBall }
    }
    
    state.lastUpdateTime = now
    state.interpolationFactor = 0
  }

  function updateInterpolation() {
    if (!state.currentBall || !state.nextBall || state.lastUpdateTime === 0) {
      return
    }

    const now = performance.now()
    const timeSinceUpdate = now - state.lastUpdateTime
    
    // Calculate interpolation factor based on time since last server update
    state.interpolationFactor = timeSinceUpdate / GAME_CONFIG.TICK_INTERVAL
  }

  function reset() {
    state.previousBall = null
    state.currentBall = null
    state.nextBall = null
    state.lastUpdateTime = 0
    state.interpolationFactor = 0
  }

  return {
    interpolatedBall,
    updateServerState,
    updateInterpolation,
    reset
  }
}
