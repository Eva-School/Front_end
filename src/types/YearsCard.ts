export interface YearItem {
  id: number;
  name: string;
}

export interface YearSection {
    id:number;
  title: string;
  items: YearItem[];
}
