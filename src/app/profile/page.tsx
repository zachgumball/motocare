"use client";

import { useEffect, useState } from "react";
import { emptyProfile, getProfile, saveProfile, type LocalMotorProfile } from "@/lib/localStore";
import { syncProfile } from "@/lib/supabase/multiUserStore";
import { fetchProfileFromSupabase } from "@/lib/supabase/multiUserStore";

export default function ProfilePage() {
  const [profile,setProfile] = useState<LocalMotorProfile>(emptyProfile);
  const [saved,setSaved] = useState(false);
  useEffect(()=>{
    const frame = window.requestAnimationFrame(()=>{
      setProfile(getProfile());
      fetchProfileFromSupabase().then((remote)=>{
        if (remote) {
          setProfile(remote);
          saveProfile(remote);
        }
      }).catch(()=>undefined);
    });
    return () => window.cancelAnimationFrame(frame);
  },[]);
  const fields: Array<[keyof LocalMotorProfile,string,string]> = [
    ["brand","Merek","text"],["model","Model","text"],["variant","Varian","text"],["productionYear","Tahun produksi","number"],
    ["plateNumber","Nomor polisi","text"],["purchaseDate","Tanggal pembelian","date"],["initialKilometers","Kilometer awal","number"],
    ["currentKilometers","Kilometer sekarang","number"],["initialUsageDate","Tanggal penggunaan awal","date"],["manualReference","Referensi manual","text"],
  ];
  async function submit(event:React.FormEvent) {
    event.preventDefault();
    saveProfile(profile);
    setSaved(true);
    try {
      await syncProfile(profile);
    } catch {
      setSaved(false);
    }
  }
  return (
    <div className="space-y-5">
      <div><h1 className="text-2xl font-bold">Motorcycle Profile</h1><p className="mt-1 text-sm text-slate-500">Profil motor tahap pertama.</p></div>
      <form onSubmit={submit} className="card grid gap-4 p-5 sm:grid-cols-2">
        {fields.map(([key,label,type])=>(
          <label key={key} className="text-sm font-medium">{label}<input type={type} value={profile[key]} onChange={(event)=>setProfile({...profile,[key]:event.target.value})} className="mt-1 h-11 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950"/></label>
        ))}
        <div className="sm:col-span-2 flex items-center gap-3"><button type="submit" className="h-11 rounded-lg bg-blue-700 px-5 font-semibold text-white">Simpan profil</button>{saved&&<span className="text-sm text-emerald-700">Profil tersimpan</span>}</div>
      </form>
    </div>
  );
}
