import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { globalTimeRef } from '../constants';

export default function TimeController({ timeMode, globalSpeed, setUiPhase }) {
  const lastPhaseRef = useRef('');

  useFrame((state, delta) => {
    // 1. 부드러운 시간 궤도 진행 로직
    if (timeMode === 'auto') {
      globalTimeRef.current += delta * 0.3 * globalSpeed;
      globalTimeRef.current %= Math.PI * 2;
    } else {
      const target = timeMode === 'day' ? Math.PI / 2 : Math.PI * 1.5;
      let diff = target - globalTimeRef.current;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      globalTimeRef.current += diff * delta * 2; // 서서히 타겟 시간대로 이동
      globalTimeRef.current %= Math.PI * 2;
      if (globalTimeRef.current < 0) globalTimeRef.current += Math.PI * 2;
    }

    // 2. UI 표시용 시간대 체크
    const s = Math.sin(globalTimeRef.current);
    let currentPhase = '☀️ 낮 (Day)';
    if (s < -0.2) currentPhase = '🌙 밤 (Night)';
    else if (s >= -0.2 && s <= 0.2) {
      const c = Math.cos(globalTimeRef.current);
      currentPhase = c > 0 ? '🌄 일출 (Sunrise)' : '🌅 일몰 (Sunset)';
    }

    if (lastPhaseRef.current !== currentPhase) {
      lastPhaseRef.current = currentPhase;
      setUiPhase(currentPhase);
    }
  });

  return null;
}