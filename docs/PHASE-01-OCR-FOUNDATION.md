# PHASE 01 — OCR FOUNDATION
**Source of Truth:** DESIGN.md
---
## Objective
Build a working OCR foundation capable of:
```text
Image Input
    ↓
OCR Worker
    ↓
PP-OCRv4 Models
    ↓
Raw Text Output
```
No CRM.
No lead extraction.
No IndexedDB.
No PWA features.
Only a functioning OCR pipeline.
---
## Deliverables
1. Working `ocr.worker.js`
2. ONNX Runtime Web integration
3. Successful loading of:
   - `det_ppocr_v4.onnx`
   - `rec_ppocr_v4.onnx`
4. OCR worker initialization message
5. OCR execution message
6. Raw text returned from OCR engine
7. Error handling and status reporting
---
# Tasks
## Task 1
Verify required project structure exists:
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
Message routing
Logging
```
No OCR yet.
---
## Task 3
Integrate ONNX Runtime Web.
Goal:
```text
ort.min.js loads successfully
```
---
## Task 4
Implement worker initialization flow.
Support:
```text
INIT
```
message.
---
## Task 5
Load Detection Model.
```text
det_ppocr_v4.onnx
```
---
## Task 6
Load Recognition Model.
```text
rec_ppocr_v4.onnx
```
---
## Task 7
Create OCR execution flow.
Support:
```text
RUN_OCR
```
message.
---
## Task 8
Implement image preprocessing.
Support:
```text
Resize
Normalize
Tensor creation
```
---
## Task 9
Execute inference pipeline.
```text
Detection
Recognition
```
---
## Task 10
Return raw OCR text.
No parsing.
No field extraction.
Raw text only.
---
# Acceptance Tests
## Test 1
Project structure exists.
**PASS**
```text
All required files exist.
```
---
## Test 2
OCR worker starts.
**PASS**
```text
Worker initializes without exception.
```
---
## Test 3
ONNX Runtime loads.
**PASS**
```text
No WASM errors.
```
---
## Test 4
Detection model loads.
**PASS**
```text
InferenceSession created.
```
---
## Test 5
Recognition model loads.
**PASS**
```text
InferenceSession created.
```
---
## Test 6
INIT message succeeds.
**PASS**
```text
Worker reports READY.
```
---
## Test 7
RUN_OCR message succeeds.
**PASS**
```text
Worker receives image payload.
```
---
## Test 8
Preprocessing succeeds.
**PASS**
```text
Valid tensor generated.
```
---
## Test 9
Inference succeeds.
**PASS**
```text
Models execute without error.
```
---
## Test 10
OCR returns text.
**PASS**
```text
Business card image
↓
Raw text returned
```
---
# Task-to-Test Mapping
```text
Task 1 → Test 1
Task 2 → Test 2
Task 3 → Test 3
Task 4 → Test 6
Task 5 → Test 4
Task 6 → Test 5
Task 7 → Test 7
Task 8 → Test 8
Task 9 → Test 9
Task 10 → Test 10
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
List any missing item.
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
✅ Detection Model Loads
✅ Recognition Model Loads
✅ RUN_OCR Executes
✅ Raw OCR Text Is Returned
```
Nothing else belongs to Phase 1.
The next phase begins only after all 10 acceptance tests pass.

