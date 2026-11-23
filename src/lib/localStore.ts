export interface LocalServiceRecord {
  id: string;
  date: string;
  kilometers: number;
  taskId: string;
  taskName: string;
  workType: string;
  description: string;
  cost?: number;
  notes?: string;
  workshop?: string;
  createdAt: string;
}

export interface LocalOdometerRecord {
  id: string;
  previousKilometers: number;
  kilometers: number;
  recordedAt: string;
  correction: boolean;
  reason?: string;
}

export interface LocalMotorProfile {
  brand: string;
  model: string;
  variant: string;
  productionYear: string;
  plateNumber: string;
  purchaseDate: string;
  initialKilometers: string;
  currentKilometers: string;
  initialUsageDate: string;
  manualReference: string;
}

export const emptyProfile: LocalMotorProfile = {
  brand:"Yamaha",
  model:"",
  variant:"",
  productionYear:"",
  plateNumber:"",
  purchaseDate:"",
  initialKilometers:"",
  currentKilometers:"",
  initialUsageDate:"",
  manualReference:"docs/yamaha-maintenance-manual.pdf",
};

let activeUserId: string | null = null;

export function setActiveUserId(userId: string | null) {
  activeUserId = userId;
  if (typeof window !== "undefined") {
    if (userId) window.localStorage.setItem("motocare-active-user", userId);
    else window.localStorage.removeItem("motocare-active-user");
  }
}

export function getActiveUserId() {
  if (activeUserId) return activeUserId;
  if (typeof window !== "undefined") {
    activeUserId = window.localStorage.getItem("motocare-active-user");
  }
  return activeUserId;
}

function scopedKey(key: string) {
  const userId = getActiveUserId();
  return userId ? `${key}:${userId}` : key;
}

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const value = window.localStorage.getItem(scopedKey(key));
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(scopedKey(key), JSON.stringify(value));
}

export function getServiceRecords() {
  return read<LocalServiceRecord[]>("motocare-service-records", []);
}

export function addServiceRecord(record: LocalServiceRecord) {
  write("motocare-service-records", [record, ...getServiceRecords()]);
}

export function getOdometerRecords() {
  return read<LocalOdometerRecord[]>("motocare-odometer-records", []);
}

export function addOdometerRecord(record: LocalOdometerRecord) {
  write("motocare-odometer-records", [record, ...getOdometerRecords()]);
}

export function getProfile() {
  return read<LocalMotorProfile>("motocare-profile", emptyProfile);
}

export function saveProfile(profile: LocalMotorProfile) {
  write("motocare-profile", profile);
}
