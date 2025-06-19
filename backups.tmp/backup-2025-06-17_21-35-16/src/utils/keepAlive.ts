let port: chrome.runtime.Port | null = null;

/**
 * Establishes a long-lived connection to the background script to keep it active.
 * If a port already exists, it does nothing.
 */
export function connectToBackground(name: string): void {
  if (port) {
    return;
  }
  port = chrome.runtime.connect({ name });

  // When the port is disconnected (e.g., popup closed), nullify it
  port.onDisconnect.addListener(() => {
    port = null;
  });
}

/**
 * A simple listener in the background script to accept connections.
 * This function should be called once in the background script's global scope.
 */
export function setupKeepAliveListener(): void {
  chrome.runtime.onConnect.addListener(port => {
    console.log(`Connection established from ${port.name}`);
    // We don't need to do anything with the port, just accepting it
    // is enough to create the connection. The port's lifecycle will keep
    // the service worker alive.
  });
} 