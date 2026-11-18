/**
 * ClientHub
 * Phase 1 - Task 4 Spec (Aligned with Task 5)
 * WASM Configuration & Validation Tests
 */

const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

test.describe('Phase 1 Task 4 - WASM Configuration', () => {

    test('Test 4.1: WASM paths configured', async ({ page }) => {
        const workerPath = path.join(process.cwd(), 'ocr.worker.js');
        const workerSource = fs.readFileSync(workerPath, 'utf8');

        expect(workerSource).toContain('wasmPaths');
    });

    test('Test 4.2: Worker starts successfully and INIT returns READY', async ({ page }) => {
        const workerCode = fs.readFileSync(path.join(process.cwd(), 'ocr.worker.js'), 'utf8');
        
        const result = await page.evaluate(async (code) => {
            return await new Promise((resolve) => {
                const blob = new Blob([code], { type: 'application/javascript' });
                const worker = new Worker(URL.createObjectURL(blob));
                const messages = [];

                worker.onmessage = (event) => {
                    messages.push(event.data);
                    if (event.data.status === 'READY' || event.data.status === 'ERROR') {
                        resolve({ messages });
                    }
                };

                worker.postMessage({ type: 'INIT' });

                setTimeout(() => {
                    resolve({ messages, timeout: true });
                }, 5000);
            });
        }, workerCode);

        expect(result.messages.some(m => m.status === 'READY')).toBe(true);
    });

    test('Test 4.3 & 4.4: INIT verifies WASM availability and returns READY', async ({ page }) => {
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
        // Updated to match Task 5 success message or general confirmation
        expect(result.message).toBeTruthy();
    });

    test('Test 4.5: Existing placeholder functionality preserved (RUN_OCR)', async ({ page }) => {
        const workerCode = fs.readFileSync(path.join(process.cwd(), 'ocr.worker.js'), 'utf8');

        const result = await page.evaluate(async (code) => {
            return await new Promise((resolve) => {
                const blob = new Blob([code], { type: 'application/javascript' });
                const workerUrl = URL.createObjectURL(blob);
                const workerObj = new Worker(workerUrl);
                workerObj.onmessage = (event) => {
                    if (event.data.status === 'COMPLETE') {
                        resolve(event.data);
                    }
                };
                workerObj.postMessage({ type: 'RUN_OCR' });
            });
        }, workerCode);

        expect(result.status).toBe('COMPLETE');
    });

    test('Test 4.6 & 4.7: No active model loading or OCR inference execution exists', async ({ page }) => {
        const workerPath = path.join(process.cwd(), 'ocr.worker.js');
        const workerSource = fs.readFileSync(workerPath, 'utf8');

        expect(workerSource).not.toContain('det_ppocr_v4');
        expect(workerSource).not.toContain('rec_ppocr_v4');
        // Ensure actual executable session execution calls aren't present (ignoring comments)
        const codeWithoutComments = workerSource.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
        expect(codeWithoutComments).not.toContain('session.run');
    });

});