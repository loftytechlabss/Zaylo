# Zaylo Mobile

**High-Performance Hybrid On-Device & Desktop AI Inference App for Android & iOS**

Zaylo Mobile brings the full power of Zaylo to your smartphone with an intelligent **Hybrid Engine**:
* **On-Device Mode**: Runs local LLMs directly on your phone's processor using **Kernel Virtual Memory Paging (`mmap`)**, **Quantized KV Caching**, and **Micro-batched Ingestion**.
* **Desktop Mode**: Connects over your local Wi-Fi to your Zaylo Desktop Server (`:8080`) to tap into 7B–70B models, multimodal vision, and SQLite document RAG without consuming phone battery.

---

## The Memory Paging Engine (How 3B Models Run on Mobile)

Running a 3.2 Billion parameter model on a smartphone usually crashes the app because Android's `LowMemoryKiller` (LMK) terminates any app that allocates 2+ GB of continuous physical heap.

Zaylo Mobile solves this with a 4-pillar **Memory Paging Engine** (`src/engine/memoryPaging.ts`):

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       ZAYLO MOBILE MEMORY PAGING ENGINE                     │
├──────────────────────────┬──────────────────────────────────────────────────┤
│ 1. Kernel Paging (mmap)  │ Model weights stay on flash storage. The OS      │
│                          │ kernel only pages active 4KB–64KB tensor pages   │
│                          │ into RAM during matrix multiplication. Zero full │
│                          │ file load into process RSS.                      │
├──────────────────────────┼──────────────────────────────────────────────────┤
│ 2. Quantized KV Cache    │ Caches Key-Value attention states in 8-bit       │
│    (q8_0 / q4_0)         │ (`q8_0`) or 4-bit (`q4_0`), cutting active multi-│
│                          │ turn RAM consumption by 50% to 75%.              │
├──────────────────────────┼──────────────────────────────────────────────────┤
│ 3. Micro-Batch Ingestion │ Ingests prompt tokens in small 128-token pages   │
│    (n_ubatch: 128)       │ (`n_ubatch`), eliminating peak scratchpad RAM    │
│                          │ spikes that cause OOM crashes.                   │
├──────────────────────────┼──────────────────────────────────────────────────┤
│ 4. Sliding Context Pager │ Prunes conversation history dynamically to keep  │
│                          │ active tokens strictly bounded inside the target │
│                          │ budget (1024 or 2048 tokens).                    │
└──────────────────────────┴──────────────────────────────────────────────────┘
```

---

## Device Tiers & Universal Compatibility

The app includes an **Adaptive Device Profiler** (`src/engine/deviceProfiler.ts`) ensuring that **even a \$70 budget device can run a local model smoothly**:

| Tier | Target Devices | Certified Model | Working RAM Footprint | Paging Strategy |
| :--- | :--- | :--- | :---: | :--- |
| **Tier 1: Eco** | Normal / Budget (< 4GB RAM) | **SmolLM2 135M / 360M** | **~160 – 380 MB** | Lightweight mmap, 1K context |
| **Tier 2: Balanced** | Mid-Range (4GB – 6GB RAM) | **Llama 3.2 1B (Q4_K_M)** | **~920 MB** | `mmap` + `q8_0` KV cache + 2K ctx |
| **Tier 3: Flagship** | Flagship Phones (8GB+ RAM) | **Llama 3.2 3B (Paged)** | **~1.85 GB** | Full Virtual Paging + `q8_0` KV + Flash Attention |

---

## Architecture & Code Structure

```text
apps/mobile/
├── App.tsx                     # Root application container & safe area
├── index.js                    # Entry point registering root component
├── package.json                # Dependencies and scripts
├── app.json                    # Expo configuration & Android permissions
├── tsconfig.json               # TypeScript path aliases
├── src/
│   ├── theme/
│   │   └── colors.ts           # Dark, futuristic slate/zinc design tokens
│   ├── types/
│   │   └── index.ts            # Typed models, memory configs, messages
│   ├── engine/
│   │   ├── memoryPaging.ts     # Paging formulas, KV cache, mmap flags
│   │   ├── deviceProfiler.ts   # Device RAM profiler & model catalog
│   │   ├── onDeviceEngine.ts   # Local inference lifecycle supervisor
│   │   ├── desktopClient.ts    # Fastify /v1/chat/completions SSE client
│   │   └── hybridRouter.ts     # Coordinates local vs remote dispatch
│   └── components/
│       ├── Header.tsx          # Mode switcher pill & memory gauge button
│       ├── ChatView.tsx        # Message feed with streaming cursor & telemetry
│       ├── MessageInput.tsx    # Floating input bar with send/stop toggles
│       ├── MemoryGaugeModal.tsx# Visual RAM breakdown & paging inspector
│       ├── PairingModal.tsx    # QR Code scanner & Wi-Fi LAN connector
│       └── ModelSelectorModal.tsx # Certified model browser
```

---

## Development & Testing

### 1. Test in Expo Go (Instant Setup)
You can test the UI, the hybrid mode switcher, the memory paging inspector, and the Desktop Wi-Fi connection immediately via Expo Go:

```bash
cd apps/mobile
pnpm start
# or: npx expo start
```
Scan the terminal QR code with the **Expo Go** app on your Android phone.

### 2. Build Native APK with C++ `llama.cpp` (Development Build)
To compile the C++ Vulkan/NDK engine on your device:

```bash
cd apps/mobile
pnpm android
# or: npx expo run:android
```
