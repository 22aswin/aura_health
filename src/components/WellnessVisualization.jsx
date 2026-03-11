import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Float, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

function WellnessModel({ modelUrl }) {
  const meshRef = useRef();
  const [model, setModel] = useState(null);

  useEffect(() => {
    // Create a placeholder geometry since we don't have an actual model
    // In production, you would load a .glb/.gltf file here
    const geometry = new THREE.IcosahedronGeometry(2, 1);
    const material = new THREE.MeshPhongMaterial({
      color: 0x5EEAD4,
      emissive: 0x5EEAD4,
      emissiveIntensity: 0.2,
      shininess: 100,
      opacity: 0.8,
      transparent: true
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    setModel(mesh);
  }, []);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });

  if (!model) return null;

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <primitive 
        ref={meshRef} 
        object={model} 
        scale={[1.5, 1.5, 1.5]}
        position={[0, 0, 0]}
      />
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
        <WellnessModel />
        
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
