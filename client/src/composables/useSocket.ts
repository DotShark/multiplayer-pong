import { ref, onUnmounted, watchEffect } from 'vue'
import { io, Socket } from 'socket.io-client'
import { useGameStore } from '@/stores/gameStore'
import type { ServerToClientEvents, ClientToServerEvents } from '@/types/game'
import { GameStatus } from '@/types/game'

let actualSocket: Socket<ServerToClientEvents, ClientToServerEvents> | null

export function useSocket() {
  const gameStore = useGameStore()
  const socket = ref<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null)
  const isConnected = ref(false)
  const isConnecting = ref(false)
  const connectionError = ref<string | null>(null)

  function connect() {
    if (actualSocket?.connected) {
      console.log('✅ Already connected')
      return
    }

    if (isConnecting.value) {
      console.log('⏳ Already connecting')
      return
    }

    console.log('🔗 Attempting to connect...')
    isConnecting.value = true
    connectionError.value = null
    gameStore.updateConnectionState('connecting')

    actualSocket = io('https://pong-api.dotshark.dev', {
      transports: ['websocket'],
      upgrade: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    socket.value = actualSocket

    console.log('🔗 Socket instance created, waiting for connection...')

    // Connection events
    actualSocket.on('connect', () => {
      console.log('🔗 Connected to server with ID:', socket.value?.id)
      isConnected.value = true
      isConnecting.value = false
      connectionError.value = null
      gameStore.updateConnectionState('connected')
    })

    actualSocket.on('disconnect', (reason) => {
      console.log('🔌 Disconnected from server:', reason)
      isConnected.value = false
      isConnecting.value = false
      gameStore.updateConnectionState('disconnected')
      gameStore.updateGameStatus(GameStatus.WAITING)
    })

    actualSocket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error)
      console.error('❌ Error message:', error.message)
      connectionError.value = `Connection failed: ${error.message}`
      isConnecting.value = false
      isConnected.value = false
      gameStore.updateConnectionState('error')
    })

    // Game events
    socket.value.on('gameState', (gameState) => {
      gameStore.updateGameState(gameState)
    })

    // Client-managed player assignment - we don't need server to tell us our side
    actualSocket.on('waitingForOpponent', () => {
      // First player to connect gets left side
      gameStore.updatePlayerSide('left')
      gameStore.updateGameStatus(GameStatus.WAITING_FOR_OPPONENT)
      console.log('👤 You are the LEFT player - waiting for opponent')
    })

    actualSocket.on('gameStart', () => {
      // If game starts and we don't have a side yet, we must be the right player
      if (!gameStore.playerSide) {
        gameStore.updatePlayerSide('right')
        console.log('👤 You are the RIGHT player - game starting!')
      }
      gameStore.updateGameStatus(GameStatus.PLAYING)
    })

    actualSocket.on('gameOver', (data) => {
      gameStore.updateGameStatus(GameStatus.GAME_OVER)
      gameStore.updateWinner(data.winner)
    })

    actualSocket.on('gameFull', () => {
      connectionError.value = 'Game is full!'
      disconnect()
    })

    // Remove the playerJoined/playerLeft complexity - we don't need it
    // The server will handle game state through gameState events
  }

  function disconnect() {
    if (actualSocket) {
      console.log('🔌 Disconnecting...')
      actualSocket.disconnect()
      actualSocket = null
      socket.value = null
    }
    isConnected.value = false
    isConnecting.value = false
    connectionError.value = null
    gameStore.updateConnectionState('disconnected')
    gameStore.resetGame()
  }

  function joinGame() {
    if (!actualSocket?.connected) {
      console.warn('⚠️ Cannot join game - not connected')
      return
    }
    
    console.log('🎮 Joining game...')
    actualSocket!.emit('joinGame')
  }

  function movePaddle(direction: 'up' | 'down') {
    if (actualSocket?.connected) {
      actualSocket!.emit('paddleMove', { direction })
    } else {
      console.warn('⚠️ Cannot move paddle - socket not connected')
    }
  }

  function setReady() {
    if (actualSocket?.connected) {
      actualSocket!.emit('ready')
    }
  }

  watchEffect(() => console.log(actualSocket?.connected))

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
