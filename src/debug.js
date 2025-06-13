import { drawQueueConstructor } from './drawRequestor';

let debugX = 100;
let debugY = 100;
let currentDebugObj = null;
let _mainGameDrawQueue = null; // drawQueue from main.js

// Debu UI
const debugXInput = document.getElementById('debugX');
const debugYInput = document.getElementById('debugY');
const debugXValueSpan = document.getElementById('debugXValue');
const debugYValueSpan = document.getElementById('debugYValue');

export function initDebug(drawQueueInstance) {
    // <-- Receives the drawQueue instance from main.js
    _mainGameDrawQueue = drawQueueInstance; // Store it for internal use

    // Set up event listeners *after* the queue is available
    debugXInput.addEventListener('input', e => {
        debugX = parseFloat(e.target.value);
        debugXValueSpan.textContent = debugX;
        updateDebugPointPosition();
    });

    debugYInput.addEventListener('input', e => {
        debugY = parseFloat(e.target.value);
        debugYValueSpan.textContent = debugY;
        updateDebugPointPosition();
    });

    // Sync initial UI values
    debugXInput.value = debugX;
    debugYInput.value = debugY;
    debugXValueSpan.textContent = debugX;
    debugYValueSpan.textContent = debugY;

    updateDebugPointPosition();
    console.log(
        'DEBUG.JS: Initialized with drawQueue. Length:',
        _mainGameDrawQueue.length
    );
}

function updateDebugPointPosition() {
    // Ensure _mainGameDrawQueue is available before using it
    if (!_mainGameDrawQueue) {
        console.error('DEBUG.JS: _mainGameDrawQueue not initialized!');
        return;
    }

    if (!currentDebugObj) {
        // This block should only execute ONCE
        currentDebugObj = drawQueueConstructor(
            debugX,
            debugY,
            15,
            'lime',
            'darkgreen'
        );
        _mainGameDrawQueue.push(currentDebugObj); // <-- Use the internal queue
        console.log(
            'DEBUG.JS: Created and pushed new debug object. Queue length:',
            _mainGameDrawQueue.length
        );
    } else {
        // Block executes on subsequent changes
        currentDebugObj.x = debugX;
        currentDebugObj.y = debugY;
        console.log(
            'DEBUG.JS: Updated existing debug object position to:',
            currentDebugObj.x,
            currentDebugObj.y
        );
    }
}
