import React from 'react';

export default function DashboardUI({ timeMode, setTimeMode, globalSpeed, setGlobalSpeed, uiPhase }) {
  // 상태별 색상 테마 동적 변경
  const getPhaseTheme = () => {
    if (uiPhase.includes('낮')) return { color: '#ffe082', bg: 'rgba(255, 193, 7, 0.18)', border: '#ffca28' };
    if (uiPhase.includes('밤')) return { color: '#9fa8da', bg: 'rgba(63, 81, 181, 0.25)', border: '#5c6bc0' };
    return { color: '#ffcc80', bg: 'rgba(255, 152, 0, 0.2)', border: '#ffb74d' }; // 일출/일몰
  };

  const theme = getPhaseTheme();

  return (
    <div style={{
      position: 'absolute', top: '20px', left: '20px', zIndex: 10,
      background: 'rgba(20, 24, 33, 0.88)', padding: '20px', borderRadius: '14px',
      border: '1px solid rgba(255,255,255,0.15)', color: '#ffffff', fontFamily: 'sans-serif',
      boxShadow: '0 12px 40px rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', width: '260px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <span style={{ fontSize: '13px', color: '#aaa' }}>현재 환경 상태:</span>
        <span style={{ fontSize: '14px', fontWeight: 'bold', color: theme.color, background: theme.bg, padding: '4px 12px', borderRadius: '20px', border: `1px solid ${theme.border}` }}>
          {uiPhase}
        </span>
      </div>
      
      <div style={{ fontSize: '12px', color: '#ccc', marginBottom: '8px', fontWeight: '600' }}>환경 시간 제어</div>
      <div style={{ display: 'flex', gap: '6px', marginBottom: '20px' }}>
        {['auto', 'day', 'night'].map((mode) => (
          <button key={mode} onClick={() => setTimeMode(mode)}
            style={{
              flex: 1, cursor: 'pointer', padding: '8px 0', borderRadius: '6px', border: 'none',
              fontSize: '11px', fontWeight: '600', transition: 'all 0.2s',
              background: timeMode === mode ? '#ffffff' : 'rgba(255,255,255,0.08)',
              color: timeMode === mode ? '#111318' : '#ffffff',
            }}
          >
            {mode === 'auto' ? '🔄 자동순환' : mode === 'day' ? '낮 고정' : '밤 고정'}
          </button>
        ))}
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#ccc', marginBottom: '6px', fontWeight: '600' }}>
          <span>🏃 전체 애니메이션 배속</span>
          <span style={{ color: '#4fc3f7', fontFamily: 'monospace' }}>{globalSpeed.toFixed(1)}x</span>
        </div>
        <input type="range" min="0.0" max="3.0" step="0.1" value={globalSpeed} onChange={(e) => setGlobalSpeed(parseFloat(e.target.value))} style={{ width: '100%', cursor: 'pointer', accentColor: '#4fc3f7' }} />
      </div>
    </div>
  );
}