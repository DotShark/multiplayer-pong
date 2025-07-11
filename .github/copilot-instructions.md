# Copilot Instructions - Pong Multiplayer

## 🎯 Project Context

You're helping build a real-time multiplayer Pong game with a **1-day deadline** (8h dev time). This is an MVP focused on **functionality over fancy features**. Keep it simple, make it work, ship it fast.

## 🛠️ Tech Stack & Architecture

### Backend (Authoritative Server)
- **Node.js vanilla** + `http.createServer` (NO Express - overkill for this)
- **Socket.io** for WebSocket communication
- **TypeScript** for type safety
- **Server-side game loop** (authoritative, 20 FPS tick rate)
- **No database** - everything in memory

### Frontend (Client-side Prediction)
- **Vue 3** + Composition API
- **HTML5 Canvas** for rendering (800x400px)
- **Socket.io-client** for real-time communication
- **Pinia** for state management
- **Vue Router** for navigation
- **TypeScript** for type safety
- **Vite** for dev server
- **Tailwind CSS** for styling

### Project Structure
```
client/
├── src/
│   ├── components/game/     # GameCanvas.vue, GameHUD.vue
│   ├── composables/         # useSocket.ts, useGameLoop.ts
│   ├── stores/              # gameStore.ts, roomStore.ts
│   ├── types/               # Shared types
│   └── App.vue
server/
├── src/
│   ├── managers/            # GameManager.ts, RoomManager.ts
│   ├── entities/            # Game.ts, Player.ts, Ball.ts
│   ├── types/               # Shared types
│   └── server.ts
```

## 🎮 Game Logic Requirements

### Player Management
- **2 players max** (hard limit)
- **First come, first served** paddle assignment:
  - Player 1 → Left paddle
  - Player 2 → Right paddle
  - Player 3+ → Kick with "Game full"

### Game States
1. **Waiting** (0 players) - Server idle
2. **WaitingForOpponent** (1 player) - Show waiting message
3. **Playing** (2 players) - Game auto-starts
4. **GameOver** - First to 5 points wins

### Controls & Physics
- **Controls**: W/S or ↑/↓ for all players
- **Ball**: Constant velocity, bounce angle based on paddle impact
- **Collision**: AABB (Axis-Aligned Bounding Box)
- **Canvas specs**: 800x400px, paddle 80x15px, ball 15x15px

## 📡 Socket.io Events

### Client → Server
```typescript
'paddle_move': { direction: 'up' | 'down' }  // Server knows player via socket.id
'ready': {}  // Player ready to play
```

### Server → Client
```typescript
'game_state': {
  ball: { x: number, y: number, vx: number, vy: number },
  leftPaddle: { y: number },
  rightPaddle: { y: number },
  score: { left: number, right: number }
}
'waiting_for_opponent': {}
'game_start': {}
'game_over': { winner: 'left' | 'right' }
'game_full': {}  // Too many players
```

## ⚡ Performance Requirements

- **Server tick rate**: 20 FPS (50ms per update)
- **Client framerate**: 60 FPS (smooth interpolation)
- **Input latency**: < 50ms for paddle movement
- **Network latency**: < 100ms acceptable
- **State sync**: Server authoritative, client-side prediction

## 🎯 Code Guidelines

### TypeScript Types
Always use shared types between client/server:
```typescript
interface GameState {
  ball: { x: number; y: number; vx: number; vy: number };
  leftPaddle: { y: number };
  rightPaddle: { y: number };
  score: { left: number; right: number };
}
```

### Vue 3 Patterns
- Use **Composition API** with `<script setup>`
- Leverage **Pinia** for state management
- Create **composables** for reusable logic
- Keep components focused and small

### Socket.io Best Practices
- **Server-side validation** for all game actions
- **Efficient packet structure** (bandwidth-friendly)
- **Proper error handling** for disconnections
- **Room-based architecture** (even for single game)

### Performance Optimizations
- **Client-side interpolation** between server updates
- **Minimal data transmission** (only changed state)
- **Debounce input events** to prevent spam
- **Canvas optimization** (avoid unnecessary redraws)

## 🚫 Limitations & Constraints

### Accepted Limitations
- **No spectators** (2 players only)
- **No game persistence** (all in memory)
- **No reconnection logic** (player leaves = game pauses)
- **Single game instance** (no multiple rooms)
- **No fancy graphics** (basic canvas shapes)

### Quick & Dirty Solutions OK
- **Hard-coded game constants** (speeds, sizes)
- **Simple collision detection** (AABB is enough)
- **Basic UI** (functional over beautiful)
- **No extensive error handling** (focus on happy path)

## 🏆 Success Criteria

### Must-Have Features
- [ ] 2 players can connect and play simultaneously
- [ ] Automatic paddle assignment (left/right)
- [ ] Real-time ball physics and collision
- [ ] Synchronized scoring system
- [ ] Proper game state management (0/1/2+ players)
- [ ] Input responsiveness < 50ms
- [ ] No desync between clients

### MVP Delivery
- **Setup**: `node server.js` (port 3000) + `npm run dev` (port 5173)
- **Test**: Open 2 browser tabs = 2 players playing
- **Ship**: Working localhost demo

### Package Installation
**IMPORTANT**: Always use Linux console commands for package installation:
- **Install each package individually** - Never use npm install with package.json
- **Server packages**: `cd server && npm install <package-name>`
- **Client packages**: `cd client && npm install <package-name>`
- **Dev dependencies**: Add `--save-dev` flag for development packages
- **Create directories first** before installing packages
- **Ask questions one by one when uncertain** - Don't make assumptions, ask the user for clarification
- **Examples**:
  - `npm install socket.io` (server)
  - `npm install socket.io-client` (client)
  - `npm install --save-dev @types/node` (TypeScript types)

## 💡 Development Tips

### Debugging Helpers
- Add console logs for socket events
- Visual debug info on canvas (coordinates, velocities)
- Network tab monitoring for packet frequency
- Simple FPS counter for performance monitoring

### Common Pitfalls to Avoid
- **Client-side authoritative logic** (keep server in control)
- **Over-engineering** (remember: 8h deadline)
- **Premature optimization** (make it work first)
- **Complex state management** (Pinia keeps it simple)

### Quick Wins
- **Use existing Canvas patterns** (don't reinvent)
- **Copy-paste physics formulas** (bounce calculations)
- **Leverage Socket.io rooms** (even for single game)
- **TypeScript inference** (let compiler help you)

---

**Remember**: This is a 1-day MVP sprint. Prioritize working code over perfect code. Ship the damn thing! 🚀

*"Perfect is the enemy of good, and good is the enemy of shipped"* - Some wise dev, probably