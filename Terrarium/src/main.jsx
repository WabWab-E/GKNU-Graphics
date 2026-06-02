import React, { Suspense, useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Edges } from '@react-three/drei';
import * as THREE from 'three';

/* --------------------------------------------------------
   0. 전역 상수 및 설정 (Configuration)
-------------------------------------------------------- */
const CONFIG = {
  skyDay: new THREE.Color('#87ceeb'),
  skyNight: new THREE.Color('#030712'),
  ambientDay: new THREE.Color('#ffffff'),
  ambientNight: new THREE.Color('#3a415a'),
  carColors: ['#ff0000', '#0000ff', '#fbc02d', '#4caf50', '#ffffff', '#212121', '#9c27b0', '#ff5722'],
  roadY: -1.48,      
  wheelRadius: 0.15, 
  boundX: 11,        
};

const CAR_BASE_Y = CONFIG.roadY + CONFIG.wheelRadius; 

const clippingPlanes = [
  new THREE.Plane(new THREE.Vector3(1, 0, 0), 10),    
  new THREE.Plane(new THREE.Vector3(-1, 0, 0), 10),   
  new THREE.Plane(new THREE.Vector3(0, 1, 0), 6.5),   
  new THREE.Plane(new THREE.Vector3(0, -1, 0), 13.5), 
  new THREE.Plane(new THREE.Vector3(0, 0, 1), 10),    
  new THREE.Plane(new THREE.Vector3(0, 0, -1), 10),   
];

const wheelGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.1, 16);
const wheelMat = new THREE.MeshStandardMaterial({ color: '#111111', roughness: 0.9, clippingPlanes });
const bulbGeo = new THREE.BoxGeometry(0.02, 0.1, 0.12);
const bulbMat = new THREE.MeshBasicMaterial({ color: '#ffeb3b', clippingPlanes });

/* --------------------------------------------------------
   1. 풍차 (Windmill) 컴포넌트
-------------------------------------------------------- */
function Windmill({ position, globalSpeed }) {
  const bladesRef = useRef();

  useFrame((state, delta) => {
    // 💡 기본 회전 속도(1.5)에 글로벌 전역 속도 배율을 곱해 연동
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
      <mesh position={[0, -0.6, 0.98]} rotation={[-0.185, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.4, 0.7, 0.12]} />
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

/* --------------------------------------------------------
   2. 자동차 (MovingCar) 컴포넌트
-------------------------------------------------------- */
function MovingCar({ initialX, zPosition, direction, isNight, globalSpeed }) {
  const carRef = useRef();
  const headlightRef = useRef();
  const targetRef = useRef();
  const beamRef = useRef();

  const getRandomColor = () => CONFIG.carColors[Math.floor(Math.random() * CONFIG.carColors.length)];
  const getRandomSpeed = () => 3.5 + Math.random() * 3.0;

  const [bodyColor, setBodyColor] = useState(getRandomColor);
  const [speed, setSpeed] = useState(getRandomSpeed);

  const carMat = useMemo(() => new THREE.MeshStandardMaterial({ 
    color: bodyColor, roughness: 0.2, metalness: 0.5, clippingPlanes 
  }), [bodyColor]);

  useFrame((state, delta) => {
    if (headlightRef.current) headlightRef.current.visible = isNight;
    if (beamRef.current) beamRef.current.visible = isNight;

    if (carRef.current) {
      // 💡 자동차 고유 랜덤 속도에 글로벌 전역 속도 배율을 곱해 연동
      carRef.current.position.x += delta * speed * direction * globalSpeed;

      if ((direction === 1 && carRef.current.position.x > CONFIG.boundX) ||
          (direction === -1 && carRef.current.position.x < -CONFIG.boundX)) {
        carRef.current.position.x = -CONFIG.boundX * direction;
        setBodyColor(getRandomColor());
        setSpeed(getRandomSpeed());
      }
    }
  });

  const rotationY = direction === 1 ? 0 : Math.PI;
  const wheelPositions = [[0.45, 0.41], [-0.45, 0.41], [0.45, -0.41], [-0.45, -0.41]];

  return (
    <group ref={carRef} position={[initialX, CAR_BASE_Y, zPosition]} rotation={[0, rotationY, 0]}>
      <mesh geometry={new THREE.BoxGeometry(1.5, 0.3, 0.8)} material={carMat} castShadow receiveShadow position={[0, 0.25, 0]} />
      <mesh geometry={new THREE.BoxGeometry(0.8, 0.3, 0.72)} material={carMat} castShadow position={[-0.1, 0.55, 0]} />
      {wheelPositions.map((pos, idx) => (
        <mesh key={idx} geometry={wheelGeo} material={wheelMat} castShadow position={[pos[0], CONFIG.wheelRadius, pos[1]]} rotation={[Math.PI / 2, 0, 0]} />
      ))}

      <group position={[0.75, 0.22, 0]}>
        <object3D ref={targetRef} position={[4, -0.05, 0]} />
        <spotLight ref={headlightRef} target={targetRef.current} angle={0.4} penumbra={0.7} intensity={30} distance={12} color="#fffde7" castShadow shadow-bias={-0.001} />
        
        <mesh ref={beamRef} position={[1.5, -0.05, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.7, 3.0, 16, 1, true]} />
          <meshBasicMaterial color="#fffde7" transparent opacity={0.12} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} clippingPlanes={clippingPlanes} />
        </mesh>

        <mesh geometry={bulbGeo} material={bulbMat} position={[0, 0, 0.22]} />
        <mesh geometry={bulbGeo} material={bulbMat} position={[0, 0, -0.22]} />
      </group>
    </group>
  );
}

/* --------------------------------------------------------
   3. 논밭 및 도로 디테일 컴포넌트
-------------------------------------------------------- */
function FieldWithRoad() {
  const ridges = useMemo(() => {
    const list = [];
    for (let x = -9; x <= 9; x += 1.2) list.push({ x, z: -4, length: 10 }); 
    for (let x = -9; x <= 9; x += 1.2) list.push({ x, z: 7, length: 4 });  
    return list;
  }, []);

  return (
    <group>
      <mesh position={[0, -2.5, 0]} receiveShadow castShadow>
        <boxGeometry args={[20, 2, 20]} />
        <meshStandardMaterial color="#3d261d" roughness={0.9} metalness={0.1} />
      </mesh>
      <mesh position={[0, -5.0, 0]} receiveShadow castShadow>
        <boxGeometry args={[20, 3, 20]} />
        <meshStandardMaterial color="#22252a" roughness={1.0} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.49, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="goldenrod" roughness={0.8} />
      </mesh>
      {ridges.map((ridge, idx) => (
        <mesh key={idx} position={[ridge.x, -1.45, ridge.z]} castShadow receiveShadow>
          <boxGeometry args={[0.4, 0.1, ridge.length]} />
          <meshStandardMaterial color="#b8860b" roughness={0.9} />
        </mesh>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, CONFIG.roadY, 3]} receiveShadow>
        <planeGeometry args={[20, 3]} />
        <meshStandardMaterial color="#282828" roughness={0.8} />
      </mesh>
      {[-8, -6, -4, -2, 0, 2, 4, 6, 8].map((xPos, idx) => (
        <mesh key={idx} position={[xPos, -1.47, 3]} receiveShadow>
          <boxGeometry args={[1, 0.01, 0.08]} />
          <meshStandardMaterial color="#ffd700" roughness={1.0} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

/* --------------------------------------------------------
   4. 테라리움 환경 시스템 (Sky / Sun / Moon)
-------------------------------------------------------- */
function TerrariumEnvironment({ isNight, isManual, globalSpeed, setAutoTimeOffset }) {
  const skyRef = useRef();
  const sunRef = useRef();
  const moonRef = useRef();
  const sunLightRef = useRef();
  const moonLightRef = useRef();
  const ambientLightRef = useRef();
  const hemiLightRef = useRef(); 

  // 누적 가중 타임 라인 트래킹용 레프
  const customTimeRef = useRef(0);

  useFrame((state, delta) => {
    let dayFactor;
    let sunX, sunY, moonX, moonY;
    const radius = 11.5;
    const centerY = 0.5;

    if (isManual) {
      dayFactor = isNight ? 0 : 1;
      sunX = 0; sunY = isNight ? -radius : radius;
      moonX = 0; moonY = isNight ? radius : -radius;
    } else {
      // 💡 [시간 동기화 왜곡 해결]: 단순 state.clock 대신 가중 속도가 더해진 자체 타임라인 누적 계산
      customTimeRef.current += delta * 0.3 * globalSpeed;
      const computedTime = customTimeRef.current;

      sunX = Math.cos(computedTime) * radius;
      sunY = centerY + Math.sin(computedTime) * radius;
      moonX = Math.cos(computedTime + Math.PI) * radius;
      moonY = centerY + Math.sin(computedTime + Math.PI) * radius;
      dayFactor = (Math.sin(computedTime) + 1) / 2;

      // 부모 컴포넌트(Scene) 감지용 브릿지 값 전달
      setAutoTimeOffset(computedTime);
    }

    if (sunRef.current) sunRef.current.position.set(sunX, sunY, -1);
    if (sunLightRef.current) sunLightRef.current.position.set(sunX, sunY, -1);
    if (moonRef.current) moonRef.current.position.set(moonX, moonY, -1);
    if (moonLightRef.current) moonLightRef.current.position.set(moonX, moonY, -1);

    if (skyRef.current) skyRef.current.material.color.copy(CONFIG.skyDay).lerp(CONFIG.skyNight, 1 - dayFactor);
    if (ambientLightRef.current) {
      ambientLightRef.current.intensity = 0.18 + dayFactor * 0.27;
      ambientLightRef.current.color.copy(CONFIG.ambientNight).lerp(CONFIG.ambientDay, dayFactor);
    }
    if (hemiLightRef.current) hemiLightRef.current.intensity = 0.1 + dayFactor * 0.4;
    if (sunLightRef.current) sunLightRef.current.intensity = Math.max(0, dayFactor) * 1.8; 
    if (moonLightRef.current) moonLightRef.current.intensity = Math.max(0, 1 - dayFactor) * 0.6;
  });

  return (
    <>
      <ambientLight ref={ambientLightRef} />
      <hemisphereLight ref={hemiLightRef} skyColor="#ffffff" groundColor="#2d1e18" />
      <directionalLight ref={sunLightRef} castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.0005} />
      <directionalLight ref={moonLightRef} color="#bbdefb" castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.0005} />

      <mesh ref={skyRef} position={[0, 3.5, 0]}>
        <boxGeometry args={[19.9, 20.1, 19.9]} />
        <meshBasicMaterial side={THREE.BackSide} toneMapped={false} />
      </mesh>
      <mesh position={[0, 3.5, 0]}>
        <boxGeometry args={[20.2, 20.2, 20.2]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.06} roughness={0.1} metalness={0.8} side={THREE.DoubleSide} />
        <Edges scale={1.0} threshold={15} color="#ffffff" opacity={0.3} transparent />
      </mesh>
      <mesh ref={sunRef}><sphereGeometry args={[0.9, 32, 32]} /><meshBasicMaterial color="#ff7700" clippingPlanes={clippingPlanes} /></mesh>
      <mesh ref={moonRef}><sphereGeometry args={[0.6, 32, 32]} /><meshBasicMaterial color="#fffde7" clippingPlanes={clippingPlanes} /></mesh>
    </>
  );
}

/* --------------------------------------------------------
   5. 메인 캔버스 및 제어용 대시보드 UI 씬
-------------------------------------------------------- */
export default function Scene() {
  const [timeMode, setTimeMode] = useState('auto'); 
  const [isNightState, setIsNightState] = useState(false);
  
  // 💡 글로벌 애니메이션 통합 배율 상태 (기본값: 1.0배속)
  const [globalSpeed, setGlobalSpeed] = useState(1.0); 
  const [autoTimeOffset, setAutoTimeOffset] = useState(0);

  useMemo(() => {
    if (timeMode === 'day') setIsNightState(false);
    if (timeMode === 'night') setIsNightState(true);
  }, [timeMode]);

  // 자동 주행 시 가중 속도 오프셋을 트래킹하여 UI 텍스트 동기화
  useMemo(() => {
    if (timeMode === 'auto') {
      const autoNight = Math.sin(autoTimeOffset) < 0;
      if (autoNight !== isNightState) setIsNightState(autoNight);
    }
  }, [autoTimeOffset, timeMode]);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      
      {/* 고도화된 UI 대시보드 */}
      <div style={{
        position: 'absolute', top: '20px', left: '20px', zIndex: 10,
        background: 'rgba(20, 24, 33, 0.88)', padding: '20px', borderRadius: '14px',
        border: '1px solid rgba(255,255,255,0.15)', color: '#ffffff', fontFamily: 'sans-serif',
        boxShadow: '0 12px 40px rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', width: '260px'
      }}>
        {/* 상단 상태 라벨 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <span style={{ fontSize: '13px', color: '#aaa' }}>현재 환경 상태:</span>
          <span style={{
            fontSize: '14px', fontWeight: 'bold', 
            color: isNightState ? '#9fa8da' : '#ffe082',
            background: isNightState ? 'rgba(63, 81, 181, 0.25)' : 'rgba(255, 193, 7, 0.18)',
            padding: '4px 12px', borderRadius: '20px', border: `1px solid ${isNightState ? '#5c6bc0' : '#ffca28'}`
          }}>
            {isNightState ? '🌙 밤 (Night)' : '☀️ 낮 (Day)'}
          </span>
        </div>
        
        {/* 수동 컨트롤 버튼 팩 */}
        <div style={{ fontSize: '12px', color: '#ccc', marginBottom: '8px', fontWeight: '600' }}>환경 시간 제어</div>
        <div style={{ display: 'flex', gap: '6px', marginBottom: '20px' }}>
          {['auto', 'day', 'night'].map((mode) => (
            <button
              key={mode}
              onClick={() => setTimeMode(mode)}
              style={{
                flex: 1, cursor: 'pointer', padding: '8px 0', borderRadius: '6px', border: 'none',
                fontSize: '11px', fontWeight: '600', transition: 'all 0.2s',
                background: timeMode === mode ? '#ffffff' : 'rgba(255,255,255,0.08)',
                color: timeMode === mode ? '#111318' : '#ffffff',
              }}
            >
              {mode === 'auto' ? '🔄 자동순환' : mode === 'day' ? '낮 고정' : '밤 고정'}
            </button>
          ))}
        </div>

        {/* 💡 [새로운 요구사항]: 전체 씬 애니메이션 통합 컨트롤러 슬라이더 */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#ccc', marginBottom: '6px', fontWeight: '600' }}>
            <span>🏃 전체 애니메이션 배속</span>
            <span style={{ color: '#4fc3f7', fontFamily: 'monospace' }}>{globalSpeed.toFixed(1)}x</span>
          </div>
          <input 
            type="range" 
            min="0.0" 
            max="3.0" 
            step="0.1" 
            value={globalSpeed}
            onChange={(e) => setGlobalSpeed(parseFloat(e.target.value))}
            style={{
              width: '100%', cursor: 'pointer', accentColor: '#4fc3f7',
              background: 'rgba(255,255,255,0.2)', height: '6px', borderRadius: '4px'
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#777', marginTop: '4px' }}>
            <span>정지 (0x)</span>
            <span>표준 (1x)</span>
            <span>최대 (3x)</span>
          </div>
        </div>
      </div>

      {/* 3D 그래픽스 렌더링 영역 */}
      <Canvas camera={{ position: [0, 8, 28], fov: 45 }} shadows gl={{ localClippingEnabled: true }}>
        <color attach="background" args={['#111318']} />

        <Suspense fallback={null}>
          <TerrariumEnvironment isNight={isNightState} isManual={timeMode !== 'auto'} globalSpeed={globalSpeed} setAutoTimeOffset={setAutoTimeOffset} />
          <FieldWithRoad />
          <Windmill position={[0, 0, 0]} globalSpeed={globalSpeed} />
          
          {/* 우측 주행 차 */}
          <MovingCar initialX={-6} zPosition={3.75} direction={1} isNight={isNightState} globalSpeed={globalSpeed} />
          
          {/* 좌측 주행 차 */}
          <MovingCar initialX={6} zPosition={2.25} direction={-1} isNight={isNightState} globalSpeed={globalSpeed} />
        </Suspense>

        <OrbitControls makeDefault maxDistance={60} minDistance={10} />
      </Canvas>
    </div>
  );
}