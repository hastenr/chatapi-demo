import { ChatAPI } from '@hastenr/chatapi-sdk';
import chalk from 'chalk';
import * as readline from 'readline';
import { ConfigManager } from './config.js';

interface Room {
  id: string;
  name: string;
  type: 'channel' | 'group' | 'dm';
  memberCount: number;
}

export class CLI {
  private rl?: readline.Interface;
  private currentRoom?: Room;
  private connected = false;

  constructor(private chat: ChatAPI, private config: ConfigManager) {}

  async start(): Promise<void> {
    await this.showWelcome();
    await this.ensureConnection();
    await this.selectRoom();
    await this.enterChatMode();
  }

  private async showWelcome(): Promise<void> {
    console.log(chalk.blue('ChatAPI CLI Demo v1.0.0'));
    console.log(chalk.blue('========================\n'));

    const config = this.config.getChatConfig();
    console.log('API Configuration:');
    console.log(`Base URL: ${config.baseURL}`);
    console.log(`API Key: ${'*'.repeat(20)}`);
    console.log(`User ID: ${config.userId}`);
    console.log(`Display Name: ${this.config.getDisplayName()}`);
    console.log();
  }

  private async ensureConnection(): Promise<void> {
    try {
      await this.chat.connect();
      this.connected = true;
      console.log(chalk.green('Connection Status: Connected ✅'));
      this.setupEventHandlers();
    } catch (error) {
      console.error(chalk.red('Failed to connect:'), error);
      throw error;
    }
  }

  private setupEventHandlers(): void {
    this.chat.on('message', (event: any) => {
      const displayName = this.chat.getSenderDisplayName(event);
      this.displayMessage(displayName, event.content, event.created_at);
    });

    this.chat.on('presence.update', (event: any) => {
      this.displayPresence(event.user_id, event.status);
    });

    this.chat.on('typing', (event: any) => {
      this.displayTyping(event.user_id, event.action);
    });
  }

  private async selectRoom(): Promise<void> {
    // Mock rooms since getRooms not available
    const rooms: Room[] = [
      { id: 'general', name: 'general', type: 'channel', memberCount: 5 },
      { id: 'dev-team', name: 'dev-team', type: 'group', memberCount: 3 },
      { id: 'random', name: 'random', type: 'channel', memberCount: 12 }
    ];

    console.log('\nAvailable rooms:');
    rooms.forEach((room, index) => {
      console.log(`${index + 1}. ${room.name} (${room.type}) - ${room.memberCount} members`);
    });

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const answer = await new Promise<string>(resolve => {
      rl.question('\nSelect room (number or \'create\'): ', resolve);
    });

    rl.close();

    if (answer.toLowerCase() === 'create') {
      // TODO: Create room
    } else {
      const index = parseInt(answer) - 1;
      if (index >= 0 && index < rooms.length) {
        this.currentRoom = rooms[index];
        // Assume join is automatic or not needed
        console.log(chalk.green(`Joined room: ${this.currentRoom.name}`));
      }
    }
  }

  private async enterChatMode(): Promise<void> {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: `${this.currentRoom?.name || 'chat'} > `
    });

    this.rl.prompt();

    this.rl.on('line', async (line) => {
      const input = line.trim();
      if (input.startsWith('/')) {
        await this.handleCommand(input);
      } else if (input) {
        await this.sendMessage(input);
      }
      this.rl?.prompt();
    });

    this.rl.on('close', () => {
      console.log(chalk.blue('\nGoodbye!'));
      process.exit(0);
    });
  }

  private async handleCommand(command: string): Promise<void> {
    const parts = command.slice(1).split(' ');
    const cmd = parts[0].toLowerCase();

    switch (cmd) {
      case 'help':
        this.showHelp();
        break;
      case 'quit':
      case 'exit':
        this.rl?.close();
        break;
      case 'status':
        console.log(`Connected: ${this.connected ? 'Yes' : 'No'}`);
        console.log(`Current room: ${this.currentRoom?.name || 'None'}`);
        break;
      default:
        console.log(chalk.red(`Unknown command: ${cmd}`));
    }
  }

  private async sendMessage(content: string): Promise<void> {
    if (!this.currentRoom) {
      console.log(chalk.red('No room selected'));
      return;
    }

    try {
      await this.chat.sendMessage(this.currentRoom.id, content);
    } catch (error) {
      console.error(chalk.red('Failed to send message:'), error);
    }
  }

  private displayMessage(displayName: string, content: string, timestamp: string): void {
    const time = new Date(timestamp).toLocaleTimeString();
    console.log(`[${time}] ${displayName}: ${content}`);
  }

  private displayPresence(userId: string, status: string): void {
    console.log(chalk.gray(`${userId} is now ${status}`));
  }

  private displayTyping(userId: string, action: string): void {
    if (action === 'start') {
      console.log(chalk.gray(`${userId} is typing...`));
    }
  }

  private showHelp(): void {
    console.log('\nAvailable commands:');
    console.log('/help - Show this help');
    console.log('/join <room> - Join a different room');
    console.log('/create <type> <name> - Create new room');
    console.log('/members - List room members');
    console.log('/history [limit] - Show message history');
    console.log('/status - Show connection status');
    console.log('/quit - Exit the application');
  }
}