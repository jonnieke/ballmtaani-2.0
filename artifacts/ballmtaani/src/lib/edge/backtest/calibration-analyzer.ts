/**
 * BallMtaani Edge Phase 4 — Calibration Analyzer & Reliability Curves
 * Divides predictions into 10 probability buckets, calculates ECE and MCE metrics.
 */

export interface CalibrationBucketResult {
  bucketIndex: number;
  bucketStart: number;
  bucketEnd: number;
  avgPredictedProbability: number;
  actualFrequency: number;
  predictionCount: number;
  absoluteCalibrationError: number;
}

export interface CalibrationAnalysisResult {
  expectedCalibrationError: number; // ECE (0 to 1)
  maxCalibrationError: number; // MCE (0 to 1)
  buckets: CalibrationBucketResult[];
  sampleSize: number;
}

export function analyzeProbabilityCalibration(
  predictedProbs: number[],
  actualOutcomes: number[] // 1 for true, 0 for false
): CalibrationAnalysisResult {
  const n = predictedProbs.length;
  const numBuckets = 10;
  const bucketResults: CalibrationBucketResult[] = [];

  if (n === 0) {
    return {
      expectedCalibrationError: 0,
      maxCalibrationError: 0,
      buckets: [],
      sampleSize: 0,
    };
  }

  let totalWeightedError = 0;
  let maxError = 0;

  for (let b = 0; b < numBuckets; b++) {
    const start = b / numBuckets; // e.g. 0.10
    const end = (b + 1) / numBuckets; // e.g. 0.20

    let probSum = 0;
    let actualSum = 0;
    let count = 0;

    for (let i = 0; i < n; i++) {
      const p = predictedProbs[i];
      // Include boundary at 1.0 for the last bucket
      if (p >= start && (b === numBuckets - 1 ? p <= end : p < end)) {
        probSum += p;
        actualSum += actualOutcomes[i];
        count += 1;
      }
    }

    const avgProb = count > 0 ? probSum / count : (start + end) / 2;
    const actualFreq = count > 0 ? actualSum / count : 0;
    const absError = Math.abs(avgProb - actualFreq);

    if (count > 0) {
      totalWeightedError += (count / n) * absError;
      if (absError > maxError) maxError = absError;
    }

    bucketResults.push({
      bucketIndex: b + 1,
      bucketStart: start,
      bucketEnd: end,
      avgPredictedProbability: Math.round(avgProb * 10000) / 10000,
      actualFrequency: Math.round(actualFreq * 10000) / 10000,
      predictionCount: count,
      absoluteCalibrationError: Math.round(absError * 10000) / 10000,
    });
  }

  return {
    expectedCalibrationError: Math.round(totalWeightedError * 10000) / 10000,
    maxCalibrationError: Math.round(maxError * 10000) / 10000,
    buckets: bucketResults,
    sampleSize: n,
  };
}
