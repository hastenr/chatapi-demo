#!/usr/bin/env node

import { ChatAPI } from '@hastenr/chatapi-sdk';
import { CLI } from './cli.js';
import { ConfigManager } from './config.js';

async function main() {
  try {
    const config = new ConfigManager();
    await config.load();

    const chat = new ChatAPI(config.getChatConfig());
    const cli = new CLI(chat, config);

    await cli.start();
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

main();