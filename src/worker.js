console.log('WORKER.JS: Script started executing.');
importScripts('../public/pkg/demoparser2.js');
console.log('WORKER.JS: demoparser2.js imported.');
// wasm_bindgen is made available globally in the worker's scope after importScripts.
const { parseEvents, parseTicks } = wasm_bindgen;

// This function loads the actual .wasm binary file into the worker.
// Each worker thread needs to load its own instance of the WASM binary.
async function run_in_worker() {
    await wasm_bindgen('../public/pkg/demoparser2_bg.wasm');
    console.log(
        'WORKER.JS: WASM binary loaded successfully. Rust functions are now available.'
    );
}

// Execute the WASM loading function when the worker starts.
run_in_worker();

// This is the handler for messages received from the main thread (e.g., from main.js).
onmessage = async function (e) {
    // The main thread will send an object with 'fileBytes' and 'fieldsToExtract'.
    const fileBytes = e.data.fileBytes;
    // Use the fields provided by the main thread, or fall back to a default set
    // that includes all fields needed by your replayDataManager.
    const fieldsToExtract = e.data.fieldsToExtract || ['X', 'Y'];

    console.log('worker.js: Starting demo parsing for tick data...');
    // Call the parseTicks Rust function with the byte array and the desired fields.
    console.log(fieldsToExtract);
    let result = parseTicks(fileBytes, fieldsToExtract);

    console.log(
        'worker.js: Demo parsing complete. Sending result back to main thread.'
    );
    // Send the parsed result back to the main thread.
    postMessage(result);
};
