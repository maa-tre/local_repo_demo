import React, { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, PerspectiveCamera, ContactShadows, OrbitControls } from '@react-three/drei';
import { useScroll, MotionValue } from 'framer-motion';
import * as THREE from 'three';
import FloatingShape from './FloatingShape';
import HolographicEarth from './HolographicEarth';

// Camera Controller handles Scroll movement vs Earth "Get Started" mode
const CameraController = ({ 
  scrollYProgress, 
  isStarted,
  isTracking
}: { 
  scrollYProgress: MotionValue<number>, 
  isStarted: boolean,
  isTracking: boolean
}) => {
  const vec = new THREE.Vector3();

  useFrame((state) => {
    // If tracking a satellite, disable this controller's logic entirely to allow manual inspection
    if (isTracking) return;

    // If we haven't started, allow scroll to control Y position
    if (!isStarted) {
      const progress = scrollYProgress.get();
      const targetY = -progress * 5;
      state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, targetY, 0.05);
      
      // Look slightly down at the object
      state.camera.lookAt(0, targetY, 0);
    } else {
      // If started, move camera to center for the Earth view
      // We check distance to avoid fighting OrbitControls too much once settled
      if (state.camera.position.distanceTo(new THREE.Vector3(0,0,0)) > 12) {
         state.camera.position.lerp(vec.set(0, 0, 10), 0.04);
      }
    }
  });
  return null;
}

// Realistic Distant Sun Component
const Sun = () => {
  return (
    <group position={[50, 20, 50]}>
       {/* Distant Star Point */}
      <mesh>
        <sphereGeometry args={[2, 16, 16]} />
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </mesh>
      
      {/* Glare / Lens Flare Simulation using Sprite for auto-facing camera */}
      <SpriteGlow />
    </group>
  )
}

const SpriteGlow = () => {
  const spriteRef = useRef<THREE.Sprite>(null);
  
  // Create a simple radial gradient texture programmatically
  const texture = React.useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const context = canvas.getContext('2d');
    if(context) {
        const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, 'rgba(255, 240, 200, 1)');
        gradient.addColorStop(0.2, 'rgba(255, 220, 180, 0.4)');
        gradient.addColorStop(0.5, 'rgba(255, 200, 150, 0.1)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        context.fillStyle = gradient;
        context.fillRect(0, 0, 64, 64);
    }
    return new THREE.CanvasTexture(canvas);
  }, []);

  return (
    <sprite ref={spriteRef} scale={[60, 60, 1]}>
      <spriteMaterial map={texture} blending={THREE.AdditiveBlending} depthWrite={false} transparent opacity={0.8} />
    </sprite>
  );
}

// Handles the transition animation between the Shape and the Earth using Spring Physics
const SceneContent = ({ 
  isStarted, 
  showSatellites,
  onSatelliteSelect
}: { 
  isStarted: boolean, 
  showSatellites: boolean,
  onSatelliteSelect: (selected: boolean) => void
}) => {
  const shapeGroup = useRef<THREE.Group>(null);
  const earthGroup = useRef<THREE.Group>(null);
  
  // Physics state for the transition
  const spring = useRef({ scale: 0, velocity: 0 });

  useFrame((state, delta) => {
    // 1. Handle Shape opacity/scale out
    if (shapeGroup.current) {
      const targetShapeScale = isStarted ? 0 : 1;
      shapeGroup.current.scale.lerp(new THREE.Vector3(targetShapeScale, targetShapeScale, targetShapeScale), delta * 4);
      
      if (!isStarted) {
        shapeGroup.current.rotation.y += delta * 0.2;
      }
    }

    // 2. Handle Earth scale in
    if (earthGroup.current) {
      const targetScale = isStarted ? 1 : 0;
      const stiffness = 120;
      const damping = 14;
      const force = (targetScale - spring.current.scale) * stiffness;
      const acceleration = force - spring.current.velocity * damping;
      
      spring.current.velocity += acceleration * delta;
      spring.current.scale += spring.current.velocity * delta;

      const s = Math.max(0, spring.current.scale);
      earthGroup.current.scale.set(s, s, s);
    }
  });

  return (
    <>
      <group ref={shapeGroup}>
        <FloatingShape />
      </group>
      <group ref={earthGroup} scale={[0,0,0]}>
        <HolographicEarth 
          showSatellites={showSatellites} 
          onSatelliteSelect={onSatelliteSelect}
        />
      </group>
    </>
  );
};

interface ExperienceProps {
  isStarted: boolean;
  showSatellites: boolean;
}

const Experience: React.FC<ExperienceProps> = ({ isStarted, showSatellites }) => {
  const { scrollYProgress } = useScroll();
  const [isTracking, setIsTracking] = useState(false);

  return (
    <div className="fixed inset-0 z-0 w-full h-full">
      <Canvas dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
        <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={45} />
        
        <CameraController 
          scrollYProgress={scrollYProgress} 
          isStarted={isStarted} 
          isTracking={isTracking}
        />

        {/* 
           OrbitControls allow manual control.
           Auto-rotate pauses when a satellite is selected so users can inspect it easily.
        */}
        {isStarted && (
           <OrbitControls 
             enabled={true} 
             enableZoom={true} 
             enablePan={true} 
             enableDamping={true}
             dampingFactor={0.05}
             minDistance={3}
             maxDistance={50} 
             autoRotate={false}
             autoRotateSpeed={0.5}
           />
        )}

        {/* Dynamic Lighting System */}
        <ambientLight intensity={isStarted ? 0.1 : 0.5} /> 
        
        {!isStarted && (
          <>
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={100} color="#00ffff" />
            <spotLight position={[-10, -10, -10]} angle={0.15} penumbra={1} intensity={100} color="#ff00ff" />
          </>
        )}

        {/* Distant Sun Light */}
        {isStarted && (
          <>
             <directionalLight position={[50, 20, 50]} intensity={3.5} color="#ffffff" castShadow />
             <Sun />
          </>
        )}
        
        <pointLight position={[0, 0, 5]} intensity={isStarted ? 0 : 20} color="white" />
        
        <Suspense fallback={null}>
          <SceneContent 
            isStarted={isStarted} 
            showSatellites={showSatellites} 
            onSatelliteSelect={setIsTracking}
          />
          <Environment preset={isStarted ? "night" : "city"} />
        </Suspense>
        
        {!isStarted && (
          <ContactShadows 
              position={[0, -4, 0]} 
              opacity={0.5} 
              scale={20} 
              blur={2} 
              far={4.5} 
              color="#000000"
          />
        )}
      </Canvas>
      
      {/* Vignette Overlay */}
      <div className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 ${isStarted ? 'opacity-0' : 'opacity-60'}`} 
           style={{ background: 'radial-gradient(circle at 50% 50%, transparent 0%, transparent 60%, rgba(0,0,0,0.8) 100%)' }}>
      </div>
    </div>
  );
};

export default Experience;