import { readFileSync, writeFileSync, existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
import * as readline from 'readline';

export interface ChatConfig {
  baseURL: string;
  apiKey: string;
  userId: string;
  displayName?: string;
}

export class ConfigManager {
  private config: Partial<ChatConfig> = {};
  private configPath: string;

  constructor() {
    this.configPath = join(homedir(), '.chatapi-config.json');
  }

  async load(): Promise<void> {
    // Load from env vars first
    this.config.baseURL = process.env.CHATAPI_BASE_URL || 'https://api.chatapi.com';
    this.config.apiKey = process.env.CHATAPI_API_KEY;
    this.config.userId = process.env.CHATAPI_USER_ID;
    this.config.displayName = process.env.CHATAPI_DISPLAY_NAME;

    // Load from file if exists
    if (existsSync(this.configPath)) {
      try {
        const fileConfig = JSON.parse(readFileSync(this.configPath, 'utf-8'));
        this.config = { ...this.config, ...fileConfig };
      } catch (error) {
        console.warn('Failed to load config file:', error);
      }
    }

    // Prompt for missing required fields
    await this.ensureRequiredFields();
  }

  private async ensureRequiredFields(): Promise<void> {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const question = (query: string): Promise<string> => {
      return new Promise(resolve => rl.question(query, resolve));
    };

    if (!this.config.apiKey) {
      this.config.apiKey = await this.promptSecure('API Key: ', rl);
    }

    if (!this.config.userId) {
      this.config.userId = await question('User ID: ');
    }

    rl.close();

    // Save to file
    this.save();
  }

  private async promptSecure(prompt: string, rl: readline.Interface): Promise<string> {
    return new Promise(resolve => {
      const stdin = process.stdin;
      const stdout = process.stdout;

      stdout.write(prompt);
      stdin.setRawMode(true);
      stdin.resume();
      stdin.setEncoding('utf8');

      let password = '';

      stdin.on('data', (char: string) => {
        char = char + '';

        switch (char) {
          case '\n':
          case '\r':
          case '\u0004':
            stdin.setRawMode(false);
            stdin.pause();
            stdout.write('\n');
            resolve(password);
            break;
          case '\u0003':
            process.exit();
            break;
          default:
            stdout.write('*');
            password += char;
            break;
        }
      });
    });
  }

  private save(): void {
    try {
      writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
    } catch (error) {
      console.warn('Failed to save config:', error);
    }
  }

  getChatConfig(): ChatConfig {
    if (!this.config.apiKey || !this.config.userId || !this.config.baseURL) {
      throw new Error('Missing required configuration');
    }
    return {
      baseURL: this.config.baseURL,
      apiKey: this.config.apiKey,
      userId: this.config.userId,
      displayName: this.config.displayName
    };
  }

  getDisplayName(): string {
    return this.config.displayName || this.config.userId || 'Anonymous';
  }
}