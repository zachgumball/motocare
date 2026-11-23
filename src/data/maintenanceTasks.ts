export type TableSource = "emissions" | "general";
export type TaskCategory =
  | "Mesin"
  | "Sistem bahan bakar"
  | "Sistem pengereman"
  | "Sistem CVT"
  | "Kelistrikan"
  | "Roda dan ban"
  | "Suspensi"
  | "Rangka dan kemudi"
  | "Pelumasan"
  | "Sistem emisi";
export type WorkType =
  | "Inspection"
  | "Replacement"
  | "Cleaning"
  | "Lubrication"
  | "Adjustment"
  | "Diagnosis";

export interface MaintenanceWork {
  type: WorkType;
  description: string;
  kilometerInterval?: number;
  monthInterval?: number;
  yearInterval?: number;
  scheduleKm?: number[];
  scheduleMonths?: number[];
  indicator?: "oil" | "belt";
  dealerRequired?: boolean;
  notes?: string;
}

export interface MaintenanceTask {
  id: string;
  number: number;
  source: TableSource;
  name: string;
  category: TaskCategory;
  dealerRequired: boolean;
  page: "8-2" | "8-3" | "8-4" | "8-5" | "8-6";
  annual: boolean;
  scheduleKm: number[];
  scheduleMonths: number[];
  works: MaintenanceWork[];
}

const standardSchedule = {
  km: [1000, 4000, 7000, 10000, 13000],
  months: [1, 4, 7, 10, 13],
};

export const maintenanceTasks: MaintenanceTask[] = [
  { id:"e1-fuel-line", number:1, source:"emissions", name:"Saluran bahan bakar", category:"Sistem bahan bakar", dealerRequired:true, page:"8-2", annual:true, scheduleKm:[4000,7000,10000,13000], scheduleMonths:[4,7,10,13], works:[{type:"Inspection",description:"Inspeksi jalur bahan bakar untuk menemukan keretakan atau kerusakan.",dealerRequired:true}] },
  { id:"e2-fuel-filter", number:2, source:"emissions", name:"Saringan bahan bakar", category:"Sistem bahan bakar", dealerRequired:true, page:"8-2", annual:false, scheduleKm:[12000], scheduleMonths:[], works:[{type:"Inspection",description:"Nilai keadaan saringan bahan bakar.",dealerRequired:true},{type:"Replacement",description:"Lakukan penggantian bila diperlukan.",kilometerInterval:12000,notes:"Interval eksplisit 12.000 km."}] },
  { id:"e3-spark-plug", number:3, source:"emissions", name:"Busi", category:"Mesin", dealerRequired:false, page:"8-2", annual:false, scheduleKm:[4000,7000,10000,13000], scheduleMonths:[4,7,10,13], works:[{type:"Inspection",description:"Nilai keadaan busi."},{type:"Cleaning",description:"Bersihkan busi dan sesuaikan celah elektrodanya.",scheduleKm:[4000,7000,10000,13000]},{type:"Replacement",description:"Pasang busi pengganti.",kilometerInterval:8000}] },
  { id:"e4-valve", number:4, source:"emissions", name:"Klep", category:"Mesin", dealerRequired:true, page:"8-2", annual:false, scheduleKm:[4000,13000], scheduleMonths:[4,13], works:[{type:"Inspection",description:"Ukur celah klep.",dealerRequired:true},{type:"Adjustment",description:"Sesuaikan celah apabila hasil pemeriksaan memerlukannya.",dealerRequired:true}] },
  { id:"e5-fuel-injection", number:5, source:"emissions", name:"Fuel injection", category:"Sistem bahan bakar", dealerRequired:true, page:"8-2", annual:true, scheduleKm:[4000,7000,10000,13000], scheduleMonths:[4,7,10,13], works:[{type:"Inspection",description:"Ukur putaran idle mesin.",dealerRequired:true}] },
  { id:"e6-exhaust", number:6, source:"emissions", name:"Sistem pembuangan", category:"Sistem emisi", dealerRequired:true, page:"8-2", annual:true, scheduleKm:[4000,7000,10000,13000], scheduleMonths:[4,7,10,13], works:[{type:"Inspection",description:"Telusuri kemungkinan kebocoran pada sistem pembuangan.",dealerRequired:true},{type:"Replacement",description:"Pasang gasket pengganti bila diperlukan.",dealerRequired:true}] },
  { id:"g1-diagnostic", number:1, source:"general", name:"Pemeriksaan sistem diagnostik", category:"Mesin", dealerRequired:true, page:"8-3", annual:true, scheduleKm:standardSchedule.km, scheduleMonths:standardSchedule.months, works:[{type:"Diagnosis",description:"Jalankan pemeriksaan dinamis dengan perangkat diagnostik Yamaha.",dealerRequired:true},{type:"Inspection",description:"Baca kode gangguan yang tersimpan.",dealerRequired:true}] },
  { id:"g2-air-filter", number:2, source:"general", name:"Elemen saringan udara", category:"Mesin", dealerRequired:false, page:"8-3", annual:false, scheduleKm:[12000], scheduleMonths:[], works:[{type:"Replacement",description:"Pasang elemen filter udara pengganti.",kilometerInterval:12000}] },
  { id:"g3-air-hose", number:3, source:"general", name:"Selang pemeriksa saringan udara", category:"Sistem emisi", dealerRequired:false, page:"8-3", annual:true, scheduleKm:[4000,7000,10000,13000], scheduleMonths:[4,7,10,13], works:[{type:"Cleaning",description:"Bersihkan selang pemeriksaan filter udara."}] },
  { id:"g4-v-belt-filter", number:4, source:"general", name:"Elemen saringan udara wadah V-belt", category:"Sistem CVT", dealerRequired:true, page:"8-3", annual:false, scheduleKm:[4000,7000,10000,13000], scheduleMonths:[4,7,10,13], works:[{type:"Cleaning",description:"Bersihkan elemen filter ruang V-belt.",dealerRequired:true},{type:"Replacement",description:"Ganti elemen bila kondisinya memerlukan.",dealerRequired:true}] },
  { id:"g5-battery", number:5, source:"general", name:"Aki", category:"Kelistrikan", dealerRequired:true, page:"8-3", annual:true, scheduleKm:standardSchedule.km, scheduleMonths:standardSchedule.months, works:[{type:"Inspection",description:"Ukur tegangan aki.",dealerRequired:true},{type:"Adjustment",description:"Isi daya bila hasil pemeriksaan memerlukannya.",dealerRequired:true}] },
  { id:"g6-front-brake", number:6, source:"general", name:"Rem depan", category:"Sistem pengereman", dealerRequired:true, page:"8-3", annual:true, scheduleKm:standardSchedule.km, scheduleMonths:standardSchedule.months, works:[{type:"Inspection",description:"Uji fungsi rem, periksa level cairan, dan cari tanda kebocoran.",dealerRequired:true},{type:"Replacement",description:"Ganti kampas apabila batas pemakaian telah tercapai.",notes:"Dipicu oleh kondisi kampas, bukan interval tetap.",dealerRequired:true}] },
  { id:"g7-rear-brake", number:7, source:"general", name:"Rem belakang", category:"Sistem pengereman", dealerRequired:true, page:"8-3", annual:true, scheduleKm:standardSchedule.km, scheduleMonths:standardSchedule.months, works:[{type:"Inspection",description:"Uji kerja rem belakang, cek level cairan, dan cari kebocoran.",dealerRequired:true},{type:"Replacement",description:"Ganti kampas apabila batas pemakaian telah tercapai.",notes:"Dipicu oleh kondisi kampas, bukan interval tetap.",dealerRequired:true}] },
  { id:"g8-brake-hose", number:8, source:"general", name:"Selang rem", category:"Sistem pengereman", dealerRequired:true, page:"8-4", annual:true, scheduleKm:[4000,7000,10000,13000], scheduleMonths:[4,7,10,13], works:[{type:"Inspection",description:"Amati keadaan selang, penahan, dan jalur pemasangannya.",dealerRequired:true},{type:"Replacement",description:"Ganti selang rem pada interval empat tahun.",yearInterval:4,dealerRequired:true}] },
  { id:"g9-brake-fluid", number:9, source:"general", name:"Minyak rem", category:"Sistem pengereman", dealerRequired:true, page:"8-4", annual:false, scheduleKm:[], scheduleMonths:[], works:[{type:"Replacement",description:"Perbarui minyak rem.",yearInterval:2,dealerRequired:true}] },
  { id:"g10-wheels", number:10, source:"general", name:"Roda", category:"Roda dan ban", dealerRequired:true, page:"8-4", annual:true, scheduleKm:[4000,7000,10000,13000], scheduleMonths:[4,7,10,13], works:[{type:"Inspection",description:"Periksa roda untuk perubahan bentuk atau kerusakan.",dealerRequired:true}] },
  { id:"g11-tires", number:11, source:"general", name:"Ban", category:"Roda dan ban", dealerRequired:true, page:"8-4", annual:true, scheduleKm:[1000,4000,7000,10000,13000], scheduleMonths:[1,4,7,10,13], works:[{type:"Inspection",description:"Nilai kedalaman tapak dan keadaan ban.",dealerRequired:true},{type:"Replacement",description:"Ganti ban bila hasil pemeriksaan mengharuskannya.",dealerRequired:true},{type:"Adjustment",description:"Ukur tekanan ban dan sesuaikan bila perlu.",dealerRequired:true}] },
  { id:"g12-wheel-bearings", number:12, source:"general", name:"Bearing roda", category:"Roda dan ban", dealerRequired:true, page:"8-4", annual:false, scheduleKm:[4000,7000,10000,13000], scheduleMonths:[4,7,10,13], works:[{type:"Inspection",description:"Periksa bearing untuk kelonggaran maupun kerusakan.",dealerRequired:true}] },
  { id:"g13-steering-bearing", number:13, source:"general", name:"Bearing kemudi", category:"Rangka dan kemudi", dealerRequired:true, page:"8-4", annual:true, scheduleKm:[1000,4000,7000,10000,13000], scheduleMonths:[1,4,7,10,13], works:[{type:"Inspection",description:"Periksa kelancaran gerak dan rasa kasar pada kemudi.",dealerRequired:true},{type:"Lubrication",description:"Aplikasikan grease berbasis sabun litium.",kilometerInterval:24000,dealerRequired:true}] },
  { id:"g14-fasteners", number:14, source:"general", name:"Part pengunci rangka", category:"Rangka dan kemudi", dealerRequired:true, page:"8-4", annual:true, scheduleKm:standardSchedule.km, scheduleMonths:standardSchedule.months, works:[{type:"Inspection",description:"Periksa kelengkapan dan kekencangan pengikat rangka.",dealerRequired:true}] },
  { id:"g15-front-lever-hinge", number:15, source:"general", name:"Engsel tuas rem depan", category:"Sistem pengereman", dealerRequired:false, page:"8-4", annual:true, scheduleKm:[4000,7000,10000,13000], scheduleMonths:[4,7,10,13], works:[{type:"Lubrication",description:"Oleskan grease silikon pada engsel tuas depan."}] },
  { id:"g16-rear-lever-hinge", number:16, source:"general", name:"Engsel tuas rem belakang", category:"Sistem pengereman", dealerRequired:false, page:"8-4", annual:true, scheduleKm:[4000,7000,10000,13000], scheduleMonths:[4,7,10,13], works:[{type:"Lubrication",description:"Oleskan grease silikon pada engsel tuas belakang."}] },
  { id:"g17-side-center-stand", number:17, source:"general", name:"Standar samping dan standar tengah", category:"Rangka dan kemudi", dealerRequired:false, page:"8-5", annual:true, scheduleKm:[4000,7000,10000,13000], scheduleMonths:[4,7,10,13], works:[{type:"Inspection",description:"Uji fungsi standar samping dan tengah."},{type:"Lubrication",description:"Gunakan grease berbasis sabun litium pada titik pelumasan."}] },
  { id:"g18-sidestand-switch", number:18, source:"general", name:"Sidestand switch", category:"Kelistrikan", dealerRequired:true, page:"8-5", annual:true, scheduleKm:standardSchedule.km, scheduleMonths:standardSchedule.months, works:[{type:"Inspection",description:"Uji respons sakelar standar samping.",dealerRequired:true}] },
  { id:"g19-front-fork", number:19, source:"general", name:"Front fork", category:"Suspensi", dealerRequired:true, page:"8-5", annual:false, scheduleKm:[4000,7000,10000,13000], scheduleMonths:[4,7,10,13], works:[{type:"Inspection",description:"Amati kerja fork dan tanda kebocoran oli.",dealerRequired:true}] },
  { id:"g20-shock", number:20, source:"general", name:"Unit shock absorber", category:"Suspensi", dealerRequired:true, page:"8-5", annual:false, scheduleKm:[4000,7000,10000,13000], scheduleMonths:[4,7,10,13], works:[{type:"Inspection",description:"Nilai kerja shock absorber dan cari jejak oli.",dealerRequired:true}] },
  { id:"g21-engine-oil", number:21, source:"general", name:"Oli mesin", category:"Pelumasan", dealerRequired:false, page:"8-5", annual:false, scheduleKm:[3000], scheduleMonths:[], works:[{type:"Inspection",description:"Cek tinggi oli dan amati kebocoran.",kilometerInterval:3000,notes:"Angka 3.000 km mengatur pemeriksaan, bukan penggantian oli."},{type:"Replacement",description:"Ganti oli saat indikator penggantian aktif.",indicator:"oil",notes:"Penggantian dipicu indikator kendaraan."}] },
  { id:"g22-oil-screen", number:22, source:"general", name:"Kawat saringan oli mesin", category:"Pelumasan", dealerRequired:true, page:"8-5", annual:false, scheduleKm:[1000,4000,7000,10000,13000], scheduleMonths:[1,4,7,10,13], works:[{type:"Cleaning",description:"Bersihkan saringan oli mesin.",dealerRequired:true}] },
  { id:"g23-cooling", number:23, source:"general", name:"Sistem pendinginan", category:"Mesin", dealerRequired:false, page:"8-5", annual:true, scheduleKm:[4000,7000,10000,13000], scheduleMonths:[4,7,10,13], works:[{type:"Inspection",description:"Cek level cairan pendingin dan tanda kebocoran.",dealerRequired:false},{type:"Replacement",description:"Ganti cairan pendingin.",kilometerInterval:12000}] },
  { id:"g24-final-gear-oil", number:24, source:"general", name:"Oli transmisi akhir", category:"Pelumasan", dealerRequired:false, page:"8-5", annual:false, scheduleKm:[1000,12000], scheduleMonths:[], works:[{type:"Inspection",description:"Periksa area transmisi akhir untuk kebocoran.",scheduleKm:[4000,7000,10000,13000],scheduleMonths:[4,7,10,13]},{type:"Replacement",description:"Mulai penggantian pada 1.000 km, kemudian gunakan interval 12.000 km.",kilometerInterval:12000,notes:"Penggantian awal dilakukan pada 1.000 km."}] },
  { id:"g25-v-belt", number:25, source:"general", name:"V-belt", category:"Sistem CVT", dealerRequired:true, page:"8-5", annual:false, scheduleKm:[7000,10000,13000,25000], scheduleMonths:[7,10,13], works:[{type:"Inspection",description:"Periksa V-belt untuk keausan dan kerusakan.",dealerRequired:true},{type:"Replacement",description:"Ganti ketika indikator V-belt menyala.",indicator:"belt",kilometerInterval:25000,notes:"Nilai 25.000 km tercantum dalam jadwal; indikator juga menjadi pemicu.",dealerRequired:true}] },
  { id:"g26-secondary-sheave", number:26, source:"general", name:"Sheave sekunder V-belt", category:"Sistem CVT", dealerRequired:true, page:"8-6", annual:false, scheduleKm:[12000], scheduleMonths:[], works:[{type:"Lubrication",description:"Lumasi sheave sekunder pada interval 12.000 km.",kilometerInterval:12000,notes:"Pelumasan setiap 12.000 km.",dealerRequired:true}] },
  { id:"g27-brake-switches", number:27, source:"general", name:"Sakelar rem depan dan belakang", category:"Sistem pengereman", dealerRequired:true, page:"8-6", annual:true, scheduleKm:standardSchedule.km, scheduleMonths:standardSchedule.months, works:[{type:"Inspection",description:"Uji respons sakelar rem.",dealerRequired:true}] },
  { id:"g28-moving-cables", number:28, source:"general", name:"Komponen yang bergerak dan kabel-kabel", category:"Rangka dan kemudi", dealerRequired:false, page:"8-6", annual:true, scheduleKm:[4000,7000,10000,13000], scheduleMonths:[4,7,10,13], works:[{type:"Lubrication",description:"Lumasi bagian yang bergerak beserta kabel terkait."}] },
  { id:"g29-throttle-grip", number:29, source:"general", name:"Grip gas", category:"Kelistrikan", dealerRequired:true, page:"8-6", annual:true, scheduleKm:[4000,7000,10000,13000], scheduleMonths:[4,7,10,13], works:[{type:"Inspection",description:"Uji kerja grip dan gerak bebasnya.",dealerRequired:true},{type:"Adjustment",description:"Atur gerak bebas bila hasil pengecekan memerlukannya.",dealerRequired:true},{type:"Lubrication",description:"Lumasi rumah grip dan kabel gas.",dealerRequired:true}] },
  { id:"g30-lights", number:30, source:"general", name:"Lampu, sinyal, dan sakelar", category:"Kelistrikan", dealerRequired:true, page:"8-6", annual:true, scheduleKm:standardSchedule.km, scheduleMonths:standardSchedule.months, works:[{type:"Inspection",description:"Uji fungsi lampu, sinyal, dan sakelar.",dealerRequired:true},{type:"Adjustment",description:"Atur arah sorot lampu depan bila diperlukan.",dealerRequired:true}] },
];
