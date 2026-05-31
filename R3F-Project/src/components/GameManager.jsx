import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useStore } from '../store';
import { WAVE_DEFS } from '../constants';

export default function GameManager() {
  const phase = useStore(s => s.phase);
  const wave  = useStore(s => s.wave);

  const spawnQueue  = useRef([]);
  const spawnTimer  = useRef(0);
  const waveDone    = useRef(false);

  // Keyboard
  useEffect(() => {
    const onKey = (e) => {
      const s = useStore.getState();
      if (e.code === 'Space') { e.preventDefault(); s.startWave(); }
      if (e.code === 'Digit1') s.selectType(1);
      if (e.code === 'Digit2') s.selectType(2);
      if (e.code === 'Digit3') s.selectType(3);
      if (e.code === 'KeyR' && s.phase === 'gameover') s.reset();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Build spawn queue when wave starts
  useEffect(() => {
    if (phase === 'wave') {
      const wd = WAVE_DEFS(wave);
      spawnQueue.current = Array.from({ length: wd.count }, (_, i) => ({
        spawnAt: i * wd.spawnInterval,
        hp: wd.hp, maxHp: wd.hp, speed: wd.speed, reward: wd.reward,
      }));
      spawnTimer.current = 0;
      waveDone.current   = false;
    }
  }, [phase, wave]);

  useFrame((_, delta) => {
    const dt = delta * useStore.getState().gameSpeed;
    if (phase !== 'wave' || waveDone.current) return;

    spawnTimer.current += dt;

    while (
      spawnQueue.current.length > 0 &&
      spawnTimer.current >= spawnQueue.current[0].spawnAt
    ) {
      const { spawnAt, ...data } = spawnQueue.current.shift();
      useStore.getState().addEnemy(data);
    }

    const { enemies } = useStore.getState();
    if (spawnQueue.current.length === 0 && enemies.length === 0) {
      waveDone.current = true;
      useStore.getState().completeWave();
    }
  });

  return null;
}
