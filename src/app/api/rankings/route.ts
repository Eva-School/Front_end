import { NextRequest, NextResponse } from "next/server";

export interface StudentRanking {
  rank: number;
  studentId: string;
  name: string;
  className: string;
  average: number;
  totalGrades: number;
  trend: "up" | "down" | "stable";
  badge?: "gold" | "silver" | "bronze";
}

// ─── GET /api/rankings?year=&classId=&limit= ──────────────────────────────────
export async function GET(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  const token = authorization?.startsWith("Bearer ") ? authorization.slice("Bearer ".length) : null;

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const year    = searchParams.get("year")    ?? "2024-2025";
  const classId = searchParams.get("classId") ?? undefined;
  const limit   = parseInt(searchParams.get("limit") ?? "10");

  const API = (process.env.BACKEND_API_URL ?? "https://evaschool.runasp.net/api").replace(/\/+$/, "");

  try {
    const params = new URLSearchParams({ year, limit: String(limit) });
    if (classId) params.set("classId", classId);

    const upstream = await fetch(`${API}/rankings?${params}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const contentType = upstream.headers.get("content-type") ?? "application/json";
    return new NextResponse(await upstream.text(), {
      status: upstream.status,
      headers: { "Content-Type": contentType },
    });
  } catch {
    return NextResponse.json({ message: "Rankings service is unavailable." }, { status: 503 });
  }
}
