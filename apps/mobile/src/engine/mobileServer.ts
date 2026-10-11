import { getHostIp } from '../utils/networkHost';
import { OnDeviceEngine } from './onDeviceEngine';

let TcpSocket: any = null;
try {
  TcpSocket = require('react-native-tcp-socket').default || require('react-native-tcp-socket');
} catch {}

export interface MobileServerStats {
  isRunning: boolean;
  port: number;
  ip: string;
  requestsServed: number;
  totalTokensGenerated: number;
  uptimeSeconds: number;
}

export class MobileAIEdgeServer {
  private static serverInstance: any = null;
  private static isRunning = false;
  private static port = 8080;
  private static requestsServed = 0;
  private static totalTokens = 0;
  private static startTime = 0;
  private static listeners: Set<(stats: MobileServerStats) => void> = new Set();

  public static isSupported(): boolean {
    return !!TcpSocket && typeof TcpSocket.createServer === 'function';
  }

  public static getStats(): MobileServerStats {
    const elapsed = this.startTime > 0 ? Math.floor((Date.now() - this.startTime) / 1000) : 0;
    return {
      isRunning: this.isRunning,
      port: this.port,
      ip: getHostIp(),
      requestsServed: this.requestsServed,
      totalTokensGenerated: this.totalTokens,
      uptimeSeconds: elapsed,
    };
  }

  public static subscribe(listener: (stats: MobileServerStats) => void): () => void {
    this.listeners.add(listener);
    listener(this.getStats());
    return () => this.listeners.delete(listener);
  }

  private static notify(): void {
    const stats = this.getStats();
    this.listeners.forEach((fn) => fn(stats));
  }

  /**
   * Starts a local TCP HTTP server listening on the device's Wi-Fi interface.
   * Enables other devices on the LAN to query this phone as an OpenAI-compatible AI node.
   */
  public static async startServer(port: number = 8080): Promise<{ success: boolean; message: string }> {
    if (this.isRunning) {
      return { success: true, message: `Server already running on port ${this.port}` };
    }

    if (!this.isSupported()) {
      return {
        success: false,
        message: 'TCP listening server requires a standalone Native Build (react-native-tcp-socket is not supported in Expo Go sandbox).',
      };
    }

    this.port = port;

    return new Promise((resolve) => {
      try {
        const server = TcpSocket.createServer((socket: any) => {
          let buffer = '';

          socket.on('data', async (data: any) => {
            buffer += data.toString('utf-8');

            // Detect end of HTTP headers
            const headerEndIndex = buffer.indexOf('\r\n\r\n');
            if (headerEndIndex === -1) return;

            const headerPart = buffer.slice(0, headerEndIndex);
            const firstLine = headerPart.split('\r\n')[0] || '';
            const [method, path] = firstLine.split(' ');

            // 0. Handle CORS preflight
            if (method === 'OPTIONS') {
              const corsHeaders =
                `HTTP/1.1 204 No Content\r\n` +
                `Access-Control-Allow-Origin: *\r\n` +
                `Access-Control-Allow-Methods: GET, POST, OPTIONS\r\n` +
                `Access-Control-Allow-Headers: Content-Type, Authorization\r\n` +
                `Connection: close\r\n\r\n`;
              socket.write(corsHeaders);
              socket.end();
              return;
            }

            // 1. Health check & Web Dashboard
            if (method === 'GET' && (path === '/' || path === '/health')) {
              const activeModel = OnDeviceEngine.getActiveModel();
              const htmlBody = JSON.stringify({
                status: 'online',
                device: 'Zaylo Mobile Edge Node',
                activeModel: activeModel?.name || 'None loaded',
                requestsServed: this.requestsServed,
              }, null, 2);

              const response =
                `HTTP/1.1 200 OK\r\n` +
                `Content-Type: application/json\r\n` +
                `Access-Control-Allow-Origin: *\r\n` +
                `Content-Length: ${Buffer.byteLength(htmlBody)}\r\n` +
                `Connection: close\r\n\r\n` +
                htmlBody;

              socket.write(response);
              socket.end();
              return;
            }

            // 2. Models Endpoint (OpenAI format)
            if (method === 'GET' && path === '/v1/models') {
              const activeModel = OnDeviceEngine.getActiveModel();
              const body = JSON.stringify({
                object: 'list',
                data: [
                  {
                    id: activeModel?.id || 'on-device-model',
                    object: 'model',
                    owned_by: 'zaylo-mobile',
                  },
                ],
              });

              const response =
                `HTTP/1.1 200 OK\r\n` +
                `Content-Type: application/json\r\n` +
                `Access-Control-Allow-Origin: *\r\n` +
                `Content-Length: ${Buffer.byteLength(body)}\r\n` +
                `Connection: close\r\n\r\n` +
                body;

              socket.write(response);
              socket.end();
              return;
            }

            // 3. Chat Completions Endpoint (OpenAI format)
            if (method === 'POST' && path === '/v1/chat/completions') {
              const bodyStartIndex = headerEndIndex + 4;
              const bodyRaw = buffer.slice(bodyStartIndex);

              let parsedBody: any = {};
              try {
                parsedBody = JSON.parse(bodyRaw);
              } catch {
                // Buffer may be partial; wait for full body if needed
                return;
              }

              if (!OnDeviceEngine.isModelLoaded()) {
                const errBody = JSON.stringify({
                  error: {
                    message: 'No GGUF model is loaded into memory on this device edge node. Open the Zaylo app and load a model from the Models tab first.',
                    type: 'server_error',
                    code: 'model_not_loaded',
                  },
                });
                const errResponse =
                  `HTTP/1.1 503 Service Unavailable\r\n` +
                  `Content-Type: application/json\r\n` +
                  `Access-Control-Allow-Origin: *\r\n` +
                  `Content-Length: ${Buffer.byteLength(errBody)}\r\n` +
                  `Connection: close\r\n\r\n` +
                  errBody;
                socket.write(errResponse);
                socket.end();
                return;
              }

              this.requestsServed++;
              const incomingMessages = parsedBody.messages || [];
              const isStreaming = parsedBody.stream === true;

              if (isStreaming) {
                // Send SSE headers
                socket.write(
                  `HTTP/1.1 200 OK\r\n` +
                  `Content-Type: text/event-stream\r\n` +
                  `Cache-Control: no-cache\r\n` +
                  `Connection: keep-alive\r\n` +
                  `Access-Control-Allow-Origin: *\r\n\r\n`
                );

                try {
                  await OnDeviceEngine.generateCompletion(
                    incomingMessages,
                    {
                      useMmap: true,
                      kvCacheQuant: 'q8_0',
                      contextWindow: 2048,
                      nUbatch: 128,
                      flashAttention: true,
                      rollingContext: true,
                      ramBudgetMb: 2048,
                      estimatedFootprintMb: 350,
                    },
                    (token) => {
                      this.totalTokens++;
                      const chunk = JSON.stringify({
                        choices: [{ delta: { content: token } }],
                      });
                      socket.write(`data: ${chunk}\r\n\r\n`);
                    },
                    () => {
                      socket.write('data: [DONE]\r\n\r\n');
                      socket.end();
                      this.notify();
                    }
                  );
                } catch {
                  socket.end();
                }
              } else {
                // Non-streaming response
                let accumulated = '';
                try {
                  await OnDeviceEngine.generateCompletion(
                    incomingMessages,
                    {
                      useMmap: true,
                      kvCacheQuant: 'q8_0',
                      contextWindow: 2048,
                      nUbatch: 128,
                      flashAttention: true,
                      rollingContext: true,
                      ramBudgetMb: 2048,
                      estimatedFootprintMb: 350,
                    },
                    (token) => {
                      accumulated += token;
                      this.totalTokens++;
                    },
                    (metrics) => {
                      const resBody = JSON.stringify({
                        id: `chatcmpl-node-${Date.now()}`,
                        object: 'chat.completion',
                        created: Math.floor(Date.now() / 1000),
                        choices: [
                          {
                            index: 0,
                            message: { role: 'assistant', content: accumulated },
                            finish_reason: 'stop',
                          },
                        ],
                        usage: {
                          total_tokens: metrics.totalTokens,
                        },
                      });

                      const response =
                        `HTTP/1.1 200 OK\r\n` +
                        `Content-Type: application/json\r\n` +
                        `Access-Control-Allow-Origin: *\r\n` +
                        `Content-Length: ${Buffer.byteLength(resBody)}\r\n` +
                        `Connection: close\r\n\r\n` +
                        resBody;

                      socket.write(response);
                      socket.end();
                      this.notify();
                    }
                  );
                } catch {
                  socket.end();
                }
              }
              return;
            }

            // Fallback 404
            const notFound = 'HTTP/1.1 404 Not Found\r\nConnection: close\r\n\r\n';
            socket.write(notFound);
            socket.end();
          });

          socket.on('error', () => {});
        });

        server.listen({ port: this.port, host: '0.0.0.0' }, () => {
          this.serverInstance = server;
          this.isRunning = true;
          this.startTime = Date.now();
          this.notify();
          resolve({ success: true, message: `Node broadcasting on port ${this.port}` });
        });

        server.on('error', (err: any) => {
          this.isRunning = false;
          this.serverInstance = null;
          this.notify();
          resolve({ success: false, message: err?.message || 'Server bind failed' });
        });
      } catch (err: any) {
        this.isRunning = false;
        resolve({ success: false, message: err?.message || 'Failed to initialize server' });
      }
    });
  }

  public static async stopServer(): Promise<void> {
    if (this.serverInstance) {
      try {
        this.serverInstance.close();
      } catch {}
      this.serverInstance = null;
    }
    this.isRunning = false;
    this.startTime = 0;
    this.notify();
  }
}
