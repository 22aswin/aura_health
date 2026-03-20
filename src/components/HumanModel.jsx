import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls } from '@react-three/drei';

function ModelRenderer({ moodScore }) {
  const meshRef = useRef();
  // Expects a user-provided human.glb in the public/models directory
  const { scene } = useGLTF('/models/human.glb');

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002; // Very subtle, realistic slow rotation
    }
  });

  // Calm, realistic mood lighting based on instructions
  let moodColor = '#ffffff'; // Medium -> neutral white
  if (moodScore === 'High') moodColor = '#86efac'; // soft green
  if (moodScore === 'Low') moodColor = '#fca5a5'; // soft red

  return (
    <group ref={meshRef}>
      <primitive
        object={scene}
        position={[0, -2.5, 0]} // Centering adjustment for standard humanoid models
        scale={[1.5, 1.5, 1.5]}
      />
      {/* Subtle mood light cast dynamically onto the model */}
      <pointLight position={[0, 2, 4]} intensity={2.5} distance={10} color={moodColor} />
    </group>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="red" wireframe />
        </mesh>
      );
    }
    return this.props.children;
  }
}

const HumanModel = ({ moodScore = 'High' }) => {
  return (
    <div className="w-full h-full min-h-[400px] relative rounded-2xl overflow-hidden glass-card border border-glass-border bg-slate-900/30 shadow-2xl">
      <Canvas camera={{ position: [0, 0, 7], fov: 40 }}>
        <ambientLight intensity={0.6} color="#ffffff" />
        <directionalLight position={[5, 10, 5]} intensity={1.2} />
        
        <ErrorBoundary>
          <Suspense fallback={
              <mesh>
                 <boxGeometry />
                 <meshStandardMaterial wireframe />
              </mesh>
          }>
            <ModelRenderer moodScore={moodScore} />
          </Suspense>
        </ErrorBoundary>
        
        <OrbitControls 
          enableZoom={true} 
          enablePan={false}
          maxPolarAngle={Math.PI / 2 + 0.1}
          minPolarAngle={Math.PI / 3}
          target={[0, -0.5, 0]}
        />
      </Canvas>

      <div className="absolute top-4 left-4 z-10 glass-card px-4 py-2 rounded-xl border border-glass-border">
         <span className="text-white/80 text-sm font-medium flex items-center gap-2">
            Wellness Status
            <div className={`w-2 h-2 rounded-full ${
                moodScore === 'High' ? 'bg-green-400' :
                moodScore === 'Medium' ? 'bg-white' : 'bg-red-400'
            } animate-pulse shadow-glow`} />
         </span>
      </div>
    </div>
  );
};

export default HumanModel;
