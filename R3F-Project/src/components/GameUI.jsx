import { useStore } from '../store';
import { TOWER_DEFS } from '../constants';

const TOWER_KEYS = [
  { type: 1, key: '1' },
  { type: 2, key: '2' },
  { type: 3, key: '3' },
];

const S = {
  root: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    pointerEvents: 'none',
    fontFamily: "'Courier New', monospace",
    userSelect: 'none',
  },
  hud: {
    display: 'flex', alignItems: 'center', gap: 20,
    padding: '10px 16px',
    background: 'rgba(0,0,0,0.75)',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    color: '#eee', fontSize: 14,
  },
  hudItem: { display: 'flex', alignItems: 'center', gap: 6 },
  hint: { marginLeft: 'auto', color: '#555', fontSize: 11 },
  towerBar: {
    position: 'absolute', bottom: 16, left: 16,
    display: 'flex', gap: 8,
    pointerEvents: 'auto',
  },
  waveBtn: {
    position: 'absolute', bottom: 16, right: 16,
    pointerEvents: 'auto',
  },
  overlay: {
    position: 'absolute',
    top: '50%', left: '50%',
    transform: 'translate(-50%, -50%)',
    background: 'rgba(0,0,0,0.9)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 10, padding: '18px 28px',
    color: '#fff', textAlign: 'center',
    fontSize: 18, fontWeight: 'bold',
  },
  controls: {
    position: 'absolute', top: 50, right: 14,
    color: 'rgba(255,255,255,0.25)', fontSize: 10,
    textAlign: 'right', lineHeight: 2,
  },
};

export default function GameUI() {
  const gold         = useStore(s => s.gold);
  const lives        = useStore(s => s.lives);
  const wave         = useStore(s => s.wave);
  const score        = useStore(s => s.score);
  const phase        = useStore(s => s.phase);
  const selectedType = useStore(s => s.selectedType);
  const message      = useStore(s => s.message);
  const selectType   = useStore(s => s.selectType);
  const startWave    = useStore(s => s.startWave);
  const reset        = useStore(s => s.reset);
  const gameSpeed    = useStore(s => s.gameSpeed);
  const setGameSpeed = useStore(s => s.setGameSpeed);

  return (
    <div style={S.root}>
      {/* Top HUD */}
      <div style={S.hud}>
        <div style={S.hudItem}>💰 <b>{gold}</b></div>
        <div style={S.hudItem}>❤️ <b>{lives}</b></div>
        <div style={S.hudItem}>🌊 웨이브 <b>{wave}</b></div>
        <div style={S.hudItem}>⭐ <b>{score}</b></div>
        <div style={S.hint}>
          {phase === 'idle'  && 'SPACE: 웨이브 시작'}
          {phase === 'wave'  && '⚔️  전투 중...'}
          {phase === 'gameover' && '💀 게임 오버'}
        </div>

        {/* 배속 버튼 */}
        <div style={{ display: 'flex', gap: 4, marginLeft: 8, pointerEvents: 'auto' }}>
          {[1, 2, 3, 4, 5].map(s => (
            <button key={s} onClick={() => setGameSpeed(s)} style={{
              background: gameSpeed === s ? 'rgba(255,200,40,0.25)' : 'rgba(0,0,0,0.5)',
              border: `1px solid ${gameSpeed === s ? '#ffcc28' : 'rgba(255,255,255,0.15)'}`,
              color: gameSpeed === s ? '#ffcc28' : '#888',
              borderRadius: 4, padding: '2px 7px',
              cursor: 'pointer', fontSize: 11,
              fontFamily: 'inherit', fontWeight: gameSpeed === s ? 'bold' : 'normal',
              transition: 'all 0.1s',
            }}>
              {s}×
            </button>
          ))}
        </div>
      </div>

      {/* Tower selection */}
      <div style={S.towerBar}>
        {TOWER_KEYS.map(({ type, key }) => {
          const def = TOWER_DEFS[type];
          const sel = selectedType === type;
          return (
            <button key={type} onClick={() => selectType(type)} style={{
              background: sel ? 'rgba(40,100,220,0.3)' : 'rgba(0,0,0,0.75)',
              border: `2px solid ${sel ? def.color : 'rgba(255,255,255,0.15)'}`,
              color: '#eee', borderRadius: 7, padding: '8px 12px',
              cursor: 'pointer', fontSize: 11, minWidth: 88, textAlign: 'left',
              fontFamily: 'inherit', transition: 'all 0.15s',
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: 2 }}>[{key}] {def.name}</div>
              <div style={{ color: '#ffdd44' }}>💰 {def.cost}</div>
              <div style={{ color: '#aaa', fontSize: 9 }}>{def.desc}</div>
            </button>
          );
        })}
      </div>

      {/* Start wave button */}
      {phase === 'idle' && (
        <div style={S.waveBtn}>
          <button onClick={startWave} style={{
            background: 'rgba(30,180,80,0.18)',
            border: '2px solid #33ff88', color: '#33ff88',
            borderRadius: 8, padding: '12px 28px',
            cursor: 'pointer', fontSize: 16,
            fontFamily: 'inherit', fontWeight: 'bold',
          }}>
            ▶ 웨이브 {wave + 1} 시작
          </button>
        </div>
      )}

      {/* Message / Game over overlay */}
      {message && (
        <div style={S.overlay}>
          {message}
          {phase === 'gameover' && (
            <div style={{ marginTop: 14 }}>
              <button onClick={reset} style={{
                pointerEvents: 'auto',
                background: '#8b0000', color: '#fff', border: 'none',
                borderRadius: 6, padding: '9px 22px',
                cursor: 'pointer', fontSize: 14, fontFamily: 'inherit',
              }}>
                [R] 다시 시작
              </button>
            </div>
          )}
        </div>
      )}

      {/* Controls hint */}
      <div style={S.controls}>
        <div>1 / 2 / 3  타워 선택</div>
        <div>클릭       타워 배치</div>
        <div>타워 클릭  판매 메뉴</div>
        <div>SPACE      웨이브 시작</div>
        <div>드래그     카메라 회전</div>
        <div>스크롤     줌</div>
      </div>
    </div>
  );
}
