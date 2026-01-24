"use client"

import React, { useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { OrbitControls, Float, PerspectiveCamera, Environment, Text, Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { TextureLoader } from 'three'

function BrainModel({ rotate = true }: { rotate?: boolean }) {
  const mesh = useRef<THREE.Mesh>(null!)
  const scanBeam = useRef<THREE.Group>(null!)

  // High fidelity textures
  const colorMap = useLoader(TextureLoader, '/real_tissue_brain.png')

  useFrame((state, delta) => {
    if (!mesh.current) return
    if (rotate) {
      mesh.current.rotation.y += delta * 0.1
    }

    // Complex Scanning Beam Logic
    const t = state.clock.getElapsedTime()
    if (scanBeam.current) {
      scanBeam.current.position.y = Math.sin(t * 0.8) * 2.2
      scanBeam.current.rotation.y = t * 0.15
    }
  })

  const brainMaterial = (
    <meshPhysicalMaterial
      map={colorMap}
      roughness={0.4}
      metalness={0.05}
      color="#fdf2f0" // Much cleaner, warm anatomical base
      emissive="#ffffff"
      emissiveIntensity={0.01}
      transmission={0.3} // Better subsurface scattering feel
      thickness={1.5}
      clearcoat={0.2}
      clearcoatRoughness={0.1}
    />
  )

  return (
    <group>
      {/* Target Crosshair / Anomaly Detection Visual */}
      <mesh position={[0.8, 0.4, 0.6]} scale={0.8}>
        <ringGeometry args={[0.2, 0.25, 32]} />
        <meshBasicMaterial color="#ef4444" transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>

      <group ref={mesh} scale={1.2}>
        {/* Left Hemisphere - Ellipsoidal Shape */}
        <mesh position={[-0.45, 0, 0]} scale={[0.85, 1, 1.3]}>
          <sphereGeometry args={[1.6, 64, 64]} />
          {brainMaterial}
        </mesh>

        {/* Right Hemisphere - Ellipsoidal Shape */}
        <mesh position={[0.45, 0, 0]} scale={[0.85, 1, 1.3]}>
          <sphereGeometry args={[1.6, 64, 64]} />
          {brainMaterial}
        </mesh>

        {/* Brain Stem / Cerebellum hint */}
        <mesh position={[0, -1, -0.6]} scale={[0.6, 0.8, 0.6]}>
          <sphereGeometry args={[0.8, 32, 32]} />
          {brainMaterial}
        </mesh>
      </group>

      {/* Advanced Scanning HUD Overlay */}
      <group ref={scanBeam}>
        {/* Main Ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2.3, 2.4, 64]} />
          <meshBasicMaterial color="#06b6d4" transparent opacity={0.4} side={THREE.DoubleSide} />
        </mesh>

        {/* Inner Glow Disk */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[2.3, 64]} />
          <meshBasicMaterial color="#06b6d4" transparent opacity={0.05} side={THREE.DoubleSide} />
        </mesh>

        <pointLight color="#06b6d4" intensity={2} distance={5} />
      </group>

      {/* Static HUD Rings */}
      <group rotation={[Math.PI / 2, 0.2, 0]}>
        <mesh>
          <ringGeometry args={[2.8, 2.81, 128]} />
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.1} />
        </mesh>
      </group>
    </group>
  )
}

function SynapticParticles({ count = 1000 }) {
  const points = useMemo(() => {
    const p = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const radius = 2.2 + Math.random() * 0.5
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      p[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
      p[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      p[i * 3 + 2] = radius * Math.cos(phi)
    }
    return p
  }, [count])

  const mesh = useRef<THREE.Points>(null!)
  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (mesh.current) {
      mesh.current.rotation.y = t * 0.05
      mesh.current.rotation.x = t * 0.02
    }
  })

  return (
    <Points ref={mesh} positions={points} stride={3}>
      <PointMaterial
        transparent
        color="#06b6d4"
        size={0.02}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  )
}

function HUDOverlay() {
  const [text, setText] = useState("SCANNING_SYSTEM_READY")

  useEffect(() => {
    const lines = [
      "SCANNING_SYSTEM_READY",
      "NEURAL_EMBEDDING_INIT",
      "VOXEL_RECONSTRUCTION: 88%",
      "ANOMALY_SEARCH_ACTIVE",
      "SYNCING_WITH_MED_TAX_LIL"
    ]
    let i = 0
    const interval = setInterval(() => {
      setText(lines[i % lines.length])
      i++
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <group position={[0, -3.8, 0]}>
      <Text
        fontSize={0.12}
        color="#3b82f6"
        anchorX="center"
        anchorY="middle"
        maxWidth={4}
        textAlign="center"
      >
        {`[ SYSTEM_STATUS ]\n${text}\nLOAD_AVG: 0.24ms`}
      </Text>
    </group>
  )
}

export default function BrainViewer3D({ className, autoRotate = true }: { className?: string, autoRotate?: boolean }) {
  return (
    <div className={className}>
      <Canvas dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
        <PerspectiveCamera makeDefault position={[0, 0, 7.5]} fov={35} />

        {/* Cinematic Clinical Lighting */}
        <ambientLight intensity={0.5} />
        <spotLight position={[5, 5, 10]} angle={0.25} penumbra={1} intensity={3} color="#ffffff" />
        <pointLight position={[-10, 5, -5]} intensity={2} color="#ffffff" />
        <pointLight position={[10, -5, 5]} intensity={1.5} color="#ffffff" />
        <directionalLight position={[0, -5, 5]} intensity={1} color="#ffffff" />

        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <group>
            <BrainModel rotate={autoRotate} />
            <SynapticParticles />
            <HUDOverlay />
          </group>
        </Float>

        <OrbitControls
          enableZoom={false}
          maxPolarAngle={Math.PI / 1.5}
          minPolarAngle={Math.PI / 3}
          makeDefault
        />
        <Environment preset="city" />
      </Canvas>
    </div>
  )
}
