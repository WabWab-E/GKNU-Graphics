import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CONFIG, CAR_BASE_Y, globalTimeRef, clippingPlanes } from '../constants';

const wheelGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.1, 16);
const wheelMat = new THREE.MeshStandardMaterial({ color: '#111111', roughness: 0.9, clippingPlanes });
const bulbGeo = new THREE.BoxGeometry(0.1, 0.12, 0.15);

const WHEEL_POSITIONS = [
  [0.45, 0.15, 0.41],
  [-0.45, 0.15, 0.41],
  [0.45, 0.15, -0.41],
  [-0.45, 0.15, -0.41]
];

export default function MovingCar({ initialX, zPosition, direction, globalSpeed }) {
  const carRef = useRef();
  const headlightRef = useRef();
  const targetRef = useRef(); 

  const getRandomColor = () => CONFIG.carColors[Math.floor(Math.random() * CONFIG.carColors.length)];
  const getRandomSpeed = () => 3.5 + Math.random() * 3.0;

  const [speed, setSpeed] = useState(getRandomSpeed);
  const bumpOffset = useMemo(() => Math.random() * 100, []);

  const carMat = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: getRandomColor(), roughness: 0.2, metalness: 0.5, clippingPlanes 
  }), []);

  const bulbMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#ffeb3b", emissive: "#ffeb3b", emissiveIntensity: 0, clippingPlanes
  }), []);

  useEffect(() => {
    return () => {
      carMat.dispose();
      bulbMat.dispose();
    };
  }, [carMat, bulbMat]);

  useEffect(() => {
    if (headlightRef.current && targetRef.current) {
      headlightRef.current.target = targetRef.current;
    }
  }, []);

  useFrame((state, delta) => {
    const s = Math.sin(globalTimeRef.current);
    const nightFactor = Math.max(0, -s); 

    if (headlightRef.current) headlightRef.current.intensity = 110 * nightFactor;
    bulbMat.emissiveIntensity = 3.5 * nightFactor; 

    if (!carRef.current) return;

    carRef.current.position.x += delta * speed * direction * globalSpeed;
    
    const elapsedTime = state.clock.getElapsedTime();
    const speedFactor = speed / 5.0; 
    const waveValue = elapsedTime * speed * 3 + bumpOffset;
    
    carRef.current.position.y = CAR_BASE_Y + Math.sin(waveValue) * (0.016 * speedFactor);
    carRef.current.rotation.z = Math.cos(waveValue) * (0.022 * speedFactor);

    // 🏎️ 리스폰(순간이동) 체크
    const isPastBound = direction === 1 
      ? carRef.current.position.x > CONFIG.boundX 
      : carRef.current.position.x < -CONFIG.boundX;

    if (isPastBound) {
      carRef.current.position.x = -CONFIG.boundX * direction;
      setSpeed(getRandomSpeed());
      
      // 💡 핵심: 마테리얼 인스턴스를 새로 바꾸는 대신 기존 마테리얼의 색상 값만 부드럽게 교체
      carMat.color.set(getRandomColor()); 
    }
  });

  const rotationY = direction === 1 ? 0 : Math.PI;

  return (
    <group ref={carRef} position={[initialX, CAR_BASE_Y, zPosition]} rotation={[0, rotationY, 0]}>
      
      {/* 차 */}
      <group name="car-model">
        {/* 차체 */}
        <mesh geometry={new THREE.BoxGeometry(1.5, 0.3, 0.8)} material={carMat} castShadow position={[0, 0.3, 0]} />
        <mesh geometry={new THREE.BoxGeometry(0.8, 0.3, 0.72)} material={carMat} castShadow position={[-0.1, 0.6, 0]} />
        
        {/* 바퀴 */}
        {WHEEL_POSITIONS.map((pos, idx) => (
          <mesh key={idx} geometry={wheelGeo} material={wheelMat} castShadow position={pos} rotation={[Math.PI / 2, 0, 0]} />
        ))}
      </group>

      {/* 헤드라이트 */}
      <group name="headlight-system" position={[0.75, 0.27, 0]}>
        <spotLight 
          ref={headlightRef} 
          angle={0.5} penumbra={0.8} distance={13} 
          color="#fffde7" castShadow shadow-bias={-0.001}
        />
        <object3D ref={targetRef} position={[4, -0.5, 0]} />
  
        <mesh geometry={bulbGeo} material={bulbMat} position={[0.04, 0, 0.22]} />
        <mesh geometry={bulbGeo} material={bulbMat} position={[0.04, 0, -0.22]} />
      </group>

    </group>
  );
}