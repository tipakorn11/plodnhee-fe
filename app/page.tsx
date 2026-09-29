"use client";

import { useMemo, useState } from "react";
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

  const outstanding = people.filter((person) => !person.paid).reduce((sum, person) => sum + person.amount, 0);
  const collected = people.filter((person) => person.paid).reduce((sum, person) => sum + person.amount, 0) + 2800;
  const visiblePeople = useMemo(() => people.filter((person) => {
    const found = `${person.name} ${person.nickname}`.toLowerCase().includes(search.toLowerCase());
    return found && (filter === "all" || (filter === "paid" ? person.paid : !person.paid));
  }), [people, search, filter]);

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

  return <main className="dashboard-shell">
    <section className="stats-grid">
      <DashboardStat label="ยอดค้างชำระรวม" value={money(outstanding)} hint="ที่ยังเก็บเงินไม่ครบ" color="red" icon={<PaidOutlined />} />
      <DashboardStat label="เก็บได้แล้วทั้งหมด" value={money(collected)} hint="ชำระเรียบร้อยแล้ว" color="green" icon={<CheckCircleOutline />} />
      <DashboardStat label="ลูกหนี้ค้างชำระ" value={<>{people.filter((person) => !person.paid).length} <small>คน</small></>} hint={`จากทั้งหมด ${people.length} คน`} color="orange" icon={<GroupOutlined />} />
      <DashboardStat label="จำนวนกรุ๊ป/ทริป" value={<>{groups.length} <small>กรุ๊ป</small></>} hint="รายการหารเงินทั้งหมด" color="blue" icon={<LayersOutlined />} />
    </section>

    <section className="dashboard-grid">
      <div className="groups-column">
        <header className="section-header"><div><h1><PaidOutlined /> รายการกรุ๊ปหารเงิน</h1><p>จัดการทริปหรือกิจกรรมที่ต้องการหารค่าใช้จ่าย</p></div><button className="primary-button" onClick={() => alert("สามารถเพิ่มกลุ่มได้จากหน้าจัดการกลุ่ม")}> <Add /> สร้างกรุ๊ปหารเงิน</button></header>
        <div className="groups-list">{groups.map((group) => <ExpenseGroupCard key={group.id} group={group} people={people} />)}</div>
      </div>

      <aside className="people-column">
        <header className="section-header people-header"><div><h2><GroupOutlined /> สรุปยอดแยกตามบุคคล</h2><p>รวมยอดหนี้ทั้งหมดของแต่ละคนจากทุกกรุ๊ป</p></div><button className="outline-button" onClick={() => setShowPersonForm(true)}><PersonAddAltOutlined /> เพิ่มลูกหนี้</button></header>
        <div className="filter-card"><label><Search /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ค้นหาชื่อ หรือชื่อเล่น..." /></label><div className="tabs">{[["all", `ทั้งหมด (${people.length})`], ["open", "ยังค้างอยู่"], ["paid", "จ่ายครบแล้ว"]].map(([value, label]) => <button key={value} className={filter === value ? "active" : ""} onClick={() => setFilter(value as typeof filter)}>{label}</button>)}</div></div>
        <div className="people-list">{visiblePeople.map((person) => <PersonBalanceCard key={person.id} person={person} onPay={markPaid} onDelete={removePerson} />)}{!visiblePeople.length && <p className="empty-state">ไม่พบรายชื่อที่ค้นหา</p>}</div>
      </aside>
    </section>

    {showPersonForm && <div className="modal-backdrop" onClick={() => setShowPersonForm(false)}><form className="person-form" action={addPerson} onClick={(event) => event.stopPropagation()}><h2>เพิ่มลูกหนี้</h2><input name="name" placeholder="ชื่อ - นามสกุล" required /><input name="nickname" placeholder="ชื่อเล่น" /><input name="phone" placeholder="เบอร์โทรศัพท์" /><input name="amount" type="number" min="0" placeholder="ยอดค้างชำระ" /><div><button type="button" className="outline-button" onClick={() => setShowPersonForm(false)}>ยกเลิก</button><button className="primary-button">บันทึก</button></div></form></div>}
  </main>;
}
