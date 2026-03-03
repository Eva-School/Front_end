import type { NextApiRequest, NextApiResponse } from 'next';
import { mockTeacherSubjects } from '@/data/Teacher/teacherMockData';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ message: 'Method Not Allowed' });
    return;
  }

  res.status(200).json(mockTeacherSubjects);
}
