import { scene, camera, renderer, resize } from './core/Scene';
import { platform } from './objects/Platform';
import { initShapeSelector } from './ui/ShapeSelector';
import { initInput } from './core/InputManager';
import { startGameLoop } from './core/GameLoop';
import { createPostProcessing } from './core/PostProcessing';

// Add platform to scene
scene.add(platform);

// Initialize post-processing
const { composer, customPass } = createPostProcessing(renderer, scene, camera);

// Initialize UI and input
initShapeSelector();
initInput();

// Start the game loop with composer
startGameLoop(renderer, scene, camera, composer, customPass);

// Handle window resize (Scene handles renderer/camera, PostProcessing handles composer)
window.addEventListener('resize', resize);