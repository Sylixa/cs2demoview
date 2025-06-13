// import './style.css';
import './style/index.css';

// 1. Dynamically load demoparser2.js
await new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `${import.meta.env.BASE_URL}pkg/demoparser2.js`;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
});

// 2. Now that wasm_bindgen is defined, initialize it
await wasm_bindgen(`${import.meta.env.BASE_URL}pkg/demoparser2_bg.wasm`);

// 3. Now it's safe to use wasm_bindgen, or call things that depend on it
console.log('WASM module initialized');

import { drawObjects } from './renderer.js';
import {
    convertCordsGameToRadar,
    drawQueueConstructor,
} from './drawRequestor.js';
import { initDebug } from './debug.js';
import * as replayDataManager from './replayManager.js';
import { initMainThreadWasm } from './wasmSetup.js';

// --- WASM Worker Setup ---
console.log('MAIN.JS: Attempting to create new Worker with path:');

// const demoWorker = new Worker('./src/worker.js');
const demoWorker = new Worker(new URL('/worker.js', import.meta.url), {
    type: 'classic',
});

console.log('MAIN.JS: Worker constructor called.');
// const demoWorker = 'a';

const demoFileInput = document.getElementById('demoFileInput');
const loadingIndicator = document.getElementById('loadingIndicator');

// --- Replay System Variables ---
let currentReplayTick = 1;
let isPlaying = false;
let playbackSpeed = 1.0; // 1.0 for normal, 2.0 for 2x speed, 0.5 for 0.5x speed
const DEMO_TICK_RATE = 64; // Assuming demo have 64 ticks per second.
let lastFrameTime = 0; // For accurate time-based tick progressionlastFrameTime = 0; // For accurate time-based tick progression

// --- Global Drawing Queue ---
const mainGameDrawQueue = [
    //Test
    drawQueueConstructor(300, 300, 20, 'red', 'darkred'),
    drawQueueConstructor(1500, 500, 25, 'blue', 'darkblue'),
    drawQueueConstructor(800, 1800, 30, 'purple', 'darkpurple'),
];

console.log(
    'MAIN.JS: Static mainGameDrawQueue initialized. Length:',
    mainGameDrawQueue.length
);

initDebug(mainGameDrawQueue);

// --- Handle Demo File Upload ---
demoFileInput.addEventListener('change', async event => {
    const file = event.target.files[0];
    if (!file) return;

    loadingIndicator.style.display = 'block';
    isPlaying = false;
    playPauseBtn.textContent = 'Play';

    const reader = new FileReader();
    reader.onload = async e => {
        const uint8Array = new Uint8Array(e.target.result);
        console.log('MAIN.JS: Sending demo file to worker for parsing...');

        demoWorker.postMessage({
            fileBytes: uint8Array,
            fieldsToExtract: ['X', 'Y'],
        });
    };
    reader.readAsArrayBuffer(file);
});

// --- Handle Message from Worker ---
demoWorker.onmessage = e => {
    const parsedData = e.data;
    console.log('MAIN.JS: Received parsed data from worker:', parsedData);

    const success = replayDataManager.loadReplay(parsedData);
    if (success) {
        currentReplayTick = replayDataManager.getMinTick();
        replaySlider.min = replayDataManager.getMinTick();
        replaySlider.max = replayDataManager.getMaxTick();
        maxTickSpan.textContent = replayDataManager.getMaxTick();
        maxTickTimeSpan.textContent = formatTime(
            replayDataManager.getMaxTick()
        );
        replaySlider.value = currentReplayTick;
        updateTickDisplay();

        console.log('MAIN.JS: Replay data successfully loaded into manager.');
    } else {
        console.error(
            'MAIN.JS: Failed to load parsed data into replay manager.'
        );
    }
    loadingIndicator.style.display = 'none';
};

demoWorker.onerror = function (e) {
    console.error('MAIN.JS: Worker error:', e);
};

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
const canvasContainer = document.getElementById('canvas-container');

function resizeCanvas() {
    // offsetWidth/offsetHeight include padding and border
    canvas.width = canvasContainer.offsetWidth;
    canvas.height = canvasContainer.offsetHeight;

    // Excluding padding and border
    // canvas.width = canvasContainer.clientWidth;
    // canvas.height = canvasContainer.clientHeight;

    console.log(
        `Canvas resized to: ${canvas.width}x${canvas.height} (matching parent div)`
    );
}

resizeCanvas();

// --- Global Camera State ---
let translateX = canvas.width / 2;
let translateY = canvas.height / 2;
let scaleFactor = 1.0;

// Mouse panning
let isDragging = false;
let lastMouseX;
let lastMouseY;

// NO Map loader yet
let mapImage = new Image();
mapImage.src = `${import.meta.env.BASE_URL}maps/de_train/radar.png`;

mapImage.onload = () => {
    console.log('MAIN.JS: Map image loaded.');
};

// --- UI Elements for Camera Controls ---
const translateXInput = document.getElementById('translateX');
const translateYInput = document.getElementById('translateY');
const scaleFactorInput = document.getElementById('scaleFactor');

const translateXValueSpan = document.getElementById('translateXValue');
const translateYValueSpan = document.getElementById('translateYValue');
const scaleFactorValueSpan = document.getElementById('scaleFactorValue');

// --- Replay UI Elements ---
const replaySlider = document.getElementById('replaySlider');
const currentTickSpan = document.getElementById('currentTick');
const maxTickSpan = document.getElementById('maxTick');
const currentTickTimeSpan = document.getElementById('currentTickTime');
const maxTickTimeSpan = document.getElementById('maxTickTime');
const playPauseBtn = document.getElementById('playPauseBtn');
const speedUpBtn = document.getElementById('speedUpBtn');
const slowDownBtn = document.getElementById('slowDownBtn');
const playbackSpeedSpan = document.getElementById('playbackSpeed');

// Debug
// --- Event Listeners for Camera Controls ---
// translateXInput.addEventListener('input', e => {
//     translateX = parseFloat(e.target.value);
//     translateXValueSpan.textContent = translateX;
// });

// translateYInput.addEventListener('input', e => {
//     translateY = parseFloat(e.target.value);
//     translateYValueSpan.textContent = translateY;
// });

scaleFactorInput.addEventListener('input', e => {
    scaleFactor = parseFloat(e.target.value);
    scaleFactorValueSpan.textContent = scaleFactor.toFixed(2);
});

window.addEventListener('resize', resizeCanvas);

// Mouse panning event listeners
canvas.addEventListener('mousedown', e => {
    isDragging = true;
    canvas.classList.add('grabbing'); // Change cursor style
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
});

canvas.addEventListener('mousemove', e => {
    if (isDragging) {
        const dx = e.clientX - lastMouseX;
        const dy = e.clientY - lastMouseY;

        // Adjust translateX and translateY based on mouse movement
        // We're moving the *canvas's internal origin* directly by the mouse delta.
        translateX += dx;
        translateY += dy;

        lastMouseX = e.clientX;
        lastMouseY = e.clientY;

        // Redraw the scene
    }
});

canvas.addEventListener('mouseup', () => {
    isDragging = false;
    canvas.classList.remove('grabbing'); // Reset cursor style
});

// Touch event listeners for mobile devices
canvas.addEventListener('touchstart', e => {
    e.preventDefault(); // Prevent scrolling on touch
    isDragging = true;
    canvas.classList.add('grabbing');
    lastMouseX = e.touches[0].clientX;
    lastMouseY = e.touches[0].clientY;
});

canvas.addEventListener('touchmove', e => {
    if (isDragging) {
        e.preventDefault(); // Prevent scrolling on touch
        const dx = e.touches[0].clientX - lastMouseX;
        const dy = e.touches[0].clientY - lastMouseY;

        translateX += dx;
        translateY += dy;

        lastMouseX = e.touches[0].clientX;
        lastMouseY = e.touches[0].clientY;

        //Redraw
    }
});

canvas.addEventListener('touchend', () => {
    isDragging = false;
    canvas.classList.remove('grabbing');
});

// Zoom Slider Event Listener
scaleFactorInput.addEventListener('input', e => {
    scaleFactor = parseFloat(e.target.value);
});

// Mouse Wheel Zoom
canvas.addEventListener('wheel', e => {
    e.preventDefault(); // Prevent page scrolling
    const zoomAmount = 0.1;
    const mouseX = e.clientX - canvas.getBoundingClientRect().left;
    const mouseY = e.clientY - canvas.getBoundingClientRect().top;

    // Calculate the current world coordinates under the mouse cursor
    const worldX = (mouseX - translateX) / scaleFactor;
    const worldY = (mouseY - translateY) / scaleFactor;

    // Determine new scale factor
    let newScaleFactor = scaleFactor;
    if (e.deltaY < 0) {
        // Zoom in
        newScaleFactor += zoomAmount;
    } else {
        // Zoom out
        newScaleFactor -= zoomAmount;
    }

    // Clamp zoom to reasonable limits
    newScaleFactor = Math.max(0.05, Math.min(newScaleFactor, 5.0));

    // Adjust translateX and translateY to keep the world point under the mouse
    // 1. Calculate the new translateX/Y based on the new scale.
    //    This effectively repositions the origin so the content under the mouse stays fixed.
    translateX = mouseX - worldX * newScaleFactor;
    translateY = mouseY - worldY * newScaleFactor;

    scaleFactor = newScaleFactor;
    scaleFactorInput.value = newScaleFactor; // Update slider to match
});

// Replay UI Event Listeners
replaySlider.addEventListener('input', e => {
    // When user drags slider, jump to that tick
    currentReplayTick = parseInt(e.target.value, 10);
    isPlaying = false; // Pause when seeking manually
    updateTickDisplay();
});

playPauseBtn.addEventListener('click', () => {
    isPlaying = !isPlaying;
    playPauseBtn.textContent = isPlaying ? 'Pause' : 'Play';
});

speedUpBtn.addEventListener('click', () => {
    playbackSpeed = Math.min(playbackSpeed * 2, 8); // Max 8x speed
    playbackSpeedSpan.textContent = `${playbackSpeed}x`;
});

slowDownBtn.addEventListener('click', () => {
    playbackSpeed = Math.max(playbackSpeed / 2, 0.25); // Min 0.25x speed
    playbackSpeedSpan.textContent = `${playbackSpeed}x`;
});

function formatTime(rawTick) {
    // Convert CS2 time to real time
    let realTime = Math.floor(rawTick / DEMO_TICK_RATE);
    let seconds = realTime % 60;
    let minutes = Math.floor((realTime % 3600) / 60);
    let hours = Math.floor(realTime / 3600);
    return (
        String(hours).padStart(2, '0') +
        ':' +
        String(minutes).padStart(2, '0') +
        ':' +
        String(seconds).padStart(2, '0')
    );
}

function updateTickDisplay() {
    currentTickSpan.textContent = currentReplayTick.toFixed(2);
    currentTickTimeSpan.textContent = formatTime(currentReplayTick);

    replaySlider.value = currentReplayTick; // Keep slider in sync
}

function mainRenderLoop(currentTime) {
    // console.log('MAIN.JS Loop: mainGameDrawQueue data:', mainGameDrawQueue);

    if (!lastFrameTime) {
        lastFrameTime = currentTime;
    }
    const deltaTime = currentTime - lastFrameTime; // Time in milliseconds since last frame
    lastFrameTime = currentTime;

    if (isPlaying) {
        // Calculate how many ticks should have passed based on real time and playback speed
        const ticksToAdvance =
            (deltaTime / 1000) * DEMO_TICK_RATE * playbackSpeed;
        currentReplayTick += ticksToAdvance;

        // Clamp tick to bounds
        const maxTick = replayDataManager.getMaxTick(); // Get max tick from manager
        if (currentReplayTick > maxTick) {
            currentReplayTick = maxTick;
            isPlaying = false; // Stop at end of replay
            playPauseBtn.textContent = 'Play';
        } else if (currentReplayTick < replayDataManager.getMinTick()) {
            currentReplayTick = replayDataManager.getMinTick();
        }
        updateTickDisplay();
    }

    // Get all raw data objects for the current tick from the manager
    const rawTickData = replayDataManager.getPlayerAtTick(currentReplayTick);

    // Combine static objects and dynamic player objects for debug
    const currentDrawQueue = [...mainGameDrawQueue];

    rawTickData.forEach(item => {
        let convertedPlayerPos = convertCordsGameToRadar(
            item.X,
            item.Y,
            2730,
            2360,
            2.37,
            2048,
            2048
        );
        currentDrawQueue.push(
            drawQueueConstructor(
                convertedPlayerPos[0],
                convertedPlayerPos[1],
                10,
                'yellow',
                'orange'
                // item.name
            )
        );
    });

    // console.log('MAIN.JS Loop: currentDrawQueue data:', currentDrawQueue);

    drawObjects(
        ctx,
        currentDrawQueue,
        translateX,
        translateY,
        scaleFactor,
        mapImage
    );

    requestAnimationFrame(mainRenderLoop);
}

async function initApplication() {
    // Initialize WASM for the main thread
    await initMainThreadWasm();

    // No preload demo, fail by default
    const defaultDataSuccess = false;
    if (defaultDataSuccess) {
        console.log('Default lowtick.json loaded.');
        currentReplayTick = getMinTick();
        replaySlider.min = getMinTick();
        replaySlider.max = getMaxTick();
        replaySlider.value = currentReplayTick;
        updateTickDisplay();
    } else {
        console.warn(
            'Could not load default lowtick.json. Waiting for user upload.'
        );
    }

    // Start render
    requestAnimationFrame(mainRenderLoop);
}

// Sync initial UI values
translateXInput.value = translateX;
translateYInput.value = translateY;
scaleFactorInput.value = scaleFactor;
translateXValueSpan.textContent = translateX;
translateYValueSpan.textContent = translateY;
scaleFactorValueSpan.textContent = scaleFactor.toFixed(2);
playbackSpeedSpan.textContent = `${playbackSpeed}x`;

initApplication(); // Start the web app
