import * as THREE from 'three';
import type { ShapeType, ShaderType } from '../types';
import { createRainbowMaterial } from '../shaders/RainbowShader';
import { createFresnelMaterial } from '../shaders/FresnelShader';
import { physicsManager } from '../core/PhysicsManager';

export function createSpawnableObject(
    type: ShapeType,
    position: THREE.Vector3,
    shaderType: ShaderType = 'none',
    color?: number,
    withPhysics: boolean = true
): THREE.Mesh {
    let geometry: THREE.BufferGeometry;
    if (type === 'cube') {
        geometry = new THREE.BoxGeometry(1, 1, 1);
    } else {
        geometry = new THREE.SphereGeometry(0.5, 32, 32);
    }

    let material: THREE.Material;

    if (shaderType === 'rainbow') {
        material = createRainbowMaterial();
    } else if (shaderType === 'fresnel') {
        const baseColor = new THREE.Color(color ?? Math.random() * 0xffffff);
        material = createFresnelMaterial(baseColor);
    } else {
        material = new THREE.MeshStandardMaterial({
            color: color ?? Math.random() * 0xffffff
        });
    }

    const object = new THREE.Mesh(geometry, material);

    // Position higher up so objects fall into the bowl
    const yOffset = 3.0;
    object.position.set(position.x, position.y + yOffset, position.z);

    // Add physics if requested
    if (withPhysics && physicsManager.isInitialized()) {
        physicsManager.createDynamicBody(object, type === 'cube' ? 'box' : 'sphere', 1.0);
    }

    return object;
}