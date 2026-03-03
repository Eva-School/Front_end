import type { NextApiRequest, NextApiResponse } from 'next';
import { mockTeacherProfile } from '@/data/Teacher/teacherMockData';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // This endpoint is only used for mock data in the frontend.
  // When a real backend is connected, you can remove or proxy this file.

  if (req.method !== 'GET') {
    res.status(405).json({ message: 'Method Not Allowed' });
    return;
  }

  res.status(200).json(mockTeacherProfile);
}
