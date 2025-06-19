import { NextApiRequest, NextApiResponse } from 'next';
import { Service } from '@/types';

interface MessageRequest {
  action: string;
  data: any;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { action, data } = req.body as MessageRequest;

    switch (action) {
      case 'checkServerStatus': {
        const { server } = data as { server: Service };
        const status = await checkServerStatus(server);
        return res.status(200).json({ success: true, status });
      }

      default:
        return res.status(400).json({ success: false, error: 'Unknown action' });
    }
  } catch (error) {
    console.error('Error handling message:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
}

async function checkServerStatus(server: Service): Promise<string> {
  try {
    const response = await fetch(`${server.url}/sdapi/v1/sd-models`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(server.apiKey && { 'Authorization': `Bearer ${server.apiKey}` }),
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return 'online';
  } catch (error) {
    console.error(`Error checking server ${server.name}:`, error);
    return 'offline';
  }
} 