import { CalendarMonth, KeyboardArrowDown } from "@mui/icons-material";
import type { ExpenseGroup, Person } from "./dashboard-types";

type ExpenseGroupCardProps = { group: ExpenseGroup; people: Person[] };
const money = (value: number) => `฿${value.toLocaleString("th-TH")}`;

export function ExpenseGroupCard({ group, people }: ExpenseGroupCardProps) {
  const members = people.filter((person) => group.people.includes(person.id));
  const paidCount = members.filter((person) => person.paid).length;
  const remaining = members.filter((person) => !person.paid).reduce((sum, person) => sum + person.amount, 0);
  return <article className="expense-card">
    <div className="expense-head">
      <div>
        <div className="meta-line"><span className="category-pill">{group.category}</span><span><CalendarMonth /> {group.date}</span></div>
        <h3>{group.title}</h3>
        <div className="progress-row"><div className="progress-track"><span style={{ width: `${members.length ? (paidCount / members.length) * 100 : 0}%` }} /></div><span>เก็บได้ {paidCount}/{members.length} คน</span></div>
      </div>
      <div className="expense-total"><b>{money(group.total)}</b><small>ค้างอีก {money(remaining)}</small><KeyboardArrowDown /></div>
    </div>
    <div className="expense-members">
      <div className="member-label"><span>รายชื่อผู้หาร ({members.length} คน)</span><button>แก้ไขกลุ่ม</button></div>
      {members.map((person) => <div className="group-member" key={person.id}>
        <span className="initial neutral">{person.nickname.slice(0, 1)}</span><div><b>{person.name} <em>({person.nickname})</em></b><small>ยอดหาร: {money(Math.round(group.total / members.length))}</small></div>
        <span className={`payment-state ${person.paid ? "settled" : "open"}`}>{person.paid ? "✓ จ่ายแล้ว" : "⊗ ยังไม่จ่าย"}</span>
      </div>)}
    </div>
  </article>;
}
