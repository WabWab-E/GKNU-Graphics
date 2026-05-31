import { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../store';
import { useGameCtx } from '../GameContext';
import { TOWER_DEFS } from '../constants';

export default function Projectile({ id, towerPos, enemyId, type, damage, splash }) {
  const meshRef = useRef();
  const { enemyPositions } = useGameCtx();
  const def = TOWER_DEFS[type];
  // damage/splash come from props (레벨 적용된 값), fallback to def
  const dmg    = damage ?? def.damage;
  const splash_ = splash ?? def.splash;
  const startPos = useMemo(() => new THREE.Vector3(...towerPos), []);

  useEffect(() => {
    if (meshRef.current) meshRef.current.position.copy(startPos);
  }, []);

  useFrame((state, delta) => {
    const dt = delta * useStore.getState().gameSpeed;
    if (!meshRef.current) return;

    const ep = enemyPositions.current.get(enemyId);
    if (!ep) { useStore.getState().removeProjectile(id); return; }

    const target = new THREE.Vector3(ep.x, 0.5, ep.z);
    const curr   = meshRef.current.position;
    const dist   = curr.distanceTo(target);

    if (dist < 0.35) {
      const store = useStore.getState();
      const killed = store.damageEnemy(enemyId, dmg);
      if (killed) {
        store.spawnParticles([ep.x, 0.5, ep.z]);
        enemyPositions.current.delete(enemyId);
      }
      // Splash
      if (splash_) {
        for (const [eid, pos] of enemyPositions.current) {
          if (eid === enemyId) continue;
          const dx = pos.x - ep.x, dz = pos.z - ep.z;
          if (Math.sqrt(dx*dx + dz*dz) <= splash_)
            useStore.getState().damageEnemy(eid, Math.floor(dmg * 0.6));
        }
      }
      store.removeProjectile(id);
      return;
    }

    const dir = target.clone().sub(curr).normalize();
    curr.addScaledVector(dir, def.projSpd * dt);

    // Pulse scale
    const p = 1 + 0.25 * Math.sin(state.clock.elapsedTime * 20);
    meshRef.current.scale.setScalar(p);
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.1, 8, 8]} />
      <meshStandardMaterial
        color={def.projColor}
        emissive={def.projColor}
        emissiveIntensity={4}
        toneMapped={false}
      />
    </mesh>
  );
}
