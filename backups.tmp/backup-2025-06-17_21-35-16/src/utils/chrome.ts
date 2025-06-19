/**
 * A type-safe wrapper around chrome.runtime.sendMessage to use Promises
 * and a standardized message format.
 * @param action The action to be performed by the background script.
 * @param payload The data to be sent with the action.
 */
export function sendMessage<T = any>(action: string, payload?: any): Promise<T> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ action, payload }, (response) => {
      if (chrome.runtime.lastError) {
        return reject(new Error(chrome.runtime.lastError.message));
      }

      if (response?.success) {
        resolve(response.data as T);
      } else {
        reject(new Error(response?.error || 'An unknown error occurred.'));
      }
    });
  });
} 