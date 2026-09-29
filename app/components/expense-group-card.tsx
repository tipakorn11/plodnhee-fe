import { Add, CalendarMonth, KeyboardArrowDown, Star, StarBorder } from "@mui/icons-material";
import { useEffect, useState } from "react";
import type { ExpenseGroup, Person } from "./dashboard-types";

type ExpenseGroupCardProps = {
  group: ExpenseGroup;
  people: Person[];
  selected: boolean;
  onSelect: () => void;
  onAddCharge: (group: ExpenseGroup, amountPerPerson: number) => void;
  onToggleFavorite: () => void;
};
const money = (value: number) => `฿${value.toLocaleString("th-TH")}`;

export function ExpenseGroupCard({
  group,
  people,
  selected,
  onSelect,
  onAddCharge,
  onToggleFavorite,
}: ExpenseGroupCardProps) {
  const [amountPerPerson, setAmountPerPerson] = useState(group.lastAmount?.toString() ?? "");
  useEffect(() => { if (selected && group.lastAmount) setAmountPerPerson(group.lastAmount.toString()); }, [group.lastAmount, selected]);
  const members = people.filter((person) => group.people.includes(person.id));
  const paidCount = members.filter((person) => person.paid).length;
  const remaining = members
    .filter((person) => !person.paid)
    .reduce((sum, person) => sum + person.amount, 0);
  function submitGroupCharge(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onAddCharge(group, Number(amountPerPerson));
    setAmountPerPerson("");
  }
  return (
    <article
      className={`overflow-hidden rounded-[20px] border bg-white shadow-[0_3px_5px_#1929500b] ${selected ? "border-[#8aa9f7] ring-3 ring-[#3863df]/[.07]" : "border-[#e2e8f1]"}`}
    >
      <button
        className="relative flex w-full justify-between gap-5 bg-white p-[18px] text-left text-inherit hover:bg-[#f8faff] md:p-[25px]"
        type="button"
        onClick={onSelect}
        aria-expanded={selected}
      >
        <div>
          <div className="flex items-center gap-3 text-base font-medium text-[#90a0b7]">
            <span className="rounded-[9px] bg-[#f0f3f7] px-[13px] py-[3px] font-bold text-[#536279]">
              {group.category}
            </span>
            <span className="flex items-center gap-1">
              <CalendarMonth className="text-lg" /> {group.date}
            </span>
          </div>
          <h3 className="my-2 text-xl font-bold md:my-[9px] md:mb-4 md:text-2xl">
            {group.title}
          </h3>
          <div className="flex flex-col items-start gap-2 text-[#65758e] sm:flex-row sm:items-center sm:gap-4">
            <div className="h-3 w-full overflow-hidden rounded-[10px] bg-[#e7ecf4] sm:w-[min(500px,45vw)]">
              <span
                className="block h-full bg-[#4b7dea]"
                style={{
                  width: `${members.length ? (paidCount / members.length) * 100 : 0}%`,
                }}
              />
            </div>
            <span className="whitespace-nowrap font-semibold">
              เก็บได้ {paidCount}/{members.length} คน
            </span>
          </div>
        </div>
        <div className="relative min-w-[135px] pr-6 text-right">
          <b className="block text-2xl md:text-[27px]">{money(group.total)}</b>
          <small className="font-bold text-[#ed5264]">
            ค้างอีก {money(remaining)}
          </small>
          <KeyboardArrowDown className="absolute right-[-2px] top-[22px] text-[#93a1b7]" />
        </div>
        <span
          role="button"
          tabIndex={0}
          aria-label="ตั้งเป็นกรุ๊ปโปรด"
          className="absolute right-5 top-3 cursor-pointer text-[#e6a62d]"
          onClick={(event) => { event.stopPropagation(); onToggleFavorite(); }}
          onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onToggleFavorite(); } }}
        >
          {group.favorite ? <Star /> : <StarBorder />}
        </span>
      </button>
      {selected && (
        <form
          className="flex flex-col items-stretch gap-3 border-t border-[#e2e8f1] bg-[#f7f9ff] p-4 sm:flex-row sm:items-end sm:gap-[15px] md:px-[25px]"
          onSubmit={submitGroupCharge}
        >
          <div className="grid flex-1 gap-0.5">
            <b>เพิ่มยอดให้ทั้งกรุ๊ป</b>
            <small className="font-medium text-[#71809a]">
              สมาชิก {members.length} คนจะถูกเพิ่มยอดเท่ากัน
              · ราคาเดิม {group.lastAmount ? money(group.lastAmount) : "ยังไม่มี"}
            </small>
          </div>
          <label className="grid gap-1 text-sm font-bold text-[#536279]">
            ยอดเพิ่ม/คน
            <input
              className="w-full rounded-[9px] border border-[#cad5e6] px-2.5 py-2 outline-[#3863df] sm:w-[130px]"
              aria-label="ยอดเพิ่มต่อคน"
              type="number"
              min="1"
              step="1"
              required
              value={amountPerPerson}
              onChange={(event) => setAmountPerPerson(event.target.value)}
              placeholder="เช่น 100"
            />
          </label>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-[13px] bg-[#3863df] px-[15px] py-2.5 font-bold text-white shadow-[0_3px_6px_#3863df30]"
            type="submit"
          >
            <Add /> เพิ่มยอด
          </button>
        </form>
      )}
      <div className="border-t border-[#e2e8f1] p-4 md:px-[25px] md:pb-6 md:pt-5">
        <div className="flex items-center justify-between border-b border-[#edf0f5] pb-2 font-bold text-[#75839a]">
          <span>รายชื่อผู้หาร ({members.length} คน)</span>
          <button className="border-0 bg-transparent font-bold text-[#4a80f1]">
            แก้ไขกลุ่ม
          </button>
        </div>
        {members.map((person) => (
          <div
            className="mt-[13px] flex min-h-[66px] items-center gap-2.5 rounded-[18px] border border-[#edf0f5] p-2.5 md:gap-[15px] md:px-4"
            key={person.id}
          >
            <span className="grid size-[46px] shrink-0 place-items-center rounded-full bg-[#f1f4f8] text-lg font-bold text-[#56647a]">
              {person.nickname.slice(0, 1)}
            </span>
            <div className="grid gap-px">
              <b className="text-sm md:text-[17px]">
                {person.name}{" "}
                <em className="not-italic text-[#91a0b5]">
                  ({person.nickname})
                </em>
              </b>
              <small className="font-semibold text-[#8492a7]">
                ยอดหาร: {money(Math.round(group.total / members.length))}
              </small>
            </div>
            <span
              className={`ml-auto rounded-[15px] px-2 py-1.5 text-[13px] font-bold md:px-[14px] md:py-2 ${person.paid ? "border border-[#93e7bd] bg-[#e0fae9] text-[#398d6b]" : "border border-[#ffc4cb] bg-[#fff2f3] text-[#e44f63]"}`}
            >
              {person.paid ? "✓ จ่ายแล้ว" : "⊗ ยังไม่จ่าย"}
            </span>
          </div>
        ))}
      </div>
    </article>
  );
}
