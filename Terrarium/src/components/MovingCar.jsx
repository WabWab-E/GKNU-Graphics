import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CONFIG, CAR_BASE_Y, globalTimeRef, clippingPlanes } from '../constants';
import { Sedan, Truck, SportCar, Bus } from './CarModels';
import HeadlightSystem from './HeadlightSystem';

const wheelMat = new THREE.MeshStandardMaterial({ color: '#111111', roughness: 0.9, clippingPlanes });
const wheelGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.1, 16);

const CAR_CONFIGS = {
  sedan: { speedRange: [4.5, 6.0], bumpScale: 1.0, headlightPos: [0.75, 0.27, 0], bulbPositions: [[0.04, 0, 0.22], [0.04, 0, -0.22]], wheelPositions: [[0.45, 0.15, 0.41], [-0.45, 0.15, 0.41], [0.45, 0.15, -0.41], [-0.45, 0.15, -0.41]] },
  truck: { speedRange: [3.5, 4.0], bumpScale: 1.4, headlightPos: [0.85, 0.25, 0], bulbPositions: [[0.04, 0, 0.25], [0.04, 0, -0.25]], wheelPositions: [[0.55, 0.15, 0.46], [-0.55, 0.15, 0.46], [0.55, 0.15, -0.46], [-0.55, 0.15, -0.46]] },
  sport: { speedRange: [6.0, 8.5], bumpScale: 0.6, headlightPos: [0.8, 0.2, 0], bulbPositions: [[0.04, 0, 0.26], [0.04, 0, -0.26]], wheelPositions: [[0.55, 0.15, 0.45], [-0.55, 0.15, 0.45], [0.55, 0.15, -0.45], [-0.55, 0.15, -0.45]] },
  bus: { speedRange: [3.0, 4.0], bumpScale: 1.1, headlightPos: [1.3, 0.35, 0], bulbPositions: [[0.04, 0, 0.24], [0.04, 0, -0.24]], wheelPositions: [[0.9, 0.15, 0.43], [-0.9, 0.15, 0.43], [0.9, 0.15, -0.43], [-0.9, 0.15, -0.43]] }
};

export default function MovingCar({ initialX, zPosition, direction, globalSpeed, type }) {
  const carRef = useRef();
  const headlightRef = useRef();
  const targetRef = useRef(); 

  const carTypes = ['sedan', 'truck', 'sport', 'bus'];
  const getRandomType = () => type || carTypes[Math.floor(Math.random() * carTypes.length)];
  const getRandomColor = () => CONFIG.carColors[Math.floor(Math.random() * CONFIG.carColors.length)];

  const [carType, setCarType] = useState(getRandomType);
  const [speed, setSpeed] = useState(() => {
    const range = CAR_CONFIGS[carType].speedRange;
    return range[0] + Math.random() * (range[1] - range[0]);
  });
  const bumpOffset = useMemo(() => Math.random() * 100, []);
  const currentConfig = CAR_CONFIGS[carType];

  const carMat = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: getRandomColor(), roughness: 0.2, metalness: 0.5, clippingPlanes 
  }), []);

  const bulbMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#ffeb3b", emissive: "#ffeb3b", emissiveIntensity: 0, clippingPlanes
  }), []);

  useEffect(() => {
    return () => { carMat.dispose(); bulbMat.dispose(); };
  }, [carMat, bulbMat]);

  useEffect(() => {
    if (headlightRef.current && targetRef.current) {
      headlightRef.current.target = targetRef.current;
    }
  }, [carType]);

  useFrame((state, delta) => {
    const s = Math.sin(globalTimeRef.current);
    const nightFactor = Math.max(0, -s); 

    if (headlightRef.current) headlightRef.current.intensity = 110 * nightFactor;
    bulbMat.emissiveIntensity = 3.5 * nightFactor; 

    if (!carRef.current) return;

    carRef.current.position.x += delta * speed * direction * globalSpeed;
    
    const elapsedTime = state.clock.getElapsedTime();
    const speedFactor = speed / 5.0; 
    const waveValue = elapsedTime * speed * 4 + bumpOffset;
    
    carRef.current.position.y = CAR_BASE_Y + Math.sin(waveValue) * (0.012 * speedFactor * currentConfig.bumpScale);
    carRef.current.rotation.z = Math.cos(waveValue) * (0.012 * speedFactor * currentConfig.bumpScale);

    const isPastBound = direction === 1 ? carRef.current.position.x > CONFIG.boundX : carRef.current.position.x < -CONFIG.boundX;

    if (isPastBound) {
      carRef.current.position.x = -CONFIG.boundX * direction;
      const nextType = type || carTypes[Math.floor(Math.random() * carTypes.length)];
      setCarType(nextType);
      setSpeed(CAR_CONFIGS[nextType].speedRange[0] + Math.random() * (CAR_CONFIGS[nextType].speedRange[1] - CAR_CONFIGS[nextType].speedRange[0]));
      carMat.color.set(getRandomColor()); 
    }
  });

  return (
    <group ref={carRef} position={[initialX, CAR_BASE_Y, zPosition]} rotation={[0, direction === 1 ? 0 : Math.PI, 0]}>
      
      {/* 차량 모델 변경 */}
      <group name="car-model">
        {carType === 'sedan' && <Sedan material={carMat} />}
        {carType === 'truck' && <Truck material={carMat} wheelMaterial={wheelMat} />}
        {carType === 'sport' && <SportCar material={carMat} wheelMaterial={wheelMat} />}
        {carType === 'bus' && <Bus material={carMat} wheelMaterial={wheelMat} />}

        {/* 바퀴 */}
        {currentConfig.wheelPositions.map((pos, idx) => (
          <mesh key={idx} geometry={wheelGeo} material={wheelMat} castShadow position={pos} rotation={[Math.PI / 2, 0, 0]} />
        ))}
      </group>

      {/* 헤드라이트 */}
      <HeadlightSystem 
        config={currentConfig} 
        headlightRef={headlightRef} 
        targetRef={targetRef} 
        bulbMat={bulbMat} 
      />

    </group>
  );
}