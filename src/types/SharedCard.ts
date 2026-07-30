import type { ElementType, ReactNode } from "react";

export type CardData = {
  id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: ElementType | ReactNode | any;
  title: string;
  description: string;
  href: string;
};
