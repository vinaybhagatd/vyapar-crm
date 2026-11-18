/**
 * ClientHub
 * OCR Worker - Phase 2: Model Loading, Session Creation & Preprocessing
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

console.log('[OCR Worker] Started - Phase 2');

let detSession = null;
let recSession = null;

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
 * Handle initialization and loading of ONNX models
 */
async function handleInit() {
    try {
        console.log('[OCR Worker] INIT received — loading models');

        // Load text detection and recognition ONNX models
        detSession = await ort.InferenceSession.create('ch_PP-OCRv4_det_infer.onnx', {
            executionProviders: ['wasm']
        });

        recSession = await ort.InferenceSession.create('ch_PP-OCRv4_rec_infer.onnx', {
            executionProviders: ['wasm']
        });

        sendStatus(
            'READY',
            'Models loaded and sessions created successfully'
        );

    } catch (error) {
        console.error('[OCR Worker] Initialization error:', error);
        sendStatus(
            'ERROR',
            error?.message || 'Model initialization failed'
        );
    }
}

/**
 * Resize dimensions to be multiples of 32 while preserving aspect ratio
 */
function calculateTargetDimensions(width, height, maxSideLen = 960) {
    let ratio = 1.0;
    if (Math.max(height, width) > maxSideLen) {
        if (height > width) {
            ratio = maxSideLen / height;
        } else {
            ratio = maxSideLen / width;
        }
    }
    
    let targetWidth = Math.round(width * ratio);
    let targetHeight = Math.round(height * ratio);

    // Ensure dimensions are multiples of 32
    targetWidth = Math.round(targetWidth / 32) * 32;
    targetHeight = Math.round(targetHeight / 32) * 32;

    targetWidth = Math.max(32, targetWidth);
    targetHeight = Math.max(32, targetHeight);

    return { targetWidth, targetHeight, ratio };
}

/**
 * Preprocesses raw ImageData into an ort.Tensor for PP-OCRv4 detection
 */
function preprocessImage(imageData, targetWidth, targetHeight) {
    const { data, width: srcWidth, height: srcHeight } = imageData;
    
    const float32Data = new Float32Array(3 * targetHeight * targetWidth);
    const mean = [0.485, 0.456, 0.406];
    const std = [0.229, 0.224, 0.225];

    for (let h = 0; h < targetHeight; h++) {
        for (let w = 0; w < targetWidth; w++) {
            const srcX = Math.min(Math.floor((w / targetWidth) * srcWidth), srcWidth - 1);
            const srcY = Math.min(Math.floor((h / targetHeight) * srcHeight), srcHeight - 1);
            const srcIdx = (srcY * srcWidth + srcX) * 4;

            const r = data[srcIdx] / 255.0;
            const g = data[srcIdx + 1] / 255.0;
            const b = data[srcIdx + 2] / 255.0;

            const channelSize = targetHeight * targetWidth;
            const rIdx = h * targetWidth + w;
            const gIdx = channelSize + rIdx;
            const bIdx = channelSize * 2 + rIdx;

            float32Data[rIdx] = (r - mean[0]) / std[0];
            float32Data[gIdx] = (g - mean[1]) / std[1];
            float32Data[bIdx] = (b - mean[2]) / std[2];
        }
    }

    return new ort.Tensor('float32', float32Data, [1, 3, targetHeight, targetWidth]);
}

/**
 * Handle execution of OCR pipeline
 */
async function handleRunOcr(payload) {
    try {
        console.log('[OCR Worker] RUN_OCR received — starting inference pipeline');

        if (!detSession || !recSession) {
            throw new Error('Models not initialized. Run INIT first.');
        }

        const { imageData } = payload || {};
        if (!imageData) {
            throw new Error('No image data provided for OCR inference');
        }

        const { targetWidth, targetHeight } = calculateTargetDimensions(imageData.width, imageData.height);

        // 1. Preprocess input image into tensor
        const inputTensor = preprocessImage(imageData, targetWidth, targetHeight);

        // 2. Run text detection inference session
        const feeds = { [detSession.inputNames[0]]: inputTensor };
        const detOutputs = await detSession.run(feeds);
        
        // 3. Output detection tensor ready for post-processing
        const outputTensor = detOutputs[detSession.outputNames[0]];

        sendStatus(
            'COMPLETE',
            'OCR detection inference executed successfully'
        );

    } catch (error) {
        console.error('[OCR Worker] OCR execution error:', error);
        sendStatus(
            'ERROR',
            error?.message || 'OCR execution failed'
        );
    }
}

/**
 * Message Router
 */
self.onmessage = async function (event) {
    try {
        const { type, payload } = event?.data || {};

        switch (type) {
            case 'INIT':
                await handleInit();
                break;

            case 'RUN_OCR':
                await handleRunOcr(payload);
                break;

            default:
                sendStatus(
                    'ERROR',
                    `Unsupported message type: ${type}`
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