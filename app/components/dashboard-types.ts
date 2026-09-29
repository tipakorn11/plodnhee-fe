export type Person = {
  id: string;
  name: string;
  nickname: string;
  phone: string;
  amount: number;
  bills: number;
  paid: boolean;
};

export type ExpenseGroup = {
  id: string;
  title: string;
  category: string;
  date: string;
  total: number;
  people: string[];
};
