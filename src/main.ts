import { ChatAPI } from '@hastenr/chatapi-sdk';
import './style.css';

// ─── Config ───────────────────────────────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_SERVER_URL as string;
const API_KEY  = import.meta.env.VITE_API_KEY as string;

if (!BASE_URL || !API_KEY) {
  document.getElementById('app')!.innerHTML = `
    <div class="boot-error">
      <h2>Missing configuration</h2>
      <p>Copy <code>.env.example</code> to <code>.env</code> and fill in your values, then restart.</p>
      <pre>VITE_SERVER_URL=https://api.chatapi.cloud\nVITE_API_KEY=your-tenant-api-key</pre>
    </div>
  `;
  throw new Error('VITE_SERVER_URL and VITE_API_KEY must be set');
}

// ─── Session ──────────────────────────────────────────────────────────────────
// Random suffix per page load so each visitor gets their own isolated room

const sid    = Math.random().toString(36).slice(2, 8);
const BUYER  = { id: `buyer_${sid}`,  name: 'Sarah Kim',  initials: 'SK' };
const SELLER = { id: `seller_${sid}`, name: 'Mike Chen',  initials: 'MC' };

// ─── Demo Data ────────────────────────────────────────────────────────────────

const LISTING = {
  id:        'listing_mbp2021_sf',
  title:     'MacBook Pro M1 (2021)',
  price:     '$1,200',
  condition: 'Like New',
  specs:     '8GB RAM · 256GB SSD · Space Gray',
  emoji:     '💻',
};

const ORDER_EVENTS = [
  { label: 'Confirm Order',   icon: '✅', status: 'confirmed',        message: 'Your order has been confirmed!',       color: '#10b981' },
  { label: 'Verify Payment',  icon: '💳', status: 'payment_verified', message: `Payment of ${LISTING.price} verified`, color: '#6366f1' },
  { label: 'Package Item',    icon: '📦', status: 'packaged',         message: 'Item has been securely packaged',      color: '#f59e0b' },
  { label: 'Mark as Shipped', icon: '🚚', status: 'shipped',          message: 'Your order is on its way!', tracking: 'USPS9400111899223397718234', color: '#3b82f6' },
] as const;

// ─── Static Content ───────────────────────────────────────────────────────────

const FEATURES = [
  { icon: '⚡', title: 'Real-time WebSocket',  desc: 'Instant delivery with typing indicators and presence updates out of the box.' },
  { icon: '🔔', title: 'Topic Notifications',  desc: 'Users subscribe to topics; your backend publishes events directly over WebSocket.' },
  { icon: '🏢', title: 'Multi-tenant',         desc: 'Full data isolation per tenant with per-tenant rate limiting and API keys.' },
  { icon: '📦', title: 'Durable Delivery',     desc: 'Store-then-send with at-least-once guarantees, per-user ACKs, and automatic retry.' },
  { icon: '🔷', title: 'TypeScript SDK',       desc: 'Official SDK for browser and Node.js with built-in WebSocket reconnection.' },
  { icon: '🪶', title: 'Single Binary',        desc: 'SQLite backend, WAL mode, zero external dependencies. One Docker command to run.' },
];

const CODE_SNIPPET = `npm install @hastenr/chatapi-sdk

import { ChatAPI } from '@hastenr/chatapi-sdk';

const client = new ChatAPI({
  baseURL: 'https://api.chatapi.cloud',
  apiKey:  'sk_your_tenant_key',
  userId:  'alice',
});

await client.connect();

// Messaging
client.on('message', (ev) => console.log(ev.content));
client.sendMessage('room_abc', 'Hello!');

// Notifications
await client.subscriptions.subscribe('order.updates');
client.on('notification', (ev) => {
  const data = JSON.parse(ev.payload);
  console.log(data.message);
});`;

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChatMsg {
  id: string;
  senderId: string;
  content: string;
  seq: number;
  time: string;
  meta?: string;
}

// ─── Init ─────────────────────────────────────────────────────────────────────

renderLandingPage();

// ─── Landing Page ─────────────────────────────────────────────────────────────

function renderLandingPage(): void {
  const featureCards = FEATURES.map(f => `
    <div class="feature-card">
      <div class="feature-icon">${f.icon}</div>
      <div class="feature-title">${f.title}</div>
      <div class="feature-desc">${f.desc}</div>
    </div>
  `).join('');

  document.getElementById('app')!.innerHTML = `

    <nav class="lp-nav">
      <div class="lp-nav-inner">
        <div class="brand">
          <span class="brand-dot"></span>
          <span class="brand-name">ChatAPI</span>
        </div>
        <div class="lp-nav-links">
          <a href="https://docs.chatapi.cloud" class="lp-nav-link" target="_blank" rel="noopener">Docs</a>
          <a href="https://github.com/hastenr/chatapi" class="lp-nav-link" target="_blank" rel="noopener">GitHub</a>
          <a href="https://www.npmjs.com/package/@hastenr/chatapi-sdk" class="lp-nav-link" target="_blank" rel="noopener">npm</a>
          <a href="#demo" class="lp-nav-cta" id="nav-try-btn">Try it live</a>
        </div>
      </div>
    </nav>

    <section class="lp-hero">
      <div class="lp-hero-inner">
        <div class="lp-hero-badge">Open Source &nbsp;·&nbsp; Self-hostable &nbsp;·&nbsp; MIT License</div>
        <h1 class="lp-hero-title">Real-time messaging &amp; notifications<br class="hero-br"> for your app</h1>
        <p class="lp-hero-sub">WebSocket delivery, durable store-and-forward, and topic-based push notifications — single binary with SQLite, zero external dependencies.</p>
        <div class="lp-hero-actions">
          <a href="#demo" class="lp-btn-primary" id="hero-try-btn">&#9654;&nbsp;&nbsp;Try it live</a>
          <a href="https://docs.chatapi.cloud" class="lp-btn-secondary" target="_blank" rel="noopener">View Docs →</a>
          <a href="https://github.com/hastenr/chatapi" class="lp-btn-ghost" target="_blank" rel="noopener">GitHub</a>
        </div>
      </div>
    </section>

    <section class="lp-features">
      <div class="lp-section-inner">
        <div class="lp-features-grid">${featureCards}</div>
      </div>
    </section>

    <section class="lp-code">
      <div class="lp-section-inner lp-code-inner">
        <div class="lp-code-text">
          <h2 class="lp-section-title">Up and running in minutes</h2>
          <p class="lp-section-sub">Install the TypeScript SDK and start sending messages with a few lines of code. Works in browser and Node.js.</p>
          <ul class="lp-code-steps">
            <li><span class="lp-step-num">1</span> Install the SDK</li>
            <li><span class="lp-step-num">2</span> Connect a user</li>
            <li><span class="lp-step-num">3</span> Send &amp; receive messages</li>
            <li><span class="lp-step-num">4</span> Subscribe to notifications</li>
          </ul>
          <a href="https://docs.chatapi.cloud/api/" class="lp-btn-secondary lp-code-docs-btn" target="_blank" rel="noopener">Full API Reference →</a>
        </div>
        <div class="lp-code-block" id="code-block-container"></div>
      </div>
    </section>

    <section class="lp-demo" id="demo">
      <div class="lp-section-inner">
        <div class="lp-demo-hdr">
          <h2 class="lp-section-title">See it live</h2>
          <p class="lp-section-sub">A real marketplace scenario — buyer and seller chat, with order status notifications delivered over WebSocket in real time.</p>
        </div>
        <div id="demo-container" class="lp-demo-container">
          <div class="lp-demo-launch">
            <div class="lp-demo-launch-icon">&#9654;</div>
            <div class="lp-demo-launch-title">Interactive Demo</div>
            <div class="lp-demo-launch-desc">Live WebSocket connections to a real ChatAPI server</div>
            <button class="lp-btn-primary lp-launch-btn" id="launch-btn">Launch Demo</button>
            <div class="lp-demo-launch-note">Connects in ~1 second &nbsp;·&nbsp; No sign-up required</div>
          </div>
        </div>
      </div>
    </section>

    <footer class="lp-footer">
      <div class="lp-footer-inner">
        <div class="brand">
          <span class="brand-dot"></span>
          <span class="brand-name lp-footer-brand-name">ChatAPI</span>
        </div>
        <div class="lp-footer-links">
          <a href="https://docs.chatapi.cloud" target="_blank" rel="noopener">Documentation</a>
          <a href="https://github.com/hastenr/chatapi" target="_blank" rel="noopener">GitHub</a>
          <a href="https://www.npmjs.com/package/@hastenr/chatapi-sdk" target="_blank" rel="noopener">npm SDK</a>
          <a href="https://hub.docker.com/r/hastenr/chatapi" target="_blank" rel="noopener">Docker Hub</a>
          <a href="https://github.com/hastenr/chatapi/issues" target="_blank" rel="noopener">Issues</a>
        </div>
        <div class="lp-footer-copy">MIT License &nbsp;·&nbsp; Built with Go &amp; SQLite</div>
      </div>
    </footer>
  `;

  // Set code block via textContent to avoid escaping issues
  const codeContainer = document.getElementById('code-block-container')!;
  codeContainer.innerHTML = `
    <div class="lp-code-header">
      <div class="lp-code-dots"><span></span><span></span><span></span></div>
      <span class="lp-code-lang">TypeScript</span>
    </div>
    <pre class="lp-code-pre" id="code-pre"></pre>
  `;
  document.getElementById('code-pre')!.textContent = CODE_SNIPPET;

  // "Try it live" scrolls to demo and auto-launches
  const scrollAndLaunch = (e: Event) => {
    e.preventDefault();
    document.getElementById('demo')!.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => (document.getElementById('launch-btn') as HTMLButtonElement | null)?.click(), 700);
  };
  document.getElementById('hero-try-btn')!.addEventListener('click', scrollAndLaunch);
  document.getElementById('nav-try-btn')!.addEventListener('click', scrollAndLaunch);
  document.getElementById('launch-btn')!.addEventListener('click', launchDemo);
}

// ─── Demo Launch ──────────────────────────────────────────────────────────────

async function launchDemo(): Promise<void> {
  const container = document.getElementById('demo-container')!;

  container.innerHTML = `
    <div class="lp-demo-loading">
      <div class="spinner"></div>
      <p>Connecting…</p>
    </div>
  `;

  try {
    const buyerSDK = new ChatAPI({ baseURL: BASE_URL, apiKey: API_KEY, userId: BUYER.id, displayName: BUYER.name });

    const room = await buyerSDK.rooms.create({
      type: 'dm',
      members: [BUYER.id, SELLER.id],
      metadata: JSON.stringify({
        listing_id: LISTING.id,
        title:      LISTING.title,
        price:      LISTING.price,
        condition:  LISTING.condition,
        specs:      LISTING.specs,
      }),
    });

    const sellerSDK = new ChatAPI({ baseURL: BASE_URL, apiKey: API_KEY, userId: SELLER.id, displayName: SELLER.name });
    await Promise.all([buyerSDK.connect(), sellerSDK.connect()]);
    await buyerSDK.subscriptions.subscribe('order.updates');

    renderDemoUI(container, room.room_id, buyerSDK, sellerSDK);
  } catch (err) {
    container.innerHTML = `
      <div class="lp-demo-launch">
        <div class="lp-demo-launch-icon">⚠️</div>
        <div class="lp-demo-launch-title">Connection failed</div>
        <div class="lp-demo-launch-desc">${err instanceof Error ? esc(err.message) : 'Could not connect to the demo server.'}</div>
        <button class="lp-btn-primary lp-launch-btn" id="launch-btn">Try Again</button>
      </div>
    `;
    document.getElementById('launch-btn')!.addEventListener('click', launchDemo);
  }
}

// ─── Demo UI ──────────────────────────────────────────────────────────────────

function renderDemoUI(container: HTMLElement, roomId: string, buyerSDK: ChatAPI, sellerSDK: ChatAPI): void {
  const orderBtns = ORDER_EVENTS.map((e, i) => `
    <button class="order-btn" id="order-btn-${i}" style="--accent:${e.color}">
      <span class="order-btn-icon">${e.icon}</span>
      <span class="order-btn-label">${e.label}</span>
    </button>
  `).join('');

  container.innerHTML = `
    <div class="demo-screen">

      <div class="demo-header">
        <div class="header-left">
          <div class="brand">
            <span class="brand-dot"></span>
            <span class="brand-name">ChatAPI</span>
          </div>
          <span class="live-badge">● Live</span>
        </div>

        <div class="listing-card">
          <span class="listing-emoji">${LISTING.emoji}</span>
          <div class="listing-info">
            <div class="listing-title">${LISTING.title}</div>
            <div class="listing-meta">
              <strong>${LISTING.price}</strong>
              <span class="sep">·</span>${LISTING.condition}
              <span class="sep">·</span>${LISTING.specs}
              <span class="sep">·</span>
              <span class="listing-id-tag">#${LISTING.id}</span>
            </div>
          </div>
        </div>

        <div class="feature-chips">
          <span class="chip">⚡ Real-time</span>
          <span class="chip">⌨️ Typing</span>
          <span class="chip">👁 Presence</span>
          <span class="chip">✓ Delivery</span>
          <span class="chip">🏷 Metadata</span>
          <span class="chip">🔔 Notifications</span>
        </div>
      </div>

      <div class="panels">

        <!-- Buyer -->
        <div class="panel">
          <div class="panel-header">
            <div class="user-row">
              <div class="avatar avatar-buyer">${BUYER.initials}</div>
              <div>
                <div class="user-name">${BUYER.name}</div>
                <div class="user-role">Buyer</div>
              </div>
            </div>
            <div class="panel-controls">
              <div class="presence" id="buyer-presence">
                <span class="presence-dot online"></span>
                <span class="presence-label">Online</span>
              </div>
              <button class="conn-btn conn-btn-disconnect" id="buyer-conn-btn" title="Disconnect">⏏</button>
            </div>
          </div>
          <div class="messages" id="buyer-messages">
            <div class="messages-empty">Type a message to start the conversation</div>
          </div>
          <div class="typing-row hidden" id="buyer-typing">
            <div class="typing-bubbles"><span></span><span></span><span></span></div>
            <span class="typing-label">${SELLER.name} is typing…</span>
          </div>
          <div class="input-row">
            <input class="msg-input" id="buyer-input" type="text"
              placeholder="Message as ${BUYER.name}…" autocomplete="off" />
            <button class="send-btn send-buyer" id="buyer-send">↑</button>
          </div>
        </div>

        <!-- Order Hub -->
        <div class="order-hub">
          <div class="hub-section">
            <div class="hub-label">Room</div>
            <div class="hub-room-id" title="${roomId}">${roomId.slice(0, 14)}…</div>
          </div>
          <div class="hub-section">
            <div class="hub-label">Room Metadata</div>
            <div class="meta-tags">
              <span class="meta-tag">listing_id</span>
              <span class="meta-tag">price</span>
              <span class="meta-tag">condition</span>
              <span class="meta-tag">specs</span>
            </div>
          </div>
          <div class="hub-section">
            <div class="hub-label">Subscriptions</div>
            <div class="sub-row">
              <span class="sub-dot"></span>
              <span class="sub-topic">order.updates</span>
              <span class="sub-check">✓</span>
            </div>
            <div class="sub-note">${BUYER.name} subscribed at boot</div>
          </div>
          <div class="hub-section">
            <div class="hub-label">Simulate Backend</div>
            <div class="hub-actions-note">POST /notify → topic_subscribers → buyer WS</div>
            <div class="order-btns">${orderBtns}</div>
          </div>
          <div class="hub-section hub-feed-section">
            <div class="hub-label">
              🔔 Notifications
              <span class="notif-count hidden" id="notif-count">0</span>
            </div>
            <div class="notif-feed" id="notif-feed">
              <div class="notif-empty">Waiting for order updates…</div>
            </div>
          </div>
        </div>

        <!-- Seller -->
        <div class="panel">
          <div class="panel-header">
            <div class="user-row">
              <div class="avatar avatar-seller">${SELLER.initials}</div>
              <div>
                <div class="user-name">${SELLER.name}</div>
                <div class="user-role">Seller</div>
              </div>
            </div>
            <div class="panel-controls">
              <div class="presence" id="seller-presence">
                <span class="presence-dot online"></span>
                <span class="presence-label">Online</span>
              </div>
              <button class="conn-btn conn-btn-disconnect" id="seller-conn-btn" title="Disconnect">⏏</button>
            </div>
          </div>
          <div class="messages" id="seller-messages">
            <div class="messages-empty">Type a message to start the conversation</div>
          </div>
          <div class="typing-row hidden" id="seller-typing">
            <div class="typing-bubbles"><span></span><span></span><span></span></div>
            <span class="typing-label">${BUYER.name} is typing…</span>
          </div>
          <div class="input-row">
            <input class="msg-input" id="seller-input" type="text"
              placeholder="Message as ${SELLER.name}…" autocomplete="off" />
            <button class="send-btn send-seller" id="seller-send">↑</button>
          </div>
        </div>

      </div>
    </div>
  `;

  wireChat(roomId, buyerSDK, sellerSDK);
}

// ─── Chat + Notification Wiring ───────────────────────────────────────────────

function wireChat(roomId: string, buyerSDK: ChatAPI, sellerSDK: ChatAPI): void {
  let buyerTypingTimer:  ReturnType<typeof setTimeout> | null = null;
  let sellerTypingTimer: ReturnType<typeof setTimeout> | null = null;
  let notifCount = 0;

  buyerSDK.on('message', (ev) => {
    if (ev.room_id !== roomId) return;
    clearEmpty('buyer-messages');
    appendMsg('buyer-messages', toMsg(ev), ev.sender_id === BUYER.id);
    buyerSDK.acknowledgeMessage(roomId, ev.seq);
  });

  sellerSDK.on('message', (ev) => {
    if (ev.room_id !== roomId) return;
    clearEmpty('seller-messages');
    appendMsg('seller-messages', toMsg(ev), ev.sender_id === SELLER.id);
    sellerSDK.acknowledgeMessage(roomId, ev.seq);
  });

  buyerSDK.on('ack.received', (ev) => {
    if (ev.room_id === roomId) markDelivered('buyer-messages', ev.seq);
  });

  sellerSDK.on('ack.received', (ev) => {
    if (ev.room_id === roomId) markDelivered('seller-messages', ev.seq);
  });

  buyerSDK.on('typing', (ev) => {
    if (ev.room_id === roomId && ev.user_id !== BUYER.id) toggleTyping('buyer-typing', ev.action === 'start');
  });

  sellerSDK.on('typing', (ev) => {
    if (ev.room_id === roomId && ev.user_id !== SELLER.id) toggleTyping('seller-typing', ev.action === 'start');
  });

  buyerSDK.on('presence.update', (ev) => {
    if (ev.user_id === SELLER.id) updatePresence('buyer-presence', ev.status === 'online');
  });

  sellerSDK.on('presence.update', (ev) => {
    if (ev.user_id === BUYER.id) updatePresence('seller-presence', ev.status === 'online');
  });

  buyerSDK.on('notification', (ev) => {
    let payload: Record<string, string> = {};
    try { payload = JSON.parse(ev.payload); } catch { /* non-JSON */ }

    notifCount++;
    const badge = document.getElementById('notif-count')!;
    badge.textContent = String(notifCount);
    badge.classList.remove('hidden');

    appendNotification(ev.topic, payload);
    showToast(payload.message || ev.topic, getStatusIcon(payload.status));
  });

  ORDER_EVENTS.forEach((event, i) => {
    const btn = document.getElementById(`order-btn-${i}`) as HTMLButtonElement;
    btn.addEventListener('click', async () => {
      btn.disabled = true;
      btn.classList.add('btn-sending');
      btn.querySelector('.order-btn-label')!.textContent = 'Sending…';

      try {
        await sellerSDK.notifications.send({
          topic: 'order.updates',
          payload: {
            status:  event.status,
            message: event.message,
            item:    LISTING.title,
            ...('tracking' in event ? { tracking: event.tracking } : {}),
          },
          targets: { topic_subscribers: true },
        });
        btn.classList.remove('btn-sending');
        btn.classList.add('btn-sent');
        btn.querySelector('.order-btn-label')!.textContent = 'Sent ✓';
      } catch {
        btn.disabled = false;
        btn.classList.remove('btn-sending');
        btn.querySelector('.order-btn-label')!.textContent = event.label;
      }
    });
  });

  bindInput('buyer-input',  'buyer-send',  buyerSDK,  () => buyerTypingTimer,  (t) => { buyerTypingTimer  = t; });
  bindInput('seller-input', 'seller-send', sellerSDK, () => sellerTypingTimer, (t) => { sellerTypingTimer = t; });

  // Connection state
  wireConnButton('buyer-conn-btn',  'buyer-presence',  buyerSDK);
  wireConnButton('seller-conn-btn', 'seller-presence', sellerSDK);

  function bindInput(
    inputId: string,
    btnId: string,
    sdk: ChatAPI,
    getTimer: () => ReturnType<typeof setTimeout> | null,
    setTimer: (t: ReturnType<typeof setTimeout>) => void,
  ): void {
    const input = document.getElementById(inputId) as HTMLInputElement;
    const send = () => {
      const text = input.value.trim();
      if (!text) return;
      input.value = '';
      sdk.sendMessage(roomId, text);
      sdk.sendTyping(roomId, 'stop');
      const t = getTimer();
      if (t) clearTimeout(t);
    };
    document.getElementById(btnId)!.addEventListener('click', send);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { send(); return; }
      sdk.sendTyping(roomId, 'start');
      const t = getTimer();
      if (t) clearTimeout(t);
      setTimer(setTimeout(() => sdk.sendTyping(roomId, 'stop'), 2000));
    });
  }
}

// ─── Connection Button ────────────────────────────────────────────────────────

function wireConnButton(btnId: string, presenceId: string, sdk: ChatAPI): void {
  const btn = document.getElementById(btnId) as HTMLButtonElement;

  const setDisconnected = () => {
    btn.textContent = '⟳';
    btn.title = 'Reconnect';
    btn.classList.remove('conn-btn-disconnect');
    btn.classList.add('conn-btn-reconnect');
    const el = document.getElementById(presenceId)!;
    el.querySelector('.presence-dot')!.className = 'presence-dot offline';
    el.querySelector('.presence-label')!.textContent = 'Disconnected';
  };

  const setReconnecting = (attempt: number) => {
    btn.textContent = '…';
    btn.title = `Reconnecting (attempt ${attempt})`;
    btn.disabled = true;
    const el = document.getElementById(presenceId)!;
    el.querySelector('.presence-dot')!.className = 'presence-dot reconnecting';
    el.querySelector('.presence-label')!.textContent = 'Reconnecting…';
  };

  const setConnected = () => {
    btn.textContent = '⏏';
    btn.title = 'Disconnect';
    btn.disabled = false;
    btn.classList.remove('conn-btn-reconnect');
    btn.classList.add('conn-btn-disconnect');
    const el = document.getElementById(presenceId)!;
    el.querySelector('.presence-dot')!.className = 'presence-dot online';
    el.querySelector('.presence-label')!.textContent = 'Online';
  };

  sdk.on('connection.lost',         ()  => setDisconnected());
  sdk.on('connection.reconnecting', (ev) => setReconnecting((ev as any).attempt));
  sdk.on('connection.open',         ()  => setConnected());
  sdk.on('connection.failed',       ()  => {
    btn.textContent = '⟳';
    btn.title = 'Reconnect';
    btn.disabled = false;
    btn.classList.remove('conn-btn-disconnect');
    btn.classList.add('conn-btn-reconnect');
    const el = document.getElementById(presenceId)!;
    el.querySelector('.presence-dot')!.className = 'presence-dot offline';
    el.querySelector('.presence-label')!.textContent = 'Failed';
  });

  btn.addEventListener('click', async () => {
    if (btn.classList.contains('conn-btn-disconnect')) {
      await sdk.disconnect();
      setDisconnected();
    } else {
      btn.disabled = true;
      setReconnecting(0);
      try {
        await sdk.connect();
        setConnected();
      } catch {
        setDisconnected();
      }
    }
  });
}

// ─── Notification Helpers ─────────────────────────────────────────────────────

function appendNotification(topic: string, payload: Record<string, string>): void {
  const feed = document.getElementById('notif-feed')!;
  feed.querySelector('.notif-empty')?.remove();

  const el = document.createElement('div');
  el.className = 'notif-item notif-enter';
  el.innerHTML = `
    <div class="notif-icon">${getStatusIcon(payload.status)}</div>
    <div class="notif-body">
      <div class="notif-message">${esc(payload.message || topic)}</div>
      ${payload.tracking ? `<div class="notif-tracking">📬 ${esc(payload.tracking)}</div>` : ''}
      <div class="notif-footer">
        <span class="notif-topic-badge">${esc(topic)}</span>
        <span class="notif-time">${now()}</span>
      </div>
    </div>
  `;
  feed.insertBefore(el, feed.firstChild);
  requestAnimationFrame(() => el.classList.remove('notif-enter'));
}

function showToast(message: string, icon: string): void {
  const toast = document.createElement('div');
  toast.className = 'notif-toast';
  toast.innerHTML = `
    <div class="toast-icon">${icon}</div>
    <div class="toast-body">
      <div class="toast-label">order.updates</div>
      <div class="toast-message">${esc(message)}</div>
    </div>
  `;
  document.body.appendChild(toast);
  requestAnimationFrame(() => {
    toast.classList.add('toast-show');
    setTimeout(() => {
      toast.classList.remove('toast-show');
      setTimeout(() => toast.remove(), 350);
    }, 4000);
  });
}

function getStatusIcon(status?: string): string {
  const map: Record<string, string> = {
    confirmed: '✅', payment_verified: '💳', packaged: '📦', shipped: '🚚',
  };
  return map[status ?? ''] ?? '🔔';
}

// ─── DOM Helpers ──────────────────────────────────────────────────────────────

function toMsg(ev: { message_id: string; sender_id: string; content: string; seq: number; meta?: string }): ChatMsg {
  return { id: ev.message_id, senderId: ev.sender_id, content: ev.content, seq: ev.seq, time: now(), meta: ev.meta };
}

function clearEmpty(listId: string): void {
  document.querySelector(`#${listId} .messages-empty`)?.remove();
}

function appendMsg(listId: string, msg: ChatMsg, isSelf: boolean): void {
  const list = document.getElementById(listId)!;
  const el = document.createElement('div');
  el.className = `msg ${isSelf ? 'msg-self' : 'msg-other'}`;
  el.dataset.seq = String(msg.seq);

  let displayName = '';
  if (!isSelf && msg.meta) {
    try {
      const m = typeof msg.meta === 'string' ? JSON.parse(msg.meta) : msg.meta;
      if (m.displayName) displayName = m.displayName;
    } catch { /* ignore */ }
  }

  el.innerHTML = `
    <div class="bubble">
      ${displayName ? `<div class="bubble-sender">${esc(displayName)}</div>` : ''}
      <div class="bubble-text">${esc(msg.content)}</div>
      <div class="bubble-meta">
        <span class="msg-time">${msg.time}</span>
        ${isSelf ? '<span class="msg-status" title="Sent">✓</span>' : ''}
      </div>
    </div>
  `;
  list.appendChild(el);
  list.scrollTop = list.scrollHeight;
}

function markDelivered(listId: string, seq: number): void {
  const el = document.querySelector(`#${listId} [data-seq="${seq}"] .msg-status`);
  if (el) { el.textContent = '✓✓'; el.classList.add('delivered'); el.setAttribute('title', 'Delivered'); }
}

function toggleTyping(id: string, show: boolean): void {
  document.getElementById(id)!.classList.toggle('hidden', !show);
}

function updatePresence(id: string, online: boolean): void {
  const el = document.getElementById(id)!;
  el.querySelector('.presence-dot')!.className = `presence-dot ${online ? 'online' : 'offline'}`;
  el.querySelector('.presence-label')!.textContent = online ? 'Online' : 'Offline';
}

function now(): string {
  return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function esc(text: string): string {
  const d = document.createElement('div');
  d.appendChild(document.createTextNode(text));
  return d.innerHTML;
}
