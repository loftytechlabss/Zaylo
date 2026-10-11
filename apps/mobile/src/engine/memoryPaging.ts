import type { 
  KVCacheQuant, 
  MemoryPagingConfig, 
  OnDeviceModel,
  ChatMessage 
} from '../types';

/**
 * MobileMemoryPagingEngine
 * 
 * Provides kernel-level virtual memory paging configuration, quantized KV-cache allocation,
 * and sliding-window context management to run 1B–3B models within mobile RAM constraints
 * without triggering Android's LowMemoryKiller (LMK).
 */
export class MobileMemoryPagingEngine {
  /**
   * Calculates the exact memory footprint of the Key-Value (KV) attention cache
   * based on context window and quantization level.
   */
  public static calculateKVCacheBytes(
    layers: number,
    kvHeads: number,
    headDim: number,
    contextWindow: number,
    quant: KVCacheQuant
  ): number {
    const bytesPerElement = quant === 'f16' ? 2 : quant === 'q8_0' ? 1 : 0.5;
    // 2 accounts for both Key and Value tensors
    return 2 * layers * kvHeads * headDim * contextWindow * bytesPerElement;
  }

  /**
   * Generates optimal memory-paging parameters tailored to the device's available RAM
   * and the target model's parameter scale.
   */
  public static optimizePagingConfig(
    model: OnDeviceModel,
    availableRamMb: number
  ): MemoryPagingConfig {
    // Determine conservative RAM budget (max 65% of available RAM to avoid OS pressure)
    const ramBudgetMb = Math.floor(availableRamMb * 0.65);

    const modelId = model?.id || '';

    if (modelId.includes('3b')) {
      // 3B Model Paging Strategy:
      // High-efficiency virtual memory paging (mmap) + 8-bit quantized KV cache + capped 2048 context
      const useMmap = true;
      const kvCacheQuant: KVCacheQuant = availableRamMb < 4000 ? 'q4_0' : 'q8_0';
      const contextWindow = availableRamMb < 3500 ? 1024 : 2048;
      const nUbatch = 128; // Micro-batch size during prompt ingestion to prevent scratch memory spikes
      
      // Estimated working set: Active mmap pages (~1.5GB) + Quantized KV (~120MB) + Scratch (~90MB)
      const estimatedFootprintMb = kvCacheQuant === 'q4_0' ? 1650 : 1850;

      return {
        useMmap,
        kvCacheQuant,
        contextWindow,
        nUbatch,
        flashAttention: true,
        rollingContext: true,
        ramBudgetMb,
        estimatedFootprintMb,
      };
    }

    if (modelId.includes('1b')) {
      // 1B Model Paging Strategy:
      // Smooth performance on budget/mid-tier phones (~900MB total footprint)
      const contextWindow = availableRamMb < 2500 ? 1536 : 2048;
      return {
        useMmap: true,
        kvCacheQuant: 'q8_0',
        contextWindow,
        nUbatch: 128,
        flashAttention: true,
        rollingContext: true,
        ramBudgetMb,
        estimatedFootprintMb: 920,
      };
    }

    // Eco Models (SmolLM2 135M / 360M):
    // Runs on any device with minimal paging requirements (<350MB footprint)
    return {
      useMmap: true,
      kvCacheQuant: 'q8_0',
      contextWindow: 2048,
      nUbatch: 256,
      flashAttention: false,
      rollingContext: false,
      ramBudgetMb,
      estimatedFootprintMb: modelId.includes('135m') ? 160 : 380,
    };
  }

  /**
   * Translates the paging configuration into llama.cpp / @react-native-llama native arguments.
   */
  public static getLlamaInitOptions(config: MemoryPagingConfig) {
    return {
      // Virtual memory paging flag: keeps model in flash storage, paging only active weight tensors
      use_mmap: config.useMmap,
      // Flash Attention reduces attention matrix memory from O(N^2) to O(N)
      flash_attn: config.flashAttention,
      // Size of context window (pages)
      n_ctx: config.contextWindow,
      // Physical micro-batch size for prompt processing
      n_ubatch: config.nUbatch,
      // Quantized KV Cache flags (q8_0 cuts attention memory by 50%)
      cache_type_k: config.kvCacheQuant,
      cache_type_v: config.kvCacheQuant,
    };
  }

  /**
   * Sliding-Window Context Pager:
   * Trims conversation history to fit inside the paged context window while preserving
   * the system prompt and the most recent turns.
   */
  public static trimMessagesForPagedContext(
    messages: ChatMessage[],
    maxTokens: number = 2048
  ): ChatMessage[] {
    if (messages.length <= 2) return messages;

    // Approximate token estimator (3.8 characters per token average)
    const estimateTokens = (text: string) => Math.ceil(text.length / 3.8);

    const systemMessages = messages.filter((m) => m.role === 'system');
    const conversation = messages.filter((m) => m.role !== 'system');

    let currentTokens = systemMessages.reduce(
      (acc, m) => acc + estimateTokens(m.content),
      0
    );

    const retained: ChatMessage[] = [];

    // Traverse from newest to oldest
    for (let i = conversation.length - 1; i >= 0; i--) {
      const msg = conversation[i];
      const cost = estimateTokens(msg.content);
      if (currentTokens + cost > maxTokens - 256) {
        // Reserve 256 tokens for generation response
        break;
      }
      currentTokens += cost;
      retained.unshift(msg);
    }

    return [...systemMessages, ...retained];
  }
}
