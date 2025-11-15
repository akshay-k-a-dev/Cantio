import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Guest mode health check
  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'ok',
      mode: 'guest',
      timestamp: new Date().toISOString()
    });
  }

  // Mock sync endpoint for guest mode
  if (req.method === 'POST') {
    const data = req.body as any;

    // Validate data structure
    const requiredFields = ['playlists', 'liked', 'queue', 'version'];
    for (const field of requiredFields) {
      if (!(field in data)) {
        return res.status(400).json({
          error: `Missing required field: ${field}`
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Guest data validated successfully',
      synced: false, // Guest mode doesn't sync to server
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
