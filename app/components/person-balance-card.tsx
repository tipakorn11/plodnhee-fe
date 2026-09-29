import { ChatBubbleOutline, DeleteOutline, EditOutlined, PhoneOutlined } from "@mui/icons-material";
import type { Person } from "./dashboard-types";

type PersonBalanceCardProps = { person: Person; onPay: (person: Person) => void; onDelete: (id: string) => void };
const money = (value: number) => `฿${value.toLocaleString("th-TH")}`;

export function PersonBalanceCard({ person, onPay, onDelete }: PersonBalanceCardProps) {
  return <article className="person-card">
    <div className="person-top"><span className="initial pink">{person.nickname.slice(0, 1)}</span><div className="person-name"><b>{person.name} <em>({person.nickname})</em></b><span><PhoneOutlined /> {person.phone}</span></div><div className={`person-amount ${person.paid ? "paid" : ""}`}><b>{money(person.amount)}</b><small>{person.paid ? "จ่ายครบแล้ว" : "ค้างชำระ"}</small></div></div>
    <p>“เพื่อน{person.nickname}”</p>
    <div className="person-actions"><button onClick={() => onPay(person)}><ChatBubbleOutline /> ดูรายละเอียด / ทวงเงิน</button><EditOutlined /><DeleteOutline className="delete-icon" onClick={() => onDelete(person.id)} /></div>
  </article>;
}
