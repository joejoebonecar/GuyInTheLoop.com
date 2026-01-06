/**
 * Audio Engine
 * Procedural glitch sounds using Web Audio API
 */

let audioContext = null
let enabled = true

/**
 * Initialize audio context
 */
export function initAudio() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)()
  }
  if (audioContext.state === 'suspended') {
    audioContext.resume()
  }
  return audioContext
}

/**
 * Toggle audio on/off
 */
export function toggleAudio() {
  enabled = !enabled
  return enabled
}

/**
 * Check if audio is enabled
 */
export function isAudioEnabled() {
  return enabled
}

/**
 * Create an oscillator with envelope
 */
function createTone(freq, type, duration, volume = 0.3) {
  if (!enabled || !audioContext) return
  
  const osc = audioContext.createOscillator()
  const gain = audioContext.createGain()
  
  osc.type = type
  osc.frequency.setValueAtTime(freq, audioContext.currentTime)
  
  gain.gain.setValueAtTime(0, audioContext.currentTime)
  gain.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration)
  
  osc.connect(gain)
  gain.connect(audioContext.destination)
  
  osc.start()
  osc.stop(audioContext.currentTime + duration + 0.1)
}

/**
 * Create noise burst
 */
function createNoise(duration, volume = 0.1) {
  if (!enabled || !audioContext) return
  
  const bufferSize = audioContext.sampleRate * duration
  const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate)
  const data = buffer.getChannelData(0)
  
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * volume
  }
  
  const source = audioContext.createBufferSource()
  const gain = audioContext.createGain()
  
  source.buffer = buffer
  gain.gain.setValueAtTime(volume, audioContext.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration)
  
  source.connect(gain)
  gain.connect(audioContext.destination)
  
  source.start()
}

/**
 * Bitcrusher effect helper
 */
function createBitcrushedTone(freq, duration, bits = 4) {
  if (!enabled || !audioContext) return
  
  const osc = audioContext.createOscillator()
  const gain = audioContext.createGain()
  
  osc.type = 'square'
  osc.frequency.setValueAtTime(freq, audioContext.currentTime)
  
  // Simulate bitcrushing with rapid frequency modulation
  const step = Math.pow(2, bits)
  const freqMod = audioContext.createOscillator()
  freqMod.frequency.setValueAtTime(step, audioContext.currentTime)
  freqMod.type = 'square'
  
  gain.gain.setValueAtTime(0, audioContext.currentTime)
  gain.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.005)
  gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration)
  
  osc.connect(gain)
  gain.connect(audioContext.destination)
  
  osc.start()
  osc.stop(audioContext.currentTime + duration)
}

// ==========================================
// SOUND EFFECTS
// ==========================================

/**
 * Piece select sound - glitchy blip
 */
export function playSelect() {
  if (!enabled || !audioContext) return
  
  const t = audioContext.currentTime
  const freq = 800 + Math.random() * 200
  
  // Main blip
  createBitcrushedTone(freq, 0.08)
  
  // Glitch artifacts
  setTimeout(() => {
    createTone(freq * 1.5, 'square', 0.02, 0.1)
  }, 20)
}

/**
 * Piece move sound - digital slide
 */
export function playMove() {
  if (!enabled || !audioContext) return
  
  const t = audioContext.currentTime
  
  // Sliding tone
  const osc = audioContext.createOscillator()
  const gain = audioContext.createGain()
  
  osc.type = 'triangle'
  osc.frequency.setValueAtTime(400, t)
  osc.frequency.exponentialRampToValueAtTime(200, t + 0.15)
  
  gain.gain.setValueAtTime(0, t)
  gain.gain.linearRampToValueAtTime(0.15, t + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2)
  
  osc.connect(gain)
  gain.connect(audioContext.destination)
  
  osc.start()
  osc.stop(t + 0.25)
  
  // Click at end
  setTimeout(() => {
    createTone(600, 'square', 0.03, 0.2)
  }, 150)
}

/**
 * Capture sound - distorted crunch
 */
export function playCapture() {
  if (!enabled || !audioContext) return
  
  const t = audioContext.currentTime
  
  // Impact crunch
  createNoise(0.15, 0.3)
  
  // Low thud
  const osc = audioContext.createOscillator()
  const gain = audioContext.createGain()
  
  osc.type = 'sine'
  osc.frequency.setValueAtTime(150, t)
  osc.frequency.exponentialRampToValueAtTime(50, t + 0.1)
  
  gain.gain.setValueAtTime(0.4, t)
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15)
  
  osc.connect(gain)
  gain.connect(audioContext.destination)
  
  osc.start()
  osc.stop(t + 0.2)
  
  // Scatter particles sound
  setTimeout(() => {
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        createTone(1000 + Math.random() * 1000, 'square', 0.02, 0.05)
      }, i * 30)
    }
  }, 50)
}

/**
 * Check sound - warning tone with decay
 */
export function playCheck() {
  if (!enabled || !audioContext) return
  
  const t = audioContext.currentTime
  
  // Warning tone
  const osc = audioContext.createOscillator()
  const gain = audioContext.createGain()
  
  osc.type = 'sawtooth'
  osc.frequency.setValueAtTime(880, t)
  
  gain.gain.setValueAtTime(0, t)
  gain.gain.linearRampToValueAtTime(0.25, t + 0.01)
  gain.gain.setValueAtTime(0.25, t + 0.1)
  gain.gain.linearRampToValueAtTime(0.15, t + 0.15)
  gain.gain.setValueAtTime(0.15, t + 0.25)
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5)
  
  osc.connect(gain)
  gain.connect(audioContext.destination)
  
  osc.start()
  osc.stop(t + 0.55)
  
  // Bit decay
  setTimeout(() => {
    createBitcrushedTone(440, 0.1)
  }, 200)
}

/**
 * Checkmate sound - dramatic glitch crescendo
 */
export function playCheckmate() {
  if (!enabled || !audioContext) return
  
  const t = audioContext.currentTime
  
  // Rising glitch
  for (let i = 0; i < 8; i++) {
    setTimeout(() => {
      const freq = 200 + i * 150
      createBitcrushedTone(freq, 0.1)
      createNoise(0.05, 0.1)
    }, i * 80)
  }
  
  // Final crash
  setTimeout(() => {
    createNoise(0.3, 0.4)
    createTone(100, 'sawtooth', 0.4, 0.3)
    createTone(150, 'square', 0.4, 0.2)
  }, 700)
}

/**
 * Illegal move attempt sound - error buzz
 */
export function playError() {
  if (!enabled || !audioContext) return
  
  const t = audioContext.currentTime
  
  // Buzz
  const osc = audioContext.createOscillator()
  const gain = audioContext.createGain()
  
  osc.type = 'square'
  osc.frequency.setValueAtTime(100, t)
  
  gain.gain.setValueAtTime(0.2, t)
  gain.gain.setValueAtTime(0, t + 0.05)
  gain.gain.setValueAtTime(0.2, t + 0.1)
  gain.gain.setValueAtTime(0, t + 0.15)
  gain.gain.setValueAtTime(0.15, t + 0.2)
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3)
  
  osc.connect(gain)
  gain.connect(audioContext.destination)
  
  osc.start()
  osc.stop(t + 0.35)
}

/**
 * Castling sound - double move
 */
export function playCastle() {
  if (!enabled || !audioContext) return
  
  playMove()
  setTimeout(() => {
    playMove()
  }, 100)
}

/**
 * Promotion sound - ascending tones
 */
export function playPromotion() {
  if (!enabled || !audioContext) return
  
  const notes = [400, 500, 600, 800]
  notes.forEach((freq, i) => {
    setTimeout(() => {
      createTone(freq, 'triangle', 0.15, 0.2)
    }, i * 80)
  })
}

/**
 * Game start sound
 */
export function playGameStart() {
  if (!enabled || !audioContext) return
  
  createTone(300, 'sine', 0.2, 0.15)
  setTimeout(() => {
    createTone(400, 'sine', 0.2, 0.15)
  }, 150)
  setTimeout(() => {
    createTone(500, 'sine', 0.3, 0.2)
  }, 300)
}

/**
 * Chaos mode sound - glitchy mess
 */
export function playChaos() {
  if (!enabled || !audioContext) return
  
  for (let i = 0; i < 5; i++) {
    setTimeout(() => {
      createBitcrushedTone(100 + Math.random() * 900, 0.05)
      createNoise(0.03, 0.15)
    }, i * 50 + Math.random() * 50)
  }
}

/**
 * Bot wins sound (chaos mode)
 */
export function playBotWins() {
  if (!enabled || !audioContext) return
  
  // Descending sad trombone parody
  const notes = [400, 380, 350, 200]
  notes.forEach((freq, i) => {
    setTimeout(() => {
      createTone(freq, 'sawtooth', 0.3, 0.2)
    }, i * 200)
  })
  
  // Glitch overlay
  setTimeout(() => {
    playChaos()
  }, 600)
}


