import * as FileSystem from 'expo-file-system/legacy';
import type { 
  ChatMessage, 
  MessageMetrics, 
  OnDeviceModel, 
  MemoryPagingConfig 
} from '../types';

let nativeInitLlama: any = null;
try {
  const llamaPkg = require('llama.rn');
  nativeInitLlama = llamaPkg.initLlama || llamaPkg.default?.initLlama;
} catch {}

export class OnDeviceEngine {
  private static isInitialized = false;
  private static activeModel: OnDeviceModel | null = null;
  private static activeConfig: MemoryPagingConfig | null = null;
  private static loadedRamMb: number = 0;
  private static nativeContext: any = null;

  public static isNativeSupported(): boolean {
    return typeof nativeInitLlama === 'function';
  }

  public static async loadModel(
    model: OnDeviceModel,
    config: MemoryPagingConfig
  ): Promise<{ success: boolean; loadedRamMb: number; message: string }> {
    // 1. Verify model weights on device storage
    let weightsFoundOnDisk = false;
    let actualSizeBytes = 0;
    let localModelPath: string | null = null;

    try {
      if (FileSystem.documentDirectory) {
        const filePath = `${FileSystem.documentDirectory}models/${model.id}.gguf`;
        const fileInfo = await FileSystem.getInfoAsync(filePath);
        if (fileInfo.exists && typeof fileInfo.size === 'number' && fileInfo.size > 10 * 1024 * 1024) {
          weightsFoundOnDisk = true;
          actualSizeBytes = fileInfo.size;
          localModelPath = filePath.replace(/^file:\/\//, '');
        }
      }
    } catch {}

    if (!weightsFoundOnDisk || !localModelPath) {
      return {
        success: false,
        loadedRamMb: 0,
        message: `Model weights for "${model.name}" are not downloaded on device yet. Please download the model from the Models tab first.`,
      };
    }

    // 2. Verify native C++/GPU runtime support (standalone iOS/Android build)
    if (!this.isNativeSupported()) {
      return {
        success: false,
        loadedRamMb: 0,
        message: 'Native C++ / GPU runtime is not available inside the Expo Go sandbox. Run a standalone development build (npx expo run:ios or npx expo run:android) to load GGUF models directly on device hardware.',
      };
    }

    // 3. Initialize Native C++ / Apple Metal / OpenCL Context
    try {
      if (this.nativeContext) {
        await this.nativeContext.release().catch(() => {});
        this.nativeContext = null;
      }

      this.nativeContext = await nativeInitLlama({
        model: localModelPath,
        n_ctx: config.contextWindow || 2048,
        n_gpu_layers: 99, // Apple Metal GPU on iOS / OpenCL on Android
        use_mmap: config.useMmap ?? true,
        flash_attn_type: 'auto',
        cache_type_k: config.kvCacheQuant || 'q8_0',
        cache_type_v: config.kvCacheQuant || 'q8_0',
      });

      this.activeModel = model;
      this.activeConfig = config;
      this.isInitialized = true;
      this.loadedRamMb = config.estimatedFootprintMb || Math.round(model.sizeMb * 1.3);

      return {
        success: true,
        loadedRamMb: this.loadedRamMb,
        message: `Loaded ${model.name} (${(actualSizeBytes / (1024 * 1024)).toFixed(1)} MB) into native GPU memory via Apple Metal / OpenCL.`,
      };
    } catch (err: any) {
      this.isInitialized = false;
      this.activeModel = null;
      this.nativeContext = null;
      this.loadedRamMb = 0;
      return {
        success: false,
        loadedRamMb: 0,
        message: `Failed to initialize native model: ${err?.message || String(err)}`,
      };
    }
  }

  public static async unloadModel(): Promise<void> {
    if (this.nativeContext) {
      try {
        await this.nativeContext.release();
      } catch {}
      this.nativeContext = null;
    }
    this.isInitialized = false;
    this.activeModel = null;
    this.activeConfig = null;
    this.loadedRamMb = 0;
  }

  public static isModelLoaded(): boolean {
    return this.isInitialized && this.nativeContext !== null && this.activeModel !== null;
  }

  public static getActiveModel(): OnDeviceModel | null {
    return this.activeModel;
  }

  public static getLoadedRamMb(): number {
    return this.loadedRamMb;
  }

  /**
   * Generates a streaming response for the prompt.
   * 100% Native on-device execution on the phone's Apple Metal / OpenCL GPU via llama.rn.
   */
  public static async generateCompletion(
    messages: ChatMessage[],
    config: MemoryPagingConfig,
    onToken: (chunk: string) => void,
    onComplete: (metrics: MessageMetrics) => void
  ): Promise<() => void> {
    let isCancelled = false;
    const startTime = Date.now();

    (async () => {
      // 1. Check if model is loaded into native hardware
      if (!this.nativeContext) {
        const errorMsg = !this.isNativeSupported()
          ? 'Native C++ / Metal / OpenCL engine is not available in the Expo Go sandbox.\n\nPlease run this standalone development build (`npx expo run:ios` or `npx expo run:android`) to execute GGUF models directly on device hardware.'
          : 'No GGUF model is loaded into device memory.\n\nPlease go to the Models tab, download a model (e.g. SmolLM2 135M or Qwen 2.5 0.5B), and tap "Load into RAM".';

        onToken(errorMsg);
        onComplete({
          ttftMs: 0,
          tokensPerSec: 0,
          totalTokens: 0,
          generationDurationMs: 0,
          backendUsed: 'on_device_paged',
        });
        return;
      }

      // 2. Direct Native On-Device Inference on Phone's Hardware
      let firstTokenTime = 0;
      let totalTokens = 0;

      try {
        const stopWords = [
          '</s>',
          '<|end|>',
          '<|eot_id|>',
          '<|end_of_text|>',
          '<|im_end|>',
          '<|EOT|>',
          '<|END_OF_TURN_TOKEN|>',
          '<|end_of_turn|>',
          '<|endoftext|>',
        ];

        const formattedMessages = messages.map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const result = await this.nativeContext.completion(
          {
            messages: formattedMessages,
            n_predict: 256,
            stop: stopWords,
            temperature: 0.7,
          },
          (data: { token?: string }) => {
            if (isCancelled || !data?.token) return;
            if (firstTokenTime === 0) firstTokenTime = Date.now();
            totalTokens++;
            onToken(data.token);
          }
        );

        if (!isCancelled) {
          const endTime = Date.now();
          const durationSec = Math.max(0.1, (endTime - (firstTokenTime || startTime)) / 1000);
          const tokensPerSec = result?.timings?.predicted_per_second
            ? Number(result.timings.predicted_per_second.toFixed(1))
            : Number((totalTokens / durationSec).toFixed(1));

          onComplete({
            ttftMs: firstTokenTime ? firstTokenTime - startTime : 45,
            tokensPerSec,
            totalTokens: result?.timings?.predicted_n || totalTokens,
            generationDurationMs: endTime - startTime,
            backendUsed: 'on_device_paged',
          });
        }
      } catch (err: any) {
        if (!isCancelled) {
          onToken(`\n\n[Inference Error: ${err?.message || String(err)}]`);
          onComplete({
            ttftMs: 0,
            tokensPerSec: 0,
            totalTokens,
            generationDurationMs: Date.now() - startTime,
            backendUsed: 'on_device_paged',
          });
        }
      }
    })();

    return () => {
      isCancelled = true;
      try {
        this.nativeContext?.stopCompletion?.();
      } catch {}
    };
  }
}
