# PHASE 01 — OCR FOUNDATION

**Source of Truth:** DESIGN.md

---

# Objective

Build a working OCR foundation capable of:

```text
Image Input
    ↓
OCR Worker
    ↓
PP-OCRv4 Models
    ↓
CTC Decoder
    ↓
Raw Text Output
```

This phase focuses exclusively on OCR infrastructure.

Excluded from Phase 1:

```text
❌ CRM
❌ Lead Extraction
❌ IndexedDB
❌ Search
❌ Review Modal
❌ PWA Features
❌ Lead Management
```

Success means that a business card image can pass through the OCR pipeline and return readable raw text.

---

# Deliverables

1. Working `ocr.worker.js`
2. ONNX Runtime Web integration
3. WASM runtime configuration
4. Detection model loading
5. Recognition model loading
6. INIT workflow
7. RUN_OCR workflow
8. COMPLETE workflow
9. Character dictionary implementation
10. CTC greedy decoder implementation
11. Raw OCR text output
12. Error handling and status messaging

---

# Tasks

## Task 1

Verify required project structure exists.

Required:

```text
models/
ocr.worker.js
index.html
manifest.json
sw.js
```

---

## Task 2

Create OCR Worker skeleton.

Implement:

```text
Worker startup
Message handler
Status logging
Error logging
```

No OCR functionality yet.

---

## Task 3

Integrate ONNX Runtime Web.

Implement:

```text
ort.min.js loading
Runtime initialization
```

---

## Task 4

Configure ONNX Runtime WASM paths.

Implement:

```text
ort.env.wasm.wasmPaths
```

Verify WASM runtime startup.

---

## Task 5

Implement worker INIT message.

Purpose:

```text
Initialize worker
Prepare runtime
Report READY
```

---

## Task 6

Load Detection Model.

Model:

```text
det_ppocr_v4.onnx
```

Create inference session.

---

## Task 7

Load Recognition Model.

Model:

```text
rec_ppocr_v4.onnx
```

Create inference session.

---

## Task 8

Implement RUN_OCR message.

Purpose:

```text
Accept image payload
Begin OCR execution
```

---

## Task 9

Implement image preprocessing.

Requirements:

```text
Resize
Normalize
Convert HWC → CHW
Build Float32 tensor
```

---

## Task 10

Implement Character Dictionary.

Requirements:

```text
ppocr_keys_v1 dictionary
Character lookup
Index mapping
```

---

## Task 11

Implement CTC Greedy Decoder.

Requirements:

```text
Argmax selection
Duplicate collapse
Blank token removal
Character mapping
```

---

## Task 12

Execute OCR pipeline.

Flow:

```text
Detection
↓
Recognition
↓
CTC Decoder
```

---

## Task 13

Implement COMPLETE message.

Worker must return:

```text
status: COMPLETE
text: OCR output
```

---

## Task 14

Return raw OCR text.

No parsing.

No entity extraction.

No CRM mapping.

Raw text only.

---

# Acceptance Tests

## Test 1

Project structure exists.

PASS:

```text
All required files and folders are present.
```

FAIL:

```text
Any required file is missing.
```

---

## Test 2

OCR worker starts.

PASS:

```text
Worker initializes without exceptions.
```

---

## Test 3

ONNX Runtime loads.

PASS:

```text
No runtime errors.
```

---

## Test 4

WASM paths configured.

PASS:

```text
WASM backend starts successfully.
```

---

## Test 5

INIT succeeds.

PASS:

```text
READY status returned.
```

---

## Test 6

Detection model loads.

PASS:

```text
InferenceSession created.
```

---

## Test 7

Recognition model loads.

PASS:

```text
InferenceSession created.
```

---

## Test 8

RUN_OCR succeeds.

PASS:

```text
Image payload accepted.
```

---

## Test 9

Image preprocessing succeeds.

PASS:

```text
Valid tensor generated.
```

---

## Test 10

Character dictionary loads.

PASS:

```text
All dictionary entries accessible.
```

---

## Test 11

CTC decoder works.

PASS:

```text
Decoded output produced.
```

---

## Test 12

OCR inference succeeds.

PASS:

```text
Detection and recognition complete.
```

---

## Test 13

COMPLETE message returned.

PASS:

```text
Worker returns COMPLETE status.
```

---

## Test 14

Raw OCR text returned.

PASS:

```text
Readable text output generated.
```

---

## Test 15

OCR output quality check.

PASS:

```text
Recognizable business card text returned.
```

FAIL:

```text
Blank output
Gibberish
Repeated characters only
```

---

# Task-to-Test Mapping

```text
Task 1  → Test 1

Task 2  → Test 2

Task 3  → Test 3

Task 4  → Test 4

Task 5  → Test 5

Task 6  → Test 6

Task 7  → Test 7

Task 8  → Test 8

Task 9  → Test 9

Task 10 → Test 10

Task 11 → Test 11

Task 12 → Test 12

Task 13 → Test 13

Task 14 → Test 14

Task 12 + 14 → Test 15
```

---

# Smallest First Task

## Task 1

Verify project structure exists.

Required:

```text
models/
ocr.worker.js
index.html
manifest.json
sw.js
```

No coding required.

---

# Build Prompt

```text
Inspect the repository.

Verify the following files and folders exist:

models/
ocr.worker.js
index.html
manifest.json
sw.js

Output:

FOUND
MISSING

Do not modify files.
Do not generate code.
Do not create files.
```

---

# Review Prompt

```text
Review Phase 1 Task 1.

Verify:

models/
ocr.worker.js
index.html
manifest.json
sw.js

Output:

PASS
FAIL

List missing items only.

Do not modify files.
```

---

# Validation Prompt

```text
Validate Acceptance Test 1.

Acceptance Test:

All required files and folders exist.

Output:

PASS

or

FAIL

List missing items only.

Do not modify files.
Do not generate code.
```

---

# Phase 1 Completion Definition

Phase 1 is complete only when:

```text
✅ OCR Worker Starts
✅ ONNX Runtime Loads
✅ WASM Runtime Loads
✅ INIT Works
✅ Detection Model Loads
✅ Recognition Model Loads
✅ RUN_OCR Executes
✅ Character Dictionary Works
✅ CTC Decoder Works
✅ COMPLETE Status Returns
✅ Raw OCR Text Is Returned
✅ OCR Output Passes Quality Check
```

Only after all Phase 1 acceptance tests pass may development move to:

```text
PHASE-02-IMAGE-ACQUISITION
```