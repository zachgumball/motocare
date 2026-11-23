"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { maintenanceTasks } from "@/data/maintenanceTasks";
import { CalendarDays, Gauge, AlertCircle } from "lucide-react";
import { emptyProfile, getProfile, type LocalMotorProfile } from "@/lib/localStore";
import { fetchProfileFromSupabase } from "@/lib/supabase/multiUserStore";

export default function SchedulePage() {
  const [profile,setProfile] = useState<LocalMotorProfile>(emptyProfile);
  const [loadError,setLoadError] = useState("");
  useEffect(()=>{
    const frame=window.requestAnimationFrame(()=>{
      setProfile(getProfile());
      fetchProfileFromSupabase()
        .then((remote)=>{if(remote)setProfile(remote);})
        .catch((error:unknown)=>setLoadError(error instanceof Error?`Gagal memuat profil: ${error.message}`:"Gagal memuat profil."));
    });
    return ()=>window.cancelAnimationFrame(frame);
  },[]);
  const currentKilometers=Number(profile.currentKilometers||profile.initialKilometers||0);
  const hasOdometer=Boolean(profile.currentKilometers||profile.initialKilometers);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Jadwal Perawatan</h1>
        <p className="mt-1 text-sm text-slate-500">Jadwal referensi perawatan Yamaha. Interval berikut adalah acuan, bukan status jatuh tempo akun.</p>
      </div>
      {loadError&&<p role="status" className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">{loadError}</p>}
      <section className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm text-slate-500">Odometer akun</div>
          <div className="mt-1 flex items-center gap-2 text-lg font-bold"><Gauge size={18}/>{hasOdometer?`${currentKilometers.toLocaleString("id-ID")} km`:"Belum diatur"}</div>
        </div>
        {!hasOdometer&&<Link href="/profile" className="text-sm font-semibold text-blue-700">Isi profil dan kilometer</Link>}
      </section>
      <div className="grid gap-3">
        {maintenanceTasks.map((task,index)=>(
          <article className="card flex items-center gap-4 p-4" key={task.id}>
            <div className={`grid size-11 shrink-0 place-items-center rounded-xl ${index%4===0?"bg-amber-50 text-amber-700":"bg-blue-50 text-blue-700"}`}><CalendarDays size={20}/></div>
            <div className="min-w-0 flex-1">
              <h2 className="truncate font-semibold">{task.name}</h2>
              <p className="mt-1 text-xs text-slate-500">{task.works[0]?.description}</p>
            </div>
            <div className="hidden text-right sm:block">
              <div className="flex items-center justify-end gap-1 text-sm font-semibold">{task.scheduleKm.length?<><Gauge size={14}/>{task.scheduleKm.map((km)=>km.toLocaleString("id-ID")).join(" / ")} km</>:<><AlertCircle size={14}/>Kondisional</>}</div>
              <div className="mt-1 text-xs text-slate-500">Manual {task.page}</div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
