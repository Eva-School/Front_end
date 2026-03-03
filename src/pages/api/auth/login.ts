
import type { NextApiRequest, NextApiResponse } from "next";
/**
 * POST /api/auth/login
 * ====================
 * Authentication endpoint responsible for user login.
 *
 * Responsibilities:
 * - Validate user credentials
 * - Generate and issue an authentication token (mocked here)
 * - Store the token in an HttpOnly cookie
 * - Return the user's role to the frontend
 *
 * The frontend never directly accesses the token.
 */

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    const { username, password } = req.body;

    // Mock validation
    if (username === "student" && password === "1234") {
        // Set HttpOnly cookie
        res.setHeader(
            "Set-Cookie",
            `access_token=${username}; HttpOnly; Path=/; Max-Age=3600`
          );
          
        return res.status(200).json({ role: "Student" });
    }

    if (username === "teacher" && password === "1234") {
        res.setHeader(
            "Set-Cookie",
            `access_token=${username}; HttpOnly; Path=/; Max-Age=3600`
          );
          
        return res.status(200).json({ role: "Teacher" });
    }

    if (username === "admin" && password === "1234") {
        res.setHeader(
            "Set-Cookie",
            `access_token=${username}; HttpOnly; Path=/; Max-Age=3600`
          );
          
        return res.status(200).json({ role: "Admin" });
    }

    return res.status(401).json({ message: "Invalid r password" });
}
