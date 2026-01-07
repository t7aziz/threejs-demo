import * as THREE from 'three';
import { scene } from './Scene';
import { createSpawnableObject } from '../objects/SpawnableObject';
import { eventBus } from './EventBus';
import type { ShapeType, ShaderType } from '../types';

class ObjectManager {
    private objects: THREE.Mesh[] = [];
    private currentShader: ShaderType = 'rainbow'; // Default shader

    constructor() {
        // Listen for spawn requests from input or other systems
        eventBus.on('spawn-object', (data: { shape: ShapeType; position: THREE.Vector3 }) => {
            this.spawnObject(data.shape, data.position);
        });

        // Listen for object deletion requests
        eventBus.on('delete-object', (data: { object: THREE.Mesh }) => {
            this.deleteObject(data.object);
        });

        // Listen for shader changes
        eventBus.on('shader-changed', (data: { shader: ShaderType }) => {
            this.currentShader = data.shader;
        });
    }

    private spawnObject(shape: ShapeType, position: THREE.Vector3): void {
        const object = createSpawnableObject(shape, position, this.currentShader);
        scene.add(object);
        this.objects.push(object);
        eventBus.emit('object:created', { object });
    }

    private deleteObject(object: THREE.Mesh): void {
        const index = this.objects.indexOf(object);
        if (index > -1) {
            scene.remove(object);
            this.objects.splice(index, 1);
            eventBus.emit('object:deleted', { object });
        }
    }

    getAll(): THREE.Mesh[] {
        return this.objects;
    }

    update(deltaTime: number): void {
        // Update shader uniforms for all objects
        this.objects.forEach(obj => {
            obj.rotation.y += 0.01;

            // Update shader time uniform if material is ShaderMaterial
            if (obj.material instanceof THREE.ShaderMaterial) {
                if (obj.material.uniforms.uTime) {
                    obj.material.uniforms.uTime.value = deltaTime;
                }
            }
        });
    }
}

export const objectManager = new ObjectManager();