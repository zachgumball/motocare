"use client";

import { Download, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getServiceRecords, type LocalServiceRecord } from "@/lib/localStore";
import { fetchServiceRecordsFromSupabase } from "@/lib/supabase/multiUserStore";

export default function HistoryPage() {
  const [records,setRecords] = useState<LocalServiceRecord[]>([]);
  const [query,setQuery] = useState("");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setRecords(getServiceRecords());
      fetchServiceRecordsFromSupabase().then((remote)=>{
        if (remote.length) setRecords(remote);
      }).catch(()=>undefined);
    });
    return () => window.cancelAnimationFrame(frame);
  },[]);
  const filtered = useMemo(() => records.filter((record) =>
    `${record.taskName} ${record.workType} ${record.notes ?? ""}`.toLowerCase().includes(query.toLowerCase())
  ),[records,query]);
  const totalCost = records.reduce((sum,record)=>sum+(record.cost ?? 0),0);

  function exportCsv() {
    const lines = ["Tanggal,Kilometer,Komponen,Jenis,Deskripsi,Biaya,Catatan",
      ...filtered.map((record)=>[
        record.date,
        record.kilometers,
        `"${record.taskName.replaceAll('"','""')}"`,
        `"${record.workType.replaceAll('"','""')}"`,
        `"${record.description.replaceAll('"','""')}"`,
        record.cost ?? "",
        `"${(record.notes ?? "").replaceAll('"','""')}"`,
      ].join(","))];
    const url = URL.createObjectURL(new Blob([lines.join("\n")],{type:"text/csv;charset=utf-8"}));
    const anchor = document.createElement("a");
    anchor.href=url;
    anchor.download="motocare-service-history.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between"><div><h1 className="text-2xl font-bold">Service History</h1><p className="mt-1 text-sm text-slate-500">{records.length ? `${records.length} riwayat • Total Rp ${totalCost.toLocaleString("id-ID")}` : "Belum ada riwayat servis yang tersimpan."}</p></div><button onClick={exportCsv} disabled={!filtered.length} className="hidden h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-semibold disabled:opacity-40 sm:flex"><Download size={16}/>Export CSV</button></div>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="text-sm">Cari<div className="relative mt-1"><Search className="absolute left-3 top-3 text-slate-400" size={17}/><input value={query} onChange={(event)=>setQuery(event.target.value)} className="h-11 w-full rounded-lg border border-slate-200 pl-9 pr-3 dark:border-slate-700 dark:bg-slate-900"/></div></label>
        <label className="text-sm">Komponen<select className="mt-1 h-11 w-full rounded-lg border border-slate-200 px-3 dark:border-slate-700 dark:bg-slate-900"><option>Semua komponen</option></select></label>
        <label className="text-sm">Jenis pekerjaan<select className="mt-1 h-11 w-full rounded-lg border border-slate-200 px-3 dark:border-slate-700 dark:bg-slate-900"><option>Semua jenis</option></select></label>
      </div>
      {filtered.length ? <div className="grid gap-3">{filtered.map((record)=><article className="card p-4" key={record.id}><div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold">{record.taskName}</h2><p className="mt-1 text-sm text-slate-500">{record.workType} • {record.date} • {record.kilometers.toLocaleString("id-ID")} km</p></div><div className="text-right text-sm font-semibold">{record.cost ? `Rp ${record.cost.toLocaleString("id-ID")}` : "-"}</div></div>{record.notes&&<p className="mt-3 text-sm text-slate-600">{record.notes}</p>}</article>)}</div> : <div className="card grid min-h-72 place-items-center p-8 text-center">
        <div><div className="mx-auto grid size-14 place-items-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800"><Download size={24}/></div><h2 className="mt-4 font-semibold">Belum ada riwayat servis</h2><p className="mt-1 max-w-sm text-sm text-slate-500">Riwayat akan muncul setelah pekerjaan perawatan dikonfirmasi selesai.</p></div>
      </div>}
    </div>
  );
}
