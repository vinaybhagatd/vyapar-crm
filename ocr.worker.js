/**
 * ClientHub
 * Phase 1 - Task 5
 * INIT Runtime Flow
 *
 * Implemented:
 * - Worker startup & lifecycle
 * - Message routing & error handling
 * - ONNX Runtime Web import
 * - WASM path configuration
 * - Async INIT Runtime flow & validation
 * - READY / ERROR / COMPLETE statuses
 *
 * NOT IMPLEMENTED (Future Phases):
 * - Actual model loading (.onnx sessions)
 * - Full OCR inference (session.run)
 * - Image preprocessing & CTC decoding
 */

/**
 * Load ONNX Runtime Web
 */
importScripts(
    'https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/ort.min.js'
);

/**
 * Configure WASM paths
 */
ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/';

console.log('[OCR Worker] Started');

/**
 * Send status messages to main thread
 */
function sendStatus(status, message = '') {
    self.postMessage({
        status,
        message
    });
}

/**
 * Verify ONNX Runtime availability and WASM configuration
 */
function verifyRuntime() {
    const runtimeAvailable = typeof ort !== 'undefined';
    const wasmConfigured = typeof ort?.env?.wasm?.wasmPaths !== 'undefined';

    return runtimeAvailable && wasmConfigured;
}

/**
 * Task 5: Asynchronous INIT Runtime Flow
 */
async function handleInit() {
    try {
        console.log('[OCR Worker] INIT received — starting runtime flow');

        const runtimeAvailable = verifyRuntime();

        if (!runtimeAvailable) {
            throw new Error('ONNX Runtime Web or WASM paths unavailable');
        }

        // Task 5: Perform any asynchronous runtime preparation or checks here
        // (e.g., environment setup or pre-flight checks before declaring readiness)
        await Promise.resolve();

        sendStatus(
            'READY',
            'INIT runtime flow completed successfully'
        );

    } catch (error) {
        console.error('[OCR Worker] INIT runtime error:', error);
        sendStatus(
            'ERROR',
            error?.message || 'Initialization failed'
        );
    }
}

/**
 * RUN_OCR Placeholder Handler
 */
function handleRunOcr() {
    console.log('[OCR Worker] RUN_OCR received');
    sendStatus('COMPLETE', 'RUN_OCR placeholder executed');
}

/**
 * Message Router
 */
self.onmessage = async function (event) {
    try {
        const messageType = event?.data?.type;

        switch (messageType) {
            case 'INIT':
                await handleInit();
                break;

            case 'RUN_OCR':
                handleRunOcr();
                break;

            default:
                sendStatus(
                    'ERROR',
                    `Unsupported message type: ${messageType}`
                );
        }

    } catch (error) {
        console.error('[OCR Worker] Error:', error);
        sendStatus(
            'ERROR',
            error?.message || 'Unknown worker error'
        );
    }
};