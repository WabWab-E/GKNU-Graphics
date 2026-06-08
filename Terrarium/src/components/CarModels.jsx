import React from 'react';

// 1. 세단 모델
export function Sedan({ material }) {
  return (
    <group name="sedan-mesh">
      <mesh material={material} castShadow position={[0, 0.3, 0]}><boxGeometry args={[1.5, 0.3, 0.8]} /></mesh>
      <mesh material={material} castShadow position={[-0.1, 0.6, 0]}><boxGeometry args={[0.8, 0.3, 0.72]} /></mesh>
    </group>
  );
}

// 2. 트럭 모델
export function Truck({ material, wheelMaterial }) {
  return (
    <group name="truck-mesh">
      <mesh material={material} castShadow position={[0, 0.25, 0]}><boxGeometry args={[1.7, 0.2, 0.9]} /></mesh>
      <mesh material={material} castShadow position={[0.55, 0.55, 0]}><boxGeometry args={[0.5, 0.6, 0.86]} /></mesh>
      <mesh material={wheelMaterial} castShadow position={[-0.25, 0.5, 0]}><boxGeometry args={[1.1, 0.5, 0.86]} /></mesh>
    </group>
  );
}

// 3. 스포츠카 모델
export function SportCar({ material, wheelMaterial }) {
  return (
    <group name="sport-mesh">
      <mesh material={material} castShadow position={[0, 0.21, 0]}><boxGeometry args={[1.6, 0.22, 0.9]} /></mesh>
      <mesh material={material} castShadow position={[-0.1, 0.38, 0]}><boxGeometry args={[0.6, 0.16, 0.76]} /></mesh>
      <mesh material={wheelMaterial} castShadow position={[-0.75, 0.35, 0]}><boxGeometry args={[0.1, 0.15, 0.8]} /></mesh>
    </group>
  );
}

// 4. 버스 모델
export function Bus({ material, wheelMaterial }) {
  return (
    <group name="bus-mesh">
      <mesh material={material} castShadow position={[0, 0.55, 0]}><boxGeometry args={[2.6, 0.8, 0.85]} /></mesh>
      <mesh material={wheelMaterial} position={[0, 0.7, 0]}><boxGeometry args={[2.4, 0.15, 0.87]} /></mesh>
    </group>
  );
}