import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export default function Windmill({ position, globalSpeed }) {
  const bladesRef = useRef();

  useFrame((state, delta) => {
    if (bladesRef.current) bladesRef.current.rotation.z += delta * 1.5 * globalSpeed;
  });

  return (
    <group position={position}>
      <mesh position={[0, -1.3, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.1, 1.2, 0.4, 16]} />
        <meshStandardMaterial color="#555555" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.55, 1.0, 2.4, 16]} />
        <meshStandardMaterial color="#eaeaea" roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.5, 0]} castShadow>
        <coneGeometry args={[0.65, 0.6, 16]} />
        <meshStandardMaterial color="#b22222" roughness={0.5} />
      </mesh>
      <mesh position={[0, -1.25, -0.98]} rotation={[0.18, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.4, 0.7, 0.4]} />
        <meshStandardMaterial color="#5c4033" roughness={0.8} />
      </mesh>
      <group position={[0, 1.25, 0.65]} rotation={[-0.18, 0, 0]}>
        <group ref={bladesRef}>
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.12, 0.15, 0.2, 12]} />
            <meshStandardMaterial color="#333333" />
          </mesh>
          {[0, 1, 2, 3].map((i) => (
            <group key={i} rotation={[0, 0, (i * Math.PI) / 2]}>
              <mesh position={[0, 0.9, 0]} castShadow>
                <boxGeometry args={[0.04, 1.8, 0.04]} />
                <meshStandardMaterial color="#8b5a2b" roughness={0.9} />
              </mesh>
              <mesh position={[0.14, 1.0, 0.02]} rotation={[0, 0.1, 0]} castShadow>
                <boxGeometry args={[0.24, 1.3, 0.01]} />
                <meshStandardMaterial color="#f5f5dc" roughness={0.8} />
              </mesh>
            </group>
          ))}
        </group>
      </group>
    </group>
  );
}