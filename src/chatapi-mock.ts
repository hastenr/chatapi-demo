// Mock ChatAPI SDK for demo purposes
// In real implementation, this would be imported from '@hastenlabs/chatapi-sdk'

export interface User {
  userId: string;
  displayName?: string;
}

export interface MessageEvent {
  id: string;
  content: string;
  sender: User;
  createdAt: string;
  roomId: string;
}

export interface PresenceEvent {
  userId: string;
  status: 'online' | 'offline';
}

export interface TypingEvent {
  userId: string;
  action: 'start' | 'stop';
  roomId: string;
}

export interface Room {
  id: string;
  name: string;
  type: 'channel' | 'group' | 'dm';
  memberCount: number;
}

export type EventHandler<T> = (event: T) => void;

export class ChatAPI {
  private eventHandlers: { [event: string]: EventHandler<any>[] } = {};
  private connected = false;
  private currentRoom?: Room;
  private messages: MessageEvent[] = [];

  constructor(private config: { baseURL: string; apiKey: string; userId: string; displayName?: string }) {}

  async connect(): Promise<void> {
    // Mock connection
    this.connected = true;
    console.log('Mock: Connected to ChatAPI');
  }

  async disconnect(): Promise<void> {
    this.connected = false;
  }

  on<T>(event: string, handler: EventHandler<T>): void {
    if (!this.eventHandlers[event]) {
      this.eventHandlers[event] = [];
    }
    this.eventHandlers[event].push(handler);
  }

  private emit(event: string, data: any): void {
    if (this.eventHandlers[event]) {
      this.eventHandlers[event].forEach(handler => handler(data));
    }
  }

  async getRooms(): Promise<Room[]> {
    // Mock rooms
    return [
      { id: 'general', name: 'general', type: 'channel', memberCount: 5 },
      { id: 'dev-team', name: 'dev-team', type: 'group', memberCount: 3 },
      { id: 'random', name: 'random', type: 'channel', memberCount: 12 }
    ];
  }

  async joinRoom(roomId: string): Promise<void> {
    const rooms = await this.getRooms();
    this.currentRoom = rooms.find(r => r.id === roomId);
    if (this.currentRoom) {
      // Load mock message history
      this.messages = [
        {
          id: '1',
          content: 'Welcome to the chat!',
          sender: { userId: 'system', displayName: 'System' },
          createdAt: new Date().toISOString(),
          roomId
        }
      ];
    }
  }

  async sendMessage(roomId: string, content: string): Promise<void> {
    const message: MessageEvent = {
      id: Date.now().toString(),
      content,
      sender: { userId: this.config.userId, displayName: this.config.displayName },
      createdAt: new Date().toISOString(),
      roomId
    };
    this.messages.push(message);
    // Echo back for demo
    setTimeout(() => this.emit('message', message), 100);
  }

  getSenderDisplayName(event: MessageEvent): string {
    return event.sender.displayName || event.sender.userId;
  }

  // Mock typing indicator
  async sendTyping(roomId: string, action: 'start' | 'stop'): Promise<void> {
    // Not implemented in mock
  }
}