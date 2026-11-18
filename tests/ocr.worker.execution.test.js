const path = require("path");
const { Worker } = require("worker_threads");

const workerPath = path.resolve(
    process.cwd(),
    "ocr.worker.js"
);

function createWorker() {
    return new Worker(workerPath);
}

describe("Phase 1 Task 2 - OCR Worker Skeleton", () => {

    test("worker starts successfully", async () => {

        const worker = createWorker();

        worker.terminate();

        expect(true).toBe(true);
    });

    test("INIT returns READY status", async () => {

        const worker = createWorker();

        const result = await new Promise((resolve, reject) => {

            worker.once("message", resolve);

            worker.once("error", reject);

            worker.postMessage({
                type: "INIT"
            });
        });

        worker.terminate();

        expect(result.status).toBe("READY");
    });

    test("RUN_OCR returns COMPLETE placeholder", async () => {

        const worker = createWorker();

        const result = await new Promise((resolve, reject) => {

            worker.once("message", resolve);

            worker.once("error", reject);

            worker.postMessage({
                type: "RUN_OCR"
            });
        });

        worker.terminate();

        expect(result.status).toBe("COMPLETE");
    });

    test("unsupported message returns ERROR", async () => {

        const worker = createWorker();

        const result = await new Promise((resolve, reject) => {

            worker.once("message", resolve);

            worker.once("error", reject);

            worker.postMessage({
                type: "UNKNOWN_MESSAGE"
            });
        });

        worker.terminate();

        expect(result.status).toBe("ERROR");
    });

});