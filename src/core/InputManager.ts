import * as THREE from 'three';
import { camera } from './Scene';
import { platform } from '../objects/Platform';
import { initShapeSelector, getSelectedShape, isClickOnUI } from '../ui/ShapeSelector';
import { objectManager } from './ObjectManager';
import { eventBus } from './EventBus';
import type { ShapeType } from '../types';

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

export function initInput() {
    window.addEventListener('click', (event) => {
        if (isClickOnUI(event.target)) return;

        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);

        const intersects = raycaster.intersectObjects([platform, ...objectManager.getAll()]);

        if (intersects.length > 0) {
            const clickedObject = intersects[0]!.object;

            // Handle clicks on platform
            if (clickedObject === platform) {
                const point = intersects[0]!.point;
                const selectedShape = getSelectedShape() as ShapeType;
                eventBus.emit('spawn-object', { shape: selectedShape, position: point });
            }
            // Handle clicks on spawned objects
            else if (objectManager.getAll().includes(clickedObject as THREE.Mesh)) {
                eventBus.emit('object:clicked', { object: clickedObject });
            }
        }
    });
}
