import type { NextApiRequest, NextApiResponse } from 'next';
import { getMockClassesForYear } from '@/data/Teacher/teacherMockData';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ message: 'Method Not Allowed' });
    return;
  }

  const { year, subject } = req.query;

  if (typeof year !== 'string') {
    res.status(400).json({ message: 'Missing year parameter' });
    return;
  }
  
  // subject parameter is currently ignored by mock; real backend could filter

  const data = getMockClassesForYear(year);
  res.status(200).json(data);
}
