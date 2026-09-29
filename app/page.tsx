"use client";

import { useState } from "react";
import { Add, CheckCircleOutline, GroupOutlined, LayersOutlined, PaidOutlined, PersonAddAltOutlined, Search } from "@mui/icons-material";
import { DashboardStat } from "./components/dashboard-stat";
import { initialGroups, initialPeople } from "./components/dashboard-data";
import { ExpenseGroupCard } from "./components/expense-group-card";
import { PersonBalanceCard } from "./components/person-balance-card";
import type { ExpenseGroup, Person } from "./components/dashboard-types";

const money = (value: number) => `฿${value.toLocaleString("th-TH")}`;

export default function Home() {
  const [people, setPeople] = useState<Person[]>(initialPeople);
  const [groups, setGroups] = useState<ExpenseGroup[]>(initialGroups);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "open" | "paid">("all");
  const [showPersonForm, setShowPersonForm] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  const outstanding = people.filter((person) => !person.paid).reduce((sum, person) => sum + person.amount, 0);
  const collected = people.filter((person) => person.paid).reduce((sum, person) => sum + person.amount, 0) + 2800;
  const visiblePeople = people.filter((person) => {
    const found = `${person.name} ${person.nickname}`.toLowerCase().includes(search.toLowerCase());
    return found && (filter === "all" || (filter === "paid" ? person.paid : !person.paid));
  });

  function markPaid(person: Person) {
    setPeople((current) => current.map((item) => item.id === person.id ? { ...item, paid: true, amount: 0 } : item));
  }
  function removePerson(id: string) {
    setPeople((current) => current.filter((person) => person.id !== id));
    setGroups((current) => current.map((group) => ({ ...group, people: group.people.filter((personId) => personId !== id) })));
  }
  function addPerson(form: FormData) {
    const name = String(form.get("name") || "").trim();
    if (!name) return;
    setPeople((current) => [...current, { id: crypto.randomUUID(), name, nickname: String(form.get("nickname") || name), phone: String(form.get("phone") || "ยังไม่ได้ระบุ"), amount: Number(form.get("amount") || 0), bills: 1, paid: false }]);
    setShowPersonForm(false);
  }
  function addChargeToGroup(group: ExpenseGroup, amountPerPerson: number) {
    if (!Number.isFinite(amountPerPerson) || amountPerPerson <= 0 || !group.people.length) return;
    const memberIds = new Set(group.people);
    setPeople((current) => current.map((person) => memberIds.has(person.id)
      ? { ...person, amount: person.amount + amountPerPerson, bills: person.bills + 1, paid: false }
      : person));
    setGroups((current) => current.map((item) => item.id === group.id
      ? { ...item, total: item.total + amountPerPerson * item.people.length }
      : item));
  }

  return <main className="mx-auto max-w-[1820px] px-4 pb-20 pt-4 md:px-6 md:pt-9 xl:px-12">
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-[26px]">
      <DashboardStat label="ยอดค้างชำระรวม" value={money(outstanding)} hint="ที่ยังเก็บเงินไม่ครบ" color="red" icon={<PaidOutlined />} />
      <DashboardStat label="เก็บได้แล้วทั้งหมด" value={money(collected)} hint="ชำระเรียบร้อยแล้ว" color="green" icon={<CheckCircleOutline />} />
      <DashboardStat label="ลูกหนี้ค้างชำระ" value={<>{people.filter((person) => !person.paid).length} <small>คน</small></>} hint={`จากทั้งหมด ${people.length} คน`} color="orange" icon={<GroupOutlined />} />
      <DashboardStat label="จำนวนกรุ๊ป/ทริป" value={<>{groups.length} <small>กรุ๊ป</small></>} hint="รายการหารเงินทั้งหมด" color="blue" icon={<LayersOutlined />} />
    </section>

    <section className="mt-7 grid items-start gap-7 xl:mt-[42px] xl:grid-cols-[minmax(0,1.42fr)_minmax(460px,1fr)] xl:gap-[38px]">
      <div className="groups-column">
        <header className="mb-6 flex min-h-[63px] flex-col items-start justify-between gap-4 sm:flex-row"><div><h1 className="m-0 text-[23px] font-bold leading-tight md:text-[27px]"><PaidOutlined className="mr-3 align-[-5px] text-[32px] text-[#4f83ef]" /> รายการกรุ๊ปหารเงิน</h1><p className="m-0 mt-0.5 text-base font-medium text-[#8491a7]">จัดการทริปหรือกิจกรรมที่ต้องการหารค่าใช้จ่าย</p></div><button className="inline-flex items-center gap-2 rounded-[13px] bg-[#3863df] px-4 py-2.5 font-bold whitespace-nowrap text-white shadow-[0_3px_6px_#3863df30] md:px-[22px] md:py-[13px]" onClick={() => alert("สามารถเพิ่มกลุ่มได้จากหน้าจัดการกลุ่ม")}> <Add /> สร้างกรุ๊ปหารเงิน</button></header>
        <p className="mb-[18px] mt-[-9px] text-[15px] font-semibold text-[#75839a]">คลิกที่กรุ๊ปเพื่อเพิ่มยอดให้สมาชิกทุกคน · ส่วนลดยังคงจัดการแยกเป็นรายคน</p>
        <div className="grid gap-[18px]">{groups.map((group) => <ExpenseGroupCard key={group.id} group={group} people={people} selected={selectedGroupId === group.id} onSelect={() => setSelectedGroupId(group.id)} onAddCharge={addChargeToGroup} />)}</div>
      </div>

      <aside>
        <header className="mb-6 flex min-h-[63px] flex-col items-start justify-between gap-4 sm:flex-row"><div><h2 className="m-0 text-[23px] font-bold leading-tight md:text-[26px]"><GroupOutlined className="mr-3 align-[-5px] text-[32px] text-[#4f83ef]" /> สรุปยอดแยกตามบุคคล</h2><p className="m-0 mt-0.5 text-base font-medium text-[#8491a7]">รวมยอดหนี้ทั้งหมดของแต่ละคนจากทุกกรุ๊ป</p></div><button className="inline-flex items-center gap-2 rounded-[13px] border border-[#e2e8f1] bg-[#f9fbff] px-4 py-2.5 font-bold whitespace-nowrap text-[#526178] md:px-[22px] md:py-[13px]" onClick={() => setShowPersonForm(true)}><PersonAddAltOutlined /> เพิ่มลูกหนี้</button></header>
        <div className="mb-[26px] rounded-[20px] border border-[#e2e8f1] bg-white p-5 shadow-[0_3px_5px_#1929500b]"><label className="flex h-11 items-center gap-2.5 rounded-full bg-[#f1f4f8] px-[17px] text-[#8fa0b8]"><Search /><input className="min-w-0 flex-1 border-0 bg-transparent font-semibold text-[#172239] outline-none" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ค้นหาชื่อ หรือชื่อเล่น..." /></label><div className="mt-[18px] flex rounded-[25px] bg-[#f1f4f8] p-1">{[["all", `ทั้งหมด (${people.length})`], ["open", "ยังค้างอยู่"], ["paid", "จ่ายครบแล้ว"]].map(([value, label]) => <button key={value} className={`flex-1 rounded-[17px] px-1 py-2 text-xs font-bold md:text-base ${filter === value ? "bg-[#3863df] text-white" : "text-[#6c7a91]"}`} onClick={() => setFilter(value as typeof filter)}>{label}</button>)}</div></div>
        <div className="grid gap-[18px]">{visiblePeople.map((person) => <PersonBalanceCard key={person.id} person={person} onPay={markPaid} onDelete={removePerson} />)}{!visiblePeople.length && <p className="p-8 text-center text-[#8491a7]">ไม่พบรายชื่อที่ค้นหา</p>}</div>
      </aside>
    </section>

    {showPersonForm && <div className="fixed inset-0 z-10 grid place-items-center bg-[#0e1a2c66] p-5" onClick={() => setShowPersonForm(false)}><form className="grid w-full max-w-[440px] gap-3.5 rounded-[20px] bg-white p-7" action={addPerson} onClick={(event) => event.stopPropagation()}><h2 className="mb-1 text-2xl font-bold">เพิ่มลูกหนี้</h2><input className="rounded-[10px] border border-[#e2e8f1] p-3 outline-[#3863df]" name="name" placeholder="ชื่อ - นามสกุล" required /><input className="rounded-[10px] border border-[#e2e8f1] p-3 outline-[#3863df]" name="nickname" placeholder="ชื่อเล่น" /><input className="rounded-[10px] border border-[#e2e8f1] p-3 outline-[#3863df]" name="phone" placeholder="เบอร์โทรศัพท์" /><input className="rounded-[10px] border border-[#e2e8f1] p-3 outline-[#3863df]" name="amount" type="number" min="0" placeholder="ยอดค้างชำระ" /><div className="mt-2 flex justify-end gap-2.5"><button type="button" className="rounded-[13px] border border-[#e2e8f1] bg-[#f9fbff] px-[22px] py-[13px] font-bold text-[#526178]" onClick={() => setShowPersonForm(false)}>ยกเลิก</button><button className="rounded-[13px] bg-[#3863df] px-[22px] py-[13px] font-bold text-white">บันทึก</button></div></form></div>}
  </main>;
}
