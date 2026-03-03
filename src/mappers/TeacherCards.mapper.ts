import { CardData } from "@/types/SharedCard";
import JuniorIcon from "@/icons/1.svg";
import WheelerIcon from "@/icons/2.svg";
import SeniorIcon from "@/icons/3.svg";
import { TeacherSubject } from "@/types/Teacher-api/teacher-api";

export function mapTeacherCardsToSharedCards(
  data: TeacherSubject[]
): CardData[] {
  return data.map((item) => ({
    id: item.id.toString(),
    title: item.title,
    description: item.subjectName,
    href: item.route || `/teacher/classes?year=${item.year}`,
    icon:
      item.year === "junior"
        ? JuniorIcon
        : item.year === "wheeler"
          ? WheelerIcon
          : item.year === "senior"
            ? SeniorIcon
            : JuniorIcon,
  }));
}