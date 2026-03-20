import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Float, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

function HumanoidModel() {
  const groupRef = useRef();

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
      groupRef.current.rotation.y += 0.005;
    }
  });

  const materialProps = {
    color: '#5EEAD4',
    emissive: '#5EEAD4',
    emissiveIntensity: 0.2,
    roughness: 0.2,
    metalness: 0.8,
    transparent: true,
    opacity: 0.85
  };

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <group ref={groupRef} scale={[0.8, 0.8, 0.8]} position={[0, -1, 0]}>
        {/* Head */}
        <mesh position={[0, 3.2, 0]}>
          <sphereGeometry args={[0.4, 32, 32]} />
          <meshStandardMaterial {...materialProps} />
        </mesh>
        
        {/* Neck */}
        <mesh position={[0, 2.6, 0]}>
          <cylinderGeometry args={[0.12, 0.15, 0.4]} />
          <meshStandardMaterial {...materialProps} />
        </mesh>

        {/* Torso */}
        <mesh position={[0, 1.4, 0]}>
          <capsuleGeometry args={[0.55, 1.6, 4, 16]} />
          <meshStandardMaterial {...materialProps} />
        </mesh>

        {/* Left Arm */}
        <mesh position={[-0.9, 1.6, 0]} rotation={[0, 0, 0.25]}>
          <capsuleGeometry args={[0.18, 1.4, 4, 16]} />
          <meshStandardMaterial {...materialProps} />
        </mesh>

        {/* Right Arm */}
        <mesh position={[0.9, 1.6, 0]} rotation={[0, 0, -0.25]}>
          <capsuleGeometry args={[0.18, 1.4, 4, 16]} />
          <meshStandardMaterial {...materialProps} />
        </mesh>

        {/* Left Leg */}
        <mesh position={[-0.25, -0.6, 0]}>
          <capsuleGeometry args={[0.22, 1.8, 4, 16]} />
          <meshStandardMaterial {...materialProps} />
        </mesh>

        {/* Right Leg */}
        <mesh position={[0.25, -0.6, 0]}>
          <capsuleGeometry args={[0.22, 1.8, 4, 16]} />
          <meshStandardMaterial {...materialProps} />
        </mesh>
      </group>
    </Float>
  );
}

function ParticleField() {
  const particlesRef = useRef();
  
  useEffect(() => {
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCnt = 500;
    const posArray = new Float32Array(particlesCnt * 3);

    for (let i = 0; i < particlesCnt * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 10;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.02,
      color: 0x7DD3FC,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    particlesRef.current = particlesMesh;
  }, []);

  useFrame(() => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y += 0.001;
      particlesRef.current.rotation.x += 0.0005;
    }
  });

  return particlesRef.current ? <primitive object={particlesRef.current} /> : null;
}

const WellnessVisualization = () => {
  return (
    <div className="w-full h-full relative">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 8]} />
        
        {/* Soft ambient lighting */}
        <ambientLight intensity={0.4} color="#C4B5FD" />
        <pointLight position={[10, 10, 10]} intensity={0.8} color="#5EEAD4" />
        <pointLight position={[-10, -10, -10]} intensity={0.6} color="#7DD3FC" />
        <spotLight
          position={[0, 10, 0]}
          angle={0.3}
          penumbra={1}
          intensity={0.5}
          color="#A5B4FC"
        />
        
        {/* Main wellness model */}
        <HumanoidModel />
        
        {/* Particle effects */}
        <ParticleField />
        
        {/* Subtle controls */}
        <OrbitControls 
          enableZoom={false}
          enablePan={false}
          maxPolarAngle={Math.PI * 0.8}
          minPolarAngle={Math.PI * 0.2}
          autoRotate
          autoRotateSpeed={0.5}
        />
        
        {/* Environment for reflections */}
        <Environment preset="sunset" />
      </Canvas>
      
      {/* Overlay text */}
      <div className="absolute top-4 left-4 glass-card p-3">
        <h3 className="text-sm font-semibold text-calm-teal mb-1">Wellness Twin</h3>
        <p className="text-xs text-white/70">Your holistic health visualization</p>
      </div>
    </div>
  );
};

export default WellnessVisualization;
