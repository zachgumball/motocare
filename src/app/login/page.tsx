"use client";

import { useState } from "react";
import { Bike } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { setActiveUserId } from "@/lib/localStore";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router=useRouter();
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [message,setMessage] = useState("");
  const [loading,setLoading] = useState(false);
  const [mode,setMode] = useState<"login"|"register">("login");
  const [confirmationPending,setConfirmationPending] = useState(false);

  async function submit(event:React.FormEvent) {
    event.preventDefault();
    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      setMessage("Supabase belum dikonfigurasi. Isi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY.");
      return;
    }
    setLoading(true);
    try {
      const result = mode === "login"
        ? await supabase.auth.signInWithPassword({email,password})
        : await supabase.auth.signUp({email,password});
      const {data,error} = result;
      if (error) {
        const needsConfirmation = mode === "login"
          && (error.message.toLowerCase().includes("email not confirmed")
            || error.message.toLowerCase().includes("invalid login credentials"));
        setConfirmationPending(needsConfirmation);
        setMessage(needsConfirmation
          ? "Login gagal. Periksa email dan password. Jika baru mendaftar, pastikan email sudah dikonfirmasi."
          : error.message);
        return;
      }

      if (mode === "register" && data.user && !data.session) {
        setConfirmationPending(true);
        setMessage(`Akun berhasil dibuat. Konfirmasi alamat ${email} melalui tautan yang dikirim ke email sebelum login.`);
        return;
      }

      if (!data.user || !data.session) {
        setMessage("Autentikasi tidak menghasilkan sesi aktif. Coba lagi atau gunakan konfirmasi email.");
        return;
      }

      setMessage("Login berhasil.");
      setActiveUserId(data.user.id);
      router.push("/");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Terjadi kesalahan saat menghubungi layanan autentikasi.");
    } finally {
      setLoading(false);
    }
  }

  async function resendConfirmation() {
    const supabase=createSupabaseBrowserClient();
    if (!supabase) {
      setMessage("Supabase belum dikonfigurasi. Periksa environment aplikasi.");
      return;
    }
    setLoading(true);
    try {
      const {error}=await supabase.auth.resend({type:"signup",email});
      setMessage(error
        ? error.message
        : `Jika akun ${email} menunggu konfirmasi, tautan konfirmasi telah dikirim ulang. Periksa inbox dan folder spam.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Gagal mengirim ulang email konfirmasi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-[calc(100vh-150px)] place-items-center">
      <form onSubmit={submit} className="card w-full max-w-md p-6">
        <div className="flex items-center gap-3"><div className="grid size-11 place-items-center rounded-xl bg-blue-700 text-white"><Bike size={23}/></div><div><h1 className="text-xl font-bold">MotoCare</h1><p className="text-sm text-slate-500">{mode === "login" ? "Masuk ke akun Anda" : "Buat akun baru"}</p></div></div>
        <label className="mt-6 block text-sm font-medium">Email<input type="email" required value={email} onChange={(event)=>setEmail(event.target.value)} className="mt-1 h-11 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950"/></label>
        <label className="mt-4 block text-sm font-medium">Password<input type="password" required value={password} onChange={(event)=>setPassword(event.target.value)} className="mt-1 h-11 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950"/></label>
        {message&&<p role="status" className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">{message}</p>}
        <button disabled={loading} className="mt-5 h-11 w-full rounded-lg bg-blue-700 font-semibold text-white disabled:opacity-50">{loading?"Memeriksa...":mode === "login"?"Masuk":"Daftar"}</button>
        {confirmationPending&&<button type="button" disabled={loading} onClick={resendConfirmation} className="mt-3 w-full text-center text-sm font-semibold text-blue-700 disabled:opacity-50">Kirim ulang email konfirmasi</button>}
        {confirmationPending&&<div className="mt-4 rounded-lg bg-slate-50 p-3 text-xs leading-5 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          Jika email tetap tidak tiba, SMTP bawaan Supabase hanya mengirim ke alamat yang diizinkan dan memiliki batas pengiriman. Untuk menerima email dari semua pengguna, konfigurasi SMTP khusus di Supabase.
          <a href="https://supabase.com/docs/guides/auth/auth-smtp" target="_blank" rel="noreferrer" className="ml-1 font-semibold text-blue-700 underline dark:text-blue-300">Panduan SMTP</a>
        </div>}
        <button type="button" onClick={()=>setMode(mode==="login"?"register":"login")} className="mt-4 w-full text-center text-sm font-semibold text-blue-700">{mode==="login"?"Belum punya akun? Daftar":"Sudah punya akun? Masuk"}</button>
      </form>
    </div>
  );
}
