import type { ShapeType, ShaderType } from '../types';
import { eventBus } from '../core/EventBus';

let selectedShape: ShapeType = 'cube';
let selectedShader: ShaderType = 'rainbow';
let uiElement: HTMLDivElement | null = null;

function updateButtonStyles(activeId: string, buttons: HTMLElement[]) {
    buttons.forEach(btn => {
        if (btn.id === activeId) {
            btn.style.backgroundColor = '#4CAF50';
            btn.style.border = '2px solid white';
        } else {
            btn.style.backgroundColor = '#555';
            btn.style.border = '2px solid transparent';
        }
    });
}

export function initShapeSelector() {
    uiElement = document.createElement('div');
    uiElement.style.position = 'absolute';
    uiElement.style.top = '20px';
    uiElement.style.left = '20px';
    uiElement.style.padding = '15px';
    uiElement.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    uiElement.style.color = 'white';
    uiElement.style.borderRadius = '8px';
    uiElement.style.fontFamily = 'Arial, sans-serif';
    uiElement.style.userSelect = 'none';
    uiElement.innerHTML = `
      <div style="margin-bottom: 10px; font-weight: bold;">Select Shape:</div>
      <button id="cubeBtn" style="
        padding: 10px 20px;
        margin-right: 10px;
        cursor: pointer;
        border: 2px solid white;
        background-color: #4CAF50;
        color: white;
        border-radius: 4px;
        font-size: 14px;
      ">Cube</button>
      <button id="sphereBtn" style="
        padding: 10px 20px;
        cursor: pointer;
        border: 2px solid transparent;
        background-color: #555;
        color: white;
        border-radius: 4px;
        font-size: 14px;
      ">Sphere</button>
      
      <div style="margin-top: 15px; margin-bottom: 10px; font-weight: bold;">Select Shader:</div>
      <button id="noneShaderBtn" style="
        padding: 10px 20px;
        margin-right: 10px;
        margin-bottom: 5px;
        cursor: pointer;
        border: 2px solid transparent;
        background-color: #555;
        color: white;
        border-radius: 4px;
        font-size: 14px;
      ">None</button>
      <button id="rainbowShaderBtn" style="
        padding: 10px 20px;
        margin-right: 10px;
        margin-bottom: 5px;
        cursor: pointer;
        border: 2px solid white;
        background-color: #4CAF50;
        color: white;
        border-radius: 4px;
        font-size: 14px;
      ">Rainbow</button>
      <button id="fresnelShaderBtn" style="
        padding: 10px 20px;
        cursor: pointer;
        border: 2px solid transparent;
        background-color: #555;
        color: white;
        border-radius: 4px;
        font-size: 14px;
      ">Fresnel</button>
      <button id="stripesShaderBtn" style="
        padding: 10px 20px;
        margin-left: 10px;
        cursor: pointer;
        border: 2px solid transparent;
        background-color: #555;
        color: white;
        border-radius: 4px;
        font-size: 14px;
      ">Stripes</button>
    `;
    document.body.appendChild(uiElement);

    // Shape buttons
    const cubeBtn = document.getElementById('cubeBtn')!;
    const sphereBtn = document.getElementById('sphereBtn')!;
    const shapeButtons = [cubeBtn, sphereBtn];

    cubeBtn.addEventListener('click', () => {
        selectedShape = 'cube';
        updateButtonStyles('cubeBtn', shapeButtons);
    });
    sphereBtn.addEventListener('click', () => {
        selectedShape = 'sphere';
        updateButtonStyles('sphereBtn', shapeButtons);
    });

    // Shader buttons
    const noneShaderBtn = document.getElementById('noneShaderBtn')!;
    const rainbowShaderBtn = document.getElementById('rainbowShaderBtn')!;
    const fresnelShaderBtn = document.getElementById('fresnelShaderBtn')!;
    const stripesShaderBtn = document.getElementById('stripesShaderBtn')!;
    const shaderButtons = [noneShaderBtn, rainbowShaderBtn, fresnelShaderBtn, stripesShaderBtn];

    noneShaderBtn.addEventListener('click', () => {
        selectedShader = 'none';
        updateButtonStyles('noneShaderBtn', shaderButtons);
        eventBus.emit('shader-changed', { shader: 'none' });
    });
    rainbowShaderBtn.addEventListener('click', () => {
        selectedShader = 'rainbow';
        updateButtonStyles('rainbowShaderBtn', shaderButtons);
        eventBus.emit('shader-changed', { shader: 'rainbow' });
    });
    fresnelShaderBtn.addEventListener('click', () => {
        selectedShader = 'fresnel';
        updateButtonStyles('fresnelShaderBtn', shaderButtons);
        eventBus.emit('shader-changed', { shader: 'fresnel' });
    });
    stripesShaderBtn.addEventListener('click', () => {
        selectedShader = 'stripes';
        updateButtonStyles('stripesShaderBtn', shaderButtons);
        eventBus.emit('shader-changed', { shader: 'stripes' });
    });
}

export function getSelectedShape(): ShapeType {
    return selectedShape;
}

export function isClickOnUI(target: EventTarget | null): boolean {
    if (!target) return false;
    if (uiElement && target instanceof Node) {
        return uiElement.contains(target);
    }
    if (target instanceof HTMLElement) {
        return target.tagName === 'BUTTON';
    }
    return false;
}
