// ocr.worker.js - PaddleOCR ONNX Web Worker
importScripts('https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/ort.min.js');

// Configure WASM paths for ONNX Runtime
ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/';

let detSession = null;
let recSession = null;

// PP-OCRv4 text-recognition character dictionary (ppocr_keys_v1).
// Index 62 is space (0-9, a-z, A-Z, then space, then symbols).
const PPOCR_KEYS =
    '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ !"#$%&\'()*+,-./:;<=>?@[\]^_`{|}~';
const CHARACTER_DICT = PPOCR_KEYS.split('');

self.onmessage = async function (e) {
    const { type, width, height, imageBuffer } = e.data;

    if (type === 'INIT') {
        try {
            self.postMessage({ status: 'PROGRESS', text: 'Loading ONNX Runtime models...', progress: 0.1 });

            // Load Detection and Recognition models concurrently using WASM execution provider
            detSession = await ort.InferenceSession.create('./models/det_ppocr_v4.onnx', { executionProviders: ['wasm'] });
            recSession = await ort.InferenceSession.create('./models/rec_ppocr_v4.onnx', { executionProviders: ['wasm'] });

            self.postMessage({ status: 'READY', progress: 1.0 });
        } catch (error) {
            self.postMessage({ status: 'ERROR', message: 'Failed to load OCR models: ' + error.message });
        }
        return;
    }

    if (type === 'RUN_OCR') {
        try {
            self.postMessage({ status: 'PROGRESS', text: 'Preprocessing image tensors...', progress: 0.3 });

            // 1. Reconstruct ImageData from transferred buffer
                        const imgData = new ImageData(new Uint8ClampedArray(imageBuffer), width, height);

                        // 2. Preprocess image for recognition model [1, 3, 32, 320] (Standard PP-OCRv4 rec input shape)
                        const recWidth = 320;
                        // PP-OCRv4 recognition input: [1, 3, 32, 320]
                        const recHeight = 32;
                        const preprocessedTensor = preprocessForRecognition(imgData, width, height, recWidth, recHeight);

            self.postMessage({ status: 'PROGRESS', text: 'Running neural network inference...', progress: 0.6 });

            // 3. Execute Recognition Inference session
            const feeds = { [recSession.inputNames[0]]: preprocessedTensor };
            const results = await recSession.run(feeds);
            const outputTensor = results[recSession.outputNames[0]];

            self.postMessage({ status: 'PROGRESS', text: 'Decoding text output...', progress: 0.85 });

            // 4. CTC Greedy Decoding on output logits
            const decodedResult = ctcGreedyDecode(outputTensor);
            const decodedText = decodedResult.text;
            const confidence = decodedResult.confidence;

            self.postMessage({
                status: 'COMPLETE',
                text: decodedText,
                confidence: confidence
            });

        } catch (error) {
            self.postMessage({ status: 'ERROR', message: 'OCR execution failed: ' + error.message });
        }
    }
};
/** Preprocesses ImageData into a CHW Float32Array tensor normalized for PP-OCR recognition
    */
function preprocessForRecognition(imgData, srcWidth, srcHeight, targetW, targetH) {
    // Resize & normalize to [-1, 1] (Standard PaddleOCR recognition normalization: (val / 255 - 0.5) / 0.5)
    const float32Data = new Float32Array(3 * targetW * targetH);
    const data = imgData.data;

    for (let y = 0; y < targetH; y++) {
        for (let x = 0; x < targetW; x++) {
            const srcX = Math.floor((x / targetW) * srcWidth);
            const srcY = Math.floor((y / targetH) * srcHeight);
            const srcIdx = (srcY * srcWidth + srcX) * 4;

            // R, G, B normalization
            const r = (data[srcIdx] / 255.0 - 0.5) / 0.5;
            const g = (data[srcIdx + 1] / 255.0 - 0.5) / 0.5;
            const b = (data[srcIdx + 2] / 255.0 - 0.5) / 0.5;

            // CHW Layout storage
            const destIdx = y * targetW + x;
            float32Data[destIdx] = r;                                   // R channel
            float32Data[targetW * targetH + destIdx] = g;               // G channel
            float32Data[2 * targetW * targetH + destIdx] = b;           // B channel
        }

    }

    return new ort.Tensor('float32', float32Data, [1, 3, targetH, targetW]);
}

/** Performs CTC greedy decoding on output logits tensor from recognition model
    */
function ctcGreedyDecode(outputTensor) {
    const dims = outputTensor.dims; // typically [Batch, TimeSteps, Classes]
    const data = outputTensor.data;
    const timeSteps = dims[1];
    const numClasses = dims[2];

    let text = '';
    let lastIdx = -1;
    let totalProb = 0;
    let tokenCount = 0;

    for (let t = 0; t < timeSteps; t++) {
        let maxClassIdx = 0;
        let maxProb = -Number.MAX_VALUE;

        const offset = t * numClasses;
        for (let c = 0; c < numClasses; c++) {
            const prob = data[offset + c];
            if (prob > maxProb) {
                maxProb = prob;
                maxClassIdx = c;
            }
        }

        // CTC blank is index 0; ignore duplicates and blanks
        if (maxClassIdx !== 0 && maxClassIdx !== lastIdx) {
            if (maxClassIdx < CHARACTER_DICT.length) {
                text += CHARACTER_DICT[maxClassIdx];
            }
            totalProb += maxProb;
            tokenCount++;
        }
        lastIdx = maxClassIdx;

    }
    const confidence = tokenCount > 0 ? totalProb / tokenCount : 0;
    return { text, confidence };
}
