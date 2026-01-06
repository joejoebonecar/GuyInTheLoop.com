/**
 * HUD and UI
 * Imageboard-style wrapper, theme switcher, status text, move log
 */

// Theme definitions (classic imageboard themes)
export const THEMES = {
  yotsuba: {
    name: 'Yotsuba',
    headerBg: '#F0E0D6',
    headerBorder: '#D9BFB7',
    bodyBg: '#FFFFEE',
    postBg: '#F0E0D6',
    textColor: '#800000',
    linkColor: '#0000EE',
    nameColor: '#117743',
    // Board colors
    lightSquare: 0xf5deb3,
    darkSquare: 0xd2691e,
    background: 0xffffee
  },
  yotsubaB: {
    name: 'Yotsuba B',
    headerBg: '#D6DAF0',
    headerBorder: '#B7C5D9',
    bodyBg: '#EEF2FF',
    postBg: '#D6DAF0',
    textColor: '#34345C',
    linkColor: '#34345C',
    nameColor: '#117743',
    // Board colors
    lightSquare: 0xadd8e6,
    darkSquare: 0x4682b4,
    background: 0xeef2ff
  },
  futaba: {
    name: 'Futaba',
    headerBg: '#F0E0D6',
    headerBorder: '#D9BFB7',
    bodyBg: '#FFFFEE',
    postBg: '#F0E0D6',
    textColor: '#800000',
    linkColor: '#0000EE',
    nameColor: '#117743',
    // Board colors (greenish tint)
    lightSquare: 0xe8f5e9,
    darkSquare: 0x558b2f,
    background: 0xffffee
  }
}

// Current theme
let currentTheme = 'yotsuba'

// Status messages
const STATUS_MESSAGES = {
  yourTurn: "your move, anon",
  aiThinking: "AI is thinking (doubt.jpg)",
  check: "you're in check, genius",
  checkmate: "checkmate. git gud",
  stalemate: "stalemate. nobody wins. peak performance.",
  aiCheck: "check. prepare yourself.",
  aiCheckmate: "checkmate. skill issue detected.",
  invalidMove: "that's not how chess works, anon",
  selectPiece: "select a piece. preferably yours.",
  gameOver: "game over. touch grass."
}

/**
 * Get a random timestamp for the imageboard aesthetic
 */
function getTimestamp() {
  const now = new Date()
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']
  
  const day = days[now.getDay()]
  const month = months[now.getMonth()]
  const date = String(now.getDate()).padStart(2, '0')
  const year = String(now.getFullYear()).slice(-2)
  const hours = String(now.getHours()).padStart(2, '0')
  const mins = String(now.getMinutes()).padStart(2, '0')
  const secs = String(now.getSeconds()).padStart(2, '0')
  
  return `${month}/${date}/${year}(${day})${hours}:${mins}:${secs}`
}

/**
 * Generate a post number
 */
let postNumber = Math.floor(Math.random() * 900000) + 100000
function getPostNumber() {
  return `No.${++postNumber}`
}

/**
 * Create the main UI
 */
export function createUI(container) {
  const theme = THEMES[currentTheme]
  
  container.innerHTML = `
    <div class="chess-app" id="chessApp">
      <header class="board-header">
        <h1>/chess3d/ - 3d chess</h1>
        <span class="tagline">pieces go brrr</span>
      </header>
      
      <div class="main-content">
        <div class="post op-post">
          <div class="post-info">
            <span class="name">Anonymous</span>
            <span class="timestamp">${getTimestamp()}</span>
            <span class="post-number">${getPostNumber()}</span>
          </div>
          <div class="post-content">
            <div class="game-container" id="gameContainer"></div>
          </div>
        </div>
        
        <div class="sidebar">
          <div class="post reply-post">
            <div class="post-info">
              <span class="name">STATUS</span>
              <span class="post-number">${getPostNumber()}</span>
            </div>
            <div class="post-content">
              <div class="status-text" id="statusText">${STATUS_MESSAGES.selectPiece}</div>
              <div class="turn-indicator" id="turnIndicator">White to move</div>
            </div>
          </div>
          
          <div class="post reply-post">
            <div class="post-info">
              <span class="name">CONTROLS</span>
              <span class="post-number">${getPostNumber()}</span>
            </div>
            <div class="post-content controls">
              <div class="control-group">
                <label>Difficulty:</label>
                <select id="difficultySelect">
                  <option value="easy">I eat crayons</option>
                  <option value="hard">I enjoy suffering</option>
                  <option value="chaos">Chaotic Bullshittery</option>
                </select>
              </div>
              <div class="control-group">
                <label>Theme:</label>
                <select id="themeSelect">
                  <option value="yotsuba">Yotsuba</option>
                  <option value="yotsubaB">Yotsuba B</option>
                  <option value="futaba">Futaba</option>
                </select>
              </div>
              <div class="button-group">
                <button id="newGameBtn">rage quit and restart</button>
                <button id="soundToggleBtn">🔊 Sound: ON</button>
              </div>
            </div>
          </div>
          
          <div class="post reply-post move-log-post">
            <div class="post-info">
              <span class="name">MOVE LOG</span>
              <span class="post-number">${getPostNumber()}</span>
            </div>
            <div class="post-content">
              <div class="move-log" id="moveLog">
                <div class="greentext">&gt;waiting for moves...</div>
              </div>
            </div>
          </div>
          
          <div class="post reply-post" id="chaosCommentPost" style="display: none;">
            <div class="post-info">
              <span class="name" style="color: #ff0000;">BOT</span>
              <span class="post-number">${getPostNumber()}</span>
            </div>
            <div class="post-content">
              <div class="chaos-comment" id="chaosComment"></div>
            </div>
          </div>
        </div>
      </div>
      
      <footer class="board-footer">
        <a href="../">back to /gitl/</a>
        <span class="separator">|</span>
        <span class="footer-text">pieces explode. no refunds.</span>
      </footer>
    </div>
  `
  
  applyTheme(currentTheme)
  
  return {
    gameContainer: document.getElementById('gameContainer'),
    statusText: document.getElementById('statusText'),
    turnIndicator: document.getElementById('turnIndicator'),
    moveLog: document.getElementById('moveLog'),
    difficultySelect: document.getElementById('difficultySelect'),
    themeSelect: document.getElementById('themeSelect'),
    newGameBtn: document.getElementById('newGameBtn'),
    soundToggleBtn: document.getElementById('soundToggleBtn'),
    chaosCommentPost: document.getElementById('chaosCommentPost'),
    chaosComment: document.getElementById('chaosComment')
  }
}

/**
 * Apply a theme
 */
export function applyTheme(themeName) {
  currentTheme = themeName
  const theme = THEMES[themeName]
  
  document.documentElement.style.setProperty('--header-bg', theme.headerBg)
  document.documentElement.style.setProperty('--header-border', theme.headerBorder)
  document.documentElement.style.setProperty('--body-bg', theme.bodyBg)
  document.documentElement.style.setProperty('--post-bg', theme.postBg)
  document.documentElement.style.setProperty('--text-color', theme.textColor)
  document.documentElement.style.setProperty('--link-color', theme.linkColor)
  document.documentElement.style.setProperty('--name-color', theme.nameColor)
  
  return theme
}

/**
 * Get current theme colors for 3D scene
 */
export function getThemeColors() {
  return THEMES[currentTheme]
}

/**
 * Update status text
 */
export function setStatus(key, custom = null) {
  const statusEl = document.getElementById('statusText')
  if (statusEl) {
    statusEl.textContent = custom || STATUS_MESSAGES[key] || key
  }
}

/**
 * Update turn indicator
 */
export function setTurn(color, isAI = false) {
  const turnEl = document.getElementById('turnIndicator')
  if (turnEl) {
    if (isAI) {
      turnEl.textContent = `${color === 'w' ? 'White' : 'Black'} (AI) to move`
    } else {
      turnEl.textContent = `${color === 'w' ? 'White' : 'Black'} to move`
    }
  }
}

/**
 * Add move to log
 */
export function addMoveToLog(moveNum, whiteSan, blackSan = null) {
  const logEl = document.getElementById('moveLog')
  if (!logEl) return
  
  // Remove "waiting for moves" message
  const waiting = logEl.querySelector('.greentext')
  if (waiting && waiting.textContent.includes('waiting')) {
    waiting.remove()
  }
  
  const moveDiv = document.createElement('div')
  moveDiv.className = 'move-entry'
  
  let moveText = `${moveNum}. ${whiteSan}`
  if (blackSan) {
    moveText += ` ${blackSan}`
  }
  
  moveDiv.textContent = moveText
  logEl.appendChild(moveDiv)
  
  // Scroll to bottom
  logEl.scrollTop = logEl.scrollHeight
}

/**
 * Clear move log
 */
export function clearMoveLog() {
  const logEl = document.getElementById('moveLog')
  if (logEl) {
    logEl.innerHTML = '<div class="greentext">&gt;waiting for moves...</div>'
  }
}

/**
 * Show chaos mode comment
 */
export function showChaosComment(comment) {
  const postEl = document.getElementById('chaosCommentPost')
  const commentEl = document.getElementById('chaosComment')
  
  if (postEl && commentEl) {
    postEl.style.display = 'block'
    commentEl.textContent = comment
    
    // Add glitch effect
    commentEl.classList.add('glitch-text')
    setTimeout(() => {
      commentEl.classList.remove('glitch-text')
    }, 300)
  }
}

/**
 * Hide chaos comment
 */
export function hideChaosComment() {
  const postEl = document.getElementById('chaosCommentPost')
  if (postEl) {
    postEl.style.display = 'none'
  }
}

/**
 * Show game over message
 */
export function showGameOver(winner, reason) {
  const statusEl = document.getElementById('statusText')
  if (statusEl) {
    let message = ''
    if (winner === 'draw') {
      message = STATUS_MESSAGES.stalemate
    } else if (winner === 'w') {
      message = 'White wins. ' + (reason === 'checkmate' ? STATUS_MESSAGES.checkmate : STATUS_MESSAGES.gameOver)
    } else {
      message = 'Black wins. ' + (reason === 'checkmate' ? STATUS_MESSAGES.aiCheckmate : STATUS_MESSAGES.gameOver)
    }
    statusEl.textContent = message
    statusEl.classList.add('game-over')
  }
}

/**
 * Update sound button
 */
export function updateSoundButton(enabled) {
  const btn = document.getElementById('soundToggleBtn')
  if (btn) {
    btn.textContent = enabled ? '🔊 Sound: ON' : '🔇 Sound: OFF'
  }
}

/**
 * Get CSS styles for the UI
 */
export function getStyles() {
  return `
    :root {
      --header-bg: #F0E0D6;
      --header-border: #D9BFB7;
      --body-bg: #FFFFEE;
      --post-bg: #F0E0D6;
      --text-color: #800000;
      --link-color: #0000EE;
      --name-color: #117743;
    }
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: arial, helvetica, sans-serif;
      font-size: 13px;
      background: var(--body-bg);
      color: var(--text-color);
      min-height: 100vh;
    }
    
    .chess-app {
      max-width: 1400px;
      margin: 0 auto;
      padding: 10px;
    }
    
    .board-header {
      background: var(--header-bg);
      border: 1px solid var(--header-border);
      padding: 10px 15px;
      margin-bottom: 10px;
      display: flex;
      align-items: baseline;
      gap: 15px;
    }
    
    .board-header h1 {
      font-size: 24px;
      font-weight: bold;
      color: #AF0A0F;
      margin: 0;
    }
    
    .board-header .tagline {
      font-size: 12px;
      color: #666;
      font-style: italic;
    }
    
    .main-content {
      display: flex;
      gap: 15px;
      flex-wrap: wrap;
    }
    
    .post {
      background: var(--post-bg);
      border: 1px solid var(--header-border);
      margin-bottom: 10px;
    }
    
    .op-post {
      flex: 1;
      min-width: 600px;
    }
    
    .sidebar {
      width: 320px;
      flex-shrink: 0;
    }
    
    .reply-post {
      width: 100%;
    }
    
    .post-info {
      padding: 5px 10px;
      font-size: 12px;
      border-bottom: 1px solid var(--header-border);
      background: rgba(0,0,0,0.02);
    }
    
    .post-info .name {
      color: var(--name-color);
      font-weight: bold;
      margin-right: 8px;
    }
    
    .post-info .timestamp {
      margin-right: 8px;
      color: #666;
    }
    
    .post-info .post-number {
      color: var(--text-color);
    }
    
    .post-content {
      padding: 10px;
    }
    
    .game-container {
      width: 100%;
      height: 500px;
      background: #1a1a2e;
      border: 2px solid #333;
    }
    
    .status-text {
      font-size: 14px;
      font-weight: bold;
      margin-bottom: 8px;
      color: #AF0A0F;
    }
    
    .status-text.game-over {
      color: #00AA00;
      animation: blink 1s infinite;
    }
    
    @keyframes blink {
      50% { opacity: 0.5; }
    }
    
    .turn-indicator {
      font-size: 12px;
      color: #666;
    }
    
    .controls {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    
    .control-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    
    .control-group label {
      font-size: 11px;
      color: #666;
      text-transform: uppercase;
    }
    
    .control-group select {
      padding: 6px;
      font-size: 13px;
      border: 1px solid var(--header-border);
      background: white;
      color: var(--text-color);
      cursor: pointer;
    }
    
    .button-group {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    
    .button-group button {
      flex: 1;
      padding: 8px 12px;
      font-size: 12px;
      border: 1px solid var(--header-border);
      background: var(--header-bg);
      color: var(--text-color);
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .button-group button:hover {
      background: #fff;
      border-color: #666;
    }
    
    .move-log {
      max-height: 200px;
      overflow-y: auto;
      font-family: monospace;
      font-size: 12px;
      line-height: 1.5;
    }
    
    .move-log .greentext {
      color: #789922;
    }
    
    .move-entry {
      padding: 2px 0;
      border-bottom: 1px dotted var(--header-border);
    }
    
    .chaos-comment {
      font-size: 14px;
      color: #ff0000;
      font-style: italic;
      padding: 5px;
      background: rgba(255,0,0,0.1);
      border-left: 3px solid #ff0000;
    }
    
    .glitch-text {
      animation: glitch 0.3s infinite;
    }
    
    @keyframes glitch {
      0% { transform: translate(0); }
      20% { transform: translate(-2px, 2px); }
      40% { transform: translate(-2px, -2px); }
      60% { transform: translate(2px, 2px); }
      80% { transform: translate(2px, -2px); }
      100% { transform: translate(0); }
    }
    
    .board-footer {
      margin-top: 15px;
      padding: 10px;
      text-align: center;
      font-size: 12px;
      color: #666;
    }
    
    .board-footer a {
      color: var(--link-color);
      text-decoration: none;
    }
    
    .board-footer a:hover {
      text-decoration: underline;
    }
    
    .board-footer .separator {
      margin: 0 10px;
    }
    
    @media (max-width: 1000px) {
      .main-content {
        flex-direction: column;
      }
      
      .op-post {
        min-width: auto;
      }
      
      .sidebar {
        width: 100%;
      }
      
      .game-container {
        height: 400px;
      }
    }
    
    @media (max-width: 600px) {
      .game-container {
        height: 300px;
      }
      
      .board-header {
        flex-direction: column;
        gap: 5px;
      }
    }
  `
}


