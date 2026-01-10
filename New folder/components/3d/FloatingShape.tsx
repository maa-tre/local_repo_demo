import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Float, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

const FloatingShape: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  // Use any for materialRef to avoid type incompatibility with MeshDistortMaterial implementation
  const materialRef = useRef<any>(null);

  useFrame((state) => {
    if (meshRef.current) {
      // Rotate the mesh slowly
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
      
      // Mouse interaction parallax
      const { x, y } = state.mouse;
      meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, x * 1.5, 0.1);
      meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, y * 1.5, 0.1);
    }
  });

  return (
    <>
      <Float
        speed={4} 
        rotationIntensity={1} 
        floatIntensity={2} 
        floatingRange={[-0.2, 0.2]}
      >
        <mesh ref={meshRef} position={[0, 0, 0]} scale={2.5}>
          <torusKnotGeometry args={[1, 0.3, 128, 16]} />
          <MeshDistortMaterial
            ref={materialRef}
            color="#3b0764" // Deep purple
            emissive="#581c87"
            emissiveIntensity={0.5}
            roughness={0.1}
            metalness={0.9}
            distort={0.4}
            speed={2}
            clearcoat={1}
            clearcoatRoughness={0.1}
          />
        </mesh>
      </Float>
      
      <Sparkles 
        count={200} 
        scale={12} 
        size={4} 
        speed={0.4} 
        opacity={0.5} 
        color="#22d3ee" // Cyan particles
      />
      <Sparkles 
        count={100} 
        scale={10} 
        size={6} 
        speed={0.2} 
        opacity={0.3} 
        color="#e879f9" // Pink particles
      />
    </>
  );
};

export default FloatingShape;