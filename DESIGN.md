# ClientHub PWA — Software Design Specification (SDS)

**Version:** 1.0 (MVP)  
**Architecture:** Local-First Offline PWA with Client-Side Neural Inference (PP-OCRv4 + ONNX Runtime Web)  
**Target Agent Context:** Hermes Agent (`DESIGN.md` Blueprint)

---

## 1. Executive Summary & System Goals
**ClientHub** is an offline-first Progressive Web App (PWA) designed for field sales representatives, shopkeepers, and small business owners to digitize physical business cards and manage customer leads without requiring cloud connectivity or paid OCR APIs.

* **Zero-Server Inference:** All optical character recognition executes locally inside the user's browser using WebAssembly (WASM) via ONNX Runtime Web.
* **Data Privacy & Zero Cost:** Sensitive contact imagery never leaves the user's device, eliminating API latency, recurring server costs, and privacy compliance risks.
* **Human-in-the-Loop (HITL) Accuracy:** Combines neural text recognition with regex heuristic parsing and an interactive verification modal to guarantee 100% clean CRM data.

---

## 2. Technology Stack

| Layer | Technology / Library | Purpose & Rationale |
| :--- | :--- | :--- |
| **Frontend UI & Reactivity** | **Alpine.js** + Tailwind CSS | Lightweight, zero-build-step reactive state management and responsive mobile-first UI. |
| **OCR Models** | **PaddleOCR (PP-OCRv4)** | Exported to ONNX (`det_ppocr_v4.onnx` & `rec_ppocr_v4.onnx`) for mobile-grade accuracy and compact footprint. |
| **Inference Engine** | **ONNX Runtime Web (`ort.min.js`)** | Executes neural network graphs in-browser via WebAssembly (WASM). |
| **Concurrency** | **HTML5 Web Workers (`ocr.worker.js`)** | Offloads heavy tensor math and model execution from the main UI thread to prevent interface freezing. |
| **Local Storage** | **IndexedDB / LocalStorage** | Persists structured lead records offline on the device. |
| **Offline Caching** | **Service Worker (`sw.js`) & Web Manifest** | Precaches HTML, JS, WASM binaries, and `.onnx` models for 100% offline execution. |
| **Hosting** | **GitHub Pages / Local Static Server** | Static asset hosting under a relative subpath (`./`) and local testing via `npx serve`. |

---

## 3. System Architecture & Data Flow

```text
┌──────────────────────────────────────────────────────────────────────┐
│                         MAIN UI THREAD (Alpine.js)                   │
│  [1. Camera / File Input] ──► [2. HTML5 Canvas Resize & RGBA Extract] │
└─────────────────────────────────────────┬────────────────────────────┘
                                          │ Zero-Copy Transferable Buffer
                                          ▼ (postMessage: imageBuffer.buffer)
┌──────────────────────────────────────────────────────────────────────┐
│                       WEB WORKER THREAD (ocr.worker.js)              │
│  [3. Tensor Preprocessing] ──► Resize, Normalize, HWC-to-CHW Layout  │
│             │                                                        │
│             ▼                                                        │
│  [4. ONNX Runtime (WASM)]  ──► det_ppocr_v4.onnx & rec_ppocr_v4.onnx │
│             │                                                        │
│             ▼                                                        │
│  [5. CTC Greedy Decoder]   ──► Logits argmax + Dictionary Mapping    │
└─────────────────────────────────────────┬────────────────────────────┘
                                          │ postMessage: { status: 'COMPLETE', text }
                                          ▼
┌──────────────────────────────────────────────────────────────────────┐
│                   MAIN UI THREAD (Heuristic & HITL)                  │
│  [6. Regex Field Mapper]   ──► Auto-extract Name, Phone, Email, Org  │
│             │                                                        │
│             ▼                                                        │
│  [7. Review Modal (UI)]    ──► Side-by-side Image + Editable Form    │
│             │                                                        │
│             ▼                                                        │
│  [8. Offline CRM Storage]  ──► Commit validated record to IndexedDB  │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 4. Component Specifications

### 4.1 Frontend Image Capture & Preprocessing (`index.html`)
* **Input Handling:** Accepts image uploads via `<input type="file" accept="image/*" capture="environment">` to invoke native mobile cameras or gallery selection.
* **Downscaling:** Draws the image onto an offscreen HTML5 `<canvas>` capped at a maximum width of `1000px` (preserving aspect ratio) to balance text legibility against WASM memory and inference latency.
* **Zero-Copy Transfer:** Extracts raw `ImageData` (`Uint8ClampedArray`) and transfers ownership of the underlying `ArrayBuffer` to the Web Worker using `worker.postMessage(payload, [imgData.data.buffer])`, avoiding memory cloning overhead.

### 4.2 OCR Web Worker (`ocr.worker.js`)
* **Logging & Environment:** Use standard `console.log` / `console.error` only. Never use non-standard `Log` calls.
* **Initialization (`INIT`):**
  * Loads `ort.min.js` via `importScripts('https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/ort.min.js')` and configures `ort.env.wasm.wasmPaths`.
  * Instantiates `detSession` (`./models/det_ppocr_v4.onnx`) and `recSession` (`./models/rec_ppocr_v4.onnx`) using `{ executionProviders: ['wasm'] }`.
* **Tensor Preprocessing (`RUN_OCR`):**
  * **Detection Input:** Resizes image dimensions to multiples of 32 and applies ImageNet normalization ($\text{mean} = [0.485, 0.456, 0.406]$, $\text{std} = [0.229, 0.224, 0.225]$) in `NCHW` format (`[1, 3, H, W]`).
  * **Recognition Input:** Resizes text crops to `[1, 3, 48, 320]`, normalizes pixel values to $[-1, 1]$ via `(pixel / 255.0 - 0.5) / 0.5`, and transposes pixel layout from interleaved `HWC` to planar `CHW` `Float32Array` (`const destIdx = y * targetW + x;`).
* **CTC Greedy Decoding:**
  * Iterates across output tensor timesteps `[1, TimeSteps, NumClasses]`, selecting the class index with the highest logit value at each step.
  * Collapses consecutive duplicate indices and strips CTC blank tokens (index `0`), mapping valid indices against the embedded `CHARACTER_DICT` (`ppocr_keys_v1` character dictionary).

### 4.3 Regex Entity Extraction & Human-in-the-Loop Modal
* **Heuristic Parsing:** Splits decoded text into lines and applies regular expressions to populate structured lead fields:
  * **Phone:** `/(\+?\d{10,13}|(?:\d{3}[-.\s]??\d{3}[-.\s]??\d{4}))/`
  * **Email:** `/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/`
  * **Name & Company:** Mapped heuristically from top-ranked non-contact text lines.
* **Review Modal:** Displays the scanned business card image thumbnail directly above pre-filled inputs (`Full Name`, `Phone`, `Email`, `Company`), allowing instant user correction prior to committing the record.

### 4.4 Offline Data Model (CRM Schema)
Confirmed leads are persisted locally as JSON objects in IndexedDB / `localStorage` under `clienthub_leads`:

```json
{
  "id": 1731514800000,
  "name": "Rahul Sharma",
  "phone": "+91 98765 43210",
  "email": "rahul@sharmatraders.in",
  "company": "Sharma Retail & Logistics",
  "scannedAt": "2026-11-14T10:24:00.000Z",
  "syncStatus": "local_only"
}
```

---

## 5. PWA & Deployment Architecture

### 5.1 Directory Structure
All paths **must** use relative `./` prefixes to ensure compatibility when hosted on subpath origins (e.g., `https://<username>.github.io/vyapar-crm/`) or served locally via `npx serve`:

```text
/clienthub/
├── DESIGN.md                # This Software Design Specification blueprint
├── index.html               # Main Alpine.js UI & HITL Review Modal
├── manifest.json            # PWA installability metadata & icons
├── sw.js                    # Service Worker for offline model/WASM caching
├── ocr.worker.js            # Background ONNX inference & CTC decoder
└── models/
    ├── det_ppocr_v4.onnx    # PP-OCRv4 Text Detection model
    └── rec_ppocr_v4.onnx    # PP-OCRv4 Text Recognition model
```

### 5.2 Offline Caching Strategy (`sw.js`)
* **Install Phase (Precaching):** Caches core shell assets (`./`, `./index.html`, `./manifest.json`, `./ocr.worker.js`, `./models/det_ppocr_v4.onnx`, `./models/rec_ppocr_v4.onnx`) and ONNX Runtime WASM binaries in a versioned cache (`clienthub-v1`).
* **Fetch Phase (Cache-First):** Intercepts network requests and serves cached `.onnx` and `.wasm` assets directly from Cache Storage, ensuring sub-second startup and full functionality in airplane mode or low-connectivity retail environments.

---

## 6. Performance & Implementation Constraints
* **Memory Bounds:** Only one `ort.InferenceSession` pair is instantiated per worker lifecycle and reused across scans to prevent WASM heap fragmentation.
* **No External Build Tools:** Keep frontend architecture zero-build-step (vanilla JS + Alpine.js CDN + Tailwind CDN) so files run directly with `npx serve`.
* **Graceful Degradation:** If neural decoding yields empty output or encounters unsupported lighting/angles, the worker falls back cleanly without crashing the UI, allowing manual entry in the review modal.

---

## 7. Hermes Agent Execution Checklist
When prompting Hermes Agent in this workspace, execute tasks in the following sequence:
1. **`ocr.worker.js`**: Implement full WASM session loading, `preprocessForRecognition` (with `y * targetW + x` CHW indexing), complete `CHARACTER_DICT`, and `ctcGreedyDecode`.
2. **`index.html`**: Build the Alpine.js reactive scanner UI, canvas downscaler, zero-copy `ArrayBuffer` worker bridge, regex field parser, HITL verification modal, and IndexedDB/LocalStorage lead manager.
3. **`manifest.json` & `sw.js`**: Configure offline caching for all `./` assets and `.onnx` model binaries.
4. **Verification**: Serve locally with `npx serve` and validate offline execution in browser DevTools.