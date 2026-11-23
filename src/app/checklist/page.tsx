"use client";

import { maintenanceTasks } from "@/data/maintenanceTasks";
import { Check, Search, Star, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { addServiceRecord, getProfile, getServiceRecords, type LocalServiceRecord } from "@/lib/localStore";
import { fetchServiceRecordsFromSupabase, syncServiceRecord } from "@/lib/supabase/multiUserStore";
import type { MaintenanceTask, MaintenanceWork } from "@/data/maintenanceTasks";

interface SelectedWork {
  task: MaintenanceTask;
  work: MaintenanceWork;
  index: number;
}

export default function ChecklistPage() {
  const [query,setQuery] = useState("");
  const [selected,setSelected] = useState<SelectedWork | null>(null);
  const [records,setRecords] = useState<LocalServiceRecord[]>([]);
  const [syncError,setSyncError] = useState("");
  const currentKilometers=Number(getProfile().currentKilometers || getProfile().initialKilometers || 0);
  const today=new Date().toISOString().slice(0,10);

  useEffect(()=>{
    const frame=window.requestAnimationFrame(()=>{
      setRecords(getServiceRecords());
      fetchServiceRecordsFromSupabase().then((remote)=>{
        if (remote.length) setRecords(remote);
      }).catch((error:unknown)=>{
        setSyncError(error instanceof Error ? `Gagal memuat riwayat online: ${error.message}` : "Gagal memuat riwayat online.");
      });
    });
    return ()=>window.cancelAnimationFrame(frame);
  },[]);

  const workItems = useMemo(() => maintenanceTasks.flatMap((task)=>task.works.map((work,index)=>({task,work,index})))
    .filter(({task,work})=>`${task.name} ${task.category} ${work.description} ${work.type}`.toLowerCase().includes(query.toLowerCase())),[query]);

  async function completeTask() {
    if (!selected) return;
    const form = document.querySelector<HTMLFormElement>("#complete-maintenance-form");
    const data = form ? new FormData(form) : null;
    const date = String(data?.get("date") || "");
    const kilometers = Number(data?.get("kilometers") || "");
    const costValue = data?.get("cost");
    const cost = costValue ? Number(costValue) : undefined;
    const notes = String(data?.get("notes") || "");
    if (!date || !Number.isFinite(kilometers) || kilometers < 0 || (cost !== undefined && (!Number.isFinite(cost) || cost < 0))) {
      setSyncError("Tanggal, kilometer, atau biaya tidak valid. Periksa kembali isian.");
      return;
    }
    const record={
      id: crypto.randomUUID(),
      date,
      kilometers,
      taskId:selected.task.id,
      taskName:selected.task.name,
      workType:selected.work.type,
      description:selected.work.description,
      cost,
      notes,
      createdAt:new Date().toISOString(),
    };
    addServiceRecord(record);
    setRecords((items)=>[record,...items]);
    try {
      await syncServiceRecord(record);
      setSyncError("");
    } catch (error) {
      setSyncError(error instanceof Error ? `Tersimpan di perangkat, sinkronisasi gagal: ${error.message}` : "Tersimpan di perangkat, sinkronisasi gagal.");
    }
    setSelected(null);
  }

  function isCompleted(task:MaintenanceTask,work:MaintenanceWork) {
    return records.some((record)=>record.taskId===task.id&&record.workType===work.type&&record.description===work.description);
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Maintenance Checklist</h1>
        <p className="mt-1 text-sm text-slate-500">36 pekerjaan dari dua tabel manual Yamaha. Berlaku sebagai referensi verifikasi.</p>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-3 text-slate-400" size={18}/>
        <input value={query} onChange={(event)=>setQuery(event.target.value)} placeholder="Cari komponen atau kategori" className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900"/>
      </div>
      {syncError&&<p role="status" className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">{syncError}</p>}
      <div className="grid gap-3 lg:grid-cols-2">
        {workItems.map(({task,work,index}) => (
          <article className="card p-4" key={`${task.id}-${index}`}>
            <div className="flex items-start gap-3">
              <button onClick={()=>setSelected({task,work,index})} aria-label={`Selesaikan ${task.name}: ${work.description}`} className={`mt-0.5 grid size-6 shrink-0 place-items-center rounded-md border ${isCompleted(task,work)?"border-emerald-600 bg-emerald-600 text-white":"border-slate-300"}`}>{isCompleted(task,work)&&<Check size={16}/>}</button>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold">{task.name}</h2>
                  {task.dealerRequired&&<span className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700"><Star size={10}/>DEALER YAMAHA</span>}
                </div>
                <p className="mt-1 text-sm text-slate-500">{work.description}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-md bg-slate-100 px-2 py-1 dark:bg-slate-800">{task.category}</span>
                  <span className="rounded-md bg-blue-50 px-2 py-1 text-blue-700">{work.type}</span>
                  <span className="rounded-md bg-slate-100 px-2 py-1 dark:bg-slate-800">Manual {task.page}</span>
                  <span className="rounded-md bg-slate-100 px-2 py-1 dark:bg-slate-800">{work.kilometerInterval ? `Setiap ${work.kilometerInterval.toLocaleString("id-ID")} km` : work.yearInterval ? `Setiap ${work.yearInterval} tahun` : work.indicator ? "Indikator kendaraan" : task.scheduleKm.length ? `${task.scheduleKm.map((km)=>km.toLocaleString("id-ID")).join("/")} km` : "Sesuai kondisi"}</span>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      {selected&&(
        <div className="fixed inset-0 z-50 grid place-items-end bg-slate-950/40 p-0 sm:place-items-center sm:p-4" role="dialog" aria-modal="true">
          <div className="w-full rounded-t-2xl bg-white p-5 shadow-xl dark:bg-slate-900 sm:max-w-md sm:rounded-2xl">
            <div className="flex items-center justify-between"><h2 className="font-bold">Konfirmasi Pekerjaan</h2><button onClick={()=>setSelected(null)} className="icon-button"><X size={18}/></button></div>
            <p className="mt-3 font-semibold text-blue-700">{selected.task.name}</p>
            <p className="mt-1 text-sm text-slate-500">{selected.work.description}</p>
            <form id="complete-maintenance-form" className="mt-4 grid gap-3">
              <label className="text-sm">Tanggal pengerjaan<input name="date" type="date" required defaultValue={today} className="mt-1 h-11 w-full rounded-lg border border-slate-200 px-3 dark:border-slate-700 dark:bg-slate-950"/></label>
              <label className="text-sm">Kilometer saat pengerjaan<input name="kilometers" type="number" min="0" required defaultValue={currentKilometers || ""} className="mt-1 h-11 w-full rounded-lg border border-slate-200 px-3 dark:border-slate-700 dark:bg-slate-950"/></label>
              <label className="text-sm">Biaya (opsional)<input name="cost" type="number" min="0" placeholder="Rp" className="mt-1 h-11 w-full rounded-lg border border-slate-200 px-3 dark:border-slate-700 dark:bg-slate-950"/></label>
              <label className="text-sm">Catatan<textarea name="notes" rows={3} className="mt-1 w-full rounded-lg border border-slate-200 p-3 dark:border-slate-700 dark:bg-slate-950"/></label>
            </form>
            <button onClick={completeTask} className="mt-5 h-11 w-full rounded-lg bg-blue-700 font-semibold text-white">Konfirmasi Selesai</button>
          </div>
        </div>
      )}
    </div>
  );
}
