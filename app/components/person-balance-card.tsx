import {
  ChatBubbleOutline,
  DeleteOutline,
  EditOutlined,
  PhoneOutlined,
} from "@mui/icons-material";
import type { Person } from "./dashboard-types";

type PersonBalanceCardProps = {
  person: Person;
  onPay: (person: Person) => void;
  onDelete: (id: string) => void;
};
const money = (value: number) => `฿${value.toLocaleString("th-TH")}`;

export function PersonBalanceCard({
  person,
  onPay,
  onDelete,
}: PersonBalanceCardProps) {
  const tone = person.paid
    ? "text-[#3c9c72] [&_small]:bg-[#e1f8ea]"
    : "text-[#d9344e] [&_small]:bg-[#ffe9ec]";
  return (
    <article className="rounded-[20px] border border-[#e2e8f1] bg-white p-5 shadow-[0_3px_5px_#1929500b] md:p-[25px]">
      <div className="flex items-center gap-3.5">
        <span className="grid size-[46px] shrink-0 place-items-center rounded-full bg-[#ffe8eb] text-lg font-bold text-[#bd3c50]">
          {person.nickname.slice(0, 1)}
        </span>
        <div className="grid min-w-0 flex-1 gap-1">
          <b className="text-[17px]">
            {person.name}{" "}
            <em className="not-italic text-[#91a0b5]">({person.nickname})</em>
          </b>
          <span className="flex items-center gap-1 font-medium text-[#94a3b8]">
            <PhoneOutlined className="text-lg" /> {person.phone}
          </span>
        </div>
        <div className={`text-right ${tone}`}>
          <b className="block text-[22px] md:text-[26px]">
            {money(person.amount)}
          </b>
          <small className="rounded-[14px] px-3 py-[3px] font-bold">
            {person.paid ? "จ่ายครบแล้ว" : "ค้างชำระ"}
          </small>
        </div>
      </div>
      <p className="my-5 rounded-xl bg-[#f3f6fa] px-[15px] py-3 font-semibold italic text-[#738096]">
        “เพื่อน{person.nickname}”
      </p>
      <div className="flex items-center gap-4 border-t border-[#e2e8f1] pt-3 text-[#95a4b9]">
        <button
          className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-[10px] bg-[#3863df] font-bold text-white"
          onClick={() => onPay(person)}
        >
          <ChatBubbleOutline /> ดูรายละเอียด / ทวงเงิน
        </button>
        <EditOutlined className="cursor-pointer" />
        <DeleteOutline
          className="cursor-pointer text-[#fc7183]"
          onClick={() => onDelete(person.id)}
        />
      </div>
    </article>
  );
}
