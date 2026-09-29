"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Add, CheckCircleOutline, GroupOutlined, LayersOutlined, PaidOutlined, PersonAddAltOutlined, Search } from "@mui/icons-material";
import { DashboardStat } from "./components/dashboard-stat";
import { ExpenseGroupCard } from "./components/expense-group-card";
import { PersonBalanceCard } from "./components/person-balance-card";
import type { ExpenseGroup, Person } from "./components/dashboard-types";
import { ApiError, type ApiGroup, debtApi } from "./components/debt-api";

const money = (value: number) => `฿${value.toLocaleString("th-TH")}`;

export default function Home() {
  const [people, setPeople] = useState<Person[]>([]);
  const [groups, setGroups] = useState<ExpenseGroup[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "open" | "paid">("all");
  const [showPersonForm, setShowPersonForm] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  const mapDashboardData = useCallback((apiPeople: { id: string; name: string }[], apiGroups: ApiGroup[]) => {
    const totals = new Map<string, { amount: number; bills: number }>();
    for (const group of apiGroups) for (const member of group.members) {
      const current = totals.get(member.person.id) ?? { amount: 0, bills: 0 };
      totals.set(member.person.id, { amount: current.amount + member.totalOwed, bills: current.bills + member.billCount });
    }
    setPeople(apiPeople.map((person) => {
      const total = totals.get(person.id) ?? { amount: 0, bills: 0 };
      return { id: person.id, name: person.name, nickname: person.name.split(/\s+/)[0] || person.name, phone: "ไม่ได้ระบุ", amount: total.amount, bills: total.bills, paid: total.amount <= 0 };
    }));
    setGroups(apiGroups.map((group) => ({
      id: group.id, title: group.name, category: "กลุ่มหารเงิน", date: new Intl.DateTimeFormat("th-TH", { dateStyle: "medium" }).format(new Date(group.createdAt)), total: group.totalOwed, people: group.members.map((member) => member.person.id),
    })));
  }, []);

  const loadData = useCallback(async (accessToken: string) => {
    setLoading(true);
    try {
      const [apiPeople, apiGroups] = await Promise.all([debtApi.people(accessToken), debtApi.groups(accessToken)]);
      mapDashboardData(apiPeople, apiGroups);
    } catch (error) {
      const text = error instanceof ApiError ? error.message : "Unable to reach the data service.";
      setMessage(text);
      if (error instanceof ApiError && error.status === 401) {
        localStorage.removeItem("plodnhee-access-token");
        setToken(null);
      }
    } finally {
      setLoading(false);
    }
  }, [mapDashboardData]);

  useEffect(() => {
    const savedToken = localStorage.getItem("plodnhee-access-token");
    const timer = window.setTimeout(() => {
      if (savedToken) setToken(savedToken);
      else setLoading(false);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (!token) return;
    const timer = window.setTimeout(() => { void loadData(token); }, 0);
    return () => window.clearTimeout(timer);
  }, [loadData, token]);

  const outstanding = people.filter((person) => !person.paid).reduce((sum, person) => sum + person.amount, 0);
  const collected = people.filter((person) => person.paid).reduce((sum, person) => sum + person.amount, 0);
  const visiblePeople = people.filter((person) => {
    const found = `${person.name} ${person.nickname}`.toLowerCase().includes(search.toLowerCase());
    return found && (filter === "all" || (filter === "paid" ? person.paid : !person.paid));
  });

  async function authenticate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      const session = authMode === "login"
        ? await debtApi.login(String(form.get("email")), String(form.get("password")))
        : await debtApi.register(String(form.get("email")), String(form.get("password")));
      localStorage.setItem("plodnhee-access-token", session.accessToken);
      setToken(session.accessToken);
      setMessage("");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to sign in."); }
  }
  async function addPerson(form: FormData) {
    const name = String(form.get("name") || "").trim();
    if (!name) return;
    if (!token) return;
    try {
      await debtApi.createPerson(token, name);
      setShowPersonForm(false);
      await loadData(token);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to add person."); }
  }
  async function addChargeToGroup(group: ExpenseGroup, amountPerPerson: number) {
    if (!Number.isFinite(amountPerPerson) || amountPerPerson <= 0 || !group.people.length) return;
    if (!token) return;
    try {
      await debtApi.createCharge(token, group.id, amountPerPerson);
      await loadData(token);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to add the charge."); }
  }

  if (!token) return <main className="mx-auto grid min-h-screen max-w-md place-items-center p-5"><form className="grid w-full gap-4 rounded-[20px] border border-[#e2e8f1] bg-white p-7 shadow-[0_3px_5px_#1929500b]" onSubmit={authenticate}><div><h1 className="m-0 text-2xl font-bold">Plodnhee</h1><p className="mt-1 text-[#75839a]">{authMode === "login" ? "เข้าสู่ระบบเพื่อดูข้อมูลจริงของคุณ" : "สร้างบัญชีเพื่อเริ่มจัดการยอดหารเงิน"}</p></div><input className="rounded-[10px] border border-[#e2e8f1] p-3 outline-[#3863df]" name="email" type="email" placeholder="อีเมล" required /><input className="rounded-[10px] border border-[#e2e8f1] p-3 outline-[#3863df]" name="password" type="password" minLength={8} placeholder="รหัสผ่าน (อย่างน้อย 8 ตัว)" required />{message && <p className="m-0 text-sm font-semibold text-[#d9344e]">{message}</p>}<button className="rounded-[13px] bg-[#3863df] px-[22px] py-[13px] font-bold text-white">{authMode === "login" ? "เข้าสู่ระบบ" : "สร้างบัญชี"}</button><button className="text-sm font-bold text-[#3863df]" type="button" onClick={() => setAuthMode((mode) => mode === "login" ? "register" : "login")}>{authMode === "login" ? "ยังไม่มีบัญชี? สร้างบัญชี" : "มีบัญชีแล้ว? เข้าสู่ระบบ"}</button></form></main>;

  return <main className="mx-auto max-w-[1820px] px-4 pb-20 pt-4 md:px-6 md:pt-9 xl:px-12">
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 xl:gap-[26px]">
      <DashboardStat label="ยอดค้างชำระรวม" value={money(outstanding)} hint="ที่ยังเก็บเงินไม่ครบ" color="red" icon={<PaidOutlined />} />
      <DashboardStat label="เก็บได้แล้วทั้งหมด" value={money(collected)} hint="ชำระเรียบร้อยแล้ว" color="green" icon={<CheckCircleOutline />} />
      <DashboardStat label="ลูกหนี้ค้างชำระ" value={<>{people.filter((person) => !person.paid).length} <small>คน</small></>} hint={`จากทั้งหมด ${people.length} คน`} color="orange" icon={<GroupOutlined />} />
      <DashboardStat label="จำนวนกรุ๊ป/ทริป" value={<>{groups.length} <small>กรุ๊ป</small></>} hint="รายการหารเงินทั้งหมด" color="blue" icon={<LayersOutlined />} />
    </section>

    <section className="mt-7 grid items-start gap-7 xl:mt-[42px] xl:grid-cols-[minmax(0,1.42fr)_minmax(460px,1fr)] xl:gap-[38px]">
      <div className="groups-column">
        <header className="mb-6 flex min-h-[63px] flex-col items-start justify-between gap-4 sm:flex-row"><div><h1 className="m-0 text-[23px] font-bold leading-tight md:text-[27px]"><PaidOutlined className="mr-3 align-[-5px] text-[32px] text-[#4f83ef]" /> รายการกรุ๊ปหารเงิน</h1><p className="m-0 mt-0.5 text-base font-medium text-[#8491a7]">จัดการทริปหรือกิจกรรมที่ต้องการหารค่าใช้จ่าย</p></div><button className="inline-flex items-center gap-2 rounded-[13px] bg-[#3863df] px-4 py-2.5 font-bold whitespace-nowrap text-white shadow-[0_3px_6px_#3863df30] md:px-[22px] md:py-[13px]" onClick={() => setMessage("การสร้างกรุ๊ปยังต้องเพิ่มใน API UI รอบถัดไป")}> <Add /> สร้างกรุ๊ปหารเงิน</button></header>
        <p className="mb-[18px] mt-[-9px] text-[15px] font-semibold text-[#75839a]">คลิกที่กรุ๊ปเพื่อเพิ่มยอดให้สมาชิกทุกคน · ส่วนลดยังคงจัดการแยกเป็นรายคน</p>
        <div className="grid gap-[18px]">{loading ? <p className="p-8 text-center text-[#8491a7]">กำลังโหลดข้อมูลจริง…</p> : groups.map((group) => <ExpenseGroupCard key={group.id} group={group} people={people} selected={selectedGroupId === group.id} onSelect={() => setSelectedGroupId(group.id)} onAddCharge={addChargeToGroup} />)}</div>
      </div>

      <aside>
        <header className="mb-6 flex min-h-[63px] flex-col items-start justify-between gap-4 sm:flex-row"><div><h2 className="m-0 text-[23px] font-bold leading-tight md:text-[26px]"><GroupOutlined className="mr-3 align-[-5px] text-[32px] text-[#4f83ef]" /> สรุปยอดแยกตามบุคคล</h2><p className="m-0 mt-0.5 text-base font-medium text-[#8491a7]">รวมยอดหนี้ทั้งหมดของแต่ละคนจากทุกกรุ๊ป</p></div><button className="inline-flex items-center gap-2 rounded-[13px] border border-[#e2e8f1] bg-[#f9fbff] px-4 py-2.5 font-bold whitespace-nowrap text-[#526178] md:px-[22px] md:py-[13px]" onClick={() => setShowPersonForm(true)}><PersonAddAltOutlined /> เพิ่มลูกหนี้</button></header>
        <div className="mb-[26px] rounded-[20px] border border-[#e2e8f1] bg-white p-5 shadow-[0_3px_5px_#1929500b]"><label className="flex h-11 items-center gap-2.5 rounded-full bg-[#f1f4f8] px-[17px] text-[#8fa0b8]"><Search /><input className="min-w-0 flex-1 border-0 bg-transparent font-semibold text-[#172239] outline-none" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ค้นหาชื่อ หรือชื่อเล่น..." /></label><div className="mt-[18px] flex rounded-[25px] bg-[#f1f4f8] p-1">{[["all", `ทั้งหมด (${people.length})`], ["open", "ยังค้างอยู่"], ["paid", "จ่ายครบแล้ว"]].map(([value, label]) => <button key={value} className={`flex-1 rounded-[17px] px-1 py-2 text-xs font-bold md:text-base ${filter === value ? "bg-[#3863df] text-white" : "text-[#6c7a91]"}`} onClick={() => setFilter(value as typeof filter)}>{label}</button>)}</div></div>
        <div className="grid gap-[18px]">{visiblePeople.map((person) => <PersonBalanceCard key={person.id} person={person} onPay={() => setMessage("สถานะชำระเงินจะมาจากข้อมูลใน API") } onDelete={() => setMessage("การลบรายชื่อยังไม่ได้รองรับโดย API") } />)}{!loading && !visiblePeople.length && <p className="p-8 text-center text-[#8491a7]">ไม่พบรายชื่อที่ค้นหา</p>}</div>
      </aside>
    </section>

    {message && <p className="fixed bottom-5 right-5 z-20 max-w-sm rounded-xl bg-[#172239] px-4 py-3 font-semibold text-white shadow-lg">{message}</p>}
    {showPersonForm && <div className="fixed inset-0 z-10 grid place-items-center bg-[#0e1a2c66] p-5" onClick={() => setShowPersonForm(false)}><form className="grid w-full max-w-[440px] gap-3.5 rounded-[20px] bg-white p-7" action={addPerson} onClick={(event) => event.stopPropagation()}><h2 className="mb-1 text-2xl font-bold">เพิ่มลูกหนี้</h2><input className="rounded-[10px] border border-[#e2e8f1] p-3 outline-[#3863df]" name="name" placeholder="ชื่อ - นามสกุล" required /><p className="m-0 text-sm text-[#75839a]">ชื่อเล่นและเบอร์โทรยังไม่มีในฐานข้อมูล จึงจะไม่ถูกบันทึก</p><div className="mt-2 flex justify-end gap-2.5"><button type="button" className="rounded-[13px] border border-[#e2e8f1] bg-[#f9fbff] px-[22px] py-[13px] font-bold text-[#526178]" onClick={() => setShowPersonForm(false)}>ยกเลิก</button><button className="rounded-[13px] bg-[#3863df] px-[22px] py-[13px] font-bold text-white">บันทึก</button></div></form></div>}
  </main>;
}
