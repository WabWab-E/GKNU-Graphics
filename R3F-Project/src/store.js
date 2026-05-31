import { create } from 'zustand';
import { MAP, TOWER_DEFS, WAVE_DEFS, getUpgradeCost } from './constants';

let _id = 0;
const uid = () => String(++_id);

export const useStore = create((set, get) => ({
  gold: 150,
  lives: 20,
  wave: 0,
  score: 0,
  phase: 'idle',
  selectedType: 1,
  message: '',
  gameSpeed: 1,
  _msgTimer: null,

  towers: [],
  enemies: [],
  projectiles: [],
  particles: [],

  // ─── UI ───
  showMessage: (msg, duration = 2500) => {
    const prev = get()._msgTimer;
    if (prev) clearTimeout(prev);
    const t = setTimeout(() => set({ message: '', _msgTimer: null }), duration);
    set({ message: msg, _msgTimer: t });
  },

  selectType: (t) => set({ selectedType: t }),
  setGameSpeed: (s) => set({ gameSpeed: s }),

  // ─── Tower ───
  placeTower: (col, row) => {
    const { gold, towers, selectedType } = get();
    const def = TOWER_DEFS[selectedType];
    if (gold < def.cost) { get().showMessage('💰 골드 부족!'); return false; }
    if (towers.some(t => t.col === col && t.row === row)) return false;
    if (!MAP[row] || MAP[row][col] !== 0) return false;
    set(s => ({
      gold: s.gold - def.cost,
      towers: [...s.towers, { id: uid(), col, row, type: selectedType, level: 1 }],
    }));
    return true;
  },

  sellTower: (id) => {
    const t = get().towers.find(t => t.id === id);
    if (!t) return;
    const refund = Math.floor(TOWER_DEFS[t.type].cost * 0.6);
    set(s => ({ gold: s.gold + refund, towers: s.towers.filter(x => x.id !== id) }));
    get().showMessage(`타워 판매 +${refund}💰`);
  },

  upgradeTower: (id) => {
    const t = get().towers.find(t => t.id === id);
    if (!t) return false;
    const cost = getUpgradeCost(t.type, t.level);
    if (get().gold < cost) { get().showMessage('💰 골드 부족!'); return false; }
    set(s => ({
      gold: s.gold - cost,
      towers: s.towers.map(x => x.id === id ? { ...x, level: x.level + 1 } : x),
    }));
    get().showMessage(`⬆️ ${TOWER_DEFS[t.type].name} Lv.${t.level + 1}!`);
    return true;
  },


  startWave: () => {
    if (get().phase !== 'idle') return;
    set(s => ({ phase: 'wave', wave: s.wave + 1 }));
  },

  completeWave: () => {
    const { wave } = get();
    const bonus = 50 + wave * 10;
    set(s => ({ phase: 'idle', gold: s.gold + bonus }));
    get().showMessage(`✅ 웨이브 ${wave} 클리어! +${bonus}💰`);
  },

  // ─── Enemy ───
  addEnemy: (data) => set(s => ({
    enemies: [...s.enemies, { id: uid(), ...data }],
  })),

  damageEnemy: (id, dmg) => {
    const enemy = get().enemies.find(e => e.id === id);
    if (!enemy) return false;
    if (enemy.hp <= dmg) {
      set(s => ({
        enemies: s.enemies.filter(e => e.id !== id),
        gold: s.gold + enemy.reward,
        score: s.score + enemy.reward,
      }));
      return true;
    }
    set(s => ({ enemies: s.enemies.map(e => e.id === id ? { ...e, hp: e.hp - dmg } : e) }));
    return false;
  },

  enemyEscaped: (id) => {
    const newLives = get().lives - 1;
    set(s => ({
      lives: newLives,
      enemies: s.enemies.filter(e => e.id !== id),
      phase: newLives <= 0 ? 'gameover' : s.phase,
    }));
    if (newLives <= 0) get().showMessage('💀 게임 오버!', 999999);
    else get().showMessage(`💀 적 통과! 남은 목숨: ${newLives}`);
  },

  // ─── Projectile ───
  spawnProjectile: (towerId, towerPos, enemyId, type, damage, splash) =>
    set(s => ({ projectiles: [...s.projectiles, { id: uid(), towerId, towerPos, enemyId, type, damage, splash }] })),

  removeProjectile: (id) =>
    set(s => ({ projectiles: s.projectiles.filter(p => p.id !== id) })),

  // ─── Particles ───
  spawnParticles: (position) =>
    set(s => ({ particles: [...s.particles, { id: uid(), position }] })),

  removeParticles: (id) =>
    set(s => ({ particles: s.particles.filter(p => p.id !== id) })),

  // ─── Reset ───
  reset: () => {
    _id = 0;
    set({
      gold: 150, lives: 20, wave: 0, score: 0,
      phase: 'idle', selectedType: 1, message: '', gameSpeed: 1,
      towers: [], enemies: [], projectiles: [], particles: [],
    });
  },
}));
