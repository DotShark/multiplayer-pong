import { defineStore } from 'pinia'
import type { GameState, ConnectionState } from '@/types/game'
import { GameStatus } from '@/types/game'

export const useGameStore = defineStore('game', {
  state: () => ({
    gameState: {
      ball: { x: 400, y: 200, vx: 5, vy: 3, radius: 7.5 },
      leftPaddle: { x: 20, y: 160, width: 15, height: 80, speed: 8 },
      rightPaddle: { x: 765, y: 160, width: 15, height: 80, speed: 8 },
      score: { left: 0, right: 0 },
      status: GameStatus.WAITING
    } as GameState,
    connectionState: 'disconnected' as ConnectionState,
    playerCount: 0,
    playerSide: null as 'left' | 'right' | null,
    winner: null as 'left' | 'right' | null,
    isGameStarted: false
  }),

  actions: {
    updateGameState(newState: GameState) {
      this.gameState = newState
    },

    updateConnectionState(state: ConnectionState) {
      this.connectionState = state
    },

    updatePlayerCount(count: number) {
      this.playerCount = count
    },

    updateGameStatus(status: GameStatus) {
      this.gameState.status = status
      if (status === GameStatus.PLAYING) {
        this.isGameStarted = true
      } else if (status === GameStatus.WAITING) {
        this.isGameStarted = false
      }
    },

    updatePlayerSide(side: 'left' | 'right') {
      this.playerSide = side
    },

    updateWinner(winnerSide: 'left' | 'right') {
      this.winner = winnerSide
    },

    resetGame() {
      this.gameState = {
        ball: { x: 400, y: 200, vx: 5, vy: 3, radius: 7.5 },
        leftPaddle: { x: 20, y: 160, width: 15, height: 80, speed: 8 },
        rightPaddle: { x: 765, y: 160, width: 15, height: 80, speed: 8 },
        score: { left: 0, right: 0 },
        status: GameStatus.WAITING
      }
      this.winner = null
      this.playerSide = null
      this.isGameStarted = false
      this.playerCount = 0
    }
  }
})
