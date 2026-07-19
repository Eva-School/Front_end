import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

type StudentReport = {
  studentName: string;
  studentId: string;
  className: string;
  year: string;
  grades: { subject: string; q1: number; q2: number; q3: number; q4: number; final: number; average: number }[];
};

const escapeHtml = (value: unknown): string =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const finiteNumber = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

// ─── Helper: build styled HTML report ────────────────────────────────────────
function buildReportHTML(data: {
  studentName: string;
  studentId: string;
  className: string;
  year: string;
  grades: { subject: string; q1: number; q2: number; q3: number; q4: number; final: number; average: number }[];
  generatedAt: string;
}): string {
  const safeStudentName = escapeHtml(data.studentName);
  const safeStudentId = escapeHtml(data.studentId);
  const safeClassName = escapeHtml(data.className);
  const safeYear = escapeHtml(data.year);
  const safeGeneratedAt = escapeHtml(data.generatedAt);
  const rows = data.grades
    .map(
      (g) => `
      <tr>
        <td>${escapeHtml(g.subject)}</td>
        <td class="center">${finiteNumber(g.q1)}</td>
        <td class="center">${finiteNumber(g.q2)}</td>
        <td class="center">${finiteNumber(g.q3)}</td>
        <td class="center">${finiteNumber(g.q4)}</td>
        <td class="center bold">${finiteNumber(g.final)}</td>
        <td class="center avg ${finiteNumber(g.average) >= 90 ? "a-plus" : finiteNumber(g.average) >= 80 ? "a" : finiteNumber(g.average) >= 70 ? "b" : finiteNumber(g.average) >= 60 ? "c" : "fail"}">${finiteNumber(g.average)}%</td>
      </tr>`
    )
    .join("");

  const overallAvg = Math.round(
    data.grades.length === 0
      ? 0
      : data.grades.reduce((sum, grade) => sum + finiteNumber(grade.average), 0) / data.grades.length
  );

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a1a; background: #fff; padding: 32px; }
  .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 3px solid #FFC600; padding-bottom: 20px; margin-bottom: 28px; }
  .school-name { font-size: 22px; font-weight: 900; color: #1a1a1a; }
  .school-sub  { font-size: 12px; color: #666; margin-top: 4px; }
  .logo { width: 52px; height: 52px; background: #FFC600; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 24px; }
  .report-title { text-align: center; margin-bottom: 24px; }
  .report-title h1 { font-size: 18px; font-weight: 800; color: #1a1a1a; }
  .report-title p  { font-size: 12px; color: #888; margin-top: 4px; }
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 28px; background: #f8f9fa; border-radius: 10px; padding: 18px; border: 1px solid #e9ecef; }
  .info-item label { font-size: 10px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 3px; }
  .info-item span  { font-size: 14px; font-weight: 600; color: #1a1a1a; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 24px; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
  th { background: #1a1a1a; color: #fff; padding: 12px 14px; font-size: 11px; font-weight: 700; text-align: left; text-transform: uppercase; letter-spacing: 0.4px; }
  th.center { text-align: center; }
  td { padding: 11px 14px; font-size: 13px; border-bottom: 1px solid #f0f0f0; }
  tr:last-child td { border-bottom: none; }
  tr:nth-child(even) td { background: #fafafa; }
  .center { text-align: center; }
  .bold { font-weight: 700; }
  .avg { font-weight: 800; border-radius: 4px; }
  .a-plus { color: #2e7d32; background: #e8f5e9; }
  .a      { color: #388e3c; background: #f1f8e9; }
  .b      { color: #f57f17; background: #fff8e1; }
  .c      { color: #e65100; background: #fff3e0; }
  .fail   { color: #c62828; background: #ffebee; }
  .summary { display: flex; gap: 16px; margin-bottom: 28px; }
  .summary-card { flex: 1; border-radius: 10px; padding: 16px; text-align: center; border: 2px solid; }
  .summary-card.primary  { border-color: #FFC600; background: #fffde7; }
  .summary-card.success  { border-color: #4CAF50; background: #e8f5e9; }
  .summary-card.info     { border-color: #2196F3; background: #e3f2fd; }
  .summary-card .val     { font-size: 28px; font-weight: 900; }
  .summary-card .lbl     { font-size: 11px; font-weight: 600; color: #666; margin-top: 4px; text-transform: uppercase; }
  .footer { text-align: center; font-size: 10px; color: #aaa; margin-top: 24px; border-top: 1px solid #eee; padding-top: 16px; }
  .watermark { position: fixed; bottom: 40px; right: 40px; opacity: 0.04; font-size: 80px; font-weight: 900; transform: rotate(-30deg); pointer-events: none; }
</style>
</head>
<body>
  <div class="watermark">EVA</div>

  <div class="header">
    <div>
      <div class="school-name">🎓 EVA School System</div>
      <div class="school-sub">Academic Grade Report — Official Document</div>
    </div>
    <div style="text-align:right">
      <div style="font-size:11px;color:#888">Generated</div>
      <div style="font-size:12px;font-weight:700">${safeGeneratedAt}</div>
    </div>
  </div>

  <div class="report-title">
    <h1>Student Grade Report</h1>
    <p>Academic Year ${safeYear}</p>
  </div>

  <div class="info-grid">
    <div class="info-item"><label>Student Name</label><span>${safeStudentName}</span></div>
    <div class="info-item"><label>Student ID</label><span>${safeStudentId}</span></div>
    <div class="info-item"><label>Class</label><span>${safeClassName}</span></div>
    <div class="info-item"><label>Academic Year</label><span>${safeYear}</span></div>
  </div>

  <div class="summary">
    <div class="summary-card primary">
      <div class="val" style="color:#f57f17">${overallAvg}%</div>
      <div class="lbl">Overall Average</div>
    </div>
    <div class="summary-card success">
      <div class="val" style="color:#2e7d32">${data.grades.filter(g => g.average >= 60).length}</div>
      <div class="lbl">Subjects Passed</div>
    </div>
    <div class="summary-card info">
      <div class="val" style="color:#1565c0">${data.grades.length}</div>
      <div class="lbl">Total Subjects</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Subject</th>
        <th class="center">Q1</th>
        <th class="center">Q2</th>
        <th class="center">Q3</th>
        <th class="center">Q4</th>
        <th class="center">Final</th>
        <th class="center">Average</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <div class="footer">
    This is an official document generated by the EVA School Grading System.
    Any alterations render this document invalid. • ${safeGeneratedAt}
  </div>
</body>
</html>`;
}

// ─── GET /api/export?type=pdf&studentId=&year= ───────────────────────────────
export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const authorization = request.headers.get("authorization");
  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : cookieStore.get("access_token")?.value;

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const year       = searchParams.get("year")      ?? "2024-2025";
  const API = (process.env.BACKEND_API_URL ?? "http://localhost:5080/api").replace(/\/+$/, "");

  try {
    const response = await fetch(`${API}/student/report?year=${encodeURIComponent(year)}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!response.ok) {
      return new NextResponse(await response.text(), {
        status: response.status,
        headers: { "Content-Type": response.headers.get("content-type") ?? "application/json" },
      });
    }
    const report = (await response.json()) as StudentReport;
    const reportData = {
      studentName: report.studentName,
      studentId: report.studentId,
      className: report.className,
      year: report.year,
      grades: report.grades,
      generatedAt: new Date().toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }),
    };

    const html = buildReportHTML(reportData);
    const safeFileStudentId = String(report.studentId).replace(/[^a-zA-Z0-9_-]/g, "_");
    const safeFileYear = String(report.year).replace(/[^a-zA-Z0-9_-]/g, "_");
    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `inline; filename="grade-report-${safeFileStudentId}-${safeFileYear}.html"`,
        "Cache-Control": "no-store",
        "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json({ message: "Report service is unavailable." }, { status: 503 });
  }
}
