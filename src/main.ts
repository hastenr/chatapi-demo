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

const sid     = Math.random().toString(36).slice(2, 8);
const CUSTOMER = { id: `visitor_${sid}`, name: 'You' };
const AGENT    = { id: `agent_${sid}`,   name: 'Alex Rivera', initials: 'AR' };

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
await client.subscriptions.subscribe('support.queue');
client.on('notification', (ev) => {
  const data = JSON.parse(ev.payload);
  console.log(data.message);
});`;

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
          <p class="lp-section-sub">A real support chat — customer on the left, agent dashboard on the right. Toggle the agent away to see topic notifications fire in real time.</p>
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

  const codeContainer = document.getElementById('code-block-container')!;
  codeContainer.innerHTML = `
    <div class="lp-code-header">
      <div class="lp-code-dots"><span></span><span></span><span></span></div>
      <span class="lp-code-lang">TypeScript</span>
    </div>
    <pre class="lp-code-pre" id="code-pre"></pre>
  `;
  document.getElementById('code-pre')!.textContent = CODE_SNIPPET;

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
    // Create a shared support room
    const bootstrap = new ChatAPI({ baseURL: BASE_URL, apiKey: API_KEY, userId: AGENT.id });
    const room = await bootstrap.rooms.create({
      type: 'dm',
      members: [CUSTOMER.id, AGENT.id],
    });

    // Connect both sides
    const customerSDK = new ChatAPI({ baseURL: BASE_URL, apiKey: API_KEY, userId: CUSTOMER.id, displayName: CUSTOMER.name });
    const agentSDK    = new ChatAPI({ baseURL: BASE_URL, apiKey: API_KEY, userId: AGENT.id,    displayName: AGENT.name });
    await Promise.all([customerSDK.connect(), agentSDK.connect()]);

    // Agent subscribes to be notified when away and customer sends a message
    await agentSDK.subscriptions.subscribe('support.queue');

    renderDemoUI(container, room.room_id, customerSDK, agentSDK);
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

function renderDemoUI(container: HTMLElement, roomId: string, customerSDK: ChatAPI, agentSDK: ChatAPI): void {
  container.innerHTML = `
    <div class="demo-screen">

      <!-- ── Left: Customer view ───────────────────────────────────────────── -->
      <div class="demo-left">
        <div class="pane-label">
          <span class="pane-label-dot customer-dot"></span>
          Customer view
        </div>
        <div class="fake-browser">
          <div class="browser-chrome">
            <div class="browser-dots"><span></span><span></span><span></span></div>
            <div class="browser-url">acmesaas.com/pricing</div>
          </div>
          <div class="fake-page">
            <div class="fake-page-hero">
              <div class="fake-logo">Acme</div>
              <h3 class="fake-heading">Upgrade your plan</h3>
              <p class="fake-sub">Unlock unlimited seats, priority support, and advanced analytics.</p>
              <div class="fake-plan-cards">
                <div class="fake-plan active-plan">
                  <div class="fake-plan-name">Pro</div>
                  <div class="fake-plan-price">$99<span>/mo</span></div>
                </div>
                <div class="fake-plan">
                  <div class="fake-plan-name">Enterprise</div>
                  <div class="fake-plan-price">Custom</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Chat widget -->
          <div class="chat-widget" id="chat-widget">
            <div class="widget-window" id="widget-window">
              <div class="widget-header">
                <div class="widget-agent-info">
                  <div class="widget-avatar">${AGENT.initials}</div>
                  <div>
                    <div class="widget-agent-name">${AGENT.name}</div>
                    <div class="widget-agent-status" id="widget-agent-status">
                      <span class="status-dot online" id="widget-status-dot"></span>
                      <span id="widget-status-text">Online</span>
                    </div>
                  </div>
                </div>
                <button class="widget-minimize" id="widget-minimize" title="Minimize">−</button>
              </div>
              <div class="widget-messages" id="widget-messages">
                <div class="widget-intro">
                  <div class="widget-avatar lg">${AGENT.initials}</div>
                  <p>Hi there! I'm ${AGENT.name}. How can I help you today?</p>
                </div>
              </div>
              <div class="widget-typing-row hidden" id="widget-typing">
                <div class="typing-dots"><span></span><span></span><span></span></div>
                <span>${AGENT.name} is typing…</span>
              </div>
              <div class="widget-input-row">
                <input class="widget-input" id="widget-input" type="text"
                  placeholder="Type a message…" autocomplete="off" />
                <button class="widget-send-btn" id="widget-send">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                </button>
              </div>
            </div>
            <button class="widget-fab" id="widget-fab" title="Open chat" style="display:none">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <span class="fab-badge hidden" id="fab-badge">1</span>
            </button>
          </div>
        </div>
      </div>

      <!-- ── Right: Agent dashboard ─────────────────────────────────────────── -->
      <div class="demo-right">
        <div class="pane-label">
          <span class="pane-label-dot agent-dot"></span>
          Agent dashboard
        </div>
        <div class="agent-dashboard">
          <div class="agent-topbar">
            <div class="agent-identity">
              <div class="agent-avatar">${AGENT.initials}</div>
              <div>
                <div class="agent-name">${AGENT.name}</div>
                <div class="agent-subtitle">Support Agent</div>
              </div>
            </div>
            <div class="agent-controls">
              <button class="status-pill online" id="status-pill">● Online</button>
              <button class="agent-conn-btn connected" id="agent-conn-btn">Disconnect</button>
            </div>
          </div>

          <div class="notif-banner hidden" id="notif-banner">
            <span class="notif-banner-icon">🔔</span>
            <span id="notif-banner-text">New message from customer</span>
            <button class="notif-banner-dismiss" id="notif-banner-dismiss">×</button>
          </div>

          <div class="agent-conv-header">
            <div class="conv-customer-name">${CUSTOMER.name}</div>
            <div class="conv-room-id" title="${roomId}">room: ${roomId.slice(0, 16)}…</div>
          </div>

          <div class="agent-messages" id="agent-messages">
            <div class="agent-messages-empty">Waiting for customer…</div>
          </div>

          <div class="agent-typing-row hidden" id="agent-typing">
            <div class="typing-dots"><span></span><span></span><span></span></div>
            <span>Customer is typing…</span>
          </div>

          <div class="agent-input-row">
            <input class="agent-input" id="agent-input" type="text"
              placeholder="Reply as ${AGENT.name}…" autocomplete="off" />
            <button class="agent-send-btn" id="agent-send">Send</button>
          </div>
        </div>
      </div>

    </div>
  `;

  wireDemo(roomId, customerSDK, agentSDK);
}

// ─── Demo Wiring ──────────────────────────────────────────────────────────────

function wireDemo(roomId: string, customerSDK: ChatAPI, agentSDK: ChatAPI): void {
  let customerTypingTimer: ReturnType<typeof setTimeout> | null = null;
  let agentTypingTimer:    ReturnType<typeof setTimeout> | null = null;
  let agentIsAway = false;
  let widgetOpen  = true;
  let unreadCount = 0;

  // ── Messaging ────────────────────────────────────────────────────────────────

  customerSDK.on('message', (ev) => {
    if (ev.room_id !== roomId) return;
    clearEmpty('widget-messages');
    appendWidgetMsg(ev.sender_id === CUSTOMER.id, ev.content, ev.seq);
    customerSDK.acknowledgeMessage(roomId, ev.seq);
    if (ev.sender_id !== CUSTOMER.id && !widgetOpen) {
      unreadCount++;
      showFabBadge(unreadCount);
    }
  });

  agentSDK.on('message', (ev) => {
    if (ev.room_id !== roomId) return;
    clearEmpty('agent-messages');
    appendAgentMsg(ev.sender_id === AGENT.id, ev.sender_id === CUSTOMER.id ? CUSTOMER.name : AGENT.name, ev.content, ev.seq);
    agentSDK.acknowledgeMessage(roomId, ev.seq);

    // When away and customer sends a message, simulate a backend notification
    if (agentIsAway && ev.sender_id === CUSTOMER.id) {
      customerSDK.notifications.send({
        topic: 'support.queue',
        payload: { message: `New message from ${CUSTOMER.name}: "${ev.content}"` },
        targets: { topic_subscribers: true },
      }).catch(() => {/* ignore */});
    }
  });

  // ── Notifications ────────────────────────────────────────────────────────────

  agentSDK.on('notification', (ev) => {
    let data: Record<string, string> = {};
    try { data = JSON.parse(ev.payload); } catch { /* non-JSON */ }
    showNotifBanner(data.message || 'New activity');
    showToast(data.message || 'New activity');
  });

  // ── Typing ───────────────────────────────────────────────────────────────────

  customerSDK.on('typing', (ev) => {
    if (ev.room_id === roomId && ev.user_id !== CUSTOMER.id)
      toggleEl('widget-typing', ev.action === 'start');
  });

  agentSDK.on('typing', (ev) => {
    if (ev.room_id === roomId && ev.user_id !== AGENT.id)
      toggleEl('agent-typing', ev.action === 'start');
  });

  // ── Presence ─────────────────────────────────────────────────────────────────

  customerSDK.on('presence.update', (ev) => {
    if (ev.user_id === AGENT.id) updateWidgetPresence(ev.status === 'online');
  });

  // ── ACK delivery ticks ────────────────────────────────────────────────────────

  customerSDK.on('ack.received', (ev) => {
    if (ev.room_id === roomId) markDelivered('widget-messages', ev.seq);
  });
  agentSDK.on('ack.received', (ev) => {
    if (ev.room_id === roomId) markDelivered('agent-messages', ev.seq);
  });

  // ── Widget toggle ────────────────────────────────────────────────────────────

  document.getElementById('widget-minimize')!.addEventListener('click', () => {
    document.getElementById('widget-window')!.style.display = 'none';
    document.getElementById('widget-fab')!.style.display    = 'flex';
    widgetOpen = false;
  });

  document.getElementById('widget-fab')!.addEventListener('click', () => {
    document.getElementById('widget-window')!.style.display = '';
    document.getElementById('widget-fab')!.style.display    = 'none';
    widgetOpen = true;
    unreadCount = 0;
    const badge = document.getElementById('fab-badge')!;
    badge.classList.add('hidden');
    badge.textContent = '';
  });

  // ── Customer input ───────────────────────────────────────────────────────────

  bindInput('widget-input', 'widget-send', customerSDK, roomId,
    () => customerTypingTimer, (t) => { customerTypingTimer = t; });

  // ── Agent input ───────────────────────────────────────────────────────────────

  bindInput('agent-input', 'agent-send', agentSDK, roomId,
    () => agentTypingTimer, (t) => { agentTypingTimer = t; });

  // ── Agent status toggle ───────────────────────────────────────────────────────

  document.getElementById('status-pill')!.addEventListener('click', () => {
    agentIsAway = !agentIsAway;
    const pill = document.getElementById('status-pill')!;
    pill.textContent = agentIsAway ? '○ Away' : '● Online';
    pill.className   = `status-pill ${agentIsAway ? 'away' : 'online'}`;
  });

  // ── Agent disconnect / reconnect ─────────────────────────────────────────────

  const connBtn = document.getElementById('agent-conn-btn')!;
  connBtn.addEventListener('click', async () => {
    if (connBtn.classList.contains('connected')) {
      await agentSDK.disconnect();
      connBtn.textContent = 'Reconnect';
      connBtn.className   = 'agent-conn-btn disconnected';
    } else {
      connBtn.textContent = 'Connecting…';
      connBtn.className   = 'agent-conn-btn connecting';
      try {
        await agentSDK.connect();
        connBtn.textContent = 'Disconnect';
        connBtn.className   = 'agent-conn-btn connected';
      } catch {
        connBtn.textContent = 'Reconnect';
        connBtn.className   = 'agent-conn-btn disconnected';
      }
    }
  });

  agentSDK.on('connection.lost',   () => {
    connBtn.textContent = 'Reconnect';
    connBtn.className   = 'agent-conn-btn disconnected';
  });
  agentSDK.on('connection.open',   () => {
    connBtn.textContent = 'Disconnect';
    connBtn.className   = 'agent-conn-btn connected';
  });

  // ── Notification banner dismiss ───────────────────────────────────────────────

  document.getElementById('notif-banner-dismiss')!.addEventListener('click', () => {
    document.getElementById('notif-banner')!.classList.add('hidden');
  });
}

// ─── Input Binding ────────────────────────────────────────────────────────────

function bindInput(
  inputId: string,
  btnId: string,
  sdk: ChatAPI,
  roomId: string,
  getTimer: () => ReturnType<typeof setTimeout> | null,
  setTimer: (t: ReturnType<typeof setTimeout>) => void,
): void {
  const input = document.getElementById(inputId) as HTMLInputElement;
  const send = () => {
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    try {
      sdk.sendMessage(roomId, text);
    } catch { /* disconnected */ }
    sdk.sendTyping(roomId, 'stop');
    const t = getTimer();
    if (t) clearTimeout(t);
  };
  document.getElementById(btnId)!.addEventListener('click', send);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { send(); return; }
    try { sdk.sendTyping(roomId, 'start'); } catch { /* disconnected */ }
    const t = getTimer();
    if (t) clearTimeout(t);
    setTimer(setTimeout(() => { try { sdk.sendTyping(roomId, 'stop'); } catch { /* ok */ } }, 2000));
  });
}

// ─── DOM Helpers ──────────────────────────────────────────────────────────────

function clearEmpty(id: string): void {
  document.querySelector(`#${id} .widget-intro`)?.remove();
  document.querySelector(`#${id} .agent-messages-empty`)?.remove();
  document.querySelector(`#${id} .widget-welcome`)?.remove();
}

function appendWidgetMsg(isSelf: boolean, content: string, seq: number): void {
  const list = document.getElementById('widget-messages')!;
  const el   = document.createElement('div');
  el.className       = `wm ${isSelf ? 'wm-self' : 'wm-other'}`;
  el.dataset['seq']  = String(seq);
  el.innerHTML = `
    <div class="wm-bubble">
      <div class="wm-text">${esc(content)}</div>
      <div class="wm-meta">
        <span class="wm-time">${now()}</span>
        ${isSelf ? '<span class="wm-tick" title="Sent">✓</span>' : ''}
      </div>
    </div>
  `;
  list.appendChild(el);
  list.scrollTop = list.scrollHeight;
}

function appendAgentMsg(isSelf: boolean, senderName: string, content: string, seq: number): void {
  const list = document.getElementById('agent-messages')!;
  const el   = document.createElement('div');
  el.className       = `am ${isSelf ? 'am-self' : 'am-other'}`;
  el.dataset['seq']  = String(seq);
  el.innerHTML = `
    <div class="am-wrap">
      ${!isSelf ? `<div class="am-sender">${esc(senderName)}</div>` : ''}
      <div class="am-bubble">
        <div class="am-text">${esc(content)}</div>
        <div class="am-meta">
          <span class="am-time">${now()}</span>
          ${isSelf ? '<span class="am-tick" title="Sent">✓</span>' : ''}
        </div>
      </div>
    </div>
  `;
  list.appendChild(el);
  list.scrollTop = list.scrollHeight;
}

function markDelivered(listId: string, seq: number): void {
  const el = document.querySelector(`#${listId} [data-seq="${seq}"] .wm-tick, #${listId} [data-seq="${seq}"] .am-tick`);
  if (el) { el.textContent = '✓✓'; el.setAttribute('title', 'Delivered'); }
}

function toggleEl(id: string, show: boolean): void {
  document.getElementById(id)!.classList.toggle('hidden', !show);
}

function updateWidgetPresence(online: boolean): void {
  const dot  = document.getElementById('widget-status-dot')!;
  const text = document.getElementById('widget-status-text')!;
  dot.className  = `status-dot ${online ? 'online' : 'offline'}`;
  text.textContent = online ? 'Online' : 'Away';
}

function showFabBadge(count: number): void {
  const badge = document.getElementById('fab-badge')!;
  badge.textContent = String(count);
  badge.classList.remove('hidden');
}

function showNotifBanner(message: string): void {
  const banner = document.getElementById('notif-banner')!;
  document.getElementById('notif-banner-text')!.textContent = message;
  banner.classList.remove('hidden');
}

function showToast(message: string): void {
  const toast = document.createElement('div');
  toast.className = 'notif-toast';
  toast.innerHTML = `
    <div class="toast-icon">🔔</div>
    <div class="toast-body">
      <div class="toast-label">support.queue</div>
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

function now(): string {
  return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

function esc(text: string): string {
  const d = document.createElement('div');
  d.appendChild(document.createTextNode(text));
  return d.innerHTML;
}
