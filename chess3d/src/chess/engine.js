/**
 * Chess Engine - Pure Logic Layer
 * NO DOM, NO THREE.JS - Just chess rules
 */

// Piece types
export const PIECE = {
  PAWN: 'p',
  KNIGHT: 'n',
  BISHOP: 'b',
  ROOK: 'r',
  QUEEN: 'q',
  KING: 'k'
}

// Colors
export const COLOR = {
  WHITE: 'w',
  BLACK: 'b'
}

// Initial board state (standard starting position)
const INITIAL_BOARD = [
  ['br', 'bn', 'bb', 'bq', 'bk', 'bb', 'bn', 'br'],
  ['bp', 'bp', 'bp', 'bp', 'bp', 'bp', 'bp', 'bp'],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  [null, null, null, null, null, null, null, null],
  ['wp', 'wp', 'wp', 'wp', 'wp', 'wp', 'wp', 'wp'],
  ['wr', 'wn', 'wb', 'wq', 'wk', 'wb', 'wn', 'wr']
]

/**
 * Create a new game state
 */
export function createGame() {
  return {
    board: INITIAL_BOARD.map(row => [...row]),
    turn: COLOR.WHITE,
    castling: {
      [COLOR.WHITE]: { kingSide: true, queenSide: true },
      [COLOR.BLACK]: { kingSide: true, queenSide: true }
    },
    enPassantTarget: null, // Square that can be captured en passant (e.g., [row, col])
    halfMoveClock: 0, // For 50-move rule (not fully implemented)
    fullMoveNumber: 1,
    moveHistory: [],
    gameOver: false,
    winner: null, // null, 'w', 'b', or 'draw'
    gameOverReason: null // 'checkmate', 'stalemate', 'resignation', etc.
  }
}

/**
 * Get piece at position
 */
export function getPiece(game, row, col) {
  if (row < 0 || row > 7 || col < 0 || col > 7) return null
  return game.board[row][col]
}

/**
 * Get piece color
 */
export function getPieceColor(piece) {
  if (!piece) return null
  return piece[0]
}

/**
 * Get piece type
 */
export function getPieceType(piece) {
  if (!piece) return null
  return piece[1]
}

/**
 * Check if a square is attacked by a color
 */
export function isSquareAttacked(game, row, col, byColor) {
  // Check all pieces of the attacking color
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = game.board[r][c]
      if (piece && getPieceColor(piece) === byColor) {
        const attacks = getAttacksForPiece(game, r, c, piece)
        if (attacks.some(([ar, ac]) => ar === row && ac === col)) {
          return true
        }
      }
    }
  }
  return false
}

/**
 * Get squares a piece attacks (not necessarily valid moves)
 */
function getAttacksForPiece(game, row, col, piece) {
  const color = getPieceColor(piece)
  const type = getPieceType(piece)
  const attacks = []

  switch (type) {
    case PIECE.PAWN: {
      const direction = color === COLOR.WHITE ? -1 : 1
      // Pawns attack diagonally
      if (col > 0) attacks.push([row + direction, col - 1])
      if (col < 7) attacks.push([row + direction, col + 1])
      break
    }
    case PIECE.KNIGHT: {
      const knightMoves = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1]
      ]
      for (const [dr, dc] of knightMoves) {
        const nr = row + dr, nc = col + dc
        if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
          attacks.push([nr, nc])
        }
      }
      break
    }
    case PIECE.BISHOP: {
      for (const [dr, dc] of [[-1, -1], [-1, 1], [1, -1], [1, 1]]) {
        for (let i = 1; i < 8; i++) {
          const nr = row + dr * i, nc = col + dc * i
          if (nr < 0 || nr > 7 || nc < 0 || nc > 7) break
          attacks.push([nr, nc])
          if (game.board[nr][nc]) break // Blocked
        }
      }
      break
    }
    case PIECE.ROOK: {
      for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
        for (let i = 1; i < 8; i++) {
          const nr = row + dr * i, nc = col + dc * i
          if (nr < 0 || nr > 7 || nc < 0 || nc > 7) break
          attacks.push([nr, nc])
          if (game.board[nr][nc]) break // Blocked
        }
      }
      break
    }
    case PIECE.QUEEN: {
      // Queen = Rook + Bishop
      for (const [dr, dc] of [[-1, -1], [-1, 1], [1, -1], [1, 1], [-1, 0], [1, 0], [0, -1], [0, 1]]) {
        for (let i = 1; i < 8; i++) {
          const nr = row + dr * i, nc = col + dc * i
          if (nr < 0 || nr > 7 || nc < 0 || nc > 7) break
          attacks.push([nr, nc])
          if (game.board[nr][nc]) break // Blocked
        }
      }
      break
    }
    case PIECE.KING: {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue
          const nr = row + dr, nc = col + dc
          if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8) {
            attacks.push([nr, nc])
          }
        }
      }
      break
    }
  }

  return attacks
}

/**
 * Find the king's position
 */
export function findKing(game, color) {
  const kingPiece = color + PIECE.KING
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (game.board[r][c] === kingPiece) {
        return [r, c]
      }
    }
  }
  return null
}

/**
 * Check if a color is in check
 */
export function isInCheck(game, color) {
  const kingPos = findKing(game, color)
  if (!kingPos) return false
  const enemyColor = color === COLOR.WHITE ? COLOR.BLACK : COLOR.WHITE
  return isSquareAttacked(game, kingPos[0], kingPos[1], enemyColor)
}

/**
 * Generate all legal moves for a piece at a position
 */
export function getLegalMoves(game, row, col) {
  const piece = game.board[row][col]
  if (!piece) return []
  
  const color = getPieceColor(piece)
  if (color !== game.turn) return []

  const pseudoLegal = getPseudoLegalMoves(game, row, col, piece)
  
  // Filter out moves that leave king in check
  return pseudoLegal.filter(move => {
    const testGame = simulateMove(game, row, col, move.toRow, move.toCol, move.promotion)
    return !isInCheck(testGame, color)
  })
}

/**
 * Get pseudo-legal moves (doesn't check if king is left in check)
 */
function getPseudoLegalMoves(game, row, col, piece) {
  const color = getPieceColor(piece)
  const type = getPieceType(piece)
  const moves = []
  const enemyColor = color === COLOR.WHITE ? COLOR.BLACK : COLOR.WHITE

  const addMove = (toRow, toCol, flags = {}) => {
    if (toRow < 0 || toRow > 7 || toCol < 0 || toCol > 7) return
    const target = game.board[toRow][toCol]
    if (target && getPieceColor(target) === color) return // Can't capture own piece
    
    moves.push({
      toRow,
      toCol,
      capture: target ? true : flags.enPassant || false,
      ...flags
    })
  }

  switch (type) {
    case PIECE.PAWN: {
      const direction = color === COLOR.WHITE ? -1 : 1
      const startRow = color === COLOR.WHITE ? 6 : 1
      const promotionRow = color === COLOR.WHITE ? 0 : 7

      // Forward move
      if (!game.board[row + direction]?.[col]) {
        if (row + direction === promotionRow) {
          // Promotion
          for (const promo of [PIECE.QUEEN, PIECE.ROOK, PIECE.BISHOP, PIECE.KNIGHT]) {
            moves.push({ toRow: row + direction, toCol: col, promotion: promo, capture: false })
          }
        } else {
          addMove(row + direction, col)
          // Double move from start
          if (row === startRow && !game.board[row + 2 * direction]?.[col]) {
            addMove(row + 2 * direction, col, { doublePawn: true })
          }
        }
      }

      // Captures
      for (const dc of [-1, 1]) {
        const nc = col + dc
        if (nc < 0 || nc > 7) continue
        const target = game.board[row + direction]?.[nc]
        
        if (target && getPieceColor(target) === enemyColor) {
          if (row + direction === promotionRow) {
            for (const promo of [PIECE.QUEEN, PIECE.ROOK, PIECE.BISHOP, PIECE.KNIGHT]) {
              moves.push({ toRow: row + direction, toCol: nc, promotion: promo, capture: true })
            }
          } else {
            addMove(row + direction, nc)
          }
        }
        
        // En passant
        if (game.enPassantTarget && 
            game.enPassantTarget[0] === row + direction && 
            game.enPassantTarget[1] === nc) {
          addMove(row + direction, nc, { enPassant: true })
        }
      }
      break
    }

    case PIECE.KNIGHT: {
      const knightMoves = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1]
      ]
      for (const [dr, dc] of knightMoves) {
        addMove(row + dr, col + dc)
      }
      break
    }

    case PIECE.BISHOP: {
      for (const [dr, dc] of [[-1, -1], [-1, 1], [1, -1], [1, 1]]) {
        for (let i = 1; i < 8; i++) {
          const nr = row + dr * i, nc = col + dc * i
          if (nr < 0 || nr > 7 || nc < 0 || nc > 7) break
          const target = game.board[nr][nc]
          if (target) {
            if (getPieceColor(target) === enemyColor) addMove(nr, nc)
            break
          }
          addMove(nr, nc)
        }
      }
      break
    }

    case PIECE.ROOK: {
      for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
        for (let i = 1; i < 8; i++) {
          const nr = row + dr * i, nc = col + dc * i
          if (nr < 0 || nr > 7 || nc < 0 || nc > 7) break
          const target = game.board[nr][nc]
          if (target) {
            if (getPieceColor(target) === enemyColor) addMove(nr, nc)
            break
          }
          addMove(nr, nc)
        }
      }
      break
    }

    case PIECE.QUEEN: {
      for (const [dr, dc] of [[-1, -1], [-1, 1], [1, -1], [1, 1], [-1, 0], [1, 0], [0, -1], [0, 1]]) {
        for (let i = 1; i < 8; i++) {
          const nr = row + dr * i, nc = col + dc * i
          if (nr < 0 || nr > 7 || nc < 0 || nc > 7) break
          const target = game.board[nr][nc]
          if (target) {
            if (getPieceColor(target) === enemyColor) addMove(nr, nc)
            break
          }
          addMove(nr, nc)
        }
      }
      break
    }

    case PIECE.KING: {
      // Normal moves
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue
          addMove(row + dr, col + dc)
        }
      }

      // Castling
      const homeRow = color === COLOR.WHITE ? 7 : 0
      if (row === homeRow && col === 4 && !isInCheck(game, color)) {
        // King side
        if (game.castling[color].kingSide &&
            !game.board[homeRow][5] && 
            !game.board[homeRow][6] &&
            game.board[homeRow][7] === color + PIECE.ROOK &&
            !isSquareAttacked(game, homeRow, 5, enemyColor) &&
            !isSquareAttacked(game, homeRow, 6, enemyColor)) {
          moves.push({ toRow: homeRow, toCol: 6, castle: 'K', capture: false })
        }
        // Queen side
        if (game.castling[color].queenSide &&
            !game.board[homeRow][1] && 
            !game.board[homeRow][2] && 
            !game.board[homeRow][3] &&
            game.board[homeRow][0] === color + PIECE.ROOK &&
            !isSquareAttacked(game, homeRow, 2, enemyColor) &&
            !isSquareAttacked(game, homeRow, 3, enemyColor)) {
          moves.push({ toRow: homeRow, toCol: 2, castle: 'Q', capture: false })
        }
      }
      break
    }
  }

  return moves
}

/**
 * Simulate a move without modifying the original game state
 */
function simulateMove(game, fromRow, fromCol, toRow, toCol, promotion = null) {
  const newGame = {
    ...game,
    board: game.board.map(row => [...row]),
    castling: {
      [COLOR.WHITE]: { ...game.castling[COLOR.WHITE] },
      [COLOR.BLACK]: { ...game.castling[COLOR.BLACK] }
    }
  }

  const piece = newGame.board[fromRow][fromCol]
  const color = getPieceColor(piece)
  const type = getPieceType(piece)

  // Handle en passant capture
  if (type === PIECE.PAWN && game.enPassantTarget &&
      toRow === game.enPassantTarget[0] && toCol === game.enPassantTarget[1]) {
    const captureRow = color === COLOR.WHITE ? toRow + 1 : toRow - 1
    newGame.board[captureRow][toCol] = null
  }

  // Move piece
  newGame.board[toRow][toCol] = promotion ? color + promotion : piece
  newGame.board[fromRow][fromCol] = null

  // Handle castling move
  if (type === PIECE.KING && Math.abs(toCol - fromCol) === 2) {
    if (toCol === 6) { // King side
      newGame.board[toRow][5] = newGame.board[toRow][7]
      newGame.board[toRow][7] = null
    } else if (toCol === 2) { // Queen side
      newGame.board[toRow][3] = newGame.board[toRow][0]
      newGame.board[toRow][0] = null
    }
  }

  return newGame
}

/**
 * Make a move and update game state
 * Returns the updated game state and move info
 */
export function makeMove(game, fromRow, fromCol, toRow, toCol, promotionOverride = null) {
  const piece = game.board[fromRow][fromCol]
  if (!piece) return { game, valid: false }

  const color = getPieceColor(piece)
  const type = getPieceType(piece)
  
  // Find this move in legal moves
  const legalMoves = getLegalMoves(game, fromRow, fromCol)
  const move = legalMoves.find(m => m.toRow === toRow && m.toCol === toCol)
  
  if (!move) return { game, valid: false }

  // Create new game state
  const newGame = {
    ...game,
    board: game.board.map(row => [...row]),
    castling: {
      [COLOR.WHITE]: { ...game.castling[COLOR.WHITE] },
      [COLOR.BLACK]: { ...game.castling[COLOR.BLACK] }
    },
    moveHistory: [...game.moveHistory]
  }

  // Determine promotion piece (random if not specified)
  let promotion = null
  if (move.promotion) {
    if (promotionOverride) {
      promotion = promotionOverride
    } else {
      // Random promotion!
      const options = [PIECE.QUEEN, PIECE.ROOK, PIECE.BISHOP, PIECE.KNIGHT]
      promotion = options[Math.floor(Math.random() * options.length)]
    }
  }

  const capturedPiece = newGame.board[toRow][toCol]
  let enPassantCapture = false

  // Handle en passant capture
  if (type === PIECE.PAWN && game.enPassantTarget &&
      toRow === game.enPassantTarget[0] && toCol === game.enPassantTarget[1]) {
    const captureRow = color === COLOR.WHITE ? toRow + 1 : toRow - 1
    newGame.board[captureRow][toCol] = null
    enPassantCapture = true
  }

  // Move piece
  newGame.board[toRow][toCol] = promotion ? color + promotion : piece
  newGame.board[fromRow][fromCol] = null

  // Handle castling move
  if (move.castle) {
    if (move.castle === 'K') { // King side
      newGame.board[toRow][5] = newGame.board[toRow][7]
      newGame.board[toRow][7] = null
    } else if (move.castle === 'Q') { // Queen side
      newGame.board[toRow][3] = newGame.board[toRow][0]
      newGame.board[toRow][0] = null
    }
  }

  // Update castling rights
  if (type === PIECE.KING) {
    newGame.castling[color].kingSide = false
    newGame.castling[color].queenSide = false
  }
  if (type === PIECE.ROOK) {
    const homeRow = color === COLOR.WHITE ? 7 : 0
    if (fromRow === homeRow && fromCol === 0) newGame.castling[color].queenSide = false
    if (fromRow === homeRow && fromCol === 7) newGame.castling[color].kingSide = false
  }
  // If a rook is captured, remove that castling right
  const enemyColor = color === COLOR.WHITE ? COLOR.BLACK : COLOR.WHITE
  const enemyHomeRow = enemyColor === COLOR.WHITE ? 7 : 0
  if (toRow === enemyHomeRow && toCol === 0) newGame.castling[enemyColor].queenSide = false
  if (toRow === enemyHomeRow && toCol === 7) newGame.castling[enemyColor].kingSide = false

  // Update en passant target
  if (move.doublePawn) {
    const epRow = color === COLOR.WHITE ? fromRow - 1 : fromRow + 1
    newGame.enPassantTarget = [epRow, fromCol]
  } else {
    newGame.enPassantTarget = null
  }

  // Switch turn
  newGame.turn = enemyColor
  if (color === COLOR.BLACK) {
    newGame.fullMoveNumber++
  }

  // Record move
  const moveRecord = {
    from: [fromRow, fromCol],
    to: [toRow, toCol],
    piece,
    captured: capturedPiece || (enPassantCapture ? enemyColor + PIECE.PAWN : null),
    promotion,
    castle: move.castle || null,
    enPassant: enPassantCapture
  }
  newGame.moveHistory.push(moveRecord)

  // Check for check, checkmate, stalemate
  const inCheck = isInCheck(newGame, enemyColor)
  const hasLegalMoves = getAllLegalMoves(newGame).length > 0

  moveRecord.check = inCheck && hasLegalMoves
  moveRecord.checkmate = inCheck && !hasLegalMoves
  moveRecord.stalemate = !inCheck && !hasLegalMoves

  if (moveRecord.checkmate) {
    newGame.gameOver = true
    newGame.winner = color
    newGame.gameOverReason = 'checkmate'
  } else if (moveRecord.stalemate) {
    newGame.gameOver = true
    newGame.winner = 'draw'
    newGame.gameOverReason = 'stalemate'
  }

  return { game: newGame, valid: true, move: moveRecord }
}

/**
 * Get all legal moves for the current player
 */
export function getAllLegalMoves(game) {
  const moves = []
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = game.board[r][c]
      if (piece && getPieceColor(piece) === game.turn) {
        const pieceMoves = getLegalMoves(game, r, c)
        for (const move of pieceMoves) {
          moves.push({ fromRow: r, fromCol: c, ...move })
        }
      }
    }
  }
  return moves
}

/**
 * Clone a game state
 */
export function cloneGame(game) {
  return {
    ...game,
    board: game.board.map(row => [...row]),
    castling: {
      [COLOR.WHITE]: { ...game.castling[COLOR.WHITE] },
      [COLOR.BLACK]: { ...game.castling[COLOR.BLACK] }
    },
    enPassantTarget: game.enPassantTarget ? [...game.enPassantTarget] : null,
    moveHistory: game.moveHistory.map(m => ({ ...m }))
  }
}


