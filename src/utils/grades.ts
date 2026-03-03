/**
 * Calculate average grade as percentage from numeric grades (Quarter / Final).
 * Uses "yourGrade" field; assumes max grade per subject is 25 unless provided.
 */
export function calculateAverageGrade(
  grades: { yourGrade: number }[],
  maxGradePerSubject = 25
): string {
  if (!grades?.length) return "—";
  const sum = grades.reduce((acc, row) => acc + row.yourGrade, 0);
  const avg = sum / grades.length;
  const percentage = maxGradePerSubject > 0 ? Math.round((avg / maxGradePerSubject) * 100) : 0;
  return `${percentage}%`;
}

/**
 * Calculate pass rate for Jadarat (Pass/Fail) as percentage.
 */
export function calculateJadaratPassRate(
  grades: { Your_Attemps: string }[]
): string {
  if (!grades?.length) return "—";
  const passCount = grades.filter(
    (row) => row.Your_Attemps?.toLowerCase() === "pass"
  ).length;
  const percentage = Math.round((passCount / grades.length) * 100);
  return `${percentage}%`;
}
