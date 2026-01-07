import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';

// Vignette + Chromatic Aberration Shader
const customShader = {
    uniforms: {
        tDiffuse: { value: null },
        uTime: { value: 0.0 },
        uResolution: { value: new THREE.Vector2() }
    },
    vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float uTime;
        uniform vec2 uResolution;
        varying vec2 vUv;

        void main() {
            vec2 uv = vUv;
            
            // Chromatic aberration
            float aberrationAmount = 0.002;
            vec2 direction = uv - 0.5;
            float dist = length(direction);
            
            vec2 uvR = uv + direction * aberrationAmount * dist;
            vec2 uvG = uv;
            vec2 uvB = uv - direction * aberrationAmount * dist;
            
            float r = texture2D(tDiffuse, uvR).r;
            float g = texture2D(tDiffuse, uvG).g;
            float b = texture2D(tDiffuse, uvB).b;
            
            vec3 color = vec3(r, g, b);
            
            // Vignette effect
            float vignette = smoothstep(0.8, 0.2, dist);
            color *= vignette;
            
            gl_FragColor = vec4(color, 1.0);
        }
    `
};

let composer: EffectComposer | null = null;
let customPass: ShaderPass | null = null;

export function createPostProcessing(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.Camera
): { composer: EffectComposer; customPass: ShaderPass } {
    composer = new EffectComposer(renderer);

    // First pass: render the scene normally
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    // Second pass: apply custom shader effects
    customPass = new ShaderPass(customShader);
    customPass.uniforms.uResolution!.value.set(window.innerWidth, window.innerHeight);
    composer.addPass(customPass);

    // Set up resize listener
    window.addEventListener('resize', handleResize);

    return { composer, customPass };
}

function handleResize(): void {
    if (composer && customPass) {
        composer.setSize(window.innerWidth, window.innerHeight);
        customPass.uniforms.uResolution!.value.set(window.innerWidth, window.innerHeight);
    }
}

export function updatePostProcessing(customPass: ShaderPass, time: number): void {
    customPass.uniforms.uTime!.value = time;
}