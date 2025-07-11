# 🏓 Multiplayer Pong Game

A real-time multiplayer Pong game built with Node.js and Vue 3. Play classic Pong with a friend in real-time!

## ✨ Features

- **2-player multiplayer** - Real-time gameplay
- **Server-side game logic** - Prevents cheating
- **Smooth controls** - W/S or Arrow keys
- **Auto-start** - Game begins when 2 players join
- **First to 5 points wins**

## 🛠️ Tech Stack

**Backend:** Node.js, Socket.io, TypeScript  
**Frontend:** Vue 3, HTML5 Canvas, Socket.io-client, Vite

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- npm

### Setup

1. **Install dependencies**
   ```bash
   # Server
   cd server && npm install
   
   # Client
   cd ../client && npm install
   ```

2. **Start the servers**
   ```bash
   # Terminal 1 - Server
   cd server && npm run dev
   
   # Terminal 2 - Client  
   cd client && npm run dev
   ```

3. **Play**
   - Open 2 browser tabs at `http://localhost:5173`
   - First player = left paddle, second player = right paddle
   - Use W/S or ↑/↓ to move your paddle
   - First to 5 points wins!

## � How It Works

- **Max 2 players** - Additional players are kicked
- **Real-time sync** - Server runs at 20 FPS, client renders at 60 FPS
- **Controls** - W/S or Arrow keys only
- **Game states** - Waiting → Playing → Game Over

## 🏗️ Project Structure

```
server/src/
├── server.ts          # Main server
├── managers/          # Game & room logic
├── entities/          # Game objects
└── types/            # Shared types

client/src/
├── components/game/   # Canvas & UI
├── composables/      # Socket logic
├── stores/          # Game state
└── types/          # Shared types
```

## 📡 Socket Events

**Client → Server:**
- `paddleMove: { direction: 'up' | 'down' }`
- `ready: {}`

**Server → Client:**
- `gameState: { ball, leftPaddle, rightPaddle, score }`
- `waitingForOpponent`, `gameStart`, `gameOver`, `gameFull`

## 🔧 Development

**Development mode:**
```bash
cd server && npm run dev    # Server with auto-restart
cd client && npm run dev    # Client with hot reload
```

**Production build:**
```bash
cd server && npm run build && npm start
cd client && npm run build && npm run preview
```

**Docker:**
```bash
docker-compose up --build
```

## 📝 Game Specs

- **Canvas:** 800x400px
- **Paddles:** 80x15px 
- **Ball:** 15x15px
- **Physics:** AABB collision detection
- **Performance:** 20 FPS server, 60 FPS client

## 🎯 MVP Goals

Built as a **1-day MVP** focusing on:
- Core multiplayer functionality
- Real-time gameplay
- Clean TypeScript code
- Modern web stack

## 🔮 Future Ideas

- [ ] Multiple game rooms
- [ ] Player usernames
- [ ] Spectator mode
- [ ] Mobile controls
- [ ] Sound effects
