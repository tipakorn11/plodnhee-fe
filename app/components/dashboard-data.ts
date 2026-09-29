import type { ExpenseGroup, Person } from "./dashboard-types";

export const initialPeople: Person[] = [
  {
    id: "1",
    name: "กิตติศักดิ์ ชัยมงคล",
    nickname: "กิต",
    phone: "081-234-5678",
    amount: 1200,
    bills: 3,
    paid: false,
  },
  {
    id: "2",
    name: "ณิชาภานต์ วงศ์สุวรรณ",
    nickname: "มิว",
    phone: "089-876-5432",
    amount: 1850,
    bills: 4,
    paid: false,
  },
  {
    id: "3",
    name: "ธนกฤต สุขเจริญ",
    nickname: "บอส",
    phone: "082-567-1234",
    amount: 550,
    bills: 2,
    paid: false,
  },
  {
    id: "4",
    name: "พิมลพรรณ เลิศวิไล",
    nickname: "แพรว",
    phone: "095-456-7890",
    amount: 0,
    bills: 2,
    paid: true,
  },
];

export const initialGroups: ExpenseGroup[] = [
  {
    id: "1",
    title: "ชาบู สยามพารากอน",
    category: "อาหารและเครื่องดื่ม",
    date: "2026-09-20",
    total: 1400,
    people: ["1", "2", "3", "4"],
  },
  {
    id: "2",
    title: "ทริปเขาใหญ่ 3 วัน 2 คืน",
    category: "ท่องเที่ยว",
    date: "2026-09-12",
    total: 4800,
    people: ["1", "2", "3"],
  },
  {
    id: "3",
    title: "ของขวัญวันเกิดเพื่อน",
    category: "ช้อปปิ้ง",
    date: "2026-09-03",
    total: 900,
    people: ["1", "4"],
  },
];
