const fs = require("fs");

const content = fs.readFileSync("ocr.worker.js", "utf8");

const checks = [
    "INIT",
    "RUN_OCR",
    "READY",
    "ERROR",
    "COMPLETE",
    "onmessage"
];

let pass = true;

for (const check of checks) {
    const found = content.includes(check);

    console.log(
        `${found ? "PASS" : "FAIL"} : ${check}`
    );

    if (!found) {
        pass = false;
    }
}

process.exit(pass ? 0 : 1);