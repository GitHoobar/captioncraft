// pages/api/youtube.ts
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { youtubeLink } = req.body;

    // Perform actions with the YouTube link here
    // For example, make a request to the YouTube Data API

    res.status(200).json({ success: true });
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
