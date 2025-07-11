import { createServer } from 'http'
import { Server } from 'socket.io'
import { GameManager } from './managers/GameManager'
import { 
  ServerToClientEvents, 
  ClientToServerEvents, 
  InterServerEvents, 
  SocketData 
} from './types/game'

const PORT = process.env.PORT || 3000

const httpServer = createServer()

const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
})

const gameManager = new GameManager(io)

io.on('connection', (socket) => {
  console.log(`New connection: ${socket.id}`)
  
  socket.on('joinGame', () => {
    console.log(`Player ${socket.id} requesting to join game`)
    gameManager.handlePlayerJoin(socket)
  })
})

httpServer.listen(PORT, () => {
  console.log(`🎮 Pong server running on port ${PORT}`)
  console.log(`📡 WebSocket server ready for connections`)
  console.log(`🌐 CORS enabled for all origins`)
})

process.on('SIGINT', () => {
  console.log('\n🔥 Shutting down server...')
  gameManager.destroy()
  httpServer.close(() => {
    console.log('✅ Server closed')
    process.exit(0)
  })
})

process.on('SIGTERM', () => {
  console.log('\n🔥 Shutting down server...')
  gameManager.destroy()
  httpServer.close(() => {
    console.log('✅ Server closed')
    process.exit(0)
  })
})

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})

export { io, gameManager }
