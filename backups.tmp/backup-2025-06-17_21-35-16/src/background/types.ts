export type RequestHandler = (
  payload: any,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response?: any) => void
) => void | Promise<void>; 