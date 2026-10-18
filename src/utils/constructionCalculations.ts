/**
 * Construction engineering calculations for BOQ, AHSP, and S-Curve
 */

export interface BOQCalculationItem {
  volume: number;
  unitPrice: number;
}

/**
 * Calculate item total price = volume * unit price
 */
export function calculateItemTotal(volume: number, unitPrice: number): number {
  if (volume < 0 || unitPrice < 0 || isNaN(volume) || isNaN(unitPrice)) return 0;
  return Math.round(volume * unitPrice);
}

/**
 * Calculate BOQ item weight (%) based on total project value
 * Formula: (item_total / total_project_value) * 100
 */
export function calculateItemWeight(itemTotal: number, totalProjectValue: number): number {
  if (!totalProjectValue || totalProjectValue <= 0 || !itemTotal || itemTotal <= 0) return 0;
  const weight = (itemTotal / totalProjectValue) * 100;
  return Math.round(weight * 1000) / 1000; // 3 decimal places
}

/**
 * Calculate earned value (Nilai Prestasi Pekerjaan) from installed progress percentage
 */
export function calculateEarnedValue(contractValue: number, progressPercent: number): number {
  if (!contractValue || contractValue <= 0 || !progressPercent || progressPercent <= 0) return 0;
  return Math.round(contractValue * (Math.min(progressPercent, 100) / 100));
}

/**
 * Calculate Total BOQ with Overhead/Profit and PPN
 * Default PPN in Indonesia is 11% (UU HPP)
 */
export function calculateBOQSummary(
  subtotalDirectCost: number,
  overheadProfitPercent: number = 10,
  ppnPercent: number = 11
) {
  const directCost = Math.max(0, subtotalDirectCost);
  const overheadProfitAmount = Math.round(directCost * (overheadProfitPercent / 100));
  const costBeforeTax = directCost + overheadProfitAmount;
  const ppnAmount = Math.round(costBeforeTax * (ppnPercent / 100));
  const grandTotal = costBeforeTax + ppnAmount;

  return {
    directCost,
    overheadProfitAmount,
    costBeforeTax,
    ppnAmount,
    grandTotal,
  };
}

/**
 * Calculate S-Curve cumulative values and schedule variance
 */
export interface WeeklyProgressPoint {
  week: number;
  label: string;
  plannedCumulative: number;
  actualCumulative?: number | null;
}

export function calculateSCurveDeviations(points: WeeklyProgressPoint[]) {
  return points.map((p) => {
    const hasActual = p.actualCumulative !== undefined && p.actualCumulative !== null;
    const deviation = hasActual ? Math.round(((p.actualCumulative ?? 0) - p.plannedCumulative) * 100) / 100 : null;
    let status: 'ahead' | 'on_track' | 'delayed' | 'pending' = 'pending';

    if (hasActual) {
      if (deviation! >= 1.5) status = 'ahead';
      else if (deviation! >= -3.0) status = 'on_track';
      else status = 'delayed';
    }

    return {
      ...p,
      deviation,
      status,
    };
  });
}
