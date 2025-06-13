/**
 * Initializes the WebAssembly module for the main thread.
 * This assumes '/pkg/demoparser2.js' has been loaded globally (e.g., via a plain <script> tag in index.html)
 * BEFORE this module is executed.
 * @returns {Promise<void>} A promise that resolves when WASM is loaded.
 */
export async function initMainThreadWasm() {
    // Access wasm_bindgen from the global window object.
    // This is necessary because demoparser2.js is loaded as a non-module script,
    // which places `wasm_bindgen` directly onto the global `window` object.
    const wasmBindgen = wasm_bindgen;
    if (typeof wasmBindgen === 'undefined') {
        console.error(
            'Error: `wasm_bindgen` is not defined globally. Ensure `/pkg/demoparser2.js` is loaded via a non-module <script> tag before this module.'
        );
        throw new Error('WASM glue code not found.');
    }

    try {
        const wasmBinaryPath = `${
            import.meta.env.BASE_URL
        }pkg/demoparser2_bg.wasm`;
        await wasmBindgen(wasmBinaryPath);
        console.log('WASM.JS: Main thread WASM binary loaded successfully.');
    } catch (e) {
        console.error('Failed to load WASM binary in main thread:', e);
        throw e; // Re-throw to propagate the error
    }
}
