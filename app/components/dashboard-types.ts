export type Person = {
  id: string;
  name: string;
  nickname: string;
  phone: string;
  amount: number;
  bills: number;
  paid: boolean;
  debts: DebtItem[];
};

export type DebtItem = {
  id: string;
  amount: number;
  description?: string;
  groupId?: string;
  groupName?: string;
  createdAt: string;
};

export type ExpenseGroup = {
  id: string;
  title: string;
  category: string;
  date: string;
  total: number;
  people: string[];
  lastAmount?: number;
  favorite?: boolean;
  memberOwed: Record<string, number>;
};
