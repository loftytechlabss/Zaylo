import type { DesktopHost, ChatMessage, MessageMetrics } from '../types';

export class DesktopClient {
  /**
   * Pings the Zaylo Desktop host and verifies connectivity and latency.
   */
  public static async ping(hostUrl: string, apiKey?: string): Promise<{
    ok: boolean;
    latencyMs: number;
    activeModel?: string;
    serverName?: string;
  }> {
    const start = Date.now();
    try {
      const url = `${hostUrl.replace(/\/+$/, '')}/v1/models`;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const res = await fetch(url, {
        method: 'GET',
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const latencyMs = Date.now() - start;

      if (!res.ok) {
        return { ok: false, latencyMs };
      }

      const data = await res.json();
      const activeModel = data?.data?.[0]?.id || 'default';

      return {
        ok: true,
        latencyMs,
        activeModel,
        serverName: 'Zaylo Desktop Host',
      };
    } catch {
      return { ok: false, latencyMs: 0 };
    }
  }

  /**
   * Completes a pairing handshake using a pairing token from Zaylo Desktop's QR code.
   */
  public static async pairWithToken(
    serverUrl: string,
    pairingToken: string,
    deviceName: string = 'Zaylo Android'
  ): Promise<{ success: boolean; apiKey?: string; error?: string }> {
    try {
      const endpoint = `${serverUrl.replace(/\/+$/, '')}/api/devices/pair`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: pairingToken, deviceName }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }));
        return { success: false, error: err.message || 'Pairing failed' };
      }

      const data = await res.json();
      return { success: true, apiKey: data.apiKey };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error during pairing' };
    }
  }

  /**
   * Streams chat completions from the Zaylo desktop Fastify server.
   */
  public static async streamCompletion(
    host: DesktopHost,
    messages: ChatMessage[],
    onToken: (chunk: string) => void,
    onComplete: (metrics: MessageMetrics) => void,
    onError: (err: Error) => void
  ): Promise<() => void> {
    const controller = new AbortController();
    const startTime = Date.now();
    let firstTokenTime = 0;
    let totalTokens = 0;

    const formattedMessages = messages.map((m) => {
      if (m.imageUri) {
        return {
          role: m.role,
          content: [
            { type: 'text', text: m.content },
            { type: 'image_url', image_url: { url: m.imageUri } },
          ],
        };
      }
      return { role: m.role, content: m.content };
    });

    (async () => {
      try {
        const url = `${host.url.replace(/\/+$/, '')}/v1/chat/completions`;
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
        };
        if (host.apiKey) {
          headers['Authorization'] = `Bearer ${host.apiKey}`;
        }

        const res = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            model: host.activeModelName || 'default',
            messages: formattedMessages,
            stream: true,
            temperature: 0.7,
          }),
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error(`Desktop server returned ${res.status}: ${res.statusText}`);
        }

        const reader = res.body?.getReader();
        if (!reader) {
          throw new Error('Streaming response body is unavailable');
        }

        const decoder = new TextDecoder('utf-8');
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith(':')) continue;
            if (trimmed === 'data: [DONE]') continue;

            if (trimmed.startsWith('data: ')) {
              try {
                const parsed = JSON.parse(trimmed.slice(6));
                const delta = parsed.choices?.[0]?.delta?.content;
                if (delta) {
                  if (firstTokenTime === 0) {
                    firstTokenTime = Date.now();
                  }
                  totalTokens++;
                  onToken(delta);
                }
              } catch {
                // Ignore chunk parse errors
              }
            }
          }
        }

        const endTime = Date.now();
        const durationSec = Math.max(0.1, (endTime - (firstTokenTime || startTime)) / 1000);
        const tokensPerSec = Number((totalTokens / durationSec).toFixed(1));

        onComplete({
          ttftMs: firstTokenTime ? firstTokenTime - startTime : 0,
          tokensPerSec,
          totalTokens,
          generationDurationMs: endTime - startTime,
          backendUsed: 'desktop_server',
        });
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          onError(err);
        }
      }
    })();

    return () => controller.abort();
  }
}
