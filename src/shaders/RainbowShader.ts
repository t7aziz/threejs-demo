import * as THREE from 'three';

export const rainbowVertexShader = `
varying vec3 vPosition;
varying vec3 vNormal;

void main() {
    vPosition = position;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const rainbowFragmentShader = `
uniform float uTime;
varying vec3 vPosition;
varying vec3 vNormal;

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
    // Create animated rainbow based on position and time
    float hue = fract(vPosition.x * 0.1 + vPosition.z * 0.1 + uTime * 0.2);
    vec3 color = hsv2rgb(vec3(hue, 0.8, 0.9));
    
    // Add simple lighting
    vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
    float diff = max(dot(vNormal, lightDir), 0.3);
    color *= diff;
    
    gl_FragColor = vec4(color, 1.0);
}
`;

export function createRainbowMaterial(): THREE.ShaderMaterial {
    return new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0.0 }
        },
        vertexShader: rainbowVertexShader,
        fragmentShader: rainbowFragmentShader
    });
}