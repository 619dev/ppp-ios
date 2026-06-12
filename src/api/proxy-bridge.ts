import { Capacitor, registerPlugin } from '@capacitor/core'
import type { ProxyConfig } from '../store'

/**
 * Bridge between the web-layer proxy config and the native iOS ProxyPlugin.
 *
 * On native platforms (iOS), this calls the ProxyPlugin via Capacitor
 * to configure the WebView's network proxy.
 *
 * On web platforms (browser), this is a no-op — browser fetch/WebSocket cannot
 * be proxied from JavaScript; users should configure their system or browser proxy.
 */

interface ProxyPluginInterface {
  applyProxy(opts: {
    type: string
    host: string
    port: string
    username: string
    password: string
  }): Promise<{ success: boolean; proxy?: string; fallback?: boolean; message?: string }>
  clearProxy(): Promise<{ success: boolean }>
}

// Lazy-init: only register the plugin when actually needed to avoid crashes
// if the native ProxyPlugin module is not compiled into the iOS binary.
let _proxyPlugin: ProxyPluginInterface | null = null
function getProxyPlugin(): ProxyPluginInterface | null {
  if (_proxyPlugin) return _proxyPlugin
  try {
    _proxyPlugin = registerPlugin<ProxyPluginInterface>('ProxyPlugin')
    return _proxyPlugin
  } catch (e) {
    console.warn('[Proxy] ProxyPlugin not available:', e)
    return null
  }
}

/**
 * Apply the proxy configuration on native platforms.
 * No-op on web.
 */
export async function applyNativeProxy(config: ProxyConfig): Promise<void> {
  if (!Capacitor.isNativePlatform()) return

  if (!config.host || !config.port) {
    await clearNativeProxy()
    return
  }

  try {
    const plugin = getProxyPlugin()
    if (!plugin) return
    const result = await plugin.applyProxy({
      type: config.type,
      host: config.host,
      port: config.port,
      username: config.username || '',
      password: config.password || '',
    })
    console.log('[Proxy] Applied:', result)
  } catch (err) {
    console.warn('[Proxy] Failed to apply (plugin may not be installed):', err)
  }
}

/**
 * Clear all proxy settings on native platforms.
 * No-op on web.
 */
export async function clearNativeProxy(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return

  try {
    const plugin = getProxyPlugin()
    if (!plugin) return
    await plugin.clearProxy()
    console.log('[Proxy] Cleared')
  } catch (err) {
    console.warn('[Proxy] Failed to clear (plugin may not be installed):', err)
  }
}

/**
 * Test latency through the currently configured proxy by timing a HEAD request
 * to the server URL. Returns latency in milliseconds, or -1 on failure.
 *
 * This works because on iOS, once the proxy is applied,
 * all WebView fetch() calls automatically route through it.
 */
export async function testProxyLatency(serverUrl: string): Promise<number> {
  if (!serverUrl) return -1

  const start = performance.now()
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000) // 10s timeout
    await fetch(`${serverUrl}/api/ping`, {
      method: 'HEAD',
      cache: 'no-cache',
      signal: controller.signal,
    }).catch(() => {
      // /api/ping may 404, try base URL
      return fetch(serverUrl, {
        method: 'HEAD',
        cache: 'no-cache',
        signal: controller.signal,
      })
    })
    clearTimeout(timeout)
    return Math.round(performance.now() - start)
  } catch {
    return -1
  }
}
