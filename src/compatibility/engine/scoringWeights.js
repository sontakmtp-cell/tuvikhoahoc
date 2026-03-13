const LEVELS = [
  { min: 85, level: 'Thiên Tác Chi Hợp', emoji: '🌟', color: '#FFD700' },
  { min: 70, level: 'Rất Tương Hợp', emoji: '💚', color: '#4CAF50' },
  { min: 55, level: 'Tương Đối Hợp', emoji: '💛', color: '#FF9800' },
  { min: 40, level: 'Bình Thường', emoji: '⚖️', color: '#9E9E9E' },
  { min: 25, level: 'Có Xung Khắc', emoji: '⚠️', color: '#FF5722' },
  { min: 0, level: 'Xung Khắc Nặng', emoji: '💔', color: '#F44336' },
];

export const MODE_SCORING_WEIGHTS = {
  romance: {
    elementFactor: 2,
    starFactor: 1.5,
    crossFactor: 0.5,
  },
  business: {
    elementFactor: 2.2,
    starFactor: 1.3,
    crossFactor: 0.6,
  },
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function toPercentage(rawScore) {
  return Math.round(((rawScore + 10) / 20) * 100);
}

export function classifyPercentage(percentage) {
  const matched = LEVELS.find((item) => percentage >= item.min) || LEVELS[LEVELS.length - 1];
  return {
    level: matched.level,
    emoji: matched.emoji,
    color: matched.color,
  };
}

export function computePairScore(elementResult, starResult, crossResult, mode = 'romance') {
  const modeWeights = MODE_SCORING_WEIGHTS[mode] || MODE_SCORING_WEIGHTS.romance;

  const raw = (elementResult.score * modeWeights.elementFactor)
    + (starResult.score * modeWeights.starFactor)
    + (crossResult.score * modeWeights.crossFactor);

  return clamp(raw, -10, 10);
}

export function computeOverallScore(results) {
  if (!Array.isArray(results) || results.length === 0) {
    return {
      rawScore: 0,
      percentage: 50,
      level: 'Bình Thường',
      emoji: '⚖️',
      color: '#9E9E9E',
      totalWeight: 0,
      weightedSum: 0,
    };
  }

  const totalWeight = results.reduce((sum, item) => sum + (item.weight || 0), 0);
  const safeWeight = totalWeight || 1;
  const weightedSum = results.reduce((sum, item) => sum + (item.weightedScore || 0), 0);
  const rawScore = weightedSum / safeWeight;
  const percentage = toPercentage(rawScore);
  const classification = classifyPercentage(percentage);

  return {
    rawScore,
    percentage,
    totalWeight,
    weightedSum,
    ...classification,
  };
}

