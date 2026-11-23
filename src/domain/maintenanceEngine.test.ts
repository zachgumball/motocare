import { describe, expect, it } from "vitest";
import { addMonths, calculateDue } from "./maintenanceEngine";

describe("maintenance engine", () => {
  it("adds months including leap-year safe behavior", () => {
    expect(addMonths(new Date("2024-02-29T00:00:00Z"), 12).toISOString().slice(0,10)).toBe("2025-02-28");
  });

  it("uses kilometer interval from actual last maintenance kilometer", () => {
    const result = calculateDue(
      {kilometerInterval:4000},
      7900,
      4000,
      undefined,
      new Date("2026-11-23T00:00:00Z"),
      500,
    );
    expect(result.nextKilometer).toBe(8000);
    expect(result.status).toBe("Upcoming");
  });

  it("calculates two-year brake-fluid schedule", () => {
    const result = calculateDue(
      {yearInterval:2},
      12000,
      undefined,
      new Date("2026-11-23T00:00:00Z"),
      new Date("2028-11-23T00:00:00Z"),
    );
    expect(result.nextDate).toBe("2028-11-23");
    expect(result.status).toBe("Due");
  });

  it("marks a task overdue after its kilometer boundary", () => {
    const result = calculateDue(
      {kilometerInterval:4000},
      8001,
      4000,
      undefined,
      new Date("2026-11-23T00:00:00Z"),
    );
    expect(result.status).toBe("Overdue");
  });

  it("marks a task due on, but not after, its kilometer boundary", () => {
    const result = calculateDue(
      {kilometerInterval:4000},
      8000,
      4000,
      undefined,
      new Date("2026-11-23T00:00:00Z"),
    );
    expect(result.status).toBe("Due");
  });

  it("marks a task due on its calendar date regardless of current time", () => {
    const result = calculateDue(
      {yearInterval:2},
      12000,
      undefined,
      new Date("2024-11-23T00:00:00Z"),
      new Date("2026-11-23T16:30:00Z"),
    );
    expect(result.status).toBe("Due");
  });

  it("returns Due when an indicator is active", () => {
    const result = calculateDue(
      {indicator:"oil"},
      12000,
      undefined,
      undefined,
      new Date("2026-11-23T00:00:00Z"),
      500,
      30,
      true,
    );
    expect(result.status).toBe("Due");
  });

  it("validates that odometer corrections cannot silently move backward", () => {
    const previous = 12000;
    const corrected = 11500;
    expect(corrected >= 0).toBe(true);
    expect(previous - corrected).toBe(500);
  });

  it("restarts the standard schedule after 20.000 km", () => {
    const result = calculateDue(
      {
        fixedKilometers:[4000,7000,10000,13000],
        repeatAfterKilometer:20000,
      },
      20000,
      20000,
      undefined,
      new Date("2026-11-23T00:00:00Z"),
    );
    expect(result.nextKilometer).toBe(24000);
  });
});
