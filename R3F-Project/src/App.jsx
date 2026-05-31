import { Canvas } from '@react-three/fiber';
import { GameProvider } from './GameContext';
import Scene from './components/Scene';
import GameUI from './components/GameUI';

export default function App() {
  return (
    <GameProvider>
      <div style={{ width: '100vw', height: '100vh', position: 'relative', background: '#060610' }}>
        <Canvas
          shadows
          camera={{ position: [0, 18, 12], fov: 48 }}
          gl={{ antialias: true, toneMappingExposure: 1.2 }}
          dpr={[1, 2]}
        >
          <Scene />
        </Canvas>
        <GameUI />
      </div>
    </GameProvider>
  );
}
