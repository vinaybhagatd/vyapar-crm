/**
 * ClientHub
 * Phase 1 - Task 5 Spec
 * INIT Runtime Flow Validation Tests
 */

const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

test.describe('Phase 1 Task 5 - INIT Runtime Flow', () => {

    test('Test 5.1: Worker handles asynchronous INIT and returns READY', async ({ page }) => {
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

    test('Test 5.2: Async message router correctly executes INIT flow', async ({ page }) => {
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
        expect(result.message).toBeTruthy();
    });

    test('Test 5.3: Worker maintains support for existing RUN_OCR placeholder', async ({ page }) => {
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

});