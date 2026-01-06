/**
 * Particle Effects
 * Capture dust/fragments explosion
 */

import * as THREE from 'three'
import { gsap } from 'gsap'

// Active particle systems
const activeSystems = []

/**
 * Create a capture explosion at a position
 */
export function createCaptureExplosion(position, color, particlesGroup) {
  const particleCount = 30
  const particles = []
  
  // Particle material
  const material = new THREE.MeshBasicMaterial({
    color: color === 'w' ? 0xf5f5f5 : 0x1a1a1a,
    transparent: true,
    opacity: 1
  })
  
  // Create small cube particles
  const geometry = new THREE.BoxGeometry(0.05, 0.05, 0.05)
  
  for (let i = 0; i < particleCount; i++) {
    const particle = new THREE.Mesh(geometry, material.clone())
    particle.position.copy(position)
    particle.position.y += 0.3 + Math.random() * 0.3
    
    // Random rotation
    particle.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    )
    
    particlesGroup.add(particle)
    particles.push(particle)
    
    // Velocity
    const velocity = new THREE.Vector3(
      (Math.random() - 0.5) * 3,
      Math.random() * 2 + 1,
      (Math.random() - 0.5) * 3
    )
    
    // Animate particle
    const duration = 0.8 + Math.random() * 0.4
    
    gsap.to(particle.position, {
      x: position.x + velocity.x,
      y: position.y + velocity.y - 2, // Gravity
      z: position.z + velocity.z,
      duration,
      ease: 'power2.out'
    })
    
    gsap.to(particle.rotation, {
      x: particle.rotation.x + Math.random() * 4,
      y: particle.rotation.y + Math.random() * 4,
      z: particle.rotation.z + Math.random() * 4,
      duration,
      ease: 'none'
    })
    
    gsap.to(particle.material, {
      opacity: 0,
      duration,
      ease: 'power2.in',
      onComplete: () => {
        particlesGroup.remove(particle)
        particle.geometry.dispose()
        particle.material.dispose()
      }
    })
  }
  
  // Create dust cloud
  createDustCloud(position, color, particlesGroup)
  
  return particles
}

/**
 * Create dust cloud effect
 */
function createDustCloud(position, color, particlesGroup) {
  const dustCount = 20
  const dustColor = color === 'w' ? 0xcccccc : 0x444444
  
  const spriteMaterial = new THREE.SpriteMaterial({
    color: dustColor,
    transparent: true,
    opacity: 0.6
  })
  
  for (let i = 0; i < dustCount; i++) {
    const dust = new THREE.Sprite(spriteMaterial.clone())
    dust.position.copy(position)
    dust.position.y += 0.2
    dust.position.x += (Math.random() - 0.5) * 0.3
    dust.position.z += (Math.random() - 0.5) * 0.3
    dust.scale.set(0.1, 0.1, 0.1)
    
    particlesGroup.add(dust)
    
    const targetScale = 0.3 + Math.random() * 0.3
    const duration = 0.6 + Math.random() * 0.3
    
    gsap.to(dust.scale, {
      x: targetScale,
      y: targetScale,
      duration,
      ease: 'power2.out'
    })
    
    gsap.to(dust.position, {
      y: position.y + 0.5 + Math.random() * 0.5,
      x: dust.position.x + (Math.random() - 0.5) * 0.5,
      z: dust.position.z + (Math.random() - 0.5) * 0.5,
      duration,
      ease: 'power2.out'
    })
    
    gsap.to(dust.material, {
      opacity: 0,
      duration,
      ease: 'power2.in',
      onComplete: () => {
        particlesGroup.remove(dust)
        dust.material.dispose()
      }
    })
  }
}

/**
 * Screen shake effect (camera shake)
 */
export function screenShake(camera, intensity = 0.1, duration = 0.2) {
  const originalPosition = camera.position.clone()
  
  const shake = () => {
    camera.position.x = originalPosition.x + (Math.random() - 0.5) * intensity
    camera.position.y = originalPosition.y + (Math.random() - 0.5) * intensity
    camera.position.z = originalPosition.z + (Math.random() - 0.5) * intensity
  }
  
  const shakeInterval = setInterval(shake, 16)
  
  setTimeout(() => {
    clearInterval(shakeInterval)
    camera.position.copy(originalPosition)
  }, duration * 1000)
}

/**
 * Glitch effect on capture (temporary visual corruption)
 */
export function glitchEffect(renderer, duration = 0.1) {
  // Simple approach: briefly change clear color
  const originalColor = renderer.getClearColor(new THREE.Color())
  const originalAlpha = renderer.getClearAlpha()
  
  renderer.setClearColor(0xff00ff, 1)
  
  setTimeout(() => {
    renderer.setClearColor(0x00ffff, 1)
    setTimeout(() => {
      renderer.setClearColor(originalColor, originalAlpha)
    }, duration * 500)
  }, duration * 500)
}

/**
 * Create check warning effect
 */
export function createCheckEffect(kingPosition, particlesGroup) {
  const ringGeometry = new THREE.RingGeometry(0.3, 0.5, 32)
  const ringMaterial = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    transparent: true,
    opacity: 0.8,
    side: THREE.DoubleSide
  })
  
  const ring = new THREE.Mesh(ringGeometry, ringMaterial)
  ring.position.copy(kingPosition)
  ring.position.y += 0.15
  ring.rotation.x = -Math.PI / 2
  ring.scale.set(0.1, 0.1, 0.1)
  
  particlesGroup.add(ring)
  
  // Expand and fade
  gsap.to(ring.scale, {
    x: 1.5,
    y: 1.5,
    z: 1.5,
    duration: 0.5,
    ease: 'power2.out'
  })
  
  gsap.to(ring.material, {
    opacity: 0,
    duration: 0.5,
    ease: 'power2.in',
    onComplete: () => {
      particlesGroup.remove(ring)
      ring.geometry.dispose()
      ring.material.dispose()
    }
  })
}

/**
 * Checkmate celebration effect
 */
export function createCheckmateEffect(position, particlesGroup) {
  const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff]
  
  for (let i = 0; i < 50; i++) {
    const geometry = new THREE.BoxGeometry(0.08, 0.08, 0.08)
    const material = new THREE.MeshBasicMaterial({
      color: colors[Math.floor(Math.random() * colors.length)],
      transparent: true,
      opacity: 1
    })
    
    const particle = new THREE.Mesh(geometry, material)
    particle.position.copy(position)
    particle.position.y += 0.5
    
    particlesGroup.add(particle)
    
    const angle = Math.random() * Math.PI * 2
    const radius = 1 + Math.random() * 2
    const height = 2 + Math.random() * 2
    
    gsap.to(particle.position, {
      x: position.x + Math.cos(angle) * radius,
      y: position.y + height,
      z: position.z + Math.sin(angle) * radius,
      duration: 1 + Math.random() * 0.5,
      ease: 'power2.out'
    })
    
    gsap.to(particle.rotation, {
      x: Math.random() * 10,
      y: Math.random() * 10,
      duration: 1.5,
      ease: 'none'
    })
    
    gsap.to(particle.material, {
      opacity: 0,
      duration: 1.5,
      delay: 0.5,
      ease: 'power2.in',
      onComplete: () => {
        particlesGroup.remove(particle)
        particle.geometry.dispose()
        particle.material.dispose()
      }
    })
  }
}


