import * as THREE from 'three';
import { objectManager } from './ObjectManager';
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

    function animate() {
        requestAnimationFrame(animate);

        const elapsedTime = clock.getElapsedTime();

        // Update all game objects with time
        objectManager.update(elapsedTime);

        // Update post-processing shader uniforms
        if (customPass) {
            updatePostProcessing(customPass, elapsedTime);
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