import { physicsManager } from '../core/PhysicsManager';
import { objectManager } from '../core/ObjectManager';
import { eventBus } from '../core/EventBus';
import * as THREE from 'three';

export function createPhysicsDebugUI() {
    const debugPanel = document.createElement('div');
    debugPanel.style.position = 'absolute';
    debugPanel.style.bottom = '20px';
    debugPanel.style.left = '20px';
    debugPanel.style.padding = '15px';
    debugPanel.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    debugPanel.style.color = 'white';
    debugPanel.style.borderRadius = '8px';
    debugPanel.style.fontFamily = 'monospace';
    debugPanel.style.fontSize = '12px';
    debugPanel.style.userSelect = 'none';

    debugPanel.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 10px;">Physics Debug</div>
        <div id="physics-status">Initializing...</div>
        <div id="object-count" style="margin-top: 5px;">Objects: 0</div>
        <button id="clear-objects" style="
            padding: 8px 12px;
            margin-top: 10px;
            cursor: pointer;
            background-color: #f44336;
            color: white;
            border: none;
            border-radius: 4px;
            width: 100%;
        ">Clear All Objects</button>
        <button id="spawn-random" style="
            padding: 8px 12px;
            margin-top: 5px;
            cursor: pointer;
            background-color: #2196F3;
            color: white;
            border: none;
            border-radius: 4px;
            width: 100%;
        ">Spawn 10 Random</button>
    `;

    document.body.appendChild(debugPanel);

    const statusDiv = document.getElementById('physics-status')!;
    const objectCountDiv = document.getElementById('object-count')!;

    // Update status
    function updateStatus() {
        if (physicsManager.isInitialized()) {
            statusDiv.textContent = '✓ Physics Active';
            statusDiv.style.color = '#4CAF50';
        } else {
            statusDiv.textContent = '✗ Physics Inactive';
            statusDiv.style.color = '#f44336';
        }

        const count = objectManager.getAll().length;
        objectCountDiv.textContent = `Objects: ${count}`;
    }

    // Update every second
    setInterval(updateStatus, 100);

    // Clear button
    document.getElementById('clear-objects')!.addEventListener('click', () => {
        objectManager.clear();
        updateStatus();
    });

    // Spawn random objects
    document.getElementById('spawn-random')!.addEventListener('click', () => {
        for (let i = 0; i < 10; i++) {
            const x = (Math.random() - 0.5) * 6;
            const z = (Math.random() - 6);
            const shape = Math.random() > 0.5 ? 'cube' : 'sphere';

            eventBus.emit('spawn-object', {
                shape,
                position: new THREE.Vector3(x, -15, z)
            });
        }

        updateStatus();
    });

    updateStatus();
}