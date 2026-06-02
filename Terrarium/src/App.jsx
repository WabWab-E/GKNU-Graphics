import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

import DashboardUI from './components/DashboardUI';
import TimeController from './components/TimeController';
import Terrarium from './components/Terrarium';
import OrbitalLights from './components/OrbitalLights';
import FieldWithRoad from './components/FieldWithRoad';
import Windmill from './components/Windmill';
import MovingCar from './components/MovingCar';

export default function App() {
  const [timeMode, setTimeMode] = useState('auto'); 
  const [globalSpeed, setGlobalSpeed] = useState(1.0); 
  const [uiPhase, setUiPhase] = useState('☀️ 낮 (Day)');

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      
      {/* HTML UI 계층 */}
      <DashboardUI 
        timeMode={timeMode} setTimeMode={setTimeMode} 
        globalSpeed={globalSpeed} setGlobalSpeed={setGlobalSpeed} 
        uiPhase={uiPhase}
      />

      {/* 3D 렌더링 계층 */}
      <Canvas camera={{ position: [0, 8, 28], fov: 45 }} shadows gl={{ localClippingEnabled: true }}>
        <Suspense fallback={null}>
          <TimeController timeMode={timeMode} globalSpeed={globalSpeed} setUiPhase={setUiPhase} />
          
          <Terrarium />
          <OrbitalLights />
          <FieldWithRoad />

          <Windmill position={[0, 0, 0]} globalSpeed={globalSpeed} />
          
          <MovingCar initialX={-6} zPosition={3.75} direction={1} globalSpeed={globalSpeed} />
          <MovingCar initialX={6} zPosition={2.25} direction={-1} globalSpeed={globalSpeed} />

          <EffectComposer>
            <Bloom luminanceThreshold={1.0} mipmapBlur intensity={1.5} />
          </EffectComposer>
        </Suspense>

        <OrbitControls makeDefault maxDistance={60} minDistance={10} />
      </Canvas>
    </div>
  );
}