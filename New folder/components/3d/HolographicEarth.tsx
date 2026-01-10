import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Sparkles, useTexture, Html, Trail } from '@react-three/drei';
import * as THREE from 'three';

// Coordinate mapping helper
const latLonToVector3 = (lat: number, lon: number, radius: number) => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = (radius * Math.sin(phi) * Math.sin(theta));
  const y = (radius * Math.cos(phi));
  return new THREE.Vector3(x, y, z);
};

const locations = [
  { name: "New York", lat: 40.7128, lon: -74.0060 },
  { name: "London", lat: 51.5074, lon: -0.1278 },
  { name: "Tokyo", lat: 35.6762, lon: 139.6503 },
  { name: "Sydney", lat: -33.8688, lon: 151.2093 },
  { name: "São Paulo", lat: -23.5505, lon: -46.6333 },
  { name: "Cairo", lat: 30.0444, lon: 31.2357 },
  { name: "Mumbai", lat: 19.0760, lon: 72.8777 },
  { name: "Kathmandu", lat: 27.7172, lon: 85.3240 },
  { name: "Moscow", lat: 55.7558, lon: 37.6173 },
  { name: "Cape Town", lat: -33.9249, lon: 18.4241 },
  { name: "Singapore", lat: 1.3521, lon: 103.8198 },
  { name: "San Francisco", lat: 37.7749, lon: -122.4194 },
  { name: "Paris", lat: 48.8566, lon: 2.3522 }
];

interface LocationMarkerProps {
  position: THREE.Vector3;
  name: string;
  occludeRef: React.RefObject<THREE.Object3D>;
}

const LocationMarker: React.FC<LocationMarkerProps> = ({ position, name, occludeRef }) => {
  const [hidden, setHidden] = useState(false);

  return (
    <group position={position}>
      {/* Small dot on the surface */}
      <mesh>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshBasicMaterial color={name === "Kathmandu" ? "#f472b6" : "#22d3ee"} toneMapped={false} />
      </mesh>
      
      {/* HTML Label with occlusion logic */}
      <Html
        distanceFactor={10}
        occlude={[occludeRef]}
        onOcclude={setHidden}
        style={{
          transition: 'all 0.2s',
          opacity: hidden ? 0 : 1,
          transform: `scale(${hidden ? 0.5 : 1})`,
          pointerEvents: 'none'
        }}
      >
        <div className="flex items-center gap-2 select-none">
          <div className={`h-[1px] w-4 ${name === "Kathmandu" ? "bg-pink-400/50" : "bg-cyan-400/50"}`}></div>
          <div className={`px-2 py-1 rounded-md bg-black/60 border backdrop-blur-md shadow-[0_0_10px_rgba(0,0,0,0.5)] ${name === "Kathmandu" ? "border-pink-500/30" : "border-cyan-500/30"}`}>
            <span className={`text-xs font-bold whitespace-nowrap ${name === "Kathmandu" ? "text-pink-100" : "text-cyan-100"}`}>{name}</span>
          </div>
        </div>
      </Html>
    </group>
  );
};

// Component to visualize the sensor swath
const ScanBeam = ({ height, color }: { height: number, color: string }) => {
  const beamRef = useRef<THREE.Mesh>(null);
  const scanLineRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const reticleRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    
    // Beam Pulse (Normal Speed)
    if (beamRef.current) {
        (beamRef.current.material as THREE.MeshBasicMaterial).opacity = 0.1 + Math.sin(t * 10) * 0.05;
    }
    
    // Emitter Glow Pulse (Normal Speed)
    if (glowRef.current) {
         glowRef.current.scale.setScalar(1 + Math.sin(t * 10) * 0.2);
    }
    
    // Reticle Rotation (Normal Speed)
    if (reticleRef.current) {
        reticleRef.current.rotation.z = -t * 0.5;
    }

    // Moving Scan Pulse (Ring) (Normal Speed)
    if (scanLineRef.current) {
      const loopTime = 2; 
      const progress = (t % loopTime) / loopTime; 
      
      // Position: 0 to -height
      scanLineRef.current.position.x = -progress * height;
      
      // Scale based on cone geometry (Radius 0 to 0.6)
      const currentRadius = 0.6 * progress;
      scanLineRef.current.scale.setScalar(Math.max(0.01, currentRadius));
      
      // Opacity fade
      let opacity = 1.0;
      if (progress < 0.1) opacity = progress * 10;
      if (progress > 0.8) opacity = (1 - progress) * 5;
      
      (scanLineRef.current.material as THREE.MeshBasicMaterial).opacity = opacity;
    }
  });

  return (
    <group>
       {/* Beam Cone: Point at Sat (0,0,0), Base at Earth (-height, 0, 0) */}
       <mesh ref={beamRef} position={[-height/2, 0, 0]} rotation={[0, 0, Math.PI/2]}>
         <cylinderGeometry args={[0.6, 0, height, 32, 1, true]} />
         <meshBasicMaterial 
            color={color} 
            transparent 
            opacity={0.15} 
            side={THREE.DoubleSide} 
            blending={THREE.AdditiveBlending} 
            depthWrite={false}
         />
       </mesh>
       
       {/* Moving Scan Pulse (Ring) */}
       <mesh ref={scanLineRef} rotation={[0, Math.PI/2, 0]}>
          <ringGeometry args={[0.8, 1, 32]} /> 
          <meshBasicMaterial color="white" transparent opacity={0.8} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} depthWrite={false} />
       </mesh>

       {/* Footprint Area (Circle on ground) */}
       <group position={[-height, 0, 0]} rotation={[0, Math.PI/2, 0]}>
           {/* Filled faint circle area */}
           <mesh>
             <circleGeometry args={[0.6, 32]} />
             <meshBasicMaterial color={color} transparent opacity={0.2} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
           </mesh>
           
           {/* Rotating Reticle Elements */}
           <group ref={reticleRef}>
                <mesh>
                    <ringGeometry args={[0.58, 0.6, 32]} />
                    <meshBasicMaterial color="white" transparent opacity={0.5} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} depthWrite={false}/>
                </mesh>
                <mesh>
                    <planeGeometry args={[1.2, 0.02]} />
                    <meshBasicMaterial color={color} transparent opacity={0.4} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} depthWrite={false} />
                </mesh>
                <mesh rotation={[0, 0, Math.PI/2]}>
                    <planeGeometry args={[1.2, 0.02]} />
                    <meshBasicMaterial color={color} transparent opacity={0.4} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} depthWrite={false} />
                </mesh>
           </group>
       </group>
       
       {/* Emitter Point */}
       <mesh ref={glowRef} position={[0,0,0]}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshBasicMaterial color={color} transparent opacity={0.9} blending={THREE.AdditiveBlending} />
       </mesh>
    </group>
  );
}

// Data Link Connection Component
const DataLink = ({ 
  satelliteRef, 
  earthRef, 
  kathmanduPos,
}: {
  satelliteRef: React.RefObject<THREE.Group>;
  earthRef: React.RefObject<THREE.Group>;
  kathmanduPos: THREE.Vector3;
}) => {
  const downlinkRef = useRef<THREE.Mesh>(null);
  const uplinkRef = useRef<THREE.Mesh>(null);
  const [isVisible, setIsVisible] = useState(false);
  
  // Create animated texture for data flow
  const flowTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        // Create dashed pattern
        ctx.fillStyle = '#000000'; // transparent base
        ctx.fillRect(0, 0, 64, 512);
        
        // Draw dashes with gradient for speed effect
        for(let i=0; i<16; i++) {
            const y = (i / 16) * 512;
            const height = 24;
            const grad = ctx.createLinearGradient(0, y, 0, y+height);
            grad.addColorStop(0, 'rgba(255,255,255,0)');
            grad.addColorStop(0.5, 'rgba(255,255,255,1)');
            grad.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, y, 64, height);
        }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    return tex;
  }, []);

  useFrame((state, delta) => {
    if (!satelliteRef.current || !earthRef.current) return;
    
    const parentGroup = satelliteRef.current.parent;
    if(!parentGroup) return;

    // 1. Calculate World Positions
    const earthWorldPos = new THREE.Vector3();
    earthRef.current.getWorldPosition(earthWorldPos);

    const satWorldPos = new THREE.Vector3();
    satelliteRef.current.getWorldPosition(satWorldPos);

    // Kathmandu World Pos (Apply Earth's Rotation)
    const kWorld = kathmanduPos.clone().applyMatrix4(earthRef.current.matrixWorld);

    // 2. Line of Sight Check
    // Calculate Normal at Kathmandu surface (Approx direction from center to K)
    const normalAtK = kWorld.clone().sub(earthWorldPos).normalize();
    // Vector from K to Satellite
    const vecKtoSat = satWorldPos.clone().sub(kWorld);
    
    // Dot product: if > 0, satellite is "above" the horizon plane of Kathmandu
    // 0.05 allows for just a bit of horizon grazing before cut off
    const visible = vecKtoSat.normalize().dot(normalAtK) > 0.05;
    
    setIsVisible(visible);

    if (visible) {
         const dist = satWorldPos.distanceTo(kWorld);
         const midPoint = satWorldPos.clone().add(kWorld).multiplyScalar(0.5);
         
         // 3. Coordinate Transformation
         // We must transform the midpoint from World Space to the Local Space of the Satellite's Parent Group.
         // This ensures the link is positioned correctly regardless of the satellite's specific local rotation.
         const localMid = parentGroup.worldToLocal(midPoint.clone());

         // Update textures (Normal Fast Speed)
         flowTexture.offset.y -= delta * 2.5; 
         
         // Pulsating effect (Normal Fast Speed)
         const pulse = 1 + Math.sin(state.clock.elapsedTime * 15) * 0.2;

         // 4. Update Meshes
         if (downlinkRef.current) {
             downlinkRef.current.position.copy(localMid);
             downlinkRef.current.lookAt(kWorld); // Look at target in World Space (Three.js handles this correctly)
             downlinkRef.current.rotateX(Math.PI / 2); // Align Cylinder Y-axis to LookAt Z-axis
             downlinkRef.current.scale.set(1.2 * pulse, dist, 1.2 * pulse);
             (downlinkRef.current.material as THREE.MeshBasicMaterial).opacity = 0.9;
         }

         if (uplinkRef.current) {
             uplinkRef.current.position.copy(localMid);
             uplinkRef.current.lookAt(kWorld);
             uplinkRef.current.rotateX(Math.PI / 2);
             uplinkRef.current.scale.set(2.5, dist, 2.5); // Wider outer shell
             (uplinkRef.current.material as THREE.MeshBasicMaterial).opacity = 0.25 * pulse;
         }
    }
  });

  if (!isVisible) return null;

  return (
    <group>
        {/* Inner High-Energy Beam (Downlink) */}
        <mesh ref={downlinkRef}>
            <cylinderGeometry args={[0.02, 0.02, 1, 8, 1, true]} />
            <meshBasicMaterial 
                color="#00ffff" 
                alphaMap={flowTexture} 
                transparent 
                blending={THREE.AdditiveBlending} 
                depthWrite={false}
                side={THREE.DoubleSide}
            />
        </mesh>
        
        {/* Outer Data Shell (Uplink) */}
        <mesh ref={uplinkRef}>
            <cylinderGeometry args={[0.05, 0.05, 1, 16, 1, true]} />
            <meshBasicMaterial 
                color="#f472b6" 
                alphaMap={flowTexture} 
                transparent 
                opacity={0.3}
                blending={THREE.AdditiveBlending} 
                depthWrite={false}
                side={THREE.DoubleSide}
            />
        </mesh>
    </group>
  )
}

interface SatelliteProps { 
  radius: number; 
  speed: number; 
  inclination: [number, number, number]; 
  color: string;
  startAngle: number;
  withTrail?: boolean;
  isSelected: boolean;
  onSelect: () => void;
  earthRef: React.RefObject<THREE.Group>;
  kathmanduPos: THREE.Vector3;
}

// Updated Satellite Component
const Satellite: React.FC<SatelliteProps> = ({ 
  radius, 
  speed, 
  inclination, 
  color, 
  startAngle,
  withTrail = false,
  isSelected,
  onSelect,
  earthRef,
  kathmanduPos
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const probeRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    // 1. Orbit Animation
    if (groupRef.current) {
      groupRef.current.rotation.y += speed * delta;
    }

    // 2. Satellite Local Rotation (Stabilize if selected)
    if (probeRef.current) {
        if (!isSelected) {
            probeRef.current.rotation.z += delta * 0.5;
            probeRef.current.rotation.x += delta * 0.2;
        } else {
            // Stabilize rotation to face earth properly
            probeRef.current.rotation.z = THREE.MathUtils.lerp(probeRef.current.rotation.z, 0, delta * 4);
            probeRef.current.rotation.x = THREE.MathUtils.lerp(probeRef.current.rotation.x, 0, delta * 4);
        }
    }
  });

  // Earth radius is 2.5
  const altitude = radius - 2.5;

  return (
    <group rotation={inclination}>
      
      {/* Orbit Path Visualization (Ring) */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[radius, 0.003, 16, 128]} />
          <meshBasicMaterial 
            color={isSelected ? "#ffffff" : color} 
            opacity={isSelected ? 0.4 : 0.15} 
            transparent 
            side={THREE.DoubleSide} 
          />
      </mesh>

      {/* The Moving Satellite Group */}
      <group ref={groupRef} rotation={[0, startAngle, 0]}>
        <group position={[radius, 0, 0]}>
          
          {/* Swath Beam (Only if selected) */}
          {isSelected && <ScanBeam height={altitude} color={color} />}

          {/* Data Link to Kathmandu (Only if selected) */}
          {isSelected && (
              <DataLink 
                satelliteRef={probeRef}
                earthRef={earthRef}
                kathmanduPos={kathmanduPos}
              />
          )}

          {/* High-Tech Probe Model */}
          <group 
            ref={probeRef} 
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            onPointerOver={() => { document.body.style.cursor = 'pointer' }}
            onPointerOut={() => { document.body.style.cursor = 'auto' }}
          >
              {/* Selection Halo */}
              {isSelected && (
                 <mesh>
                    <sphereGeometry args={[0.25, 16, 16]} />
                    <meshBasicMaterial color={color} transparent opacity={0.2} wireframe />
                 </mesh>
              )}

              {/* Core Body (Glowing Polyhedron) */}
              <mesh>
                  <icosahedronGeometry args={[0.08, 0]} />
                  <meshStandardMaterial 
                    color={isSelected ? "#ffffff" : color} 
                    emissive={color} 
                    emissiveIntensity={isSelected ? 3 : 2} 
                    toneMapped={false} 
                  />
              </mesh>
              
              {/* Solar Arrays (Thin Wide Panels) */}
              <mesh position={[0, 0, 0]}>
                  <boxGeometry args={[0.3, 0.01, 0.08]} />
                  <meshStandardMaterial 
                    color="#1a1a1a" 
                    roughness={0.3} 
                    metalness={0.8}
                  />
              </mesh>
          </group>

          {/* Optional Trail */}
          {withTrail && !isSelected && (
             <Trail
               width={2}
               length={8}
               color={new THREE.Color(color)}
               attenuation={(t) => t * t}
             >
                <mesh visible={false}>
                  <sphereGeometry args={[0.01]} />
                  <meshBasicMaterial />
                </mesh>
             </Trail>
          )}
        </group>
      </group>
    </group>
  );
};

// Realistic Procedural Cyclone Component
const Cyclone = ({ position }: { position: THREE.Vector3 }) => {
  const rotatorRef = useRef<THREE.Group>(null);

  // Procedural Photorealistic Cloud Texture Generation
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const cx = 256;
      const cy = 256;

      // 1. Draw helper: Cloud Puff (Soft radial gradient)
      const drawPuff = (x: number, y: number, r: number, op: number) => {
          const g = ctx.createRadialGradient(x, y, 0, x, y, r);
          g.addColorStop(0, `rgba(255, 255, 255, ${op})`);
          g.addColorStop(0.2, `rgba(240, 240, 255, ${op * 0.8})`);
          g.addColorStop(0.5, `rgba(255, 255, 255, ${op * 0.2})`);
          g.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
      }

      // 2. Clear canvas
      ctx.clearRect(0,0,512,512);

      // 3. Generate Spiral Arms
      const numParticles = 1200;
      const arms = 2; 
      
      for(let i=0; i<numParticles; i++) {
          const t = i / numParticles; 
          
          // Distance from center (Exponential spiral for tightness)
          const dist = 25 + Math.pow(t, 0.8) * 200; 
          
          // Angle
          const angle = t * 15; 
          const armIndex = i % arms;
          const armOffset = (Math.PI * 2 / arms) * armIndex;
          const finalAngle = angle + armOffset;

          // Turbulence/Spread
          const spread = 10 + (dist * 0.15);
          const x = cx + Math.cos(finalAngle) * dist + (Math.random() - 0.5) * spread;
          const y = cy + Math.sin(finalAngle) * dist + (Math.random() - 0.5) * spread;

          // Puff properties
          const size = 15 + Math.random() * 20 + (dist * 0.08); 
          const opacity = 0.05 + Math.random() * 0.1;

          drawPuff(x, y, size, opacity);
      }

      // 4. Dense Eye Wall
      for(let j=0; j<80; j++) {
          const a = (j/80) * Math.PI * 2;
          const d = 30 + Math.random() * 8; // Tight ring
          drawPuff(cx + Math.cos(a)*d, cy + Math.sin(a)*d, 18, 0.3);
      }

      // 5. Global Soft Mask to fade edges (prevent square plane look)
      ctx.globalCompositeOperation = 'destination-in';
      const mask = ctx.createRadialGradient(cx, cy, 0, cx, cy, 256);
      mask.addColorStop(0, 'rgba(0,0,0,1)');
      mask.addColorStop(0.6, 'rgba(0,0,0,1)');
      mask.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = mask;
      ctx.fillRect(0,0,512,512);

    }
    return new THREE.CanvasTexture(canvas);
  }, []);

  useFrame((state, delta) => {
    if (rotatorRef.current) {
        // Slow majestic rotation
        rotatorRef.current.rotation.z += delta * 0.5; 
    }
  });

  return (
    <group position={position} lookAt={new THREE.Vector3(0,0,0)}>
       {/* Rotator Group */}
       <group ref={rotatorRef}>
           
           {/* Layer 1: Base Dense Clouds */}
           {/* Position z is negative to move AWAY from center (because lookAt makes +Z point to center) */}
           <mesh position={[0,0, -0.01]}>
              <planeGeometry args={[0.8, 0.8]} />
              <meshStandardMaterial 
                map={texture} 
                transparent 
                opacity={0.95} 
                side={THREE.DoubleSide}
                depthWrite={false}
              />
           </mesh>

           {/* Layer 2: Upper Atmospheric Volume */}
           <mesh position={[0,0, -0.04]} rotation={[0,0,0.5]} scale={1.1}>
              <planeGeometry args={[0.8, 0.8]} />
              <meshStandardMaterial 
                map={texture} 
                transparent 
                opacity={0.4} 
                side={THREE.DoubleSide}
                depthWrite={false}
                blending={THREE.AdditiveBlending} 
              />
           </mesh>
       </group>
    </group>
  );
};

interface HolographicEarthProps {
  showSatellites: boolean;
  onSatelliteSelect?: (selected: boolean) => void;
}

const HolographicEarth: React.FC<HolographicEarthProps> = ({ showSatellites, onSatelliteSelect }) => {
  const earthRef = useRef<THREE.Group>(null);
  const earthMeshRef = useRef<THREE.Mesh>(null);
  const atmosphereMeshRef = useRef<THREE.Mesh>(null);
  const moonGroupRef = useRef<THREE.Group>(null);
  const moonRef = useRef<THREE.Mesh>(null);
  
  const [hovered, setHover] = useState(false);
  const [selectedSatIndex, setSelectedSatIndex] = useState<number | null>(null);
  
  // Propagate selection state change to parent (Experience) to toggle controls
  useEffect(() => {
    if (onSatelliteSelect) {
      onSatelliteSelect(selectedSatIndex !== null);
    }
  }, [selectedSatIndex, onSatelliteSelect]);

  // Load high-quality textures for Earth, Moon, and Cloud Atmosphere
  const [earthMap, earthNormal, earthSpecular, moonMap, cloudsMap] = useTexture([
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg',
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg',
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg',
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/moon_1024.jpg',
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png'
  ]);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    
    // Rotate Earth on its axis (5x slower than previous 0.01 -> 0.002)
    if (earthRef.current) {
      earthRef.current.rotation.y = t * 0.002;
    }

    // Orbit Moon around Earth (5x slower than previous 0.004 -> 0.0008)
    if (moonGroupRef.current) {
      moonGroupRef.current.rotation.y = t * 0.0008;
    }
    
    // Rotate Moon on its axis (5x slower than previous 0.02 -> 0.004)
    if (moonRef.current) {
      moonRef.current.rotation.y = t * 0.004;
    }

    // Animate Atmosphere/Clouds Opacity and Rotation on Hover
    if (atmosphereMeshRef.current) {
      const material = atmosphereMeshRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = THREE.MathUtils.lerp(
        material.opacity,
        hovered ? 0.6 : 0,
        delta * 3
      );
      
      atmosphereMeshRef.current.rotation.y += delta * 0.03;
    }
  });

  // Generate random satellites
  const satellites = useMemo(() => {
    return Array.from({ length: 40 }).map((_, i) => ({
      radius: 3.2 + Math.random() * 1.5,
      // Speed: Previous was / 5. Now / 25 to be 5x slower than current.
      speed: (0.1 + Math.random() * 0.2) / 25, 
      inclination: [Math.random() * Math.PI, 0, Math.random() * Math.PI] as [number, number, number],
      color: i % 5 === 0 ? '#f472b6' : '#22d3ee', // Pink and Cyan mix
      startAngle: Math.random() * Math.PI * 2,
      withTrail: i % 3 === 0 // 33% have trails
    }));
  }, []);

  const radius = 2.5;

  // Calculate Kathmandu position vector once (Local Space)
  // Kathmandu coords: 27.7172, 85.3240
  const kathmanduPos = useMemo(() => latLonToVector3(27.7172, 85.3240, radius), [radius]);

  return (
    <group scale={1}>
      {/* Earth Group */}
      <group ref={earthRef}>
        
        {/* Base Earth Mesh */}
        <mesh 
          ref={earthMeshRef} 
          scale={radius}
          onPointerOver={() => setHover(true)}
          onPointerOut={() => setHover(false)}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedSatIndex(null); // Deselect on earth click
          }}
        >
          <sphereGeometry args={[1, 64, 64]} />
          <meshPhongMaterial 
            map={earthMap}
            normalMap={earthNormal}
            specularMap={earthSpecular}
            shininess={10}
            specular={new THREE.Color(0x333333)}
          />
        </mesh>
        
        {/* Active Cyclone in Indian Ocean (Lat: -20, Lon: 75) */}
        {/* Placed at higher altitude (radius + 0.12) to ensure it sits clearly above the water/atmosphere */}
        <Cyclone position={latLonToVector3(-20, 75, radius + 0.12)} />

        {/* Glowing Atmosphere/Cloud Layer */}
        <mesh ref={atmosphereMeshRef} scale={radius * 1.005}>
          <sphereGeometry args={[1, 64, 64]} />
          <meshBasicMaterial 
            map={cloudsMap} 
            transparent={true} 
            opacity={0} 
            side={THREE.FrontSide}
            blending={THREE.AdditiveBlending}
            color="#22d3ee" // Cyan tint
            depthWrite={false}
          />
        </mesh>
        
        {/* Markers */}
        {locations.map((loc, i) => (
           <LocationMarker 
             key={i} 
             position={latLonToVector3(loc.lat, loc.lon, radius)} 
             name={loc.name}
             occludeRef={earthMeshRef}
           />
        ))}

        {/* Outer Atmosphere Glow */}
        <mesh scale={radius * 1.06}>
          <sphereGeometry args={[1, 64, 64]} />
          <MeshDistortMaterial
            color="#6366f1" // Soft Indigo
            transparent
            opacity={0.15}
            distort={0.1}
            speed={2}
            roughness={0.5}
            side={THREE.BackSide}
          />
        </mesh>
      </group>

      {/* Satellite System */}
      {showSatellites && satellites.map((sat, i) => {
        // If a satellite is selected, hide all others to reduce messiness
        if (selectedSatIndex !== null && selectedSatIndex !== i) return null;

        return (
          <Satellite 
            key={i}
            radius={sat.radius}
            speed={sat.speed}
            inclination={sat.inclination}
            color={sat.color}
            startAngle={sat.startAngle}
            withTrail={sat.withTrail}
            isSelected={selectedSatIndex === i}
            onSelect={() => setSelectedSatIndex(i)}
            earthRef={earthRef}
            kathmanduPos={kathmanduPos}
          />
        );
      })}

      {/* Moon Orbit System */}
      <group ref={moonGroupRef} rotation={[0.4, 0, 0]}>
        <mesh ref={moonRef} position={[6, 0, 0]} scale={0.7}> 
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial 
            map={moonMap} 
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>
      </group>

      {/* Background Starfield */}
      <Sparkles 
        count={400} 
        scale={20} 
        size={2} 
        speed={0.1} 
        opacity={0.6} 
        color="#ffffff"
      />
    </group>
  );
};

export default HolographicEarth;