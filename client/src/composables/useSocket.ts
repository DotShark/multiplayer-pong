import { ref, onMounted, onUnmounted } from 'vue'
import { io, Socket } from 'socket.io-client'
import { useGameStore } from '@/stores/gameStore'
import type { ServerToClientEvents, ClientToServerEvents } from '@/types/game'
import { GameStatus } from '@/types/game'

export function useSocket() {
  const gameStore = useGameStore()
  const socket = ref<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null)
  const isConnected = ref(false)
  const isConnecting = ref(false)
  const connectionError = ref<string | null>(null)

  const connect = () => {
    if (socket.value?.connected) return

    isConnecting.value = true
    connectionError.value = null

    socket.value = io('http://localhost:3000', {
      transports: ['websocket'],
      upgrade: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    // Connection events
    socket.value.on('connect', () => {
      console.log('🔗 Connected to server')
      isConnected.value = true
      isConnecting.value = false
      gameStore.updateConnectionState('connected')
    })

    socket.value.on('disconnect', () => {
      console.log('🔌 Disconnected from server')
      isConnected.value = false
      isConnecting.value = false
      gameStore.updateConnectionState('disconnected')
    })

    socket.value.on('connect_error', (error) => {
      console.error('❌ Connection error:', error)
      connectionError.value = error.message
      isConnecting.value = false
      gameStore.updateConnectionState('disconnected')
    })

    // Game events
    socket.value.on('gameState', (gameState) => {
      gameStore.updateGameState(gameState)
    })

    socket.value.on('waitingForOpponent', () => {
      gameStore.updateGameStatus(GameStatus.WAITING_FOR_OPPONENT)
    })

    socket.value.on('gameStart', () => {
      gameStore.updateGameStatus(GameStatus.PLAYING)
    })

    socket.value.on('gameOver', (data) => {
      gameStore.updateGameStatus(GameStatus.GAME_OVER)
      gameStore.updateWinner(data.winner)
    })

    socket.value.on('gameFull', () => {
      connectionError.value = 'Game is full!'
      disconnect()
    })

    socket.value.on('playerJoined', (data) => {
      console.log(`🎮 Player ${data.playerId} joined as ${data.side}`)
      gameStore.updatePlayerSide(data.side)
    })

    socket.value.on('playerLeft', (data) => {
      console.log(`👋 Player ${data.playerId} left`)
    })
  }

  const disconnect = () => {
    if (socket.value) {
      socket.value.disconnect()
      socket.value = null
    }
    isConnected.value = false
    isConnecting.value = false
    gameStore.updateConnectionState('disconnected')
  }

  const joinGame = () => {
    if (socket.value?.connected) {
      socket.value.emit('joinGame')
    }
  }

  const movePaddle = (direction: 'up' | 'down') => {
    if (socket.value?.connected) {
      socket.value.emit('paddleMove', { direction })
    }
  }

  const setReady = () => {
    if (socket.value?.connected) {
      socket.value.emit('ready')
    }
  }

  onMounted(() => {
    connect()
  })

  onUnmounted(() => {
    disconnect()
  })

  return {
    socket,
    isConnected,
    isConnecting,
    connectionError,
    connect,
    disconnect,
    joinGame,
    movePaddle,
    setReady
  }
}
