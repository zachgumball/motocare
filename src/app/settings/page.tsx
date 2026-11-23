import { isSupabaseConfigured } from "@/lib/supabase/client";

export default function SettingsPage() {
  const supabaseConfigured = isSupabaseConfigured();
  return (
    <div className="space-y-5">
      <div><h1 className="text-2xl font-bold">Settings</h1><p className="mt-1 text-sm text-slate-500">Preferensi aplikasi dan pengingat.</p></div>
      <div className="card divide-y divide-slate-100 dark:divide-slate-800">
        <div className="flex items-center justify-between p-5"><div><div className="font-medium">Koneksi database</div><div className={`mt-1 text-sm ${supabaseConfigured?"text-emerald-700":"text-amber-700"}`}>{supabaseConfigured?"Supabase terkonfigurasi":"Supabase belum dikonfigurasi — data aktif disimpan lokal"}</div></div></div>
        <div className="flex items-center justify-between p-5"><div><div className="font-medium">Autentikasi</div><div className="mt-1 text-sm text-slate-500">Masuk dengan akun Supabase</div></div><a href="/login" className="text-sm font-semibold text-blue-700">Masuk</a></div>
        {[["Batas Upcoming Kilometer","500 km"],["Batas Upcoming Waktu","30 hari"],["Tema","Mengikuti tombol header"],["Notifikasi browser","Belum diaktifkan"]].map(([label,value])=>(
          <div key={label} className="flex items-center justify-between p-5"><div><div className="font-medium">{label}</div><div className="mt-1 text-sm text-slate-500">{value}</div></div><button className="text-sm font-semibold text-blue-700">Ubah</button></div>
        ))}
      </div>
    </div>
  );
}
