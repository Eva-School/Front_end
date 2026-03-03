import type { NextApiRequest, NextApiResponse } from 'next';
import { getMockStudentsForClass } from '@/data/Teacher/teacherMockData';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ message: 'Method Not Allowed' });
    return;
  }

  const { classId } = req.query;
  if (typeof classId !== 'string') {
    res.status(400).json({ message: 'Missing classId parameter' });
    return;
  }

  const students = getMockStudentsForClass(classId);
  res.status(200).json({ students });
}
