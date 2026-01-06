/**
 * Standard Algebraic Notation (SAN) Generator
 * Converts move records to human-readable chess notation
 */

import { PIECE, getPieceType, getPieceColor, getLegalMoves } from './engine.js'

// File letters (columns)
const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']

// Rank numbers (rows, from white's perspective)
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1']

/**
 * Convert row/col to algebraic notation (e.g., [0, 0] -> "a8")
 */
export function toSquare(row, col) {
  return FILES[col] + RANKS[row]
}

/**
 * Convert algebraic notation to row/col (e.g., "a8" -> [0, 0])
 */
export function fromSquare(square) {
  const col = FILES.indexOf(square[0])
  const row = RANKS.indexOf(square[1])
  return [row, col]
}

/**
 * Get piece letter for SAN (uppercase, pawns have no letter)
 */
function getPieceLetter(pieceType) {
  switch (pieceType) {
    case PIECE.KING: return 'K'
    case PIECE.QUEEN: return 'Q'
    case PIECE.ROOK: return 'R'
    case PIECE.BISHOP: return 'B'
    case PIECE.KNIGHT: return 'N'
    case PIECE.PAWN: return ''
    default: return ''
  }
}

/**
 * Convert a move record to SAN
 * @param {object} game - Game state BEFORE the move
 * @param {object} moveRecord - The move that was made
 */
export function toSAN(game, moveRecord) {
  const { from, to, piece, captured, promotion, castle, check, checkmate } = moveRecord
  const [fromRow, fromCol] = from
  const [toRow, toCol] = to
  const pieceType = getPieceType(piece)
  const pieceColor = getPieceColor(piece)

  let san = ''

  // Castling
  if (castle) {
    san = castle === 'K' ? 'O-O' : 'O-O-O'
  } else {
    // Piece letter (not for pawns)
    san += getPieceLetter(pieceType)

    // Disambiguation for pieces that can reach the same square
    if (pieceType !== PIECE.PAWN) {
      const disambiguation = getDisambiguation(game, fromRow, fromCol, toRow, toCol, piece)
      san += disambiguation
    }

    // Capture notation
    if (captured) {
      if (pieceType === PIECE.PAWN) {
        san += FILES[fromCol] // Pawn captures include file of origin
      }
      san += 'x'
    }

    // Destination square
    san += toSquare(toRow, toCol)

    // Promotion
    if (promotion) {
      san += '=' + getPieceLetter(promotion).toUpperCase()
    }
  }

  // Check/Checkmate
  if (checkmate) {
    san += '#'
  } else if (check) {
    san += '+'
  }

  return san
}

/**
 * Get disambiguation string for pieces that can reach the same square
 */
function getDisambiguation(game, fromRow, fromCol, toRow, toCol, piece) {
  const pieceType = getPieceType(piece)
  const pieceColor = getPieceColor(piece)
  
  // Find other pieces of same type that can move to the same square
  const otherPieces = []
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (r === fromRow && c === fromCol) continue
      const p = game.board[r][c]
      if (p && p === piece) {
        const moves = getLegalMoves(game, r, c)
        if (moves.some(m => m.toRow === toRow && m.toCol === toCol)) {
          otherPieces.push([r, c])
        }
      }
    }
  }

  if (otherPieces.length === 0) return ''

  // Check if file is unique
  const sameFile = otherPieces.some(([r, c]) => c === fromCol)
  const sameRank = otherPieces.some(([r, c]) => r === fromRow)

  if (!sameFile) {
    return FILES[fromCol]
  } else if (!sameRank) {
    return RANKS[fromRow]
  } else {
    return FILES[fromCol] + RANKS[fromRow]
  }
}

/**
 * Format move for display with full description
 */
export function toVerbose(moveRecord) {
  const { from, to, piece, captured, promotion, castle, check, checkmate, enPassant, stalemate } = moveRecord
  const pieceType = getPieceType(piece)
  const pieceColor = getPieceColor(piece)
  const colorName = pieceColor === 'w' ? 'White' : 'Black'
  
  const pieceNames = {
    [PIECE.KING]: 'King',
    [PIECE.QUEEN]: 'Queen',
    [PIECE.ROOK]: 'Rook',
    [PIECE.BISHOP]: 'Bishop',
    [PIECE.KNIGHT]: 'Knight',
    [PIECE.PAWN]: 'Pawn'
  }

  let desc = `${colorName} ${pieceNames[pieceType]}`

  if (castle) {
    desc = `${colorName} castles ${castle === 'K' ? 'kingside' : 'queenside'}`
  } else {
    desc += ` ${toSquare(from[0], from[1])} → ${toSquare(to[0], to[1])}`
    
    if (captured) {
      const capturedType = getPieceType(captured)
      desc += ` captures ${pieceNames[capturedType]}`
      if (enPassant) desc += ' (en passant)'
    }
    
    if (promotion) {
      desc += ` promotes to ${pieceNames[promotion]}`
    }
  }

  if (checkmate) {
    desc += ' - CHECKMATE!'
  } else if (check) {
    desc += ' - Check!'
  } else if (stalemate) {
    desc += ' - Stalemate!'
  }

  return desc
}

/**
 * Get move number prefix (e.g., "1." or "1...")
 */
export function getMoveNumber(moveIndex, isBlack) {
  const moveNum = Math.floor(moveIndex / 2) + 1
  return isBlack ? `${moveNum}...` : `${moveNum}.`
}


