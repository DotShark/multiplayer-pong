<template>
  <div class="min-h-screen bg-gray-900 text-white">
    <div class="container flex flex-col justify-center items-center gap-4">
      <h1 class="text-4xl font-bold text-center">Multiplayer Pong</h1>
      
      <div class="flex flex-col gap-6 items-center">
        <div class="flex-shrink-0">
          <GameCanvas />
        </div>
        <div class="w-full lg:w-80 flex-shrink-0 max-w-md lg:max-w-none">
          <GameHUD />
        </div>
      </div>

      <div v-if="connectionError" class="mt-6 max-w-md mx-auto">
        <div class="bg-red-600 text-white px-4 py-2 rounded-lg text-center">
          {{ connectionError }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import GameCanvas from '@/components/game/GameCanvas.vue'
import GameHUD from '@/components/game/GameHUD.vue'
import { useSocket } from '@/composables/useSocket'
import { useGameStore } from '@/stores/gameStore'

const gameStore = useGameStore()
const { connectionError, joinGame, connect } = useSocket()

onMounted(() => {
  // Auto-connect and join game when component mounts
  connect()
  
  // Small delay to ensure connection is established
  setTimeout(() => {
    joinGame()
  }, 100)
})
</script>


