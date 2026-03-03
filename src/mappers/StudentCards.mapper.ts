import { CardData } from "@/types/SharedCard";
import BookIcon from "@/icons/book.svg";
import fileIcon from "@/icons/file.svg";
import { StudentCardApi } from '@/types/Student-api/Student-api';

export function mapStudentCardsToSharedCards(
  data: StudentCardApi[]
): CardData[] {
  return data.map((item) => ({
    id: item.id.toString(),
    title: item.title,
    description: item.description,
    href: item.route,
    icon:
      item.title === "Quarter Grades"
        ? BookIcon
        : fileIcon,
  }));
}