import { useRef, useState, useMemo } from 'react';
import { useFrame, extend } from '@react-three/fiber';
import { Html, shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../store';
import { useGameCtx } from '../GameContext';
import { gridToWorld, TOWER_DEFS, getTowerStats, getUpgradeCost, getLevelTier, TIER_COLORS } from '../constants';

// ── GLSL: 맥박 발광 셰이더 ──
const TowerGlowMaterial = shaderMaterial(
  { time: 0, baseColor: new THREE.Color('#3399ff'), emissiveColor: new THREE.Color('#0a3388'), intensity: 1.0 },
  `
    varying vec3 vNormal; varying vec3 vPosition;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  `
    uniform float time; uniform vec3 baseColor; uniform vec3 emissiveColor; uniform float intensity;
    varying vec3 vNormal; varying vec3 vPosition;
    void main() {
      float pulse = 0.5 + 0.5 * sin(time * 3.0 + vPosition.y * 10.0);
      float rim   = 1.0 - max(0.0, dot(normalize(vNormal), vec3(0.0, 0.0, 1.0)));
      vec3  col   = baseColor * (0.6 + pulse * 0.4 * intensity) + emissiveColor * (rim * 1.8 * intensity);
      gl_FragColor = vec4(col, 1.0);
    }
  `
);
extend({ TowerGlowMaterial });

export default function Tower({ id, col, row, type, level = 1 }) {
  const pivotRef = useRef();
  const matRef   = useRef();
  const cooldown = useRef(0);
  const [showMenu, setShowMenu] = useState(false);
  const { enemyPositions } = useGameCtx();

  const def   = TOWER_DEFS[type];
  const stats = useMemo(() => getTowerStats(type, level), [type, level]);
  const [wx, , wz] = gridToWorld(col, row);
  const baseColor     = useMemo(() => new THREE.Color(def.color),    [def.color]);
  const emissiveColor = useMemo(() => new THREE.Color(def.emissive), [def.emissive]);

  const tier      = getLevelTier(level);
  const tierColor = TIER_COLORS[tier];
  const upgradeCost = getUpgradeCost(type, level);

  // 티어별 링 색 (Three.js Color)
  const ringColor = useMemo(() => new THREE.Color(tierColor), [tierColor]);

  useFrame((state, delta) => {
    if (matRef.current) {
      matRef.current.time      = state.clock.elapsedTime;
      // 레벨 높을수록 빠르게 맥박, 밝게
      matRef.current.intensity = 0.8 + Math.min(level * 0.07, 2.5);
    }

    const dt = delta * useStore.getState().gameSpeed;
    cooldown.current -= dt;
    if (cooldown.current > 0) return;

    const { enemies, spawnProjectile } = useStore.getState();
    if (!enemies.length) return;

    let nearest = null, nearestDist = Infinity;
    for (const [eid, pos] of enemyPositions.current) {
      if (!enemies.some(e => e.id === eid)) continue;
      const dx = pos.x - wx, dz = pos.z - wz;
      const d  = Math.sqrt(dx * dx + dz * dz);
      if (d <= stats.range && d < nearestDist) {
        nearest = { id: eid, x: pos.x, z: pos.z };
        nearestDist = d;
      }
    }
    if (!nearest) return;

    if (pivotRef.current)
      pivotRef.current.rotation.y = Math.atan2(nearest.x - wx, nearest.z - wz);

    cooldown.current = 1 / stats.atkSpd;
    spawnProjectile(id, [wx, 1.0, wz], nearest.id, type, stats.damage, stats.splash);
  });

  // 레벨에 따른 타워 크기 (천천히 커짐, 최대 1.5배)
  const towerScale = Math.min(1.0 + (level - 1) * 0.025, 1.5);
  // 링 개수: 티어당 1개 추가
  const ringCount = Math.min(tier + 1, 4);

  return (
    <group position={[wx, 0, wz]}>
      {/* 기단 */}
      <mesh
        position={[0, 0.27 * towerScale, 0]}
        scale={[towerScale, towerScale, towerScale]}
        castShadow receiveShadow
        onClick={(e) => { e.stopPropagation(); setShowMenu(v => !v); }}
      >
        <cylinderGeometry args={[0.36, 0.44, 0.55, 8]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.7} metalness={0.4} />
      </mesh>

      {/* 티어 링 (레벨에 따라 최대 4개) */}
      {Array.from({ length: ringCount }).map((_, ri) => (
        <mesh key={ri} position={[0, (0.22 + ri * 0.18) * towerScale, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.42 * towerScale, 0.055, 8, 24]} />
          <meshStandardMaterial
            color={tierColor}
            emissive={tierColor}
            emissiveIntensity={1.0 + tier * 0.4}
            metalness={0.8} roughness={0.2}
          />
        </mesh>
      ))}

      {/* 회전 헤드 (GLSL 셰이더) */}
      <group ref={pivotRef} position={[0, (0.78 + (towerScale - 1) * 0.4), 0]}>
        <mesh castShadow scale={towerScale}>
          <boxGeometry args={[0.46, 0.46, 0.46]} />
          <towerGlowMaterial ref={matRef} baseColor={baseColor} emissiveColor={emissiveColor} intensity={0.8} />
        </mesh>
        {/* 포신 */}
        <mesh position={[0, 0, 0.3 * towerScale]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.055, 0.055, 0.5 * towerScale, 6]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.15} />
        </mesh>
        {/* 포구 */}
        <mesh position={[0, 0, 0.56 * towerScale]}>
          <sphereGeometry args={[Math.min(0.075 + level * 0.003, 0.16), 8, 8]} />
          <meshStandardMaterial
            color={def.projColor} emissive={def.projColor}
            emissiveIntensity={Math.min(3 + level * 0.2, 8)}
            toneMapped={false}
          />
        </mesh>
      </group>

      {/* 사거리 링 */}
      {showMenu && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <ringGeometry args={[stats.range - 0.06, stats.range, 48]} />
          <meshBasicMaterial color={tierColor} transparent opacity={0.2} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* 메뉴 */}
      {showMenu && (
        <Html position={[0, 2.1 + (towerScale - 1) * 0.5, 0]} center distanceFactor={9}>
          <div style={{
            background: 'rgba(6,6,18,0.96)',
            border: `1px solid ${tierColor}`,
            borderRadius: 8, padding: '9px 14px',
            color: '#eee', fontSize: 11,
            textAlign: 'center', minWidth: 130,
            pointerEvents: 'auto',
            userSelect: 'none',
            fontFamily: 'monospace',
            boxShadow: `0 0 10px ${tierColor}44`,
          }}>
            {/* 이름 + 레벨 배지 */}
            <div style={{ fontWeight: 'bold', fontSize: 12, marginBottom: 4 }}>
              {def.name}
              <span style={{
                marginLeft: 7, padding: '1px 6px',
                borderRadius: 10, fontSize: 10,
                background: tierColor + '33',
                border: `1px solid ${tierColor}`,
                color: tierColor,
              }}>
                Lv.{level}
              </span>
            </div>

            {/* 현재 스탯 */}
            <div style={{ color: '#888', fontSize: 10, marginBottom: 3, lineHeight: 1.7 }}>
              <div>⚔️ <b style={{color:'#eee'}}>{stats.damage}</b>
                <span style={{color:'#556',fontSize:9}}> (+{Math.round(TOWER_DEFS[type].damage * 0.18 * Math.pow(1.18, level-1))})</span>
              </div>
              <div>📏 <b style={{color:'#eee'}}>{stats.range}</b>
                <span style={{color:'#556',fontSize:9}}> (+{(TOWER_DEFS[type].range * 0.06 * Math.pow(1.06, level-1)).toFixed(1)})</span>
              </div>
              <div>⚡ <b style={{color:'#eee'}}>{stats.atkSpd}/s</b></div>
            </div>

            {/* 업그레이드 버튼 */}
            <button
              onClick={(e) => { e.stopPropagation(); useStore.getState().upgradeTower(id); }}
              style={{
                display: 'block', width: '100%',
                background: 'rgba(40,160,80,0.2)',
                border: `1px solid ${tierColor}`, color: tierColor,
                borderRadius: 4, padding: '5px 0',
                cursor: 'pointer', fontSize: 11,
                marginBottom: 5, fontFamily: 'inherit', fontWeight: 'bold',
              }}>
              ⬆ Lv.{level+1}  ({upgradeCost}💰)
            </button>

            {/* 판매 버튼 */}
            <button
              onClick={(e) => { e.stopPropagation(); useStore.getState().sellTower(id); setShowMenu(false); }}
              style={{
                display: 'block', width: '100%',
                background: 'rgba(140,20,20,0.25)',
                border: '1px solid #cc3333', color: '#ff8888',
                borderRadius: 4, padding: '4px 0',
                cursor: 'pointer', fontSize: 11, fontFamily: 'inherit',
              }}>
              🔴 판매 (+{Math.floor(def.cost * (0.4 + Math.min(level * 0.05, 0.5)))}💰)
            </button>
          </div>
        </Html>
      )}
    </group>
  );
}
