export type MaintenanceStatus = "Normal" | "Upcoming" | "Due" | "Overdue" | "Completed" | "Needs Attention";

export interface ScheduleRule {
  kilometerInterval?: number;
  monthInterval?: number;
  yearInterval?: number;
  fixedKilometers?: number[];
  indicator?: "oil" | "belt";
  firstAtKilometer?: number;
  repeatAfterKilometer?: number;
  annual?: boolean;
  dealerRequired?: boolean;
}

export interface ScheduleResult {
  nextKilometer?: number;
  nextDate?: string;
  reason: string;
  status: MaintenanceStatus;
  daysUntil?: number;
  kilometersUntil?: number;
}

export function addMonths(date: Date, months: number): Date {
  const result = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = result.getUTCDate();
  result.setUTCMonth(result.getUTCMonth() + months);
  if (result.getUTCDate() !== day) result.setUTCDate(0);
  return result;
}

export function calculateDue(
  rule: ScheduleRule,
  currentKilometers: number,
  lastKilometers: number | undefined,
  lastDate: Date | undefined,
  referenceDate = new Date(),
  upcomingKmThreshold = 500,
  upcomingDaysThreshold = 30,
  indicatorActive = false,
): ScheduleResult {
  if (indicatorActive) {
    return { status:"Due", reason:`Indikator ${rule.indicator === "oil" ? "penggantian oli" : "penggantian V-belt"} menyala.`, kilometersUntil:0 };
  }

  let nextKm: number | undefined;
  if (rule.kilometerInterval) {
    const base = lastKilometers ?? rule.firstAtKilometer ?? 0;
    nextKm = base + rule.kilometerInterval;
  } else if (rule.fixedKilometers?.length) {
    const baseKilometers = lastKilometers ?? 0;
    if (rule.repeatAfterKilometer && baseKilometers >= rule.repeatAfterKilometer) {
      const cycleLength = rule.repeatAfterKilometer;
      const cycle = Math.floor(baseKilometers / cycleLength);
      const candidates = rule.fixedKilometers.map((km) => cycle * cycleLength + km);
      nextKm = candidates.find((km) => km > currentKilometers);
    } else {
      nextKm = rule.fixedKilometers.find((km) => km > baseKilometers);
    }
  }

  let nextDate: string | undefined;
  if (rule.monthInterval && lastDate) {
    nextDate = addMonths(lastDate, rule.monthInterval).toISOString().slice(0, 10);
  } else if (rule.yearInterval && lastDate) {
    nextDate = addMonths(lastDate, rule.yearInterval * 12).toISOString().slice(0, 10);
  }

  const kmUntil = nextKm === undefined ? undefined : nextKm - currentKilometers;
  const dateUntil = nextDate
    ? Math.ceil(
        (new Date(`${nextDate}T00:00:00Z`).getTime()
          - Date.UTC(referenceDate.getUTCFullYear(), referenceDate.getUTCMonth(), referenceDate.getUTCDate()))
        / 86400000,
      )
    : undefined;

  const kmOverdue = kmUntil !== undefined && kmUntil < 0;
  const dateOverdue = dateUntil !== undefined && dateUntil < 0;
  const kmReached = kmUntil !== undefined && kmUntil <= 0;
  const dateReached = dateUntil !== undefined && dateUntil <= 0;

  if (kmOverdue || dateOverdue) {
    return {
      nextKilometer:nextKm,
      nextDate,
      status:"Overdue",
      reason: kmOverdue && dateOverdue
        ? "Jadwal kilometer dan waktu telah dilewati."
        : kmOverdue
          ? "Jadwal kilometer telah dilewati."
          : "Jadwal waktu telah dilewati.",
      kilometersUntil:kmUntil,
      daysUntil:dateUntil,
    };
  }

  if (kmReached || dateReached) {
    return { nextKilometer:nextKm,nextDate,status:"Due",reason:"Salah satu pemicu jadwal sudah tercapai.",kilometersUntil:kmUntil,daysUntil:dateUntil };
  }

  const kmUpcoming = kmUntil !== undefined && kmUntil <= upcomingKmThreshold;
  const dateUpcoming = dateUntil !== undefined && dateUntil <= upcomingDaysThreshold;

  if (kmUpcoming || dateUpcoming) {
    return {nextKilometer:nextKm,nextDate,status:"Upcoming",reason:kmUpcoming?"Mendekati batas kilometer.":"Mendekati tanggal jadwal.",kilometersUntil:kmUntil,daysUntil:dateUntil};
  }

  return {nextKilometer:nextKm,nextDate,status:"Normal",reason:"Belum mendekati jadwal.",kilometersUntil:kmUntil,daysUntil:dateUntil};
}
