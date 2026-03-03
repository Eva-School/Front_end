import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // In mock mode we simply accept the grade and do nothing.
    // A real implementation would write to a database.
    const { classId, studentId, grade } = req.body;
    console.log('Received grade save', { classId, studentId, grade });
    res.status(200).json({ success: true });
    return;
  }
  res.status(405).json({ message: 'Method Not Allowed' });
}
