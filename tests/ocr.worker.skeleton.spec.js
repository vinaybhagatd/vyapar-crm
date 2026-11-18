const { test, expect } = require('@playwright/test');

test.describe('Phase 1 Task 2 - OCR Worker Skeleton', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3000');
    });

    test('worker responds with READY for INIT', async ({ page }) => {

        const result = await page.evaluate(async () => {

            const worker = new Worker('./ocr.worker.js');

            return new Promise((resolve, reject) => {

                worker.onmessage = (event) => {
                    resolve(event.data);
                    worker.terminate();
                };

                worker.onerror = (error) => {
                    reject(error.message);
                    worker.terminate();
                };

                worker.postMessage({
                    type: 'INIT'
                });

            });
        });

        expect(result.status).toBe('READY');
    });

    test('worker responds with COMPLETE for RUN_OCR placeholder', async ({ page }) => {

        const result = await page.evaluate(async () => {

            const worker = new Worker('./ocr.worker.js');

            return new Promise((resolve, reject) => {

                worker.onmessage = (event) => {
                    resolve(event.data);
                    worker.terminate();
                };

                worker.onerror = (error) => {
                    reject(error.message);
                    worker.terminate();
                };

                worker.postMessage({
                    type: 'RUN_OCR'
                });

            });
        });

        expect(result.status).toBe('COMPLETE');
    });

    test('worker responds with ERROR for unsupported message', async ({ page }) => {

        const result = await page.evaluate(async () => {

            const worker = new Worker('./ocr.worker.js');

            return new Promise((resolve, reject) => {

                worker.onmessage = (event) => {
                    resolve(event.data);
                    worker.terminate();
                };

                worker.onerror = (error) => {
                    reject(error.message);
                    worker.terminate();
                };

                worker.postMessage({
                    type: 'INVALID_MESSAGE'
                });

            });
        });

        expect(result.status).toBe('ERROR');
    });

    test('worker does not crash when receiving malformed message', async ({ page }) => {

        const result = await page.evaluate(async () => {

            const worker = new Worker('./ocr.worker.js');

            return new Promise((resolve, reject) => {

                worker.onmessage = (event) => {
                    resolve(event.data);
                    worker.terminate();
                };

                worker.onerror = (error) => {
                    reject(error.message);
                    worker.terminate();
                };

                worker.postMessage({});

            });
        });

        expect(result.status).toBe('ERROR');
    });
});