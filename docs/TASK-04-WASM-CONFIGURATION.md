# TASK 04 — WASM CONFIGURATION

## Parent Phase

```text
PHASE 01
OCR FOUNDATION
```

---

# Objective

Configure ONNX Runtime Web to use the WASM execution provider and verify that the worker can successfully initialize with explicit WASM path configuration.

This task exists solely to configure and validate WASM runtime behavior.

---

# Scope

## In Scope

```text
✅ ort.env.wasm.wasmPaths
✅ WASM configuration
✅ WASM startup verification
✅ Runtime readiness validation
✅ INIT flow update
```

## Out of Scope

```text
❌ Model loading
❌ Detection model
❌ Recognition model
❌ OCR inference
❌ Image preprocessing
❌ Character dictionary
❌ CTC decoder
❌ Lead extraction
❌ IndexedDB
❌ PWA functionality
```

---

# Deliverables

1. WASM paths configured.
2. Runtime initializes successfully.
3. INIT verifies WASM availability.
4. READY status returned after WASM validation.
5. Existing Task 3 tests continue to pass.

---

# Tasks

## Task 4.1

Add:

```javascript
ort.env.wasm.wasmPaths
```

configuration.

---

## Task 4.2

Verify ONNX Runtime can locate WASM assets.

---

## Task 4.3

Update INIT flow to verify WASM initialization.

---

## Task 4.4

Return READY only when WASM validation succeeds.

---

## Task 4.5

Return ERROR if WASM validation fails.

---

# Acceptance Tests

## Test 4.1

WASM paths configured.

PASS:

```text
ort.env.wasm.wasmPaths exists.
```

FAIL:

```text
WASM path configuration missing.
```

---

## Test 4.2

Worker starts successfully.

PASS:

```text
Worker initializes without error.
```

FAIL:

```text
Worker startup fails.
```

---

## Test 4.3

INIT returns READY.

PASS:

```text
INIT
↓
READY
```

FAIL:

```text
INIT
↓
ERROR
```

---

## Test 4.4

WASM configuration verified.

PASS:

```text
Runtime confirms WASM availability.
```

FAIL:

```text
Runtime unavailable.
```

---

## Test 4.5

Existing Task 3 functionality preserved.

PASS:

```text
All Task 3 tests still pass.
```

FAIL:

```text
Any Task 3 test fails.
```

---

## Test 4.6

No model loading exists.

PASS:

```text
No det_ppocr_v4.onnx
No rec_ppocr_v4.onnx
```

FAIL:

```text
Any model-loading code exists.
```

---

## Test 4.7

No OCR inference exists.

PASS:

```text
No session.run()
```

FAIL:

```text
OCR inference implemented.
```

---

# Task-to-Test Mapping

```text
Task 4.1 → Test 4.1

Task 4.2 → Test 4.2, Test 4.4

Task 4.3 → Test 4.3

Task 4.4 → Test 4.3, Test 4.4

Task 4.5 → Test 4.3

Task 4.1-4.5 → Test 4.5

Task 4.1-4.5 → Test 4.6

Task 4.1-4.5 → Test 4.7
```

---

# Smallest First Task

## Task 4.1

Implement:

```javascript
ort.env.wasm.wasmPaths
```

only.

Nothing else.

---

# Build Prompt

```text
Using DESIGN.md as the only source of truth.

Phase 1
Task 4

Implement only:

ort.env.wasm.wasmPaths

Modify only:

ocr.worker.js

Requirements:

- Configure ONNX Runtime WASM paths.
- Do not load models.
- Do not implement OCR.
- Do not implement preprocessing.
- Do not implement inference.
- Do not implement character dictionaries.
- Do not implement CTC decoding.

Generate only one file.

Stop after Task 4.1.
```

---

# Review Prompt

```text
Review ocr.worker.js.

Validate Task 4.

Verify:

1. ort.env.wasm.wasmPaths exists.
2. Worker still starts.
3. INIT still functions.
4. READY status still exists.
5. ERROR status still exists.
6. No model loading.
7. No OCR inference.

Output:

PASS
or

FAIL

Then list:

Satisfied Requirements
Failed Requirements

No code generation.
```

---

# Validation Prompt

```text
Validate Task 4 Acceptance Tests.

Verify:

✅ Test 4.1
✅ Test 4.2
✅ Test 4.3
✅ Test 4.4
✅ Test 4.5
✅ Test 4.6
✅ Test 4.7

Output:

PASS
or

FAIL

List failed tests only.

Do not modify files.
```

---

# Completion Criteria

Task 4 is complete only when:

```text
✅ WASM paths configured
✅ Runtime initializes
✅ INIT returns READY
✅ Worker remains stable
✅ All Task 3 tests pass
✅ No model loading
✅ No inference
```

Only then may development move to:

```text
PHASE 01
TASK 05
INIT Runtime Flow
```