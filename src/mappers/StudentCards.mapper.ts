import { CardData } from "@/types/SharedCard";
import BookIcon from "@/icons/book.svg";
import fileIcon from "@/icons/file.svg";
import { StudentCardApi } from '@/types/Student-api/Student-api';

const STUDENT_CARD_FALLBACKS: Record<string, { description: string; href: string }> = {
  "quarter-grades": {
    description: "Review your quarter assessment results.",
    href: "/student/quarter",
  },
  "final-grades": {
    description: "Review your final examination results.",
    href: "/student/final",
  },
  competencies: {
    description: "Review your Jadarat competency progress.",
    href: "/student/jadarat",
  },
};

export function mapStudentCardsToSharedCards(
  data: StudentCardApi[]
): CardData[] {
  return data.flatMap((item) => {
    const fallback = STUDENT_CARD_FALLBACKS[item.id];
    const href = item.route?.trim() || fallback?.href;

    // Never render a dashboard card with an invalid link. This also keeps the
    // UI compatible with an API instance that has not yet been restarted.
    if (!href) return [];

    return [{
      id: item.id,
      title: item.title,
      description: item.description?.trim() || fallback?.description || "View your academic information.",
      href,
      icon: item.id === "quarter-grades" ? BookIcon : fileIcon,
    }];
  });
}
