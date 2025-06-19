interface MessageResponse {
  success: boolean;
  status?: string;
  error?: string;
}

export const sendMessage = async (action: string, data: any): Promise<MessageResponse> => {
  try {
    const response = await chrome.runtime.sendMessage({ action, data });
    return response;
  } catch (error) {
    console.error('Error sending message:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}; 