<template>
  <div class="game-hud">
    <!-- Connection Status -->
    <div class="flex items-center gap-2 mb-4">
      <div class="connection-indicator">
        <div class="w-3 h-3 rounded-full" :class="{
          'bg-green-500': gameStore.connectionState === 'connected',
          'bg-yellow-500 animate-pulse': gameStore.connectionState === 'connecting',
          'bg-red-500': gameStore.connectionState === 'disconnected'
        }"></div>
      </div>
      <span class="text-sm font-medium">{{ connectionStatusText }}</span>
    </div>

    <!-- Game Info -->
    <div class="game-info mb-4">
      <div class="flex justify-between items-center">
        <div class="text-sm">
          <span class="text-gray-400">Status:</span>
          <span class="ml-2 font-medium">{{ gameStatusText }}</span>
        </div>
        <div class="text-sm" v-if="gameStore.playerSide">
          <span class="text-gray-400">You are:</span>
          <span class="ml-2 font-medium capitalize">{{ gameStore.playerSide }} Player</span>
        </div>
      </div>
    </div>

    <!-- Controls -->
    <div class="controls-info">
      <h3 class="text-lg font-semibold mb-2">Controls</h3>
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <kbd class="px-2 py-1 bg-gray-700 rounded text-xs">W</kbd>
            <span>Move Up</span>
          </div>
          <div class="flex items-center gap-2">
            <kbd class="px-2 py-1 bg-gray-700 rounded text-xs">S</kbd>
            <span>Move Down</span>
          </div>
        </div>
        <div>
          <div class="flex items-center gap-2 mb-1">
            <kbd class="px-2 py-1 bg-gray-700 rounded text-xs">↑</kbd>
            <span>Move Up</span>
          </div>
          <div class="flex items-center gap-2">
            <kbd class="px-2 py-1 bg-gray-700 rounded text-xs">↓</kbd>
            <span>Move Down</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Game Stats -->
    <div class="game-stats mt-4" v-if="gameStore.gameState.status === GameStatus.PLAYING">
      <h3 class="text-lg font-semibold mb-2">Game Stats</h3>
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div class="text-center">
          <div class="text-2xl font-bold">{{ gameStore.gameState.score.left }}</div>
          <div class="text-gray-400">Left Player</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold">{{ gameStore.gameState.score.right }}</div>
          <div class="text-gray-400">Right Player</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import { GameStatus } from '@/types/game'

const gameStore = useGameStore()

const connectionStatusText = computed(() => {
  switch (gameStore.connectionState) {
    case 'connected':
      return 'Connected'
    case 'connecting':
      return 'Connecting...'
    default:
      return 'Disconnected'
  }
})

const gameStatusText = computed(() => {
  switch (gameStore.gameState.status) {
    case GameStatus.WAITING:
      return 'Waiting for players'
    case GameStatus.WAITING_FOR_OPPONENT:
      return 'Waiting for opponent'
    case GameStatus.PLAYING:
      return 'Playing'
    case GameStatus.GAME_OVER:
      return 'Game Over'
    default:
      return 'Unknown'
  }
})
</script>

<style scoped>
.game-hud {
  background-color: #1f2937;
  border-radius: 0.5rem;
  padding: 1rem;
  color: white;
}

.connection-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
}

kbd {
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace;
}
</style>
