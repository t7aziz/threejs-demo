import * as THREE from 'three';

export const fresnelVertexShader = `
varying vec3 vNormal;
varying vec3 vViewPosition;

void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
}
`;

export const fresnelFragmentShader = `
uniform float uTime;
uniform vec3 uColor;
varying vec3 vNormal;
varying vec3 vViewPosition;

void main() {
    // Fresnel effect - edges glow more than center
    vec3 viewDir = normalize(vViewPosition);
    float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), 3.0);
    
    // Animated glow intensity
    float glowIntensity = 0.5 + 0.5 * sin(uTime * 2.0);
    
    // Mix base color with glow
    vec3 glowColor = vec3(0.3, 0.8, 1.0); // Cyan glow
    vec3 finalColor = mix(uColor, glowColor, fresnel * glowIntensity);
    
    gl_FragColor = vec4(finalColor, 1.0);
}
`;

export function createFresnelMaterial(color: THREE.Color): THREE.ShaderMaterial {
    return new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0.0 },
            uColor: { value: new THREE.Vector3(color.r, color.g, color.b) }
        },
        vertexShader: fresnelVertexShader,
        fragmentShader: fresnelFragmentShader
    });
}