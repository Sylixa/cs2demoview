const demoFileInput = document.getElementById('demoFileInput');
const demoEventWorker = new Worker(new URL('/worker.js', import.meta.url), {
    type: 'classic',
});

const pendingWorkerRequests = new Map();
let nextRequestId = 0;

export const requestDemo = (
    file = demoFileInput.files[0],
    args = [['X', 'Y']],
    method = 'tick'
) => {
    nextRequestId++;
    return new Promise((resolve, reject) => {
        if (!file) return reject('No file provided');

        const reader = new FileReader();
        reader.onload = async e => {
            const uint8Array = new Uint8Array(e.target.result);
            console.log(
                `SUBT: Sending demo file to worker for parsing ${method}...`
            );

            let requestId = nextRequestId;
            pendingWorkerRequests.set(requestId, { resolve, reject });

            demoEventWorker.postMessage({
                requestId: requestId,
                fileBytes: uint8Array,
                fieldsToExtract: args,
                parseMethod: method,
            });
        };
        reader.readAsArrayBuffer(file);
    });
};

// const requestEvent = (args = ['X', 'Y']) => {
//     const file = demoFileInput.files[0];
//     if (!file) return;

//     let requestId = nextRequestId++;

//     return new Promise((reject, resolve) => {
//         pendingWorkerRequests.set(requestId, { resolve, reject });

//         const reader = new FileReader();
//         reader.onload = async e => {
//             const uint8Array = new Uint8Array(e.target.result);
//             console.log(
//                 'SUBT: Sending demo file to worker for parsing event...'
//             );

//             demoEventWorker.postMessage({
//                 requestId: requestId,
//                 fileBytes: uint8Array,
//                 fieldsToExtract: args,
//                 parseMethod: 'event',
//             });
//         };
//         reader.readAsArrayBuffer(file);
//     });
// };

// const requestHeader = (args = []) => {
//     const file = demoFileInput.files[0];
//     if (!file) return;

//     const requestId = nextRequestId++;

//     return new Promise((resolve, reject) => {
//         pendingWorkerRequests.set(requestId, { resolve, reject });

//         const reader = new FileReader();
//         reader.onload = () => {
//             const uint8Array = new Uint8Array(reader.result);
//             console.log(
//                 'SUBT: Sending demo file to worker for parsing header...'
//             );

//             demoEventWorker.postMessage({
//                 requestId,
//                 fileBytes: uint8Array,
//                 fieldsToExtract: args,
//                 parseMethod: 'header',
//             });
//         };
//         reader.readAsArrayBuffer(file);
//     });
// };

demoEventWorker.onmessage = e => {
    const { requestId, type, result, reason } = e.data;

    if (!pendingWorkerRequests.has(requestId))
        console.warn(
            `SUBT: Received worker message for unknown requestId: ${requestId}. Ignoring.`
        );

    const { resolve, reject } = pendingWorkerRequests.get(requestId);
    if (type === 'success') resolve(result);

    if (type === 'error') {
        reject(
            new Error(reason || `SUBT: Worker error for request ${requestId}`)
        );
    } else {
        reject(
            new Error(
                `SUBT: Worker sent an unhandled message type: ${type} for request ${requestId}`
            )
        );
    }

    pendingWorkerRequests.delete(requestId);
};
demoEventWorker.onerror = function (e) {
    console.error('SUBT: Worker global error:', e);

    pendingWorkerRequests.forEach(({ reject }) => {
        reject(
            new Error(
                `Worker process crashed: ${e.reason || 'Unknown worker error'}`
            )
        );
    });
    pendingWorkerRequests.clear();
};
