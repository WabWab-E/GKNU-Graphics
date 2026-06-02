import React from 'react';
import { Environment, Edges } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { globalTimeRef } from '../constants';

export default function Terrarium() {
  const { scene } = useThree();

  useFrame(() => {
    // 시간에 따라 HDRI 환경의 빛 반사 강도 조절 (밤에는 환경광이 어두워짐)
    const s = Math.sin(globalTimeRef.current);
    const dayFactor = (s + 1) / 2;
    const intensity = 0.05 + dayFactor * 0.95;
    
    scene.environmentIntensity = intensity;
    scene.backgroundIntensity = intensity; 
  });

  return (
    <>
      <Environment files="sky.hdr" background />
      <mesh position={[0, 3.5, 0]}>
        <boxGeometry args={[20.2, 20.2, 20.2]} />
        <meshPhysicalMaterial 
          transmission={1} 
          thickness={0.5}  
          roughness={0.05} 
          ior={1.45}        
          clearcoat={1}    
          transparent 
          opacity={1}
          side={THREE.DoubleSide}
        />
        <Edges scale={1.0} threshold={15} color="#ffffff" opacity={0.4} transparent />
      </mesh>
    </>
  );
}