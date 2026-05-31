import { createContext, useContext, useRef } from 'react';

const GameCtx = createContext(null);

export const GameProvider = ({ children }) => {
  // Shared Map<enemyId, {x, z}> — written by Enemy, read by Tower/Projectile
  const enemyPositions = useRef(new Map());
  return <GameCtx.Provider value={{ enemyPositions }}>{children}</GameCtx.Provider>;
};

export const useGameCtx = () => {
  const ctx = useContext(GameCtx);
  if (!ctx) throw new Error('useGameCtx outside GameProvider');
  return ctx;
};
