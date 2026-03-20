import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, Float } from '@react-three/drei';

function AvatarModel({ moodLevel }) {
  const meshRef = useRef();
  // Load the GLB model (human 3D model instead of astronaut)
  const { scene } = useGLTF('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/gltf/Soldier.glb');

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
    }
  });

  // Dynamic mood lighting colors
  let glowColor = '#22c55e'; // High mood -> green
  if (moodLevel === 'medium') glowColor = '#eab308'; // Medium mood -> yellow
  if (moodLevel === 'low') glowColor = '#ef4444'; // Low mood -> red

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <primitive
        ref={meshRef}
        object={scene}
        position={[0, -1, 0]}
        scale={[1.5, 1.5, 1.5]}
      />
      {/* Mood-based lighting focusing on the model */}
      <pointLight position={[0, 0, 2]} distance={5} intensity={5} color={glowColor} />
    </Float>
  );
}

const WellnessAvatar = ({ moodLevel = 'high' }) => {
  return (
    <div className="w-full h-full relative">
      <Canvas camera={{ position: [0, 1.5, 4], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        
        <Suspense fallback={null}>
          <AvatarModel moodLevel={moodLevel} />
        </Suspense>
        
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          maxPolarAngle={Math.PI * 0.6}
          minPolarAngle={Math.PI * 0.3}
        />
      </Canvas>

      {/* Modern Overlay */}
      <div className="absolute top-4 left-4 glass-card p-3 rounded-xl border border-glass-border bg-slate-900/50 backdrop-blur-md text-left z-10">
        <h3 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
          Wellness Avatar
          <div className={`w-2 h-2 rounded-full ${
            moodLevel === 'high' ? 'bg-green-500' :
            moodLevel === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
          } animate-pulse`}></div>
        </h3>
        <p className="text-xs text-white/70">Reflecting your current state</p>
      </div>
    </div>
  );
};

export default WellnessAvatar;
