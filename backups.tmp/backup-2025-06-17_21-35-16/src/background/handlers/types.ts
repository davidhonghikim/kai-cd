export type RequestHandler<T = unknown, R = unknown> = (
  payload: T,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: R) => void
) => void | boolean | Promise<void | boolean>; 