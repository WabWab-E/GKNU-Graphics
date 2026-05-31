export const GRID_W = 16;
export const GRID_H = 10;

// 0 = buildable, 1 = path
export const MAP = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];

// worldX = col - 7.5,  worldZ = row - 4.5
export const WAYPOINTS = [
  { x: -9.5, y: 0.5, z: -2.5 },
  { x: -7.5, y: 0.5, z: -2.5 },
  { x: -4.5, y: 0.5, z: -2.5 },
  { x: -4.5, y: 0.5, z: -0.5 },
  { x: -1.5, y: 0.5, z: -0.5 },
  { x: -1.5, y: 0.5, z:  1.5 },
  { x:  2.5, y: 0.5, z:  1.5 },
  { x:  2.5, y: 0.5, z:  3.5 },
  { x:  8.5, y: 0.5, z:  3.5 },
];

export const gridToWorld = (col, row) => [col - 7.5, 0, row - 4.5];

export const TOWER_DEFS = {
  1: {
    name: '기본 타워',
    cost: 50,
    damage: 15,
    range: 3.0,
    atkSpd: 1.0,
    color: '#3399ff',
    emissive: '#0a3388',
    projColor: '#88ccff',
    projSpd: 10,
    desc: '밸런스형',
  },
  2: {
    name: '스나이퍼',
    cost: 80,
    damage: 60,
    range: 6.0,
    atkSpd: 0.4,
    color: '#ff3355',
    emissive: '#880022',
    projColor: '#ff99aa',
    projSpd: 18,
    desc: '장거리 강력',
  },
  3: {
    name: '스플래시',
    cost: 100,
    damage: 8,
    range: 2.5,
    atkSpd: 2.0,
    color: '#44ff88',
    emissive: '#116633',
    projColor: '#aaffe0',
    projSpd: 7,
    splash: 1.8,
    desc: '근거리 범위',
  },
};

// ── 무한 업그레이드 공식 (레벨당 조금씩 증가) ──
// 데미지: +18%/레벨, 사거리: +6%/레벨, 공속: +10%/레벨 (최대 8.0/s)
const DMG_PER_LV   = 0.18;
const RANGE_PER_LV = 0.06;
const SPD_PER_LV   = 0.10;
const MAX_ATK_SPD  = 8.0;

// 업그레이드 비용: baseCost * 0.6 * level^1.15  (레벨 높을수록 조금씩 비싸짐)
export const getUpgradeCost = (type, currentLevel) =>
  Math.floor(TOWER_DEFS[type].cost * 0.6 * Math.pow(currentLevel, 1.15));

export const getTowerStats = (type, level) => {
  const def = TOWER_DEFS[type];
  const n   = level - 1;
  return {
    ...def,
    damage: Math.round(def.damage  * Math.pow(1 + DMG_PER_LV,   n)),
    range:  parseFloat((def.range  * Math.pow(1 + RANGE_PER_LV, n)).toFixed(1)),
    atkSpd: parseFloat(Math.min(MAX_ATK_SPD, def.atkSpd * Math.pow(1 + SPD_PER_LV, n)).toFixed(2)),
  };
};

// 레벨 티어 (시각 변화용)
export const getLevelTier = (level) => {
  if (level < 5)  return 0; // 기본  (회색)
  if (level < 10) return 1; // 실버  (은색)
  if (level < 20) return 2; // 골드  (금색)
  if (level < 35) return 3; // 플래티넘 (하늘)
  return 4;                  // 레전더리 (보라)
};

export const TIER_COLORS = ['#888888', '#cccccc', '#ffcc00', '#44ddff', '#cc44ff'];


export const WAVE_DEFS = (wave) => ({
  count: 5 + wave * 3,
  hp: 40 + wave * 25,
  speed: 1.8 + wave * 0.15,
  reward: 8 + wave * 2,
  spawnInterval: Math.max(0.3, 0.9 - wave * 0.05),
});
