"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Gauge,
  ClipboardCheck,
  CalendarDays,
  History,
  Bike,
  Settings,
  Gauge as Odometer,
  Bell,
  Moon,
  Sun,
} from "lucide-react";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { setActiveUserId } from "@/lib/localStore";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

const navigation = [
  { href:"/", label:"Dashboard", icon:Gauge },
  { href:"/checklist", label:"Checklist", icon:ClipboardCheck },
  { href:"/schedule", label:"Schedule", icon:CalendarDays },
  { href:"/history", label:"Riwayat", icon:History },
  { href:"/profile", label:"Motor", icon:Bike },
  { href:"/odometer", label:"Odometer", icon:Odometer },
  { href:"/settings", label:"Pengaturan", icon:Settings },
];

export function AppShell({children}:{children:React.ReactNode}) {
  const pathname = usePathname();
  const router=useRouter();
  const [dark,setDark] = useState(false);
  const [loggedIn,setLoggedIn] = useState(false);
  const [authChecking,setAuthChecking] = useState(true);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const saved = window.localStorage.getItem("motocare-theme");
      const shouldDark = saved === "dark";
      document.documentElement.classList.toggle("dark", shouldDark);
      setDark(shouldDark);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      const frame=window.requestAnimationFrame(()=>{
        setAuthChecking(false);
      });
      return () => window.cancelAnimationFrame(frame);
    }
    let active=true;
    supabase.auth.getSession().then(({data})=>{
      if (!active) return;
      const isLoggedIn=Boolean(data.session);
      setLoggedIn(isLoggedIn);
      setActiveUserId(data.session?.user.id ?? null);
      setAuthChecking(false);
    });
    const {data:{subscription}} = supabase.auth.onAuthStateChange((_event,session)=>{
      const isLoggedIn=Boolean(session);
      setLoggedIn(isLoggedIn);
      setActiveUserId(session?.user.id ?? null);
      setAuthChecking(false);
    });
    return () => {
      active=false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (authChecking) return;
    if (!loggedIn && pathname !== "/login") router.replace("/login");
    if (loggedIn && pathname === "/login") router.replace("/");
  }, [authChecking,loggedIn,pathname,router]);

  async function logout() {
    const supabase=createSupabaseBrowserClient();
    await supabase?.auth.signOut();
    setActiveUserId(null);
    setLoggedIn(false);
    router.push("/login");
  }

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    window.localStorage.setItem("motocare-theme", next ? "dark" : "light");
  }

  if (authChecking) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 text-slate-500">
        <div className="flex items-center gap-3"><div className="size-5 animate-spin rounded-full border-2 border-slate-300 border-t-blue-700"/><span className="text-sm font-medium">Memeriksa sesi...</span></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white px-4 py-6 dark:border-slate-800 dark:bg-slate-900 md:block">
        <Link href="/" className="flex items-center gap-3 px-3">
          <div className="grid size-10 place-items-center rounded-xl bg-blue-700 text-white"><Bike size={22}/></div>
          <div>
            <div className="font-bold tracking-tight">MotoCare</div>
            <div className="text-xs text-slate-500">Maintenance Tracker</div>
          </div>
        </Link>
        <nav className="mt-8 space-y-1">
          {navigation.map(({href,label,icon:Icon}) => (
            <Link key={href} href={href} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${pathname===href?"bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300":"text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"}`}>
              <Icon size={18}/>{label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="md:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 md:px-8">
          <div className="md:hidden"><span className="font-bold text-blue-700">MotoCare</span></div>
          <div className="hidden text-sm text-slate-500 md:block">Dashboard kendaraan</div>
          <div className="flex items-center gap-1">
            <button aria-label="Notifikasi" className="icon-button"><Bell size={19}/></button>
            <button aria-label="Ganti tema" onClick={toggleTheme} className="icon-button">{dark?<Sun size={19}/>:<Moon size={19}/>}</button>
            {loggedIn&&<button aria-label="Keluar" onClick={logout} className="icon-button"><LogOut size={19}/></button>}
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6 pb-24 md:px-8 md:pb-10">{children}</main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-30 grid grid-cols-7 border-t border-slate-200 bg-white px-1 pb-[env(safe-area-inset-bottom)] dark:border-slate-800 dark:bg-slate-900 md:hidden">
        {navigation.map(({href,label,icon:Icon}) => (
          <Link key={href} href={href} className={`flex min-h-16 flex-col items-center justify-center gap-1 text-[10px] ${pathname===href?"text-blue-700 dark:text-blue-300":"text-slate-500"}`}>
            <Icon size={20}/><span>{label==="Checklist"?"Ceklist":label==="Schedule"?"Jadwal":label==="Pengaturan"?"Setting":label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
