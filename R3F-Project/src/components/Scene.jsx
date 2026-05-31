import { Suspense } from 'react';
import { Stars, OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { useStore } from '../store';
import Grid from './Grid';
import Tower from './Tower';
import Enemy from './Enemy';
import Projectile from './Projectile';
import Particles from './Particles';
import GameManager from './GameManager';

export default function Scene() {
  const towers      = useStore(s => s.towers);
  const enemies     = useStore(s => s.enemies);
  const projectiles = useStore(s => s.projectiles);
  const particles   = useStore(s => s.particles);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.35} />
      <directionalLight
        position={[10, 18, 6]}
        intensity={1.4}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
      />
      <pointLight position={[-8, 4, -2.5]} intensity={0.8} color="#ff6633" distance={20} />
      <pointLight position={[ 8, 4,  3.5]} intensity={0.8} color="#3366ff" distance={20} />

      {/* Environment */}
      <Stars radius={80} depth={60} count={3000} factor={3} />
      <fog attach="fog" args={['#060610', 22, 55]} />

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.06, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#050e05" roughness={1} />
      </mesh>

      {/* Game logic & objects */}
      <Suspense fallback={null}>
        <GameManager />
        <Grid />
        {towers.map(t      => <Tower      key={t.id} {...t} />)}
        {enemies.map(e     => <Enemy      key={e.id} {...e} />)}
        {projectiles.map(p => <Projectile key={p.id} {...p} />)}
        {particles.map(p   => <Particles  key={p.id} {...p} />)}
      </Suspense>

      {/* Camera */}
      <OrbitControls
        target={[0, 0, 0]}
        minDistance={7}
        maxDistance={32}
        maxPolarAngle={Math.PI / 2.1}
      />

      {/* Post-processing */}
      <EffectComposer>
        <Bloom
          intensity={1.8}
          luminanceThreshold={0.25}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
      </EffectComposer>
    </>
  );
}
