/**
 * Chess AI - Move selection for different difficulty modes
 * NO DOM, NO THREE.JS - Pure logic
 */

import { 
  getAllLegalMoves, 
  makeMove, 
  cloneGame, 
  isInCheck, 
  getPieceType, 
  getPieceColor,
  PIECE, 
  COLOR 
} from './engine.js'

// Piece values for evaluation
const PIECE_VALUES = {
  [PIECE.PAWN]: 100,
  [PIECE.KNIGHT]: 320,
  [PIECE.BISHOP]: 330,
  [PIECE.ROOK]: 500,
  [PIECE.QUEEN]: 900,
  [PIECE.KING]: 20000
}

// Piece-square tables for positional evaluation (from white's perspective)
const PST = {
  [PIECE.PAWN]: [
    [0,  0,  0,  0,  0,  0,  0,  0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [5,  5, 10, 25, 25, 10,  5,  5],
    [0,  0,  0, 20, 20,  0,  0,  0],
    [5, -5,-10,  0,  0,-10, -5,  5],
    [5, 10, 10,-20,-20, 10, 10,  5],
    [0,  0,  0,  0,  0,  0,  0,  0]
  ],
  [PIECE.KNIGHT]: [
    [-50,-40,-30,-30,-30,-30,-40,-50],
    [-40,-20,  0,  0,  0,  0,-20,-40],
    [-30,  0, 10, 15, 15, 10,  0,-30],
    [-30,  5, 15, 20, 20, 15,  5,-30],
    [-30,  0, 15, 20, 20, 15,  0,-30],
    [-30,  5, 10, 15, 15, 10,  5,-30],
    [-40,-20,  0,  5,  5,  0,-20,-40],
    [-50,-40,-30,-30,-30,-30,-40,-50]
  ],
  [PIECE.BISHOP]: [
    [-20,-10,-10,-10,-10,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5, 10, 10,  5,  0,-10],
    [-10,  5,  5, 10, 10,  5,  5,-10],
    [-10,  0, 10, 10, 10, 10,  0,-10],
    [-10, 10, 10, 10, 10, 10, 10,-10],
    [-10,  5,  0,  0,  0,  0,  5,-10],
    [-20,-10,-10,-10,-10,-10,-10,-20]
  ],
  [PIECE.ROOK]: [
    [0,  0,  0,  0,  0,  0,  0,  0],
    [5, 10, 10, 10, 10, 10, 10,  5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [0,  0,  0,  5,  5,  0,  0,  0]
  ],
  [PIECE.QUEEN]: [
    [-20,-10,-10, -5, -5,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5,  5,  5,  5,  0,-10],
    [-5,  0,  5,  5,  5,  5,  0, -5],
    [0,  0,  5,  5,  5,  5,  0, -5],
    [-10,  5,  5,  5,  5,  5,  0,-10],
    [-10,  0,  5,  0,  0,  0,  0,-10],
    [-20,-10,-10, -5, -5,-10,-10,-20]
  ],
  [PIECE.KING]: [
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-20,-30,-30,-40,-40,-30,-30,-20],
    [-10,-20,-20,-20,-20,-20,-20,-10],
    [20, 20,  0,  0,  0,  0, 20, 20],
    [20, 30, 10,  0,  0, 10, 30, 20]
  ]
}

/**
 * Evaluate board position (positive = white advantage)
 */
function evaluate(game) {
  let score = 0

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = game.board[row][col]
      if (!piece) continue

      const color = getPieceColor(piece)
      const type = getPieceType(piece)
      const multiplier = color === COLOR.WHITE ? 1 : -1

      // Material value
      score += multiplier * PIECE_VALUES[type]

      // Positional value
      const pstRow = color === COLOR.WHITE ? row : 7 - row
      score += multiplier * (PST[type]?.[pstRow]?.[col] || 0)
    }
  }

  // Bonus for being in check (opponent is in trouble)
  if (isInCheck(game, COLOR.BLACK)) score += 50
  if (isInCheck(game, COLOR.WHITE)) score -= 50

  return score
}

/**
 * Minimax with alpha-beta pruning
 */
function minimax(game, depth, alpha, beta, maximizing) {
  if (depth === 0 || game.gameOver) {
    return evaluate(game)
  }

  const moves = getAllLegalMoves(game)
  
  if (moves.length === 0) {
    if (isInCheck(game, game.turn)) {
      // Checkmate
      return maximizing ? -100000 + (5 - depth) : 100000 - (5 - depth)
    }
    return 0 // Stalemate
  }

  // Move ordering: captures first, then checks
  moves.sort((a, b) => {
    let scoreA = 0, scoreB = 0
    if (a.capture) scoreA += 10
    if (b.capture) scoreB += 10
    return scoreB - scoreA
  })

  if (maximizing) {
    let maxEval = -Infinity
    for (const move of moves) {
      const result = makeMove(game, move.fromRow, move.fromCol, move.toRow, move.toCol)
      if (!result.valid) continue
      const evalScore = minimax(result.game, depth - 1, alpha, beta, false)
      maxEval = Math.max(maxEval, evalScore)
      alpha = Math.max(alpha, evalScore)
      if (beta <= alpha) break
    }
    return maxEval
  } else {
    let minEval = Infinity
    for (const move of moves) {
      const result = makeMove(game, move.fromRow, move.fromCol, move.toRow, move.toCol)
      if (!result.valid) continue
      const evalScore = minimax(result.game, depth - 1, alpha, beta, true)
      minEval = Math.min(minEval, evalScore)
      beta = Math.min(beta, evalScore)
      if (beta <= alpha) break
    }
    return minEval
  }
}

/**
 * Hard AI - Uses minimax with alpha-beta pruning
 */
export function getHardMove(game) {
  const moves = getAllLegalMoves(game)
  if (moves.length === 0) return null

  const maximizing = game.turn === COLOR.WHITE
  const depth = 4

  let bestMove = null
  let bestScore = maximizing ? -Infinity : Infinity

  for (const move of moves) {
    const result = makeMove(game, move.fromRow, move.fromCol, move.toRow, move.toCol)
    if (!result.valid) continue

    const score = minimax(result.game, depth - 1, -Infinity, Infinity, !maximizing)

    if (maximizing ? score > bestScore : score < bestScore) {
      bestScore = score
      bestMove = move
    }
  }

  return bestMove
}

/**
 * Easy AI - Random moves with occasional blunders
 */
export function getEasyMove(game) {
  const moves = getAllLegalMoves(game)
  if (moves.length === 0) return null

  // 10% chance to accidentally play a decent move
  if (Math.random() < 0.1) {
    // Try to find a capture or check
    const goodMoves = moves.filter(m => m.capture)
    if (goodMoves.length > 0) {
      return goodMoves[Math.floor(Math.random() * goodMoves.length)]
    }
  }

  // Otherwise, random move (sometimes intentionally bad)
  return moves[Math.floor(Math.random() * moves.length)]
}

// ==========================================
// CHAOS MODE
// ==========================================

// Chaos mode state
let chaosState = {
  turnCount: 0,
  winTurn: 0, // Random 1-50
  rulesCorruption: 0, // 0-1, increases each turn
  comments: []
}

/**
 * Initialize chaos mode
 */
export function initChaosMode() {
  chaosState = {
    turnCount: 0,
    winTurn: Math.floor(Math.random() * 50) + 1,
    rulesCorruption: 0,
    comments: []
  }
  return chaosState
}

/**
 * Get chaos state
 */
export function getChaosState() {
  return { ...chaosState }
}

/**
 * Chaos AI comments based on situation
 */
const CHAOS_COMMENTS = {
  good: [
    "oh. you're not completely useless.",
    "did you... did you just make a good move? suspicious.",
    "broken clock. twice a day. you know the drill.",
    "even a monkey with a typewriter...",
    "congrats on achieving baseline competence."
  ],
  bad: [
    "that was objectively terrible.",
    "my neurons are crying.",
    "this is why we can't have nice things.",
    "are you doing this on purpose? please say yes.",
    "i've seen better play from a malfunctioning roomba.",
    "skill issue detected.",
    "you call that a move? i call it a cry for help.",
    "fascinating. wrong, but fascinating."
  ],
  neutral: [
    "move registered. barely.",
    "okay.",
    "sure. why not.",
    "i guess that's technically legal. for now.",
    "noted. filed under 'whatever'."
  ],
  chaos: [
    "THE RULES ARE MORE LIKE GUIDELINES ANYWAY",
    "reality.exe has stopped responding",
    "who needs consistent physics?",
    "chess? i thought we were playing calvinball.",
    "the pieces have opinions now.",
    "time is a flat circle. so is this board. probably."
  ],
  winning: [
    "anyway, i win now.",
    "surprise. victory is mine.",
    "didn't see that coming, did you? neither did i.",
    "game over. i made the rules, i break the rules.",
    "congratulations on your participation."
  ],
  cheating: [
    "lmao you thought you won? cute.",
    "SIKE. i activated my trap card.",
    "actually, that was illegal. because i said so.",
    "plot twist: i was the rules all along.",
    "nice try. emphasis on 'try'."
  ]
}

/**
 * Get a random comment from a category
 */
function getComment(category) {
  const comments = CHAOS_COMMENTS[category]
  return comments[Math.floor(Math.random() * comments.length)]
}

/**
 * Chaos AI move - rules degrade over time
 */
export function getChaosMove(game, playerMove = null) {
  chaosState.turnCount++
  chaosState.rulesCorruption = Math.min(1, chaosState.turnCount / 30)

  const response = {
    move: null,
    comment: null,
    botWins: false,
    cheat: false
  }

  // Check if bot declares victory
  if (chaosState.turnCount >= chaosState.winTurn) {
    response.botWins = true
    response.comment = getComment('winning')
    return response
  }

  // Comment on player's move
  if (playerMove) {
    if (playerMove.capture || playerMove.check) {
      response.comment = getComment('good')
    } else if (Math.random() < 0.3) {
      response.comment = getComment('bad')
    } else if (Math.random() < 0.2) {
      response.comment = getComment('chaos')
    } else {
      response.comment = getComment('neutral')
    }
  }

  // Get moves - with corruption, might include illegal ones
  let moves = getAllLegalMoves(game)
  
  if (moves.length === 0) {
    response.comment = getComment('chaos')
    return response
  }

  // At high corruption, bot might make weird moves
  if (chaosState.rulesCorruption > 0.5 && Math.random() < chaosState.rulesCorruption * 0.5) {
    // Sometimes add chaos comment
    if (Math.random() < 0.3) {
      response.comment = getComment('chaos')
    }
  }

  // Pick a move (slightly weighted toward captures at high corruption)
  if (chaosState.rulesCorruption > 0.3 && Math.random() < 0.4) {
    const captures = moves.filter(m => m.capture)
    if (captures.length > 0) {
      response.move = captures[Math.floor(Math.random() * captures.length)]
      return response
    }
  }

  response.move = moves[Math.floor(Math.random() * moves.length)]
  return response
}

/**
 * Chaos mode: Bot cheats when player would win
 */
export function chaosBotCheat() {
  return {
    comment: getComment('cheating'),
    cheat: true,
    botWins: true
  }
}

/**
 * Get AI move based on difficulty
 */
export function getAIMove(game, difficulty) {
  switch (difficulty) {
    case 'hard':
      return { move: getHardMove(game), comment: null }
    case 'easy':
      return { move: getEasyMove(game), comment: null }
    case 'chaos':
      return getChaosMove(game)
    default:
      return { move: getEasyMove(game), comment: null }
  }
}


