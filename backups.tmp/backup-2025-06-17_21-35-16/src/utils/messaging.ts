// Minimal messaging utility for background/extension messaging
interface MessageResponse {
  success: boolean;
  data?: any;
  error?: string;
  status?: string;
}

export const sendMessage = async (action: string, data: any): Promise<MessageResponse> => {
  try {
    const response = await fetch('/api/message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action, data }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error sending message:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}; 