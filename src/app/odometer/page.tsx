"use client";

import { useEffect, useState } from "react";
import { Gauge, History } from "lucide-react";
import { addOdometerRecord, getOdometerRecords, getProfile, saveProfile, type LocalOdometerRecord } from "@/lib/localStore";
import { syncOdometer } from "@/lib/supabase/multiUserStore";
import { fetchOdometerRecordsFromSupabase } from "@/lib/supabase/multiUserStore";

export default function OdometerPage() {
  const [kilometers,setKilometers] = useState("");
  const [reason,setReason] = useState("");
  const [correction,setCorrection] = useState(false);
  const [records,setRecords] = useState<LocalOdometerRecord[]>([]);
  const [error,setError] = useState("");

  useEffect(()=>{
    const frame = window.requestAnimationFrame(()=>{
      setRecords(getOdometerRecords());
      fetchOdometerRecordsFromSupabase().then((remote)=>{
        if (remote.length) setRecords(remote);
      }).catch(()=>undefined);
    });
    return () => window.cancelAnimationFrame(frame);
  },[]);

  async function updateOdometer(event:React.FormEvent) {
    event.preventDefault();
    const next = Number(kilometers);
    if (!Number.isFinite(next) || next < 0) {
      setError("Kilometer tidak boleh negatif atau tidak valid.");
      return;
    }
    const profile = getProfile();
    const previous = Number(profile.currentKilometers || profile.initialKilometers || 0);
    if (!correction && next < previous) {
      setError("Kilometer baru lebih rendah dari catatan terakhir. Aktifkan koreksi dan isi alasan.");
      return;
    }
    if (correction && !reason.trim()) {
      setError("Alasan koreksi wajib diisi.");
      return;
    }
    const record:LocalOdometerRecord = {
      id:crypto.randomUUID(),
      previousKilometers:previous,
      kilometers:next,
      recordedAt:new Date().toISOString(),
      correction,
      reason:correction ? reason.trim() : undefined,
    };
    addOdometerRecord(record);
    saveProfile({...profile,currentKilometers:String(next)});
    setRecords((items)=>[record,...items]);
    try {
      await syncOdometer(record);
    } catch (syncError) {
      setError(syncError instanceof Error ? syncError.message : "Data tersimpan lokal, tetapi sinkronisasi gagal.");
    }
    setKilometers("");
    setReason("");
    setCorrection(false);
    setError("");
  }

  return (
    <div className="space-y-5">
      <div><h1 className="text-2xl font-bold">Odometer Tracker</h1><p className="mt-1 text-sm text-slate-500">Catat jarak tempuh aktual dan koreksi odometer secara eksplisit.</p></div>
      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <form onSubmit={updateOdometer} className="card space-y-4 p-5">
          <div className="flex items-center gap-3"><div className="grid size-10 place-items-center rounded-xl bg-blue-50 text-blue-700"><Gauge size={20}/></div><div><div className="text-sm text-slate-500">Kilometer saat ini</div><div className="font-bold">{(Number(getProfile().currentKilometers || getProfile().initialKilometers || 0)).toLocaleString("id-ID")} km</div></div></div>
          <label className="block text-sm font-medium">Kilometer baru<input type="number" min="0" value={kilometers} onChange={(event)=>setKilometers(event.target.value)} className="mt-1 h-11 w-full rounded-lg border border-slate-200 px-3 dark:border-slate-700 dark:bg-slate-950"/></label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={correction} onChange={(event)=>setCorrection(event.target.checked)} /> Koreksi odometer</label>
          {correction&&<label className="block text-sm font-medium">Alasan koreksi<textarea value={reason} onChange={(event)=>setReason(event.target.value)} rows={3} className="mt-1 w-full rounded-lg border border-slate-200 p-3 dark:border-slate-700 dark:bg-slate-950"/></label>}
          {error&&<p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <button className="h-11 w-full rounded-lg bg-blue-700 font-semibold text-white">Perbarui kilometer</button>
        </form>
        <div className="card p-5">
          <div className="flex items-center gap-2 font-bold"><History size={18}/>Riwayat perubahan</div>
          {records.length ? <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">{records.map((record)=><div className="py-3" key={record.id}><div className="flex justify-between text-sm"><span>{record.previousKilometers.toLocaleString("id-ID")} km → <strong>{record.kilometers.toLocaleString("id-ID")} km</strong></span>{record.correction&&<span className="rounded-full bg-amber-50 px-2 text-xs font-semibold text-amber-700">Koreksi</span>}</div><div className="mt-1 text-xs text-slate-500">{new Date(record.recordedAt).toLocaleDateString("id-ID")}{record.reason&&` • ${record.reason}`}</div></div>)}</div> : <p className="mt-6 text-sm text-slate-500">Belum ada perubahan odometer.</p>}
        </div>
      </div>
    </div>
  );
}
