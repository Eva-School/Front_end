/**
 * POST /api/auth/logout
 * =====================
 * Endpoint responsible for logging out the current user.
 *
 * Responsibilities:
 * - Invalidate the authentication cookie
 * - Terminate the user's session
 * - Ensure the client is fully unauthenticated
 */

import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    res.setHeader(
      "Set-Cookie",
      "access_token=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax"
    );
  
    return res.status(200).json({ message: "Logged out successfully" });
  }
  