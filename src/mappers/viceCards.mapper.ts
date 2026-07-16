import { ViceCardApi } from '@/types/vice/vice-api';
import { CardData } from "@/types/SharedCard";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import GroupsIcon from "@mui/icons-material/Groups";
import FactCheckIcon from "@mui/icons-material/FactCheck";

export function mapViceCardsToSharedCards(
  data: ViceCardApi[]
): CardData[] {
  return data.map((item) => ({
    id: item.id.toString(),
    title: item.title,
    description: item.description,
    href: item.route,
    icon:
      item.title === "Teacher"
        ? PersonAddAlt1Icon
        : item.title === "Grades"
          ? FactCheckIcon
          : GroupsIcon,
  }));
}
