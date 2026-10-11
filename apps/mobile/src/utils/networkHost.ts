import { NativeModules, Platform } from 'react-native';

/**
 * Resolves the host IP address on the local network.
 * When running in Expo / React Native, the Metro bundler script URL
 * contains the local machine's LAN IP (e.g. 192.168.31.246).
 */
export function getHostIp(): string {
  try {
    const scriptURL = NativeModules?.SourceCode?.scriptURL;
    if (typeof scriptURL === 'string') {
      const match = scriptURL.match(/https?:\/\/([^/:]+)/);
      if (match && match[1] && match[1] !== 'localhost' && match[1] !== '127.0.0.1') {
        return match[1];
      }
    }
  } catch {}

  // Fallback to active LAN IP where llama-server and Metro are running
  return '192.168.31.246';
}

/**
 * Returns the default base URL for the Zaylo / llama-server inference gateway.
 */
export function getDefaultHostUrl(): string {
  const ip = getHostIp();
  return `http://${ip}:8080`;
}
