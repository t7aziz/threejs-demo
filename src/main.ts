import { scene, camera, renderer, resize } from './core/Scene';
import { platform, initPlatformPhysics } from './objects/Platform';
import { initShapeSelector } from './ui/ShapeSelector';
import { initInput } from './core/InputManager';
import { startGameLoop } from './core/GameLoop';
import { createPostProcessing } from './core/PostProcessing';
import { physicsManager } from './core/PhysicsManager';
import { createPhysicsDebugUI } from './ui/PhysicsDebugUI';

// Add platform to scene
scene.add(platform);

// Initialize post-processing
const { composer, customPass } = createPostProcessing(renderer, scene, camera);

// Initialize physics and platform physics
async function initializePhysics() {
    try {
        await physicsManager.initialize();
        initPlatformPhysics();
        console.log('Physics ready!');
    } catch (error) {
        console.error('Physics initialization failed:', error);
    }
}

// Initialize everything
initializePhysics();

// Initialize UI and input
initShapeSelector();
initInput();
createPhysicsDebugUI();

// Start the game loop with composer
startGameLoop(renderer, scene, camera, composer, customPass);

// Handle window resize (Scene handles renderer/camera, PostProcessing handles composer)
window.addEventListener('resize', resize);