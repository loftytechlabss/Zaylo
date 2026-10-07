import type { 
  HybridMode, 
  DesktopHost, 
  OnDeviceModel, 
  MemoryPagingConfig, 
  ChatMessage, 
  MessageMetrics 
} from '../types';
import { DesktopClient } from './desktopClient';
import { OnDeviceEngine } from './onDeviceEngine';

export class HybridRouter {
  constructor(
    private getMode: () => HybridMode,
    private getDesktopHost: () => DesktopHost,
    private getOnDeviceModel: () => OnDeviceModel,
    private getPagingConfig: () => MemoryPagingConfig
  ) {}

  /**
   * Dispatches a message to either the desktop host or the on-device paged engine.
   */
  public async dispatchPrompt(
    messages: ChatMessage[],
    onToken: (chunk: string) => void,
    onComplete: (metrics: MessageMetrics) => void,
    onError: (err: Error) => void
  ): Promise<() => void> {
    const mode = this.getMode();
    const desktopHost = this.getDesktopHost();
    const localModel = this.getOnDeviceModel();
    const pagingConfig = this.getPagingConfig();

    if (mode === 'desktop' && desktopHost.isConnected) {
      // Route to Desktop Host Server
      return DesktopClient.streamCompletion(
        desktopHost,
        messages,
        onToken,
        onComplete,
        async (err) => {
          // If desktop stream fails unexpectedly, report or offer fallback
          onError(err);
        }
      );
    } else {
      // Route to On-Device Paged Engine
      await OnDeviceEngine.loadModel(localModel, pagingConfig);
      return OnDeviceEngine.generateCompletion(
        messages,
        pagingConfig,
        onToken,
        onComplete
      );
    }
  }
}
