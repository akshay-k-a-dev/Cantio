import type { VercelRequest, VercelResponse } from '@vercel/node';
import { search } from '../lib/youtube';

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

  const { q, limit } = req.query;

  if (!q || typeof q !== 'string') {
    return res.status(400).json({ error: 'Query parameter "q" is required' });
  }

  try {
    const results = await search(
      q,
      limit && typeof limit === 'string' ? parseInt(limit) : 10
    );

    // Return empty results instead of error if search fails
    if (!results || results.length === 0) {
      return res.status(200).json({
        results: [],
        message: 'No results found. YouTube search may be temporarily unavailable.'
      });
    }

    return res.status(200).json({ results });
  } catch (error) {
    console.error('Search error:', error);
    // Return empty results with message instead of 500
    return res.status(200).json({
      results: [],
      error: 'Search temporarily unavailable',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
