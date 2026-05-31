import { useMemo, useState } from 'react';
import { useStore } from '../store';
import { MAP, GRID_W, GRID_H, gridToWorld } from '../constants';

export default function Grid() {
  const placeTower   = useStore(s => s.placeTower);
  const towers       = useStore(s => s.towers);
  const [hovered, setHovered] = useState(null);

  const tiles = useMemo(() => {
    const res = [];
    for (let row = 0; row < GRID_H; row++)
      for (let col = 0; col < GRID_W; col++) {
        const isPath = MAP[row][col] === 1;
        const [wx, , wz] = gridToWorld(col, row);
        res.push({ col, row, isPath, wx, wz });
      }
    return res;
  }, []);

  return (
    <group>
      {tiles.map(({ col, row, isPath, wx, wz }) => {
        const occupied = towers.some(t => t.col === col && t.row === row);
        const hover    = hovered?.col === col && hovered?.row === row;
        const canBuild = !isPath && !occupied;

        const color = isPath
          ? '#1a0e06'
          : occupied
            ? '#0d1a2a'
            : hover
              ? '#1a5533'
              : '#0d2a18';

        return (
          <mesh
            key={`${col}-${row}`}
            position={[wx, 0, wz]}
            rotation={[-Math.PI / 2, 0, 0]}
            receiveShadow
            onClick={(e) => { e.stopPropagation(); if (canBuild) placeTower(col, row); }}
            onPointerEnter={(e) => { e.stopPropagation(); setHovered({ col, row }); }}
            onPointerLeave={() => setHovered(null)}
          >
            <planeGeometry args={[0.96, 0.96]} />
            <meshStandardMaterial
              color={color}
              roughness={0.9}
              metalness={0.05}
              emissive={isPath ? '#331100' : hover && canBuild ? '#113322' : '#000000'}
              emissiveIntensity={isPath ? 0.3 : hover && canBuild ? 0.4 : 0}
            />
          </mesh>
        );
      })}

      {/* Subtle grid lines */}
      <gridHelper
        args={[GRID_W, GRID_W, '#111a11', '#0d150d']}
        position={[0, 0.005, 0]}
      />

      {/* Entry / Exit markers */}
      <mesh position={[-8, 0.01, -2.5]} rotation={[-Math.PI/2, 0, 0]}>
        <planeGeometry args={[0.9, 0.9]} />
        <meshStandardMaterial color="#00ff44" emissive="#00ff44" emissiveIntensity={0.6} />
      </mesh>
      <mesh position={[7.5, 0.01, 3.5]} rotation={[-Math.PI/2, 0, 0]}>
        <planeGeometry args={[0.9, 0.9]} />
        <meshStandardMaterial color="#ff3333" emissive="#ff3333" emissiveIntensity={0.6} />
      </mesh>
    </group>
  );
}
