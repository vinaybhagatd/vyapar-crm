/**
 * ClientHub
 * Phase 1 - Task 2
 * OCR Worker Skeleton
 *
 * Purpose:
 * - Worker startup
 * - Message routing
 * - Status messaging scaffold
 * - Error handling scaffold
 *
 * NOT IMPLEMENTED YET:
 * - ONNX Runtime
 * - WASM Configuration
 * - OCR Models
 * - Image Preprocessing
 * - OCR Inference
 * - Character Dictionary
 * - CTC Decoder
 */

console.log("[OCR Worker] Started");

/**
 * Send status message to main thread
 */
function sendStatus(status, message = "") {
    self.postMessage({
        status,
        message
    });
}

/**
 * Handle INIT message
 */
function handleInit() {
    console.log("[OCR Worker] INIT received");

    // Placeholder only.
    // Actual initialization will be implemented in later tasks.

    sendStatus("READY", "OCR Worker skeleton initialized");
}

/**
 * Handle RUN_OCR message
 */
function handleRunOcr() {
    console.log("[OCR Worker] RUN_OCR received");

    // Placeholder only.
    // OCR execution will be implemented in future tasks.

    sendStatus("COMPLETE", "RUN_OCR placeholder executed");
}

/**
 * Main message router
 */
self.onmessage = function (event) {
    try {
        const messageType = event?.data?.type;

        switch (messageType) {
            case "INIT":
                handleInit();
                break;

            case "RUN_OCR":
                handleRunOcr();
                break;

            default:
                sendStatus(
                    "ERROR",
                    `Unsupported message type: ${messageType}`
                );
        }
    } catch (error) {
        console.error("[OCR Worker] Error:", error);

        sendStatus(
            "ERROR",
            error?.message || "Unknown worker error"
        );
    }
};
