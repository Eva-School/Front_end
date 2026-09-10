import { CardData } from "@/types/SharedCard";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import AssignmentIcon from "@mui/icons-material/Assignment";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import BarChartIcon from "@mui/icons-material/BarChart";
import { StudentCardApi } from "@/types/Student-api/Student-api";

const STUDENT_CARD_FALLBACKS: Record<string, { description: string; href: string }> = {
  "quarter-grades": {
    description: "Review continuous coursework, quizzes, and quarterly assessments.",
    href: "/student/quarter",
  },
  "final-grades": {
    description: "Review official transcripts, final exams, and academic standing.",
    href: "/student/final",
  },
  competencies: {
    description: "Track technical Jadarat mastery, attempts, and evaluations.",
    href: "/student/jadarat",
  },
  "academic-progress": {
    description: "Analyze performance trends across academic terms and subjects.",
    href: "/student/progress",
  },
};

export function mapStudentCardsToSharedCards(data: StudentCardApi[]): CardData[] {
  return data.flatMap((item) => {
    const fallback = STUDENT_CARD_FALLBACKS[item.id];
    const href = item.route?.trim() || fallback?.href;

    if (!href) return [];

    let iconComponent = AssignmentIcon;
    if (item.id === "quarter-grades") {
      iconComponent = MenuBookIcon;
    } else if (item.id === "competencies") {
      iconComponent = WorkspacePremiumIcon;
    } else if (item.id === "academic-progress" || item.id === "progress") {
      iconComponent = BarChartIcon;
    }

    return [
      {
        id: item.id,
        title: item.title,
        description:
          item.description?.trim() ||
          fallback?.description ||
          "View your academic information.",
        href,
        icon: iconComponent,
      },
    ];
  });
}
