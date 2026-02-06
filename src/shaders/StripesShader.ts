import * as THREE from 'three';

export const stripesVertexShader = `
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vWorldPos;
varying vec3 vWorldNormal;

void main() {
    vPosition = position;
    vNormal = normalize(normalMatrix * normal);

    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const stripesFragmentShader = `
uniform float uTime;
uniform vec3 uColorA;
uniform vec3 uColorB;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vWorldPos;
varying vec3 vWorldNormal;

// Hash and noise utilities
float hash11(float p) {
    p = fract(p * 0.1031);
    p *= p + 33.33;
    p *= p + p;
    return fract(p);
}

float hash31(vec3 p) {
    p = fract(p * 0.1031);
    p += dot(p, p.yzx + 33.33);
    return fract((p.x + p.y) * p.z);
}

float noise(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    vec3 u = f * f * (3.0 - 2.0 * f);

    float n000 = hash31(i + vec3(0.0, 0.0, 0.0));
    float n100 = hash31(i + vec3(1.0, 0.0, 0.0));
    float n010 = hash31(i + vec3(0.0, 1.0, 0.0));
    float n110 = hash31(i + vec3(1.0, 1.0, 0.0));
    float n001 = hash31(i + vec3(0.0, 0.0, 1.0));
    float n101 = hash31(i + vec3(1.0, 0.0, 1.0));
    float n011 = hash31(i + vec3(0.0, 1.0, 1.0));
    float n111 = hash31(i + vec3(1.0, 1.0, 1.0));

    float nx00 = mix(n000, n100, u.x);
    float nx10 = mix(n010, n110, u.x);
    float nx01 = mix(n001, n101, u.x);
    float nx11 = mix(n011, n111, u.x);
    float nxy0 = mix(nx00, nx10, u.y);
    float nxy1 = mix(nx01, nx11, u.y);
    return mix(nxy0, nxy1, u.z);
}

float fbm(vec3 p) {
    float f = 0.0;
    float a = 0.5;
    for (int i = 0; i < 6; i++) {
        f += a * noise(p);
        p = p * 2.02 + vec3(17.0, 13.0, 11.0);
        a *= 0.5;
    }
    return f;
}

// Triplanar sampling of a procedural stripe function
float stripes3D(vec3 p) {
    float t = uTime * 0.6;
    vec3 q = p * 2.0;
    float n = fbm(q + t);
    float s = sin((q.y + n * 0.6 + t) * 8.0);
    return smoothstep(-0.2, 0.2, s);
}

vec3 triplanarStripe(vec3 p, vec3 n) {
    vec3 blend = abs(n);
    blend = pow(blend, vec3(4.0));
    blend /= (blend.x + blend.y + blend.z + 0.0001);

    float sx = stripes3D(vec3(p.y, p.z, p.x));
    float sy = stripes3D(vec3(p.x, p.z, p.y));
    float sz = stripes3D(vec3(p.x, p.y, p.z));
    float s = sx * blend.x + sy * blend.y + sz * blend.z;
    return mix(uColorA, uColorB, s);
}

// Fresnel term
float fresnel(vec3 n, vec3 v, float power) {
    return pow(1.0 - max(dot(n, v), 0.0), power);
}

// Fake ambient occlusion based on noise
float fakeAO(vec3 p) {
    float o = fbm(p * 1.2 + 12.3);
    return mix(0.6, 1.0, o);
}

void main() {
    vec3 n = normalize(vWorldNormal);
    vec3 viewDir = normalize(cameraPosition - vWorldPos);

    // Complex base pattern: triplanar stripes + domain warping
    vec3 warp = vec3(
        fbm(vWorldPos * 1.3 + uTime * 0.2),
        fbm(vWorldPos * 1.7 - uTime * 0.15),
        fbm(vWorldPos * 2.1 + uTime * 0.1)
    );
    vec3 warpedPos = vWorldPos + (warp - 0.5) * 0.6;
    vec3 baseColor = triplanarStripe(warpedPos, n);

    // Subtle iridescence shift
    float ir = fbm(vWorldPos * 3.0 + uTime);
    vec3 irColor = vec3(0.2, 0.6, 1.0) * ir + vec3(1.0, 0.2, 0.4) * (1.0 - ir);
    baseColor = mix(baseColor, irColor, 0.2);

    // Lighting: directional + rim + specular
    vec3 lightDir = normalize(vec3(0.4, 1.0, 0.6));
    float diff = max(dot(n, lightDir), 0.0);

    vec3 halfDir = normalize(lightDir + viewDir);
    float spec = pow(max(dot(n, halfDir), 0.0), 64.0);

    float rim = fresnel(n, viewDir, 2.5);

    // Procedural sparkle
    float sparkle = step(0.995, noise(vWorldPos * 25.0 + uTime * 2.5));

    float ao = fakeAO(vWorldPos);

    vec3 color = baseColor * (0.35 + diff * 0.85) * ao;
    color += vec3(1.0) * spec * 0.35;
    color += vec3(0.5, 0.9, 1.0) * rim * 0.4;
    color += vec3(1.0) * sparkle * 0.6;

    // Tone mapping-ish curve
    color = color / (color + vec3(1.0));

    gl_FragColor = vec4(color, 1.0);
}
`;

export function createStripesMaterial(): THREE.ShaderMaterial {
    return new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0.0 },
            uColorA: { value: new THREE.Vector3(0.15, 0.8, 0.9) },
            uColorB: { value: new THREE.Vector3(0.9, 0.2, 0.6) }
        },
        vertexShader: stripesVertexShader,
        fragmentShader: stripesFragmentShader
    });
}
