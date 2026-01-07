import * as THREE from 'three';

const planeGeometry = new THREE.PlaneGeometry(20, 20);
const planeMaterial = new THREE.MeshStandardMaterial({
    color: 0x2d8659,
    side: THREE.DoubleSide
});
export const platform = new THREE.Mesh(planeGeometry, planeMaterial);
platform.rotation.x = -Math.PI / 2;
platform.position.y = 0;
