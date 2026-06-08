import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { globalTimeRef, clippingPlanes } from '../constants';

export default function OrbitalLights() {
  const sunLightRef = useRef();
  const moonLightRef = useRef();
  const sunMeshRef = useRef();
  const moonMeshRef = useRef();

  useFrame(() => {
    const time = globalTimeRef.current;
    const s = Math.sin(time);
    const radius = 11.5;
    const centerY = 0.5;

    {/* 공전 궤도 */}
    const sunX = Math.cos(time) * radius;
    const sunY = centerY + s * radius;
    const moonX = Math.cos(time + Math.PI) * radius;
    const moonY = centerY + Math.sin(time + Math.PI) * radius;

    {/* 빛 페이드 인/아웃 조절*/}
    if (sunLightRef.current) {
      sunLightRef.current.position.set(sunX, sunY, -1);
      sunLightRef.current.intensity = Math.max(0, s) * 2.5; 
    }
    if (moonLightRef.current) {
      moonLightRef.current.position.set(moonX, moonY, -1);
      moonLightRef.current.intensity = Math.max(0, -s) * 0.6;
    }
    if (sunMeshRef.current) sunMeshRef.current.position.set(sunX, sunY, -1);
    if (moonMeshRef.current) moonMeshRef.current.position.set(moonX, moonY, -1);
  });

  return (
    <>
      <directionalLight ref={sunLightRef} castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0005} color="#fff1e0" />
      <directionalLight ref={moonLightRef} castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.0005} color="#bbdefb" />
      
      <mesh ref={sunMeshRef}><sphereGeometry args={[0.9, 32, 32]} /><meshBasicMaterial color="#ff9800" clippingPlanes={clippingPlanes} /></mesh>
      <mesh ref={moonMeshRef}><sphereGeometry args={[0.6, 32, 32]} /><meshBasicMaterial color="#fffde7" clippingPlanes={clippingPlanes} /></mesh>
    </>
  );
}