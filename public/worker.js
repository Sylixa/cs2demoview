console.log('WORKER.JS: Script started executing.');
importScripts('/cs2demoview/pkg/demoparser2.js');
console.log('WORKER.JS: demoparser2.js imported.');

const { parseTicks, parseHeader, parseEvent } = wasm_bindgen;

async function run_in_worker() {
    await wasm_bindgen('/cs2demoview/pkg/demoparser2_bg.wasm');
    console.log(
        'WORKER.JS: WASM binary loaded successfully. Rust functions are now available.'
    );
}

run_in_worker();

self.onmessage = async e => {
    const fileBytes = e.data.fileBytes;
    const fieldsToExtract = e.data.fieldsToExtract;
    const parseMethod = e.data.parseMethod;
    const requestId = e.data.requestId;

    console.log(...fieldsToExtract);

    if (!fieldsToExtract) {
        self.postMessage({
            requestId: requestId,
            type: 'error',
            reason: 'No extract method specified',
        });
    }

    if (!parseMethod) {
        self.postMessage({
            requestId: requestId,
            type: 'error',
            reason: 'No parse method specified',
        });
    }
    if (!fileBytes) {
        self.postMessage({
            requestId: requestId,
            type: 'error',
            reason: 'No file bytes provided for parsing',
        });
    }

    console.log(
        `WORKER[${requestId}].JS: Starting demo parsing for ${parseMethod} data...`
    );

    let result = null;
    switch (parseMethod) {
        case 'tick':
            result = parseTicks(fileBytes, ...fieldsToExtract);
            break;
        case 'event':
            result = parseEvent(fileBytes, ...fieldsToExtract);
            break;
        case 'header':
            result = parseHeader(fileBytes, ...fieldsToExtract);
            break;
    }
    if (!result) self.postMessage({ type: 'error', reason: 'No data' });

    console.log(
        `WORKER[${requestId}].JS: Demo parsing complete for '${parseMethod}'. Sending result back to main thread.`
    );

    self.postMessage({ requestId: requestId, type: 'success', result: result });
};
