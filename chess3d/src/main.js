/**
 * Main Integration Layer
 * Connects chess engine, renderer, audio, and UI
 */

import { gsap } from 'gsap'

// Chess Engine
import { 
  createGame, 
  getPiece, 
  getPieceColor, 
  getPieceType,
  getLegalMoves, 
  makeMove, 
  getAllLegalMoves,
  isInCheck,
  findKing,
  COLOR 
} from './chess/engine.js'
import { toSAN } from './chess/san.js'
import { getAIMove, initChaosMode, chaosBotCheat } from './chess/ai.js'

// Renderer
import { 
  initScene, 
  boardToWorld, 
  addPieceMesh, 
  removePieceMesh, 
  clearPieces,
  showHighlights, 
  clearHighlights,
  showGhost,
  clearGhost,
  getParticlesGroup,
  setThemeColors,
  raycast,
  getCanvas
} from './render/scene.js'
import { createPieceMesh, highlightPiece, applyGlitch } from './render/pieces.js'
import { createCaptureExplosion, createCheckEffect, createCheckmateEffect } from './render/particles.js'

// Audio
import { 
  initAudio, 
  toggleAudio, 
  isAudioEnabled,
  playSelect, 
  playMove, 
  playCapture, 
  playCheck, 
  playCheckmate,
  playError,
  playCastle,
  playPromotion,
  playGameStart,
  playChaos,
  playBotWins
} from './audio/sfx.js'

// UI
import { 
  createUI, 
  applyTheme, 
  getThemeColors,
  setStatus, 
  setTurn,
  addMoveToLog,
  clearMoveLog,
  showChaosComment,
  hideChaosComment,
  showGameOver,
  updateSoundButton,
  getStyles
} from './ui/hud.js'

// Game State
let game = null
let selectedSquare = null
let pieceMeshMap = new Map() // Maps "row,col" to mesh
let difficulty = 'easy'
let playerColor = COLOR.WHITE
let isAnimating = false
let uiElements = null

// Move tracking for SAN log
let pendingWhiteMove = null

/**
 * Initialize the application
 */
function init() {
  // Inject styles
  const styleEl = document.createElement('style')
  styleEl.textContent = getStyles()
  document.head.appendChild(styleEl)
  
  // Create UI
  uiElements = createUI(document.body)
  
  // Initialize 3D scene
  const { scene, camera, renderer } = initScene(uiElements.gameContainer)
  
  // Initialize audio
  initAudio()
  
  // Create new game
  startNewGame()
  
  // Setup event listeners
  setupEventListeners()
  
  console.log('Chess 3D initialized')
}

/**
 * Start a new game
 */
function startNewGame() {
  // Reset game state
  game = createGame()
  selectedSquare = null
  pendingWhiteMove = null
  isAnimating = false
  
  // Clear 3D pieces
  clearPieces()
  pieceMeshMap.clear()
  clearHighlights()
  clearGhost()
  
  // Clear UI
  clearMoveLog()
  hideChaosComment()
  setTurn(COLOR.WHITE)
  setStatus('selectPiece')
  
  // Remove game-over class
  const statusEl = document.getElementById('statusText')
  if (statusEl) statusEl.classList.remove('game-over')
  
  // Initialize chaos mode if selected
  if (difficulty === 'chaos') {
    initChaosMode()
    showChaosComment("welcome to chaos mode. the rules are made up and the points don't matter.")
  }
  
  // Create piece meshes
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = getPiece(game, row, col)
      if (piece) {
        const color = getPieceColor(piece)
        const type = getPieceType(piece)
        const mesh = createPieceMesh(type, color)
        addPieceMesh(mesh, row, col)
        pieceMeshMap.set(`${row},${col}`, mesh)
      }
    }
  }
  
  // Play start sound
  playGameStart()
  
  // Apply glitch to pieces
  pieceMeshMap.forEach(mesh => {
    setTimeout(() => applyGlitch(mesh, 0.5), Math.random() * 500)
  })
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  const canvas = getCanvas()
  
  // Click handling
  canvas.addEventListener('click', onCanvasClick)
  canvas.addEventListener('touchend', onCanvasTouchEnd)
  
  // Hover handling
  canvas.addEventListener('mousemove', onCanvasHover)
  
  // UI controls
  uiElements.newGameBtn.addEventListener('click', () => {
    startNewGame()
  })
  
  uiElements.soundToggleBtn.addEventListener('click', () => {
    const enabled = toggleAudio()
    updateSoundButton(enabled)
  })
  
  uiElements.difficultySelect.addEventListener('change', (e) => {
    difficulty = e.target.value
    startNewGame()
  })
  
  uiElements.themeSelect.addEventListener('change', (e) => {
    const theme = applyTheme(e.target.value)
    setThemeColors({
      lightSquare: theme.lightSquare,
      darkSquare: theme.darkSquare,
      background: theme.background
    })
  })
  
  // Initialize audio on first interaction
  document.addEventListener('click', () => initAudio(), { once: true })
}

/**
 * Handle canvas click
 */
function onCanvasClick(e) {
  if (isAnimating || game.gameOver) return
  if (game.turn !== playerColor) return // Not player's turn
  
  const hit = raycast(e.clientX, e.clientY, uiElements.gameContainer)
  if (!hit) return
  
  handleSquareClick(hit.row, hit.col)
}

/**
 * Handle touch end
 */
function onCanvasTouchEnd(e) {
  if (e.touches.length > 0) return
  const touch = e.changedTouches[0]
  
  if (isAnimating || game.gameOver) return
  if (game.turn !== playerColor) return
  
  const hit = raycast(touch.clientX, touch.clientY, uiElements.gameContainer)
  if (!hit) return
  
  handleSquareClick(hit.row, hit.col)
}

/**
 * Handle canvas hover for ghost preview
 */
function onCanvasHover(e) {
  if (isAnimating || game.gameOver) return
  if (!selectedSquare) {
    clearGhost()
    return
  }
  
  const hit = raycast(e.clientX, e.clientY, uiElements.gameContainer)
  if (!hit) {
    clearGhost()
    return
  }
  
  // Check if hovering over a valid move
  const legalMoves = getLegalMoves(game, selectedSquare.row, selectedSquare.col)
  const isValidMove = legalMoves.some(m => m.toRow === hit.row && m.toCol === hit.col)
  
  if (isValidMove) {
    const mesh = pieceMeshMap.get(`${selectedSquare.row},${selectedSquare.col}`)
    if (mesh) {
      showGhost(mesh, hit.row, hit.col)
    }
  } else {
    clearGhost()
  }
}

/**
 * Handle clicking on a square
 */
function handleSquareClick(row, col) {
  const piece = getPiece(game, row, col)
  
  if (selectedSquare) {
    // Try to move
    const legalMoves = getLegalMoves(game, selectedSquare.row, selectedSquare.col)
    const isValidMove = legalMoves.some(m => m.toRow === row && m.toCol === col)
    
    if (isValidMove) {
      executeMove(selectedSquare.row, selectedSquare.col, row, col)
    } else if (piece && getPieceColor(piece) === game.turn) {
      // Select different piece
      selectPiece(row, col)
    } else {
      // Deselect
      deselectPiece()
      playError()
    }
  } else {
    // Select piece
    if (piece && getPieceColor(piece) === game.turn) {
      selectPiece(row, col)
    }
  }
}

/**
 * Select a piece
 */
function selectPiece(row, col) {
  // Deselect previous
  if (selectedSquare) {
    const prevMesh = pieceMeshMap.get(`${selectedSquare.row},${selectedSquare.col}`)
    if (prevMesh) highlightPiece(prevMesh, false)
  }
  
  selectedSquare = { row, col }
  
  // Highlight selected piece
  const mesh = pieceMeshMap.get(`${row},${col}`)
  if (mesh) highlightPiece(mesh, true)
  
  // Show valid moves
  const legalMoves = getLegalMoves(game, row, col)
  showHighlights(legalMoves.map(m => ({ row: m.toRow, col: m.toCol })))
  showHighlights([{ row, col }], 'selected')
  
  playSelect()
  setStatus('yourTurn')
}

/**
 * Deselect piece
 */
function deselectPiece() {
  if (selectedSquare) {
    const mesh = pieceMeshMap.get(`${selectedSquare.row},${selectedSquare.col}`)
    if (mesh) highlightPiece(mesh, false)
  }
  selectedSquare = null
  clearHighlights()
  clearGhost()
}

/**
 * Execute a move with animation
 */
async function executeMove(fromRow, fromCol, toRow, toCol) {
  isAnimating = true
  deselectPiece()
  
  // Store game state before move for SAN generation
  const gameBeforeMove = { ...game, board: game.board.map(r => [...r]) }
  
  // Make the move in engine
  const result = makeMove(game, fromRow, fromCol, toRow, toCol)
  if (!result.valid) {
    isAnimating = false
    playError()
    return
  }
  
  game = result.game
  const moveRecord = result.move
  
  // Generate SAN
  const san = toSAN(gameBeforeMove, moveRecord)
  
  // Animate the move
  await animateMove(fromRow, fromCol, toRow, toCol, moveRecord)
  
  // Update move log
  const moveIndex = game.moveHistory.length - 1
  const isBlack = moveRecord.piece[0] === 'b'
  
  if (!isBlack) {
    pendingWhiteMove = san
  } else {
    const moveNum = Math.floor(moveIndex / 2) + 1
    addMoveToLog(moveNum, pendingWhiteMove || '...', san)
    pendingWhiteMove = null
  }
  
  // Handle game state
  if (moveRecord.checkmate) {
    playCheckmate()
    const kingPos = findKing(game, game.turn)
    if (kingPos) {
      createCheckmateEffect(boardToWorld(kingPos[0], kingPos[1]), getParticlesGroup())
    }
    showGameOver(moveRecord.piece[0], 'checkmate')
    isAnimating = false
    return
  }
  
  if (moveRecord.stalemate) {
    showGameOver('draw', 'stalemate')
    isAnimating = false
    return
  }
  
  if (moveRecord.check) {
    playCheck()
    const kingPos = findKing(game, game.turn)
    if (kingPos) {
      createCheckEffect(boardToWorld(kingPos[0], kingPos[1]), getParticlesGroup())
    }
    setStatus('aiCheck')
  }
  
  // Update turn
  setTurn(game.turn, game.turn !== playerColor)
  
  isAnimating = false
  
  // AI turn
  if (!game.gameOver && game.turn !== playerColor) {
    setTimeout(executeAIMove, 500)
  }
}

/**
 * Animate a move
 */
async function animateMove(fromRow, fromCol, toRow, toCol, moveRecord) {
  const mesh = pieceMeshMap.get(`${fromRow},${fromCol}`)
  if (!mesh) return
  
  const targetPos = boardToWorld(toRow, toCol)
  const capturedMesh = pieceMeshMap.get(`${toRow},${toCol}`)
  
  // Handle capture
  if (capturedMesh || moveRecord.enPassant) {
    let capturePos
    let capturedPieceMesh
    
    if (moveRecord.enPassant) {
      // En passant capture
      const captureRow = moveRecord.piece[0] === 'w' ? toRow + 1 : toRow - 1
      capturedPieceMesh = pieceMeshMap.get(`${captureRow},${toCol}`)
      capturePos = boardToWorld(captureRow, toCol)
      pieceMeshMap.delete(`${captureRow},${toCol}`)
    } else {
      capturedPieceMesh = capturedMesh
      capturePos = boardToWorld(toRow, toCol)
      pieceMeshMap.delete(`${toRow},${toCol}`)
    }
    
    // Animate capture
    if (capturedPieceMesh) {
      const capturedColor = capturedPieceMesh.userData.pieceColor
      createCaptureExplosion(capturePos, capturedColor, getParticlesGroup())
      removePieceMesh(capturedPieceMesh)
      playCapture()
    }
  }
  
  // Animate move
  await new Promise(resolve => {
    gsap.to(mesh.position, {
      x: targetPos.x,
      y: targetPos.y + 0.3, // Lift up
      z: targetPos.z,
      duration: 0.15,
      ease: 'power2.out',
      onComplete: () => {
        gsap.to(mesh.position, {
          y: targetPos.y,
          duration: 0.1,
          ease: 'bounce.out',
          onComplete: resolve
        })
      }
    })
  })
  
  // Update mesh map
  pieceMeshMap.delete(`${fromRow},${fromCol}`)
  pieceMeshMap.set(`${toRow},${toCol}`, mesh)
  mesh.userData.row = toRow
  mesh.userData.col = toCol
  
  // Handle castling rook
  if (moveRecord.castle) {
    playCastle()
    const rookFromCol = moveRecord.castle === 'K' ? 7 : 0
    const rookToCol = moveRecord.castle === 'K' ? 5 : 3
    const rookMesh = pieceMeshMap.get(`${toRow},${rookFromCol}`)
    
    if (rookMesh) {
      const rookTargetPos = boardToWorld(toRow, rookToCol)
      await new Promise(resolve => {
        gsap.to(rookMesh.position, {
          x: rookTargetPos.x,
          z: rookTargetPos.z,
          duration: 0.2,
          ease: 'power2.inOut',
          onComplete: resolve
        })
      })
      
      pieceMeshMap.delete(`${toRow},${rookFromCol}`)
      pieceMeshMap.set(`${toRow},${rookToCol}`, rookMesh)
      rookMesh.userData.col = rookToCol
    }
  }
  
  // Handle promotion
  if (moveRecord.promotion) {
    playPromotion()
    
    // Replace pawn with promoted piece
    const color = mesh.userData.pieceColor
    const newMesh = createPieceMesh(moveRecord.promotion, color)
    
    removePieceMesh(mesh)
    addPieceMesh(newMesh, toRow, toCol)
    pieceMeshMap.set(`${toRow},${toCol}`, newMesh)
    
    // Glitch effect on new piece
    applyGlitch(newMesh, 2)
    setTimeout(() => applyGlitch(newMesh, 0.5), 500)
  }
  
  // Sound if no capture
  if (!moveRecord.capture && !moveRecord.castle) {
    playMove()
  }
}

/**
 * Execute AI move
 */
async function executeAIMove() {
  if (game.gameOver) return
  
  isAnimating = true
  setStatus('aiThinking')
  
  // Small delay to show "thinking"
  await new Promise(r => setTimeout(r, 300 + Math.random() * 500))
  
  // Get AI move
  const aiResult = getAIMove(game, difficulty)
  
  // Handle chaos mode special cases
  if (difficulty === 'chaos') {
    if (aiResult.comment) {
      showChaosComment(aiResult.comment)
      playChaos()
    }
    
    if (aiResult.botWins) {
      playBotWins()
      showChaosComment(aiResult.comment || "i win lol")
      showGameOver('b', 'chaos')
      isAnimating = false
      return
    }
    
    if (aiResult.cheat) {
      showChaosComment(aiResult.comment || "nice try")
      showGameOver('b', 'cheat')
      isAnimating = false
      return
    }
  }
  
  const move = aiResult.move
  if (!move) {
    isAnimating = false
    return
  }
  
  // Store game state for SAN
  const gameBeforeMove = { ...game, board: game.board.map(r => [...r]) }
  
  // Make move
  const result = makeMove(game, move.fromRow, move.fromCol, move.toRow, move.toCol)
  if (!result.valid) {
    isAnimating = false
    return
  }
  
  game = result.game
  const moveRecord = result.move
  
  // Generate SAN
  const san = toSAN(gameBeforeMove, moveRecord)
  
  // Animate
  await animateMove(move.fromRow, move.fromCol, move.toRow, move.toCol, moveRecord)
  
  // Update move log
  const moveIndex = game.moveHistory.length - 1
  const moveNum = Math.floor(moveIndex / 2) + 1
  
  if (pendingWhiteMove) {
    addMoveToLog(moveNum, pendingWhiteMove, san)
    pendingWhiteMove = null
  } else {
    addMoveToLog(moveNum, '...', san)
  }
  
  // Handle game state
  if (moveRecord.checkmate) {
    playCheckmate()
    const kingPos = findKing(game, game.turn)
    if (kingPos) {
      createCheckmateEffect(boardToWorld(kingPos[0], kingPos[1]), getParticlesGroup())
    }
    showGameOver(moveRecord.piece[0], 'checkmate')
    
    // In chaos mode, check if player would have won
    if (difficulty === 'chaos' && moveRecord.piece[0] === 'w') {
      const cheatResult = chaosBotCheat()
      showChaosComment(cheatResult.comment)
    }
    
    isAnimating = false
    return
  }
  
  if (moveRecord.stalemate) {
    showGameOver('draw', 'stalemate')
    isAnimating = false
    return
  }
  
  if (moveRecord.check) {
    playCheck()
    const kingPos = findKing(game, game.turn)
    if (kingPos) {
      createCheckEffect(boardToWorld(kingPos[0], kingPos[1]), getParticlesGroup())
    }
    setStatus('check')
  } else {
    setStatus('yourTurn')
  }
  
  setTurn(game.turn)
  isAnimating = false
}

// Start the application
document.addEventListener('DOMContentLoaded', init)
