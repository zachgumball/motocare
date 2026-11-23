"use client";

import { Bike, Gauge, CheckCircle2, Clock3, TriangleAlert, Wrench } from "lucide-react";
import { maintenanceTasks } from "@/data/maintenanceTasks";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getActiveUserId, getProfile, getServiceRecords, type LocalMotorProfile, type LocalServiceRecord } from "@/lib/localStore";
import { emptyProfile } from "@/lib/localStore";
import { fetchProfileFromSupabase, fetchServiceRecordsFromSupabase } from "@/lib/supabase/multiUserStore";

export default function Dashboard() {
  const [profile,setProfile] = useState<LocalMotorProfile>(emptyProfile);
  const [serviceRecords,setServiceRecords] = useState<LocalServiceRecord[]>([]);
  const [isDemo,setIsDemo] = useState(()=>!getActiveUserId());
  const [loadError,setLoadError] = useState("");
  useEffect(()=>{
    const frame = window.requestAnimationFrame(()=>{
      if (!getActiveUserId()) return;
      setIsDemo(false);
      setProfile(getProfile());
      setServiceRecords(getServiceRecords());
      Promise.all([fetchProfileFromSupabase(),fetchServiceRecordsFromSupabase()])
        .then(([remoteProfile,remoteRecords])=>{
          if (remoteProfile) setProfile(remoteProfile);
          if (remoteRecords.length) setServiceRecords(remoteRecords);
        })
        .catch((error:unknown)=>{
          setLoadError(error instanceof Error ? `Gagal memuat data akun: ${error.message}` : "Gagal memuat data akun.");
        });
    });
    return () => window.cancelAnimationFrame(frame);
  },[]);
  const upcoming = maintenanceTasks.slice(0, 5);
  const hasMotorProfile = Boolean(profile.model && profile.model !== "Belum diisi");
  const hasOdometer = Boolean(profile.currentKilometers || profile.initialKilometers);
  const displayedKilometers = isDemo ? 12000 : Number(profile.currentKilometers || profile.initialKilometers || 0);
  const metrics = isDemo
    ? [
        ["Total pekerjaan", String(maintenanceTasks.length), Wrench, "text-blue-700"],
        ["Sudah selesai", "0", CheckCircle2, "text-emerald-700"],
        ["Akan datang", "12", Clock3, "text-amber-700"],
        ["Terlambat", "3", TriangleAlert, "text-red-700"],
        ["Penyelesaian", "0%", Gauge, "text-blue-700"],
      ]
    : [
        ["Total pekerjaan", String(maintenanceTasks.length), Wrench, "text-blue-700"],
        ["Catatan servis", String(serviceRecords.length), CheckCircle2, "text-emerald-700"],
        ["Odometer", hasOdometer ? `${displayedKilometers.toLocaleString("id-ID")} km` : "Belum diatur", Gauge, "text-blue-700"],
        ["Profil motor", hasMotorProfile ? "Terisi" : "Belum diatur", Bike, "text-amber-700"],
      ];
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-blue-700">{isDemo?"Pratinjau publik":"Selamat datang"}</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Ringkasan Perawatan</h1>
        </div>
        {isDemo&&<span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">DEMO</span>}
      </div>

      {isDemo&&<section className="card flex flex-col gap-4 border border-amber-200 bg-amber-50/60 p-5 dark:border-amber-900 dark:bg-amber-950/30 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-700 dark:text-slate-200">Ini hanya pratinjau. Angka dan jadwal di bawah adalah contoh, bukan data kendaraan akunmu.</p>
        <Link href="/login" className="shrink-0 rounded-lg bg-blue-700 px-4 py-2 text-center text-sm font-semibold text-white">Buat akun atau masuk</Link>
      </section>}

      {loadError&&<p role="status" className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">{loadError}</p>}

      <section className="card flex flex-col justify-between gap-5 p-5 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <div className="grid size-14 place-items-center rounded-2xl bg-blue-50 text-blue-700 dark:bg-blue-950">
            <Bike size={28}/>
          </div>
          <div>
            <h2 className="font-bold">{isDemo?"Profil motor contoh":hasMotorProfile?`${profile.brand} ${profile.model}`:"Profil motor belum diatur"}</h2>
            <p className="mt-1 text-sm text-slate-500">{isDemo?"Data simulasi":profile.variant || (hasMotorProfile?"Profil akun Anda":"Lengkapi profil untuk menyesuaikan perawatan.")}</p>
          </div>
        </div>
        <div className="rounded-xl bg-slate-50 px-5 py-3 dark:bg-slate-800">
          <div className="flex items-center gap-2 text-sm text-slate-500"><Gauge size={16}/>Odometer saat ini</div>
          <div className="mt-1 text-xl font-bold">{isDemo||hasOdometer?`${displayedKilometers.toLocaleString("id-ID")} km`:"Belum diatur"}</div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {metrics.map(([label,value,Icon,color]) => (
          <div className="card p-4" key={String(label)}>
            <div className={`mb-3 grid size-9 place-items-center rounded-lg bg-slate-100 dark:bg-slate-800 ${color}`}><Icon size={18}/></div>
            <div className="text-xl font-bold">{String(value)}</div>
            <div className="mt-1 text-xs text-slate-500">{String(label)}</div>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-bold">{isDemo?"Contoh perawatan mendatang":"Riwayat servis terbaru"}</h2>
            <Link href="/schedule" className="text-sm font-semibold text-blue-700">Lihat semua</Link>
          </div>
          <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
            {isDemo&&upcoming.map((task,index) => (
              <Link href="/checklist" key={task.id} className="flex items-center gap-3 py-3">
                <div className={`mt-1 size-2 shrink-0 rounded-full ${index<2?"bg-amber-500":"bg-blue-500"}`}/>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{task.name}</div>
                  <div className="mt-0.5 text-xs text-slate-500">{task.works[0]?.description}</div>
                </div>
                <span className="text-xs font-semibold text-slate-600">{task.scheduleKm[0] ? `${task.scheduleKm[0].toLocaleString("id-ID")} km` : "Indikator"}</span>
              </Link>
            ))}
            {!isDemo&&serviceRecords.slice(0,5).map((record)=>(
              <div key={record.id} className="flex items-center gap-3 py-3">
                <div className="mt-1 size-2 shrink-0 rounded-full bg-emerald-500"/>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{record.taskName}</div>
                  <div className="mt-0.5 truncate text-xs text-slate-500">{record.description}</div>
                </div>
                <span className="text-xs font-semibold text-slate-600">{record.kilometers.toLocaleString("id-ID")} km</span>
              </div>
            ))}
            {!isDemo&&!serviceRecords.length&&<p className="py-4 text-sm text-slate-500">Belum ada catatan servis. Mulai dari checklist perawatan.</p>}
          </div>
        </div>

        {isDemo
          ? <div className="card p-5">
              <h2 className="font-bold">Progress Overview</h2>
              <div className="mt-6 grid place-items-center">
                <div className="relative grid size-36 place-items-center rounded-full" style={{background:"conic-gradient(#1d4ed8 0%, #e2e8f0 0)"}}>
                  <div className="grid size-28 place-items-center rounded-full bg-white text-center dark:bg-slate-900">
                    <div><div className="text-2xl font-bold">0%</div><div className="text-xs text-slate-500">Contoh</div></div>
                  </div>
                </div>
              </div>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div className="h-full rounded-full bg-blue-700" style={{width:"0%"}}/>
              </div>
            </div>
          : <div className="card flex flex-col justify-center gap-3 p-5">
              <h2 className="font-bold">Langkah berikutnya</h2>
              {!hasMotorProfile&&<Link href="/profile" className="rounded-lg bg-blue-50 p-3 text-sm font-medium text-blue-800 dark:bg-blue-950 dark:text-blue-200">Lengkapi profil motor</Link>}
              {!hasOdometer&&<Link href="/odometer" className="rounded-lg bg-blue-50 p-3 text-sm font-medium text-blue-800 dark:bg-blue-950 dark:text-blue-200">Atur odometer saat ini</Link>}
              <Link href="/checklist" className="rounded-lg bg-slate-50 p-3 text-sm font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">Buka checklist perawatan</Link>
            </div>}
      </section>
    </div>
  );
}
