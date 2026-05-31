import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../store';

const COUNT = 48;

export default function Particles({ id, position }) {
  const pointsRef = useRef();
  const life = useRef(1.0);

  const { positions, velocities, geometry } = useMemo(() => {
    const pos = new Float32Array(COUNT * 3);
    const vel = new Float32Array(COUNT * 3);
    const [px, py, pz] = position;

    for (let i = 0; i < COUNT; i++) {
      pos[i*3]   = px + (Math.random() - 0.5) * 0.3;
      pos[i*3+1] = py;
      pos[i*3+2] = pz + (Math.random() - 0.5) * 0.3;
      const angle = Math.random() * Math.PI * 2;
      const spd   = Math.random() * 5 + 2;
      vel[i*3]   = Math.cos(angle) * spd;
      vel[i*3+1] = Math.random() * 7 + 3;
      vel[i*3+2] = Math.sin(angle) * spd;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return { positions: pos, velocities: vel, geometry: geo };
  }, []);

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((_, delta) => {
    const dt = delta * useStore.getState().gameSpeed;
    life.current -= dt * 2.2;
    if (life.current <= 0) { useStore.getState().removeParticles(id); return; }

    for (let i = 0; i < COUNT; i++) {
      velocities[i*3+1] -= 14 * dt;
      positions[i*3]   += velocities[i*3]   * delta;
      positions[i*3+1]  = Math.max(0, positions[i*3+1] + velocities[i*3+1] * dt);
      positions[i*3+2] += velocities[i*3+2] * dt;
    }
    geometry.attributes.position.needsUpdate = true;

    if (pointsRef.current) {
      pointsRef.current.material.opacity = Math.max(0, life.current);
      const t = 1 - life.current;
      pointsRef.current.material.color.setRGB(1, Math.max(0.1, 0.85 - t * 0.7), 0);
    }
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        size={0.2}
        color="#ffaa33"
        transparent
        opacity={1}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}
