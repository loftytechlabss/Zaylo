import type { 
  DeviceMemoryProfile, 
  DeviceTier, 
  OnDeviceModel 
} from '../types';
import { MobileMemoryPagingEngine } from './memoryPaging';

/**
 * Curated Catalog of Mobile-Optimized Models
 */
export const MOBILE_MODELS: OnDeviceModel[] = [
  {
    id: 'smollm2-135m-q8_0',
    name: 'SmolLM2 135M',
    tagline: 'Runs on literally any device. Featherlight.',
    parameters: '135 Million',
    sizeMb: 145,
    requiredRamMb: 280,
    minTier: 'tier_1_eco',
    quantization: 'Q8_0',
    downloadUrl: 'https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct-GGUF/resolve/main/smollm2-135m-instruct-q8_0.gguf',
    isDownloaded: false,
  },
  {
    id: 'smollm2-360m-q8_0',
    name: 'SmolLM2 360M',
    tagline: 'Fast everyday assistant for budget phones.',
    parameters: '360 Million',
    sizeMb: 385,
    requiredRamMb: 520,
    minTier: 'tier_1_eco',
    quantization: 'Q8_0',
    downloadUrl: 'https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct-GGUF/resolve/main/smollm2-360m-instruct-q8_0.gguf',
    isDownloaded: false,
  },
  {
    id: 'llama-3.2-1b-q4_k_m',
    name: 'Llama 3.2 1B',
    tagline: 'High quality reasoning with mmap memory paging.',
    parameters: '1.2 Billion',
    sizeMb: 850,
    requiredRamMb: 1100,
    minTier: 'tier_2_balanced',
    quantization: 'Q4_K_M',
    downloadUrl: 'https://huggingface.co/bartowski/Llama-3.2-1B-Instruct-GGUF/resolve/main/Llama-3.2-1B-Instruct-Q4_K_M.gguf',
    isDownloaded: true, // Demo default
  },
  {
    id: 'llama-3.2-3b-q4_k_m',
    name: 'Llama 3.2 3B (Paged)',
    tagline: 'Desktop-grade intelligence with virtual memory paging & q8 KV cache.',
    parameters: '3.2 Billion',
    sizeMb: 2020,
    requiredRamMb: 2200,
    minTier: 'tier_3_flagship',
    quantization: 'Q4_K_M (Paged)',
    downloadUrl: 'https://huggingface.co/bartowski/Llama-3.2-3B-Instruct-GGUF/resolve/main/Llama-3.2-3B-Instruct-Q4_K_M.gguf',
    isDownloaded: false,
  },
];

export class DeviceProfiler {
  /**
   * Profiles the host hardware and generates an adaptive memory paging profile.
   * In a live React Native environment, total RAM is queried via react-native-device-info
   * or Platform APIs. Here we provide smart defaults with realistic mobile constraints.
   */
  public static profileDevice(mockTotalRamMb?: number): DeviceMemoryProfile {
    // Default to a typical modern 6GB Android phone if not provided
    const totalRamMb = mockTotalRamMb ?? 6144;
    // Android OS & system services typically consume ~2.2GB - 2.8GB
    const osOverheadMb = Math.min(2600, Math.floor(totalRamMb * 0.4));
    const availableRamMb = totalRamMb - osOverheadMb;

    let deviceTier: DeviceTier = 'tier_2_balanced';
    let tierLabel = 'Tier 2: Balanced (4–6GB RAM)';
    let recommendedModelId = 'llama-3.2-1b-q4_k_m';
    let canRun3B = false;

    if (totalRamMb < 3800) {
      deviceTier = 'tier_1_eco';
      tierLabel = 'Tier 1: Eco Mode (< 4GB RAM)';
      recommendedModelId = 'smollm2-360m-q8_0';
      canRun3B = false;
    } else if (totalRamMb >= 7500) {
      deviceTier = 'tier_3_flagship';
      tierLabel = 'Tier 3: Flagship (8GB+ RAM)';
      recommendedModelId = 'llama-3.2-3b-q4_k_m';
      canRun3B = true;
    } else {
      // 4GB - 6GB devices can run 3B if aggressive q4 KV paging is enabled
      canRun3B = totalRamMb >= 5500;
    }

    const targetModel = MOBILE_MODELS.find((m) => m.id === recommendedModelId) || MOBILE_MODELS[2];
    const pagingConfig = MobileMemoryPagingEngine.optimizePagingConfig(targetModel, availableRamMb);

    return {
      totalRamMb,
      availableRamMb,
      deviceTier,
      tierLabel,
      recommendedModelId,
      canRun3B,
      pagingConfig,
    };
  }
}
