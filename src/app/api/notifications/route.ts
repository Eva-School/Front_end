import { NextResponse } from "next/server";

const backendApiUrl = (process.env.BACKEND_API_URL ?? "http://localhost:5080/api").replace(/\/+$/, "");

function getToken(request: Request): string | null {
  const authorization = request.headers.get("authorization");
  return authorization?.startsWith("Bearer ") ? authorization.slice("Bearer ".length) : null;
}

async function proxy(request: Request, method: "GET" | "POST" | "PATCH") {
  const token = getToken(request);
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const response = await fetch(`${backendApiUrl}/notifications`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(method === "GET" ? {} : { "Content-Type": "application/json" }),
    },
    body: method === "GET" ? undefined : await request.text(),
    cache: "no-store",
  });

  if (response.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  const contentType = response.headers.get("content-type") ?? "application/json";
  return new NextResponse(await response.text(), {
    status: response.status,
    headers: { "Content-Type": contentType },
  });
}

export async function GET(request: Request) {
  try {
    return await proxy(request, "GET");
  } catch {
    return NextResponse.json({ message: "Notifications service is unavailable." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    return await proxy(request, "POST");
  } catch {
    return NextResponse.json({ message: "Notifications service is unavailable." }, { status: 503 });
  }
}

export async function PATCH(request: Request) {
  try {
    return await proxy(request, "PATCH");
  } catch {
    return NextResponse.json({ message: "Notifications service is unavailable." }, { status: 503 });
  }
}
