import { createSupabaseBrowserClient } from "./client";
import { maintenanceTasks } from "@/data/maintenanceTasks";
import type { LocalMotorProfile, LocalOdometerRecord, LocalServiceRecord } from "../localStore";

async function getMotorcycle(userId:string) {
  const supabase=createSupabaseBrowserClient();
  if (!supabase) return null;
  const {data,error}=await supabase
    .from("motorcycles")
    .select("id")
    .eq("user_id",userId)
    .maybeSingle();
  if (error) throw error;
  return data ? data.id as string : null;
}

export async function syncProfile(profile:LocalMotorProfile) {
  const supabase=createSupabaseBrowserClient();
  if (!supabase) return {synced:false as const};
  const {data:{user}}=await supabase.auth.getUser();
  if (!user) return {synced:false as const};

  const values={
    user_id:user.id,
    brand:profile.brand || "Yamaha",
    model:profile.model || "Belum diisi",
    variant:profile.variant || null,
    production_year:profile.productionYear ? Number(profile.productionYear) : null,
    plate_number:profile.plateNumber || null,
    purchase_date:profile.purchaseDate || null,
    initial_usage_date:profile.initialUsageDate || null,
    initial_kilometers:profile.initialKilometers ? Number(profile.initialKilometers) : 0,
    current_kilometers:profile.currentKilometers ? Number(profile.currentKilometers) : 0,
    manual_reference:profile.manualReference || null,
  };
  let motorcycleId=await getMotorcycle(user.id);
  if (motorcycleId) {
    const {error}=await supabase.from("motorcycles").update(values).eq("id",motorcycleId);
    if (error) throw error;
  } else {
    const {data,error}=await supabase.from("motorcycles").insert(values).select("id").single();
    if (error) throw error;
    motorcycleId=data.id;
  }
  return {synced:true as const,motorcycleId};
}

async function ensureTask(taskId:string) {
  const supabase=createSupabaseBrowserClient();
  if (!supabase) return null;
  const task=maintenanceTasks.find((item)=>item.id===taskId);
  if (!task) return null;
  const {data:existing}=await supabase
    .from("maintenance_tasks")
    .select("id")
    .contains("data",{app_id:taskId})
    .maybeSingle();
  if (existing) return existing.id as string;
  const {data,error}=await supabase.from("maintenance_tasks").insert({
    source_table:task.source,
    source_number:task.number,
    name:task.name,
    page_reference:task.page,
    dealer_required:task.dealerRequired,
    annual:task.annual,
    schedule_kilometers:task.scheduleKm,
    schedule_months:task.scheduleMonths,
    data:{app_id:task.id,works:task.works},
  }).select("id").single();
  if (error) throw error;
  return data.id as string;
}

export async function syncOdometer(record:LocalOdometerRecord) {
  const supabase=createSupabaseBrowserClient();
  if (!supabase) return {synced:false as const};
  const {data:{user}}=await supabase.auth.getUser();
  if (!user) return {synced:false as const};
  const motorcycleId=await getMotorcycle(user.id);
  if (!motorcycleId) return {synced:false as const};
  const {error}=await supabase.from("odometer_records").insert({
    motorcycle_id:motorcycleId,
    previous_kilometers:record.previousKilometers,
    kilometers:record.kilometers,
    recorded_at:record.recordedAt,
    correction:record.correction,
    reason:record.reason ?? null,
  });
  if (error) throw error;
  return {synced:true as const};
}

export async function syncServiceRecord(record:LocalServiceRecord) {
  const supabase=createSupabaseBrowserClient();
  if (!supabase) return {synced:false as const};
  const {data:{user}}=await supabase.auth.getUser();
  if (!user) return {synced:false as const};
  const motorcycleId=await getMotorcycle(user.id);
  if (!motorcycleId) return {synced:false as const};
  const taskId=await ensureTask(record.taskId);
  if (!taskId) throw new Error("Pekerjaan maintenance tidak ditemukan pada data sumber.");
  const {error}=await supabase.from("maintenance_records").insert({
    motorcycle_id:motorcycleId,
    task_id:taskId,
    service_date:record.date,
    kilometers:record.kilometers,
    work_description:record.description,
    work_type:record.workType,
    cost:record.cost ?? null,
    workshop:record.workshop ?? null,
    notes:record.notes ?? null,
  });
  if (error) throw error;
  return {synced:true as const};
}

export async function fetchProfileFromSupabase(): Promise<LocalMotorProfile | null> {
  const supabase=createSupabaseBrowserClient();
  if (!supabase) return null;
  const {data:{user}}=await supabase.auth.getUser();
  if (!user) return null;
  const {data,error}=await supabase
    .from("motorcycles")
    .select("brand,model,variant,production_year,plate_number,purchase_date,initial_usage_date,initial_kilometers,current_kilometers,manual_reference")
    .eq("user_id",user.id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    brand:data.brand,
    model:data.model,
    variant:data.variant ?? "",
    productionYear:data.production_year?.toString() ?? "",
    plateNumber:data.plate_number ?? "",
    purchaseDate:data.purchase_date ?? "",
    initialKilometers:data.initial_kilometers?.toString() ?? "",
    currentKilometers:data.current_kilometers?.toString() ?? "",
    initialUsageDate:data.initial_usage_date ?? "",
    manualReference:data.manual_reference ?? "docs/yamaha-maintenance-manual.pdf",
  };
}

export async function fetchOdometerRecordsFromSupabase(): Promise<LocalOdometerRecord[]> {
  const supabase=createSupabaseBrowserClient();
  if (!supabase) return [];
  const {data:{user}}=await supabase.auth.getUser();
  if (!user) return [];
  const motorcycleId=await getMotorcycle(user.id);
  if (!motorcycleId) return [];
  const {data,error}=await supabase
    .from("odometer_records")
    .select("id,previous_kilometers,kilometers,recorded_at,correction,reason")
    .eq("motorcycle_id",motorcycleId)
    .order("recorded_at",{ascending:false});
  if (error) throw error;
  return (data ?? []).map((record)=>({
    id:record.id,
    previousKilometers:record.previous_kilometers,
    kilometers:record.kilometers,
    recordedAt:record.recorded_at,
    correction:record.correction,
    reason:record.reason ?? undefined,
  }));
}

export async function fetchServiceRecordsFromSupabase(): Promise<LocalServiceRecord[]> {
  const supabase=createSupabaseBrowserClient();
  if (!supabase) return [];
  const {data:{user}}=await supabase.auth.getUser();
  if (!user) return [];
  const motorcycleId=await getMotorcycle(user.id);
  if (!motorcycleId) return [];
  const {data,error}=await supabase
    .from("maintenance_records")
    .select("id,service_date,kilometers,work_description,work_type,cost,workshop,notes,created_at,task_id")
    .eq("motorcycle_id",motorcycleId)
    .order("service_date",{ascending:false});
  if (error) throw error;
  return (data ?? []).map((record)=>({
    id:record.id,
    date:record.service_date,
    kilometers:record.kilometers,
    taskId:record.task_id,
    taskName:"Pekerjaan perawatan",
    workType:record.work_type,
    description:record.work_description,
    cost:record.cost ? Number(record.cost) : undefined,
    notes:record.notes ?? undefined,
    workshop:record.workshop ?? undefined,
    createdAt:record.created_at,
  }));
}
