/**
 * Calculation rules for construction project metrics
 */

export type ProjectHealth = 'on_track' | 'at_risk' | 'delayed' | 'ahead';

export interface ProgressStatus {
  health: ProjectHealth;
  deviation: number;
  label: string;
  badgeColor: string;
}

/**
 * Calculate progress deviation (Actual % - Planned %) and health status
 */
export function calculateProjectHealth(actualProgress: number, plannedProgress: number): ProgressStatus {
  const deviation = Math.round((actualProgress - plannedProgress) * 100) / 100;

  if (deviation >= 2) {
    return {
      health: 'ahead',
      deviation,
      label: `Lebih Cepat (+${deviation.toFixed(1).replace('.', ',')}%)`,
      badgeColor: 'emerald',
    };
  }

  if (deviation >= -3) {
    return {
      health: 'on_track',
      deviation,
      label: deviation === 0 ? 'Tepat Waktu (0,0%)' : `Sesuai Target (${deviation.toFixed(1).replace('.', ',')}%)`,
      badgeColor: 'sky',
    };
  }

  if (deviation >= -8) {
    return {
      health: 'at_risk',
      deviation,
      label: `Perlu Perhatian (${deviation.toFixed(1).replace('.', ',')}%)`,
      badgeColor: 'amber',
    };
  }

  return {
    health: 'delayed',
    deviation,
    label: `Kritis / Terlambat (${deviation.toFixed(1).replace('.', ',')}%)`,
    badgeColor: 'rose',
  };
}

/**
 * Calculate budget variance and remaining budget
 */
export function calculateBudgetMetrics(contractValue: number, realizedCost: number) {
  const remainingBudget = contractValue - realizedCost;
  const costPercentage = contractValue > 0 ? (realizedCost / contractValue) * 100 : 0;
  const isOverBudget = realizedCost > contractValue;

  return {
    remainingBudget,
    costPercentage: Math.round(costPercentage * 10) / 10,
    isOverBudget,
  };
}

/**
 * Calculate contract value with addendums/variation orders (VO)
 */
export function calculateTotalContractWithAddendums(baseContract: number, addendums: { amount: number }[]): number {
  const addendumTotal = addendums.reduce((sum, item) => sum + (item.amount || 0), 0);
  return baseContract + addendumTotal;
}

/**
 * Calculate retention amount (default usually 5%)
 */
export function calculateRetention(contractValue: number, retentionPercent: number = 5): number {
  return Math.round(contractValue * (retentionPercent / 100));
}
