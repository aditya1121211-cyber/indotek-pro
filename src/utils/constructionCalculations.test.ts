import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateItemTotal,
  calculateItemWeight,
  calculateEarnedValue,
  calculateBOQSummary,
  calculateSCurveDeviations,
} from './constructionCalculations.ts';

test('calculateItemTotal calculates volume multiplied by unit price', () => {
  assert.equal(calculateItemTotal(150, 1200000), 180000000);
  assert.equal(calculateItemTotal(0, 500000), 0);
  assert.equal(calculateItemTotal(10, 0), 0);
});

test('calculateItemWeight determines accurate weight percentage', () => {
  // 100M out of 1000M is 10%
  const weight = calculateItemWeight(100000000, 1000000000);
  assert.equal(weight, 10);

  // 48.5M total, item 4.85M = 10%
  assert.equal(calculateItemWeight(4850000, 48500000), 10);
});

test('calculateEarnedValue computes progress payment value', () => {
  // 50% on 10M = 5M
  assert.equal(calculateEarnedValue(10000000, 50), 5000000);
  // Cap at 100%
  assert.equal(calculateEarnedValue(10000000, 120), 10000000);
});

test('calculateBOQSummary applies 10% overhead and 11% PPN properly', () => {
  const directCost = 100000000; // 100 Juta
  const summary = calculateBOQSummary(directCost, 10, 11);

  assert.equal(summary.directCost, 100000000);
  assert.equal(summary.overheadProfitAmount, 10000000); // 10 Juta
  assert.equal(summary.costBeforeTax, 110000000); // 110 Juta
  assert.equal(summary.ppnAmount, 12100000); // 11% of 110 Juta = 12.1 Juta
  assert.equal(summary.grandTotal, 122100000); // 122.1 Juta
});

test('calculateSCurveDeviations flags schedule status correctly', () => {
  const points = [
    { week: 1, label: 'W1', plannedCumulative: 5, actualCumulative: 6.8 }, // +1.8 ahead
    { week: 2, label: 'W2', plannedCumulative: 12, actualCumulative: 11.5 }, // -0.5 on track
    { week: 3, label: 'W3', plannedCumulative: 20, actualCumulative: 15.0 }, // -5.0 delayed
    { week: 4, label: 'W4', plannedCumulative: 30, actualCumulative: null }, // pending
  ];

  const evaluated = calculateSCurveDeviations(points);
  assert.equal(evaluated[0].status, 'ahead');
  assert.equal(evaluated[1].status, 'on_track');
  assert.equal(evaluated[2].status, 'delayed');
  assert.equal(evaluated[3].status, 'pending');
});
