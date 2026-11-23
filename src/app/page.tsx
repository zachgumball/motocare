"use client";

import { Bike, Gauge, CheckCircle2, Clock3, TriangleAlert, Wrench } from "lucide-react";
import { maintenanceTasks } from "@/data/maintenanceTasks";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getProfile, getServiceRecords, type LocalMotorProfile } from "@/lib/localStore";
import { emptyProfile } from "@/lib/localStore";

export default function Dashboard() {
  const [profile,setProfile] = useState<LocalMotorProfile>(emptyProfile);
  const [completedCount,setCompletedCount] = useState(0);
  useEffect(()=>{
    const frame = window.requestAnimationFrame(()=>{
      setProfile(getProfile());
      setCompletedCount(getServiceRecords().length);
    });
    return () => window.cancelAnimationFrame(frame);
  },[]);
  const upcoming = maintenanceTasks.slice(0, 5);
  const displayedKilometers = Number(profile.currentKilometers || profile.initialKilometers || 12000);
  const completion = maintenanceTasks.length ? Math.round(completedCount / maintenanceTasks.length * 100) : 0;
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-blue-700">Selamat datang kembali</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Ringkasan Perawatan</h1>
        </div>
        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">DEMO</span>
      </div>

      <section className="card flex flex-col justify-between gap-5 p-5 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <div className="grid size-14 place-items-center rounded-2xl bg-blue-50 text-blue-700 dark:bg-blue-950">
            <Bike size={28}/>
          </div>
          <div>
            <h2 className="font-bold">{profile.brand && profile.model ? `${profile.brand} ${profile.model}` : "Profil motor Yamaha"}</h2>
            <p className="mt-1 text-sm text-slate-500">{profile.variant || "Data profil belum terhubung"}</p>
          </div>
        </div>
        <div className="rounded-xl bg-slate-50 px-5 py-3 dark:bg-slate-800">
          <div className="flex items-center gap-2 text-sm text-slate-500"><Gauge size={16}/>Odometer saat ini</div>
          <div className="mt-1 text-xl font-bold">{displayedKilometers.toLocaleString("id-ID")} <span className="text-sm font-normal text-slate-500">km</span></div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {[
          ["Total pekerjaan", String(maintenanceTasks.length), Wrench, "text-blue-700"],
          ["Sudah selesai", String(completedCount), CheckCircle2, "text-emerald-700"],
          ["Akan datang", "12", Clock3, "text-amber-700"],
          ["Terlambat", "3", TriangleAlert, "text-red-700"],
          ["Penyelesaian", `${completion}%`, Gauge, "text-blue-700"],
        ].map(([label,value,Icon,color]) => (
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
            <h2 className="font-bold">Upcoming Maintenance</h2>
            <Link href="/schedule" className="text-sm font-semibold text-blue-700">Lihat semua</Link>
          </div>
          <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
            {upcoming.map((task,index) => (
              <Link href="/checklist" key={task.id} className="flex items-center gap-3 py-3">
                <div className={`mt-1 size-2 shrink-0 rounded-full ${index<2?"bg-amber-500":"bg-blue-500"}`}/>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{task.name}</div>
                  <div className="mt-0.5 text-xs text-slate-500">{task.works[0]?.description}</div>
                </div>
                <span className="text-xs font-semibold text-slate-600">{task.scheduleKm[0] ? `${task.scheduleKm[0].toLocaleString("id-ID")} km` : "Indikator"}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h2 className="font-bold">Progress Overview</h2>
          <div className="mt-6 grid place-items-center">
            <div className="relative grid size-36 place-items-center rounded-full" style={{background:`conic-gradient(#1d4ed8 ${completion}%, #e2e8f0 0)`}}>
              <div className="grid size-28 place-items-center rounded-full bg-white text-center dark:bg-slate-900">
                <div><div className="text-2xl font-bold">{completion}%</div><div className="text-xs text-slate-500">Selesai</div></div>
              </div>
            </div>
          </div>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div className="h-full rounded-full bg-blue-700" style={{width:`${completion}%`}}/>
          </div>
        </div>
      </section>
    </div>
  );
}
