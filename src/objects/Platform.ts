import * as THREE from 'three';
import { physicsManager } from '../core/PhysicsManager';

// FLAT PLATFORM
// const planeGeometry = new THREE.PlaneGeometry(20, 20);
// const planeMaterial = new THREE.MeshStandardMaterial({
//     color: 0x2d8659,
//     side: THREE.DoubleSide
// });
// export const platform = new THREE.Mesh(planeGeometry, planeMaterial);
// platform.rotation.x = -Math.PI / 2;
// platform.position.y = 0;

const radius = 10;
const segments = 64;

// Create a hemisphere (bowl) geometry
const geometry = new THREE.SphereGeometry(radius, segments, segments, 0, Math.PI * 2, 0, Math.PI / 2);

const material = new THREE.MeshStandardMaterial({
    color: 0x2d8659,
    side: THREE.DoubleSide,
    wireframe: false
});

export const platform = new THREE.Mesh(geometry, material);
platform.rotation.x = Math.PI; // Flip upside down to create a bowl
platform.position.y = -radius; // Position so the bowl rim is at y=0
platform.position.z = -radius;

// Function to initialize platform physics (called after physics manager is ready)
export function initPlatformPhysics(): void {
    // Extract vertices and indices from the geometry
    const positionAttribute = geometry.getAttribute('position');
    const vertices = new Float32Array(positionAttribute.array);

    const index = geometry.index;
    const indices = index ? new Uint32Array(index.array) : new Uint32Array(0);

    // Create static physics body for the platform
    physicsManager.createStaticBody(platform, vertices, indices);

    console.log('Platform physics initialized');
}