// tests/ocr.worker.skeleton.spec.js

const path = require("path");
const fs = require("fs");

describe("Phase 1 - Task 2 OCR Worker Skeleton", () => {

    const workerPath = path.join(
        process.cwd(),
        "ocr.worker.js"
    );

    test("ocr.worker.js exists", () => {
        expect(fs.existsSync(workerPath)).toBe(true);
    });

    test("contains INIT message handler", () => {
        const content = fs.readFileSync(workerPath, "utf8");

        expect(content).toContain("INIT");
    });

    test("contains RUN_OCR message handler", () => {
        const content = fs.readFileSync(workerPath, "utf8");

        expect(content).toContain("RUN_OCR");
    });

    test("contains READY status", () => {
        const content = fs.readFileSync(workerPath, "utf8");

        expect(content).toContain("READY");
    });

    test("contains ERROR status", () => {
        const content = fs.readFileSync(workerPath, "utf8");

        expect(content).toContain("ERROR");
    });

    test("contains COMPLETE status", () => {
        const content = fs.readFileSync(workerPath, "utf8");

        expect(content).toContain("COMPLETE");
    });

    test("contains worker message handler", () => {
        const content = fs.readFileSync(workerPath, "utf8");

        expect(content).toContain("onmessage");
    });

    test("contains error handling", () => {
        const content = fs.readFileSync(workerPath, "utf8");

        expect(content).toContain("try");
        expect(content).toContain("catch");
    });

});