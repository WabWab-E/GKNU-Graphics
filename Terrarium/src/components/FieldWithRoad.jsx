import React, { useMemo } from 'react';
import { CONFIG } from '../constants';

export default function FieldWithRoad() {
  const ridges = useMemo(() => {
    const list = [];
    
    for (let x = -9; x <= 10; x += 1.2) {
      if (Math.abs(x) < 1.0) {
        list.push({ x, z: -5.25, length: 7.5 });
      } else {
        list.push({ x, z: -4, length: 10 }); 
      }
    } 

    for (let x = -9; x <= 10; x += 1.2) {
      list.push({ x, z: 7, length: 4 });  
    }
    
    return list;
  }, []);

  return (
    <group>
      {/* 상단 흙 층 */}
      <mesh position={[0, -2.5, 0]} receiveShadow castShadow>
        <boxGeometry args={[20, 2, 20]} />
        <meshStandardMaterial color="#3d261d" roughness={0.9} />
      </mesh>
      
      {/* 하단 지층 */}
      <mesh position={[0, -5.0, 0]} receiveShadow castShadow>
        <boxGeometry args={[20, 3, 20]} />
        <meshStandardMaterial color="#22252a" roughness={1.0} />
      </mesh>
      
      {/* 밀밭 베이스 표면 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.49, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="goldenrod" roughness={0.8} />
      </mesh>
      
      {/* 밭 */}
      {ridges.map((ridge, idx) => (
        <mesh key={idx} position={[ridge.x, -1.45, ridge.z]} castShadow receiveShadow>
          <boxGeometry args={[0.4, 0.1, ridge.length]} />
          <meshStandardMaterial color="#b8860b" roughness={0.9} />
        </mesh>
      ))}
      
      {/* 아스팔트 도로 표면 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, CONFIG.roadY, 3]} receiveShadow>
        <planeGeometry args={[20, 3]} />
        <meshStandardMaterial color="#282828" roughness={0.8} />
      </mesh>
      
      {/* 2차선 중앙 점선 */}
      {[-8, -6, -4, -2, 0, 2, 4, 6, 8].map((xPos, idx) => (
        <mesh key={idx} position={[xPos, -1.47, 3]} receiveShadow>
          <boxGeometry args={[1, 0.01, 0.08]} />
          <meshStandardMaterial color="#ffd700" roughness={1.0} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}