/**
 * Three.js Scene Setup
 * Orthographic 3/4 view camera, lighting, board mesh, render loop
 */

import * as THREE from 'three'

// Scene globals
let scene, camera, renderer
let boardGroup, piecesGroup, highlightGroup, ghostGroup, particlesGroup
let animationId = null

// Board dimensions
const SQUARE_SIZE = 1
const BOARD_SIZE = 8 * SQUARE_SIZE

// Theme colors (will be updated by UI)
let themeColors = {
  lightSquare: 0xf0d9b5,
  darkSquare: 0xb58863,
  background: 0x1a1a2e,
  highlight: 0x44ff44,
  selected: 0xffff44
}

/**
 * Initialize the 3D scene
 */
export function initScene(container) {
  // Scene
  scene = new THREE.Scene()
  scene.background = new THREE.Color(themeColors.background)

  // Orthographic camera for clean 3/4 view
  const aspect = container.clientWidth / container.clientHeight
  const frustumSize = 12
  camera = new THREE.OrthographicCamera(
    -frustumSize * aspect / 2,
    frustumSize * aspect / 2,
    frustumSize / 2,
    -frustumSize / 2,
    0.1,
    100
  )
  
  // Position for 3/4 isometric-ish view from white's perspective
  camera.position.set(0, 10, 8)
  camera.lookAt(0, 0, 0)

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(container.clientWidth, container.clientHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  container.appendChild(renderer.domElement)

  // Groups for organization
  boardGroup = new THREE.Group()
  piecesGroup = new THREE.Group()
  highlightGroup = new THREE.Group()
  ghostGroup = new THREE.Group()
  particlesGroup = new THREE.Group()
  
  scene.add(boardGroup)
  scene.add(piecesGroup)
  scene.add(highlightGroup)
  scene.add(ghostGroup)
  scene.add(particlesGroup)

  // Lighting
  setupLighting()

  // Create board
  createBoard()

  // Handle resize
  window.addEventListener('resize', () => onResize(container))

  // Start render loop
  animate()

  return { scene, camera, renderer }
}

/**
 * Setup scene lighting
 */
function setupLighting() {
  // Ambient light
  const ambient = new THREE.AmbientLight(0xffffff, 0.6)
  scene.add(ambient)

  // Main directional light (sun-like)
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8)
  dirLight.position.set(5, 10, 5)
  dirLight.castShadow = true
  dirLight.shadow.mapSize.width = 2048
  dirLight.shadow.mapSize.height = 2048
  dirLight.shadow.camera.near = 0.5
  dirLight.shadow.camera.far = 50
  dirLight.shadow.camera.left = -10
  dirLight.shadow.camera.right = 10
  dirLight.shadow.camera.top = 10
  dirLight.shadow.camera.bottom = -10
  scene.add(dirLight)

  // Fill light from opposite side
  const fillLight = new THREE.DirectionalLight(0xffffff, 0.3)
  fillLight.position.set(-5, 5, -5)
  scene.add(fillLight)
}

/**
 * Create the chess board
 */
function createBoard() {
  const boardGeometry = new THREE.BoxGeometry(BOARD_SIZE + 0.4, 0.3, BOARD_SIZE + 0.4)
  const boardMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x4a3728,
    roughness: 0.7
  })
  const boardBase = new THREE.Mesh(boardGeometry, boardMaterial)
  boardBase.position.y = -0.15
  boardBase.receiveShadow = true
  boardGroup.add(boardBase)

  // Create squares
  const lightMat = new THREE.MeshStandardMaterial({ 
    color: themeColors.lightSquare,
    roughness: 0.8
  })
  const darkMat = new THREE.MeshStandardMaterial({ 
    color: themeColors.darkSquare,
    roughness: 0.8
  })
  const squareGeom = new THREE.BoxGeometry(SQUARE_SIZE * 0.98, 0.1, SQUARE_SIZE * 0.98)

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const isLight = (row + col) % 2 === 0
      const square = new THREE.Mesh(squareGeom, isLight ? lightMat : darkMat)
      square.position.set(
        col * SQUARE_SIZE - BOARD_SIZE / 2 + SQUARE_SIZE / 2,
        0.05,
        row * SQUARE_SIZE - BOARD_SIZE / 2 + SQUARE_SIZE / 2
      )
      square.receiveShadow = true
      square.userData = { row, col, type: 'square' }
      boardGroup.add(square)
    }
  }
}

/**
 * Convert board coordinates to 3D position
 */
export function boardToWorld(row, col) {
  return new THREE.Vector3(
    col * SQUARE_SIZE - BOARD_SIZE / 2 + SQUARE_SIZE / 2,
    0.1,
    row * SQUARE_SIZE - BOARD_SIZE / 2 + SQUARE_SIZE / 2
  )
}

/**
 * Convert 3D position to board coordinates
 */
export function worldToBoard(position) {
  const col = Math.floor((position.x + BOARD_SIZE / 2) / SQUARE_SIZE)
  const row = Math.floor((position.z + BOARD_SIZE / 2) / SQUARE_SIZE)
  if (row >= 0 && row < 8 && col >= 0 && col < 8) {
    return { row, col }
  }
  return null
}

/**
 * Add a piece mesh to the scene
 */
export function addPieceMesh(mesh, row, col) {
  const pos = boardToWorld(row, col)
  mesh.position.copy(pos)
  mesh.userData.row = row
  mesh.userData.col = col
  piecesGroup.add(mesh)
  return mesh
}

/**
 * Remove a piece mesh from the scene
 */
export function removePieceMesh(mesh) {
  piecesGroup.remove(mesh)
}

/**
 * Get all piece meshes
 */
export function getPieceMeshes() {
  return piecesGroup.children
}

/**
 * Clear all piece meshes
 */
export function clearPieces() {
  while (piecesGroup.children.length > 0) {
    piecesGroup.remove(piecesGroup.children[0])
  }
}

/**
 * Show move highlights
 */
export function showHighlights(squares, type = 'valid') {
  clearHighlights()
  
  const color = type === 'selected' ? themeColors.selected : themeColors.highlight
  const geometry = new THREE.RingGeometry(0.3, 0.4, 32)
  const material = new THREE.MeshBasicMaterial({ 
    color,
    transparent: true,
    opacity: 0.7,
    side: THREE.DoubleSide
  })

  for (const { row, col } of squares) {
    const highlight = new THREE.Mesh(geometry, material)
    highlight.rotation.x = -Math.PI / 2
    const pos = boardToWorld(row, col)
    highlight.position.set(pos.x, 0.12, pos.z)
    highlight.userData = { row, col, type: 'highlight' }
    highlightGroup.add(highlight)
  }
}

/**
 * Clear all highlights
 */
export function clearHighlights() {
  while (highlightGroup.children.length > 0) {
    highlightGroup.remove(highlightGroup.children[0])
  }
}

/**
 * Show ghost piece preview
 */
export function showGhost(mesh, row, col) {
  clearGhost()
  
  const ghostMesh = mesh.clone()
  ghostMesh.traverse(child => {
    if (child.isMesh) {
      child.material = child.material.clone()
      child.material.transparent = true
      child.material.opacity = 0.5
    }
  })
  
  const pos = boardToWorld(row, col)
  ghostMesh.position.set(pos.x, pos.y + 0.3, pos.z) // Float above
  ghostGroup.add(ghostMesh)
}

/**
 * Clear ghost preview
 */
export function clearGhost() {
  while (ghostGroup.children.length > 0) {
    ghostGroup.remove(ghostGroup.children[0])
  }
}

/**
 * Get particles group for effects
 */
export function getParticlesGroup() {
  return particlesGroup
}

/**
 * Update theme colors
 */
export function setThemeColors(colors) {
  themeColors = { ...themeColors, ...colors }
  scene.background = new THREE.Color(themeColors.background)
  
  // Update board squares
  boardGroup.children.forEach(child => {
    if (child.userData.type === 'square') {
      const isLight = (child.userData.row + child.userData.col) % 2 === 0
      child.material.color.setHex(isLight ? themeColors.lightSquare : themeColors.darkSquare)
    }
  })
}

/**
 * Handle window resize
 */
function onResize(container) {
  const aspect = container.clientWidth / container.clientHeight
  const frustumSize = 12
  
  camera.left = -frustumSize * aspect / 2
  camera.right = frustumSize * aspect / 2
  camera.top = frustumSize / 2
  camera.bottom = -frustumSize / 2
  camera.updateProjectionMatrix()
  
  renderer.setSize(container.clientWidth, container.clientHeight)
}

/**
 * Animation loop
 */
function animate() {
  animationId = requestAnimationFrame(animate)
  renderer.render(scene, camera)
}

/**
 * Raycast from mouse position
 */
export function raycast(mouseX, mouseY, container) {
  const rect = container.getBoundingClientRect()
  const x = ((mouseX - rect.left) / rect.width) * 2 - 1
  const y = -((mouseY - rect.top) / rect.height) * 2 + 1
  
  const raycaster = new THREE.Raycaster()
  raycaster.setFromCamera(new THREE.Vector2(x, y), camera)
  
  // Check pieces first
  const pieceHits = raycaster.intersectObjects(piecesGroup.children, true)
  if (pieceHits.length > 0) {
    // Find the root piece group
    let obj = pieceHits[0].object
    while (obj.parent && obj.parent !== piecesGroup) {
      obj = obj.parent
    }
    if (obj.userData.row !== undefined) {
      return { type: 'piece', row: obj.userData.row, col: obj.userData.col }
    }
  }
  
  // Check board squares
  const boardHits = raycaster.intersectObjects(boardGroup.children)
  for (const hit of boardHits) {
    if (hit.object.userData.type === 'square') {
      return { type: 'square', row: hit.object.userData.row, col: hit.object.userData.col }
    }
  }
  
  // Check highlights
  const highlightHits = raycaster.intersectObjects(highlightGroup.children)
  if (highlightHits.length > 0) {
    const hit = highlightHits[0].object
    return { type: 'highlight', row: hit.userData.row, col: hit.userData.col }
  }
  
  return null
}

/**
 * Get the renderer DOM element
 */
export function getCanvas() {
  return renderer.domElement
}

/**
 * Cleanup
 */
export function dispose() {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  renderer.dispose()
}


