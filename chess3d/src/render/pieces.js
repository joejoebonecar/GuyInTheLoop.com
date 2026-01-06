/**
 * Chess Piece Geometries
 * Glitchy Staunton-style pieces built from Three.js primitives
 */

import * as THREE from 'three'
import { PIECE, COLOR } from '../chess/engine.js'

// Materials
const whiteMaterial = new THREE.MeshStandardMaterial({
  color: 0xf5f5f5,
  roughness: 0.3,
  metalness: 0.1
})

const blackMaterial = new THREE.MeshStandardMaterial({
  color: 0x1a1a1a,
  roughness: 0.3,
  metalness: 0.1
})

// Glitch shader (vertex displacement)
const glitchUniforms = {
  time: { value: 0 },
  glitchIntensity: { value: 0.02 }
}

// Update glitch animation
let glitchTime = 0
export function updateGlitch(delta) {
  glitchTime += delta
  glitchUniforms.time.value = glitchTime
  
  // Random glitch spikes
  if (Math.random() < 0.02) {
    glitchUniforms.glitchIntensity.value = 0.1 + Math.random() * 0.1
    setTimeout(() => {
      glitchUniforms.glitchIntensity.value = 0.02
    }, 50 + Math.random() * 100)
  }
}

/**
 * Create base for all pieces
 */
function createBase(height = 0.15) {
  const geometry = new THREE.CylinderGeometry(0.35, 0.4, height, 16)
  return new THREE.Mesh(geometry)
}

/**
 * Create a pawn - simple cylinder with sphere head
 */
function createPawn(material) {
  const group = new THREE.Group()
  
  // Base
  const base = createBase()
  base.material = material
  base.position.y = 0.075
  group.add(base)
  
  // Body
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.3, 0.4, 12),
    material
  )
  body.position.y = 0.35
  group.add(body)
  
  // Head
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 16, 12),
    material
  )
  head.position.y = 0.65
  group.add(head)
  
  group.traverse(child => {
    if (child.isMesh) {
      child.castShadow = true
      child.receiveShadow = true
    }
  })
  
  return group
}

/**
 * Create a rook - cylinder with crenellated top
 */
function createRook(material) {
  const group = new THREE.Group()
  
  // Base
  const base = createBase()
  base.material = material
  base.position.y = 0.075
  group.add(base)
  
  // Body
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25, 0.32, 0.5, 8),
    material
  )
  body.position.y = 0.4
  group.add(body)
  
  // Top platform
  const top = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.25, 0.15, 8),
    material
  )
  top.position.y = 0.72
  group.add(top)
  
  // Crenellations (battlements)
  const crenGeom = new THREE.BoxGeometry(0.12, 0.15, 0.12)
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2
    const cren = new THREE.Mesh(crenGeom, material)
    cren.position.set(
      Math.cos(angle) * 0.22,
      0.87,
      Math.sin(angle) * 0.22
    )
    group.add(cren)
  }
  
  group.traverse(child => {
    if (child.isMesh) {
      child.castShadow = true
      child.receiveShadow = true
    }
  })
  
  return group
}

/**
 * Create a knight - angled wedge suggesting horse head
 */
function createKnight(material) {
  const group = new THREE.Group()
  
  // Base
  const base = createBase()
  base.material = material
  base.position.y = 0.075
  group.add(base)
  
  // Neck/body
  const neck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.28, 0.4, 8),
    material
  )
  neck.position.y = 0.35
  group.add(neck)
  
  // Head - angled box
  const headGeom = new THREE.BoxGeometry(0.25, 0.35, 0.4)
  const head = new THREE.Mesh(headGeom, material)
  head.position.set(0.08, 0.65, 0)
  head.rotation.z = -0.3
  group.add(head)
  
  // Muzzle
  const muzzle = new THREE.Mesh(
    new THREE.BoxGeometry(0.15, 0.15, 0.25),
    material
  )
  muzzle.position.set(0.22, 0.55, 0)
  muzzle.rotation.z = -0.4
  group.add(muzzle)
  
  // Ears
  const earGeom = new THREE.ConeGeometry(0.06, 0.15, 4)
  const ear1 = new THREE.Mesh(earGeom, material)
  ear1.position.set(0, 0.88, 0.08)
  ear1.rotation.z = 0.2
  group.add(ear1)
  
  const ear2 = new THREE.Mesh(earGeom, material)
  ear2.position.set(0, 0.88, -0.08)
  ear2.rotation.z = 0.2
  group.add(ear2)
  
  group.traverse(child => {
    if (child.isMesh) {
      child.castShadow = true
      child.receiveShadow = true
    }
  })
  
  return group
}

/**
 * Create a bishop - tapered cylinder with miter slot
 */
function createBishop(material) {
  const group = new THREE.Group()
  
  // Base
  const base = createBase()
  base.material = material
  base.position.y = 0.075
  group.add(base)
  
  // Body
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.28, 0.55, 12),
    material
  )
  body.position.y = 0.42
  group.add(body)
  
  // Head
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.7),
    material
  )
  head.position.y = 0.75
  group.add(head)
  
  // Miter slot
  const slot = new THREE.Mesh(
    new THREE.BoxGeometry(0.04, 0.2, 0.25),
    new THREE.MeshStandardMaterial({ color: 0x333333 })
  )
  slot.position.set(0.12, 0.8, 0)
  slot.rotation.z = 0.3
  group.add(slot)
  
  // Top ball
  const topBall = new THREE.Mesh(
    new THREE.SphereGeometry(0.06, 8, 6),
    material
  )
  topBall.position.y = 0.95
  group.add(topBall)
  
  group.traverse(child => {
    if (child.isMesh) {
      child.castShadow = true
      child.receiveShadow = true
    }
  })
  
  return group
}

/**
 * Create a queen - tall with crown-like top
 */
function createQueen(material) {
  const group = new THREE.Group()
  
  // Base
  const base = createBase(0.18)
  base.material = material
  base.position.y = 0.09
  group.add(base)
  
  // Body
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.32, 0.6, 12),
    material
  )
  body.position.y = 0.48
  group.add(body)
  
  // Neck
  const neck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.15, 0.15, 12),
    material
  )
  neck.position.y = 0.85
  group.add(neck)
  
  // Crown base
  const crownBase = new THREE.Mesh(
    new THREE.TorusGeometry(0.15, 0.05, 8, 16),
    material
  )
  crownBase.position.y = 0.95
  crownBase.rotation.x = Math.PI / 2
  group.add(crownBase)
  
  // Crown points
  const pointGeom = new THREE.ConeGeometry(0.04, 0.12, 4)
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2
    const point = new THREE.Mesh(pointGeom, material)
    point.position.set(
      Math.cos(angle) * 0.12,
      1.05,
      Math.sin(angle) * 0.12
    )
    group.add(point)
  }
  
  // Top ball
  const topBall = new THREE.Mesh(
    new THREE.SphereGeometry(0.07, 8, 6),
    material
  )
  topBall.position.y = 1.15
  group.add(topBall)
  
  group.traverse(child => {
    if (child.isMesh) {
      child.castShadow = true
      child.receiveShadow = true
    }
  })
  
  return group
}

/**
 * Create a king - tallest with cross on top
 */
function createKing(material) {
  const group = new THREE.Group()
  
  // Base
  const base = createBase(0.2)
  base.material = material
  base.position.y = 0.1
  group.add(base)
  
  // Body
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.35, 0.65, 12),
    material
  )
  body.position.y = 0.52
  group.add(body)
  
  // Neck
  const neck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.18, 0.15, 12),
    material
  )
  neck.position.y = 0.92
  group.add(neck)
  
  // Crown rim
  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(0.18, 0.04, 8, 16),
    material
  )
  rim.position.y = 1.02
  rim.rotation.x = Math.PI / 2
  group.add(rim)
  
  // Crown dome
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(0.15, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2),
    material
  )
  dome.position.y = 1.02
  group.add(dome)
  
  // Cross vertical
  const crossV = new THREE.Mesh(
    new THREE.BoxGeometry(0.06, 0.25, 0.06),
    material
  )
  crossV.position.y = 1.27
  group.add(crossV)
  
  // Cross horizontal
  const crossH = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 0.06, 0.06),
    material
  )
  crossH.position.y = 1.32
  group.add(crossH)
  
  group.traverse(child => {
    if (child.isMesh) {
      child.castShadow = true
      child.receiveShadow = true
    }
  })
  
  return group
}

/**
 * Create a piece mesh by type and color
 */
export function createPieceMesh(pieceType, pieceColor) {
  const material = pieceColor === COLOR.WHITE ? whiteMaterial.clone() : blackMaterial.clone()
  
  let mesh
  switch (pieceType) {
    case PIECE.PAWN:
      mesh = createPawn(material)
      break
    case PIECE.ROOK:
      mesh = createRook(material)
      break
    case PIECE.KNIGHT:
      mesh = createKnight(material)
      break
    case PIECE.BISHOP:
      mesh = createBishop(material)
      break
    case PIECE.QUEEN:
      mesh = createQueen(material)
      break
    case PIECE.KING:
      mesh = createKing(material)
      break
    default:
      mesh = createPawn(material)
  }
  
  mesh.userData.pieceType = pieceType
  mesh.userData.pieceColor = pieceColor
  
  return mesh
}

/**
 * Apply glitch effect to a piece
 */
export function applyGlitch(mesh, intensity = 1) {
  mesh.traverse(child => {
    if (child.isMesh && child.geometry) {
      // Random vertex displacement
      const positions = child.geometry.attributes.position
      if (positions && !child.userData.originalPositions) {
        child.userData.originalPositions = positions.array.slice()
      }
      
      if (child.userData.originalPositions) {
        const original = child.userData.originalPositions
        const glitchAmount = 0.02 * intensity
        
        for (let i = 0; i < positions.count; i++) {
          positions.setX(i, original[i * 3] + (Math.random() - 0.5) * glitchAmount)
          positions.setY(i, original[i * 3 + 1] + (Math.random() - 0.5) * glitchAmount)
          positions.setZ(i, original[i * 3 + 2] + (Math.random() - 0.5) * glitchAmount)
        }
        positions.needsUpdate = true
      }
    }
  })
}

/**
 * Reset glitch on a piece
 */
export function resetGlitch(mesh) {
  mesh.traverse(child => {
    if (child.isMesh && child.geometry && child.userData.originalPositions) {
      const positions = child.geometry.attributes.position
      const original = child.userData.originalPositions
      
      for (let i = 0; i < positions.count; i++) {
        positions.setX(i, original[i * 3])
        positions.setY(i, original[i * 3 + 1])
        positions.setZ(i, original[i * 3 + 2])
      }
      positions.needsUpdate = true
    }
  })
}

/**
 * Highlight a piece (selection glow)
 */
export function highlightPiece(mesh, highlight = true) {
  mesh.traverse(child => {
    if (child.isMesh) {
      if (highlight) {
        child.material.emissive = new THREE.Color(0x444400)
        child.material.emissiveIntensity = 0.5
      } else {
        child.material.emissive = new THREE.Color(0x000000)
        child.material.emissiveIntensity = 0
      }
    }
  })
}


