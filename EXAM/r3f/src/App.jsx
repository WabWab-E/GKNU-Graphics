import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { WebGPURenderer } from 'three/webgpu';

function WebGPUBridge() {
  const { gl, size, scene, camera } = useThree();

  useMemo(async () => {
    const webgpuRenderer = new WebGPURenderer({
      canvas: gl.domElement,
      antialias: true,
    });
    
    await webgpuRenderer.init();
    
    gl.render = (s, c) => webgpuRenderer.render(s, c);
  }, [gl]);

  return null;
}

function RainbowTriangle() {
  const meshRef = useRef();
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const verts = new Float32Array([0.0, 0.666, 0.0, -0.5, -0.333, 0.0, 0.5, -0.333, 0.0]);
    const cols = new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]);
    geo.setAttribute('position', new THREE.BufferAttribute(verts, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(cols, 3));
    return geo;
  }, []);

  useFrame(() => {
    if (meshRef.current) meshRef.current.rotation.z -= 0.02;
  });

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshBasicMaterial vertexColors={true} side={THREE.DoubleSide} />
    </mesh>
  );
}

export default function App() {
  return (
    <Canvas camera={{ position: [0, 0, 2] }}>
      <WebGPUBridge />
      <RainbowTriangle />
    </Canvas>
  );
}
