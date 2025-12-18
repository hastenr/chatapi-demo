# ChatAPI CLI Demo - AI Coding Guidelines

## Project Overview
This is a Node.js TypeScript CLI application that demonstrates the ChatAPI SDK. It provides an interactive terminal chat interface for real-time messaging, room management, and user interactions. The app connects to ChatAPI servers via WebSocket for live events.

## Architecture
- **Entry Point**: `src/index.ts` (shebang `#!/usr/bin/env node`)
- **Core Components**:
  - `CLI` class: Main interface handler with methods like `start()`, `showWelcome()`, `ensureConnection()`, `selectRoom()`, `enterChatMode()`
  - `ConfigManager`: Handles JSON config file and environment variables
  - `ChatAPI` integration: Uses `@hastenr/chatapi-sdk` for messaging
- **Data Flow**: Config load → Authentication → WebSocket connection → Room selection → Interactive chat loop → Event processing

## Key Patterns
- **Event Handling**: Use `chat.on('message', handler)` for real-time events; display with timestamps and display names
- **Message Display**: Format as `[HH:MM] DisplayName: content` using `chalk` for colors
- **Command System**: Prefix commands with `/` (e.g., `/join room`, `/help`); implement in `enterChatMode()`
- **Configuration**: Load from `~/.chatapi-config.json` or env vars; validate required fields (apiKey, userId, baseURL)
- **Error Handling**: Catch SDK errors, display user-friendly messages, retry connections with backoff

## Dependencies & Build
- **Runtime**: Node >=16, isomorphic-ws, readline, chalk, commander
- **Dev**: TypeScript, @types/node, ts-node, nodemon
- **Build**: `npm run build` (tsc), `npm start` (ts-node src/index.ts)
- **Package**: Bin script `chatapi` in package.json

## Conventions
- **File Structure**: `src/` for TypeScript sources, `dist/` for compiled JS
- **Imports**: Use ES modules, import from SDK as `import { ChatAPI } from '@hastenr/chatapi-sdk'`
- **Async/Await**: All I/O operations async; use try/catch for error handling
- **Logging**: Use `console.log` with chalk for system messages (blue), errors (red)
- **User Input**: Use readline for interactive prompts; hide sensitive input like API keys

## Implementation Notes
- **Room Types**: Support 'channel', 'group', 'dm'; display as `name (type) - memberCount members`
- **Presence**: Track online/offline status; show in room member lists
- **Typing Indicators**: Send/receive typing events; display "User is typing..."
- **Message History**: Load last N messages on room join; paginate if needed
- **Multi-user Demo**: Ensure multiple CLI instances can chat simultaneously

## Key Files
- `src/cli.ts`: CLI class implementation
- `src/config.ts`: ConfigManager class
- `src/index.ts`: Main entry point
- `package.json`: Dependencies and scripts
