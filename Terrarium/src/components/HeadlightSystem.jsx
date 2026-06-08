import React from 'react';

export default function HeadlightSystem({ config, headlightRef, targetRef, bulbMat }) {
  return (
    <group name="headlight-system" position={config.headlightPos}>
      <spotLight 
        ref={headlightRef} 
        angle={0.5} penumbra={0.8} distance={13} 
        color="#fffde7" castShadow shadow-bias={-0.001}
      />
      <object3D ref={targetRef} position={[4, -0.5, 0]} />

      {config.bulbPositions.map((pos, idx) => (
        <mesh key={idx} material={bulbMat} position={pos}>
          <boxGeometry args={[0.04, 0.12, 0.15]} />
        </mesh>
      ))}
    </group>
  );
}