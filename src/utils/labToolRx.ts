import type { ItemBaseType } from "@/types/ItemBaseType";
import type { LabToolType } from "@/types/LabToolType";

/**
 * Frontend mirror of backend lab-tool Rx + ItemBase math (integration guide §4.4).
 * Stock/blank add uses ItemBase.addPower only; patient ADD (addRight/addLeft) is separate.
 */

export interface OrderRxRowForLabTools {
  sphereRight?: number;
  sphereLeft?: number;
  cylinderRight?: number;
  cylinderLeft?: number;
  quantity?: string | number;
  quantityRight?: number;
  quantityLeft?: number;
}

/** Sphere magnitude on supplier tool scale. */
export function sphereToolMagnitude(sphere: number): number {
  const m = Math.abs(sphere);
  if (Number.isInteger(m) && m >= 0 && m <= 4000) {
    return m;
  }
  return Math.round(m * 100);
}

/** Cylinder magnitude on supplier tool scale. */
export function cylinderToolMagnitude(cyl: number): number {
  const m = Math.abs(cyl);
  if (Number.isInteger(m) && m >= 25 && m % 25 === 0) {
    return m;
  }
  return Math.round(m * 100);
}

function effectiveEyeQuantities(row: OrderRxRowForLabTools): { qr: number; ql: number } {
  const r = row.quantityRight;
  const l = row.quantityLeft;
  if (
    typeof r === "number" &&
    !Number.isNaN(r) &&
    typeof l === "number" &&
    !Number.isNaN(l)
  ) {
    return { qr: Math.max(0, r), ql: Math.max(0, l) };
  }
  const legacy = Number(row.quantity ?? 0);
  const q = Number.isFinite(legacy) && legacy > 0 ? legacy : 0;
  return { qr: q, ql: 0 };
}

function sphToolFromBase(baseTool: number, sphere: number): number {
  const sphMag = sphereToolMagnitude(sphere);
  if (sphere < 0) return baseTool + sphMag;
  if (sphere > 0) return baseTool - sphMag;
  return baseTool;
}

/**
 * Integer tool values to check against lab-tools inventory (per eye).
 * Skips an eye when its effective quantity is 0.
 */
export function computeOrderItemLabToolValues(
  row: OrderRxRowForLabTools,
  base: ItemBaseType | undefined,
): { right: number[]; left: number[] } {
  const empty = { right: [] as number[], left: [] as number[] };
  if (!base) return empty;

  const baseCodeNum = Number(base.baseCode);
  if (!Number.isFinite(baseCodeNum)) return empty;

  const addTool =
    typeof base.addPower === "number" && !Number.isNaN(base.addPower)
      ? Math.round(base.addPower * 10)
      : 0;
  const baseTool = baseCodeNum + addTool;

  const { qr, ql } = effectiveEyeQuantities(row);
  const right: number[] = [];
  const left: number[] = [];

  if (qr > 0 && typeof row.sphereRight === "number" && !Number.isNaN(row.sphereRight)) {
    const sphTool = sphToolFromBase(baseTool, row.sphereRight);
    right.push(sphTool);
    if (typeof row.cylinderRight === "number" && !Number.isNaN(row.cylinderRight)) {
      const cylMag = cylinderToolMagnitude(row.cylinderRight);
      if (cylMag !== 0) {
        right.push(sphTool + cylMag);
      }
    }
  }

  if (ql > 0 && typeof row.sphereLeft === "number" && !Number.isNaN(row.sphereLeft)) {
    const sphTool = sphToolFromBase(baseTool, row.sphereLeft);
    left.push(sphTool);
    if (typeof row.cylinderLeft === "number" && !Number.isNaN(row.cylinderLeft)) {
      const cylMag = cylinderToolMagnitude(row.cylinderLeft);
      if (cylMag !== 0) {
        left.push(sphTool + cylMag);
      }
    }
  }

  return { right, left };
}

export function findMissingLabToolValues(
  toolValues: number[],
  labTools: LabToolType[],
): number[] {
  const missing: number[] = [];
  toolValues.forEach((val) => {
    const hasTool = labTools.some(
      (tool) =>
        typeof tool.baseCurveMin === "number" &&
        typeof tool.baseCurveMax === "number" &&
        typeof tool.quantity === "number" &&
        val >= tool.baseCurveMin &&
        val <= tool.baseCurveMax &&
        tool.quantity > 0,
    );
    if (!hasTool) missing.push(val);
  });
  return Array.from(new Set(missing));
}
