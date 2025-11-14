import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getMetadata } from '../../../lib/youtube';

/**
 * Combined endpoint: get metadata + stream in one request
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Video ID is required' });
  }

  try {
    const metadata = await getMetadata(id);

    return res.status(200).json({
      ...metadata,
      stream: {
        mode: 'iframe',
        url: `https://www.youtube.com/embed/${id}?autoplay=1&enablejsapi=1&playsinline=1`,
        source: 'iframe',
      },
    });
  } catch (error) {
    console.error('Full track error:', error);
    return res.status(500).json({
      error: 'Failed to get track information',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
