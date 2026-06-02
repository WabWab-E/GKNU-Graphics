import * as THREE from 'three';

export const globalTimeRef = { current: 0 }; 

export const CONFIG = {
  skyDay: new THREE.Color('#87ceeb'),
  skyNight: new THREE.Color('#030712'),
  ambientDay: new THREE.Color('#ffffff'),
  ambientNight: new THREE.Color('#3a415a'),
  carColors: ['#ff0000', '#0000ff', '#fbc02d', '#4caf50', '#ffffff', '#212121', '#9c27b0', '#ff5722'],
  roadY: -1.48,      
  wheelRadius: 0.15, 
  boundX: 20,        
};

export const CAR_BASE_Y = CONFIG.roadY;

export const clippingPlanes = [
  new THREE.Plane(new THREE.Vector3(1, 0, 0), 10),    
  new THREE.Plane(new THREE.Vector3(-1, 0, 0), 10),   
  new THREE.Plane(new THREE.Vector3(0, 1, 0), 6.5),   
  new THREE.Plane(new THREE.Vector3(0, -1, 0), 13.5), 
  new THREE.Plane(new THREE.Vector3(0, 0, 1), 10),    
  new THREE.Plane(new THREE.Vector3(0, 0, -1), 10),   
];