import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  const token = authorization?.startsWith("Bearer ") ? authorization.slice("Bearer ".length) : null;
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const year = request.nextUrl.searchParams.get("year") ?? "2024-2025";
  const api = (process.env.BACKEND_API_URL ?? "http://localhost:5080/api").replace(/\/+$/, "");
  try {
    const response = await fetch(`${api}/analytics/overview?year=${encodeURIComponent(year)}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    return new NextResponse(await response.text(), {
      status: response.status,
      headers: { "Content-Type": response.headers.get("content-type") ?? "application/json" },
    });
  } catch {
    return NextResponse.json({ message: "Analytics service is unavailable." }, { status: 503 });
  }
}
