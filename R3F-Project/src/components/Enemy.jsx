import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useStore } from '../store';
import { useGameCtx } from '../GameContext';
import { WAYPOINTS } from '../constants';

export default function Enemy({ id, hp, maxHp, speed }) {
  const meshRef   = useRef();
  const bodyRef   = useRef();
  const wptIdx    = useRef(1);
  const escaped   = useRef(false);
  const hitFlash  = useRef(0);
  const prevHp    = useRef(hp);
  const { enemyPositions } = useGameCtx();

  // Register position on mount / cleanup on unmount
  useEffect(() => {
    const wp0 = WAYPOINTS[0];
    enemyPositions.current.set(id, { x: wp0.x, z: wp0.z });
    return () => enemyPositions.current.delete(id);
  }, [id]);

  // Detect hp decrease → trigger hit flash
  useEffect(() => {
    if (hp < prevHp.current) hitFlash.current = 0.18;
    prevHp.current = hp;
  }, [hp]);

  useFrame((state, delta) => {
    const dt = delta * useStore.getState().gameSpeed;
    if (!meshRef.current || escaped.current) return;

    const target = WAYPOINTS[wptIdx.current];
    if (!target) return;

    const pos = meshRef.current.position;
    const dx = target.x - pos.x;
    const dz = target.z - pos.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist < 0.12) {
      wptIdx.current++;
      if (wptIdx.current >= WAYPOINTS.length) {
        escaped.current = true;
        enemyPositions.current.delete(id);
        useStore.getState().enemyEscaped(id);
        return;
      }
    } else {
      const step = Math.min(speed * dt, dist);
      pos.x += (dx / dist) * step;
      pos.z += (dz / dist) * step;
      meshRef.current.rotation.y = Math.atan2(dx, dz);
    }

    // Bob
    pos.y = 0.5 + Math.sin(state.clock.elapsedTime * 3 + parseInt(id) * 0.8) * 0.06;

    // Update shared position map
    enemyPositions.current.set(id, { x: pos.x, z: pos.z });

    // Hit flash
    if (bodyRef.current) {
      if (hitFlash.current > 0) {
        hitFlash.current = Math.max(0, hitFlash.current - dt);
        bodyRef.current.material.emissiveIntensity = hitFlash.current > 0 ? 4 : 0;
        bodyRef.current.material.emissive.set(hitFlash.current > 0 ? '#ff4400' : '#cc2200');
      }
    }
  });

  const hpPct = Math.max(0, hp / maxHp);
  const hpColor = hpPct > 0.5 ? '#44ff66' : hpPct > 0.25 ? '#ffaa22' : '#ff3333';

  return (
    <group ref={meshRef} position={[WAYPOINTS[0].x, 0.5, WAYPOINTS[0].z]}>
      {/* Body */}
      <mesh ref={bodyRef} castShadow>
        <boxGeometry args={[0.65, 0.65, 0.65]} />
        <meshStandardMaterial
          color="#cc4422"
          emissive="#cc2200"
          emissiveIntensity={0}
          roughness={0.6}
          metalness={0.2}
        />
      </mesh>

      {/* Eyes */}
      {[0.18, -0.18].map((xOff, i) => (
        <mesh key={i} position={[xOff, 0.1, 0.33]}>
          <sphereGeometry args={[0.08, 6, 6]} />
          <meshStandardMaterial color="#ffee00" emissive="#ffee00" emissiveIntensity={1.5} toneMapped={false} />
        </mesh>
      ))}

      {/* Spike on top */}
      <mesh position={[0, 0.48, 0]} castShadow>
        <coneGeometry args={[0.14, 0.4, 6]} />
        <meshStandardMaterial color="#882200" roughness={0.5} />
      </mesh>

      {/* HP bar */}
      <Html position={[0, 0.72, 0]} center occlude={false}>
        <div style={{ width: 44, pointerEvents: 'none' }}>
          <div style={{
            height: 5, background: '#222', border: '1px solid #555',
            borderRadius: 2, overflow: 'hidden',
          }}>
            <div style={{
              width: `${hpPct * 100}%`, height: '100%',
              background: hpColor,
              transition: 'width 0.05s, background 0.1s',
            }} />
          </div>
        </div>
      </Html>
    </group>
  );
}
