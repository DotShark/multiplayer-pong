import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface GameState {
  ball: { x: number; y: number; vx: number; vy: number }
  leftPaddle: { y: number }
  rightPaddle: { y: number }
  score: { left: number; right: number }
}

export const useGameStore = defineStore('game', () => {
  const gameState = ref<GameState>({
    ball: { x: 400, y: 200, vx: 5, vy: 3 },
    leftPaddle: { y: 160 },
    rightPaddle: { y: 160 },
    score: { left: 0, right: 0 }
  })

  const connectionState = ref<'disconnected' | 'connecting' | 'connected'>('disconnected')
  const playerCount = ref(0)
  const gameStatus = ref<'waiting' | 'waitingForOpponent' | 'playing' | 'gameOver'>('waiting')

  function updateGameState(newState: GameState) {
    gameState.value = newState
  }

  function updateConnectionState(state: 'disconnected' | 'connecting' | 'connected') {
    connectionState.value = state
  }

  function updatePlayerCount(count: number) {
    playerCount.value = count
  }

  function updateGameStatus(status: 'waiting' | 'waitingForOpponent' | 'playing' | 'gameOver') {
    gameStatus.value = status
  }

  return {
    gameState,
    connectionState,
    playerCount,
    gameStatus,
    updateGameState,
    updateConnectionState,
    updatePlayerCount,
    updateGameStatus
  }
})
