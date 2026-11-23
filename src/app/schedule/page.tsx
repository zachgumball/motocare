import { maintenanceTasks } from "@/data/maintenanceTasks";
import { CalendarDays, Gauge, AlertCircle } from "lucide-react";

export default function SchedulePage() {
  return (
    <div className="space-y-5">
      <div><h1 className="text-2xl font-bold">Maintenance Schedule</h1><p className="mt-1 text-sm text-slate-500">Jadwal demo berdasarkan odometer 12.000 km.</p></div>
      <div className="grid gap-3">
        {maintenanceTasks.map((task,index)=>(
          <article className="card flex items-center gap-4 p-4" key={task.id}>
            <div className={`grid size-11 shrink-0 place-items-center rounded-xl ${index%4===0?"bg-amber-50 text-amber-700":"bg-blue-50 text-blue-700"}`}><CalendarDays size={20}/></div>
            <div className="min-w-0 flex-1">
              <h2 className="truncate font-semibold">{task.name}</h2>
              <p className="mt-1 text-xs text-slate-500">{task.works[0]?.description}</p>
            </div>
            <div className="hidden text-right sm:block">
              <div className="flex items-center justify-end gap-1 text-sm font-semibold">{task.scheduleKm[0]?<><Gauge size={14}/>{task.scheduleKm[0].toLocaleString("id-ID")} km</>:<><AlertCircle size={14}/>Kondisional</>}</div>
              <div className="mt-1 text-xs text-slate-500">Manual {task.page}</div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
