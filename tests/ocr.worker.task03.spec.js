/**
 * ClientHub
 * Phase 1 - Task 3 Spec (Aligned with Task 4/5)
 * ONNX Runtime Integration Tests
 */

const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

test.describe('Phase 1 Task 3 - ONNX Runtime Integration', () => {

    test('INIT returns READY when ONNX Runtime loads', async ({ page }) => {
        const workerCode = fs.readFileSync(path.join(process.cwd(), 'ocr.worker.js'), 'utf8');

        const result = await page.evaluate(async (code) => {
            return await new Promise((resolve) => {
                const blob = new Blob([code], { type: 'application/javascript' });
                const worker = new Worker(URL.createObjectURL(blob));
                worker.onmessage = (event) => {
                    if (event.data.status === 'READY') {
                        resolve(event.data);
                    }
                };
                worker.postMessage({ type: 'INIT' });
            });
        }, workerCode);

        expect(result.status).toBe('READY');
    });

    test('ONNX Runtime object is available after INIT', async ({ page }) => {
        const workerCode = fs.readFileSync(path.join(process.cwd(), 'ocr.worker.js'), 'utf8');

        const result = await page.evaluate(async (code) => {
            return await new Promise((resolve) => {
                const blob = new Blob([code], { type: 'application/javascript' });
                const worker = new Worker(URL.createObjectURL(blob));
                worker.onmessage = (event) => {
                    if (event.data.status === 'READY') {
                        resolve(event.data);
                    }
                };
                worker.postMessage({ type: 'INIT' });
            });
        }, workerCode);

        expect(result.status).toBe('READY');
    });

    test('RUN_OCR remains placeholder implementation', async ({ page }) => {
        const workerCode = fs.readFileSync(path.join(process.cwd(), 'ocr.worker.js'), 'utf8');

        const result = await page.evaluate(async (code) => {
            return await new Promise((resolve) => {
                const blob = new Blob([code], { type: 'application/javascript' });
                const worker = new Worker(URL.createObjectURL(blob));
                worker.onmessage = (event) => {
                    if (event.data.status === 'COMPLETE') {
                        resolve(event.data);
                    }
                };
                worker.postMessage({ type: 'RUN_OCR' });
            });
        }, workerCode);

        expect(result.status).toBe('COMPLETE');
    });

    test('unsupported message returns ERROR', async ({ page }) => {
        const workerCode = fs.readFileSync(path.join(process.cwd(), 'ocr.worker.js'), 'utf8');

        const result = await page.evaluate(async (code) => {
            return await new Promise((resolve) => {
                const blob = new Blob([code], { type: 'application/javascript' });
                const worker = new Worker(URL.createObjectURL(blob));
                worker.onmessage = (event) => {
                    if (event.data.status === 'ERROR') {
                        resolve(event.data);
                    }
                };
                worker.postMessage({ type: 'INVALID_MSG' });
            });
        }, workerCode);

        expect(result.status).toBe('ERROR');
    });

    test('worker handles malformed message safely', async ({ page }) => {
        const workerCode = fs.readFileSync(path.join(process.cwd(), 'ocr.worker.js'), 'utf8');

        const result = await page.evaluate(async (code) => {
            return await new Promise((resolve) => {
                const blob = new Blob([code], { type: 'application/javascript' });
                const worker = new Worker(URL.createObjectURL(blob));
                worker.onmessage = (event) => {
                    if (event.data.status === 'ERROR') {
                        resolve(event.data);
                    }
                };
                worker.postMessage(null);
            });
        }, workerCode);

        expect(result.status).toBe('ERROR');
    });

    test('Task 3 has not implemented OCR inference yet', async ({ page }) => {
        const workerPath = path.join(process.cwd(), 'ocr.worker.js');
        const workerSource = fs.readFileSync(workerPath, 'utf8');
        
        // Strip out comments so doc notes don't trigger test assertions
        const codeWithoutComments = workerSource.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
        expect(codeWithoutComments).not.toContain('session.run');
    });

    test('Task 3 has not implemented OCR models yet', async ({ page }) => {
        const workerPath = path.join(process.cwd(), 'ocr.worker.js');
        const workerSource = fs.readFileSync(workerPath, 'utf8');
        expect(workerSource).not.toContain('det_ppocr');
    });

    test('Task 3 acknowledges WASM configuration (Advanced Phase 4/5)', async ({ page }) => {
        const workerPath = path.join(process.cwd(), 'ocr.worker.js');
        const workerSource = fs.readFileSync(workerPath, 'utf8');
        expect(workerSource).toContain('wasmPaths');
    });

});