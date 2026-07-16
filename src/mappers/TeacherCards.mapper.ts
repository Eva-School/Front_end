import { CardData } from "@/types/SharedCard";
import Looks3Icon from "@mui/icons-material/Looks3";
import LooksOneIcon from "@mui/icons-material/LooksOne";
import LooksTwoIcon from "@mui/icons-material/LooksTwo";
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
        ? LooksOneIcon
        : item.year === "wheeler"
          ? LooksTwoIcon
          : item.year === "senior"
            ? Looks3Icon
            : LooksOneIcon,
  }));
}
