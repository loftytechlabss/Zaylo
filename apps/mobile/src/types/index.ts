export type HybridMode = 'on_device' | 'desktop';

export type DeviceTier = 
  | 'tier_1_eco'        // Basic phones (< 4GB RAM): 135M–360M models, ultra-low memory
  | 'tier_2_balanced'   // Mid-tier phones (4–6GB RAM): 1B models, mmap paging
  | 'tier_3_flagship';  // Flagship phones (8GB+ RAM): 3B models with mmap + Quantized KV cache

export type KVCacheQuant = 'f16' | 'q8_0' | 'q4_0';

export interface MemoryPagingConfig {
  useMmap: boolean;               // Kernel virtual memory paging (zero full-load RSS)
  kvCacheQuant: KVCacheQuant;     // 8-bit or 4-bit KV cache quantization (50-75% RAM reduction)
  contextWindow: number;          // Paged context limit (e.g. 1024, 2048, 4096)
  nUbatch: number;                // Micro-batch ingestion to eliminate memory spikes
  flashAttention: boolean;        // Memory-efficient attention tiling
  rollingContext: boolean;        // Evict older non-system tokens to keep RAM flat
  ramBudgetMb: number;            // Upper safe RAM limit allocated to LLM
  estimatedFootprintMb: number;   // Expected runtime memory footprint
}

export interface DeviceMemoryProfile {
  totalRamMb: number;
  availableRamMb: number;
  deviceTier: DeviceTier;
  tierLabel: string;
  recommendedModelId: string;
  canRun3B: boolean;
  pagingConfig: MemoryPagingConfig;
}

export interface OnDeviceModel {
  id: string;
  name: string;
  tagline: string;
  parameters: string;
  sizeMb: number;
  requiredRamMb: number;
  minTier: DeviceTier;
  quantization: string;
  downloadUrl: string;
  isDownloaded: boolean;
  isCustomGGUF?: boolean;
}

export interface DesktopHost {
  url: string;                    // e.g. "http://192.168.1.150:8080"
  apiKey?: string;
  name: string;
  isConnected: boolean;
  activeModelName?: string;
  latencyMs?: number;
  lastPingAt?: number;
}

export interface MessageMetrics {
  ttftMs: number;
  tokensPerSec: number;
  totalTokens: number;
  generationDurationMs: number;
  backendUsed: 'on_device_paged' | 'desktop_server';
  ramUsageMb?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  imageUri?: string;
  metrics?: MessageMetrics;
  isStreaming?: boolean;
}

export interface CpuCluster {
  type: 'Performance' | 'Efficiency' | 'Prime';
  count: number;
  clockGhz: number;
}

export interface DeviceHardwareTelemetry {
  socName: string;
  cpuArchitecture: string;
  cpuTotalCores: number;
  cpuClusters: CpuCluster[];
  cpuInstructionSets: string[];
  gpuRenderer: string;
  gpuComputeApi: string;
  gpuTflopsFp16: number;
  gpuSharedMemory: boolean;
  npuName: string;
  npuTopsInt8: number;
  npuStatus: string;
  npuPrecisionSupport: string[];
  totalRamMb: number;
  usedRamMb: number;
  availableRamMb: number;
  ramType: string;
  ramBandwidthGbps: number;
  virtualPagingActive: boolean;
  pageSizeKb: number;
  mmapSupport: string;
  dirtyPageThresholdMb: number;
  kvCacheCompression: string;
  storageTotalGb: number;
  storageAvailableGb: number;
  storageType: string;
  sequentialReadSpeedMbS: number;
  osName: string;
  kernelVersion: string;
  thermalState: 'Nominal' | 'Fair' | 'Throttled';
  batteryPercent: number;
  batteryState: 'Charging' | 'Unplugged';
}

export interface DownloadProgress {
  modelId: string;
  downloadedMb: number;
  totalMb: number;
  percent: number;
  speedMbS: number;
  etaSeconds: number;
  status: 'idle' | 'downloading' | 'completed' | 'paused' | 'error';
}
