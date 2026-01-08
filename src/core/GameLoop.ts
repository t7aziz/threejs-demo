import * as THREE from 'three';
import { objectManager } from './ObjectManager';
import { physicsManager } from './PhysicsManager';
import type { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import type { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { updatePostProcessing } from './PostProcessing';

export function startGameLoop(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.Camera,
    composer?: EffectComposer,
    customPass?: ShaderPass
) {
    const clock = new THREE.Clock();
    let lastTime = 0;

    function animate() {
        requestAnimationFrame(animate);

        const currentTime = clock.getElapsedTime();
        const deltaTime = currentTime - lastTime;
        lastTime = currentTime;

        // Step physics simulation
        if (physicsManager.isInitialized()) {
            physicsManager.step(deltaTime);
        }

        // Update all game objects with time
        objectManager.update(currentTime);

        // Update post-processing shader uniforms
        if (customPass) {
            updatePostProcessing(customPass, currentTime);
        }

        // Render using composer if available, otherwise use renderer directly
        if (composer) {
            composer.render();
        } else {
            renderer.render(scene, camera);
        }
    }

    animate();
}