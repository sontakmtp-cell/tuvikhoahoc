import { findPalaceByName, normalizeChartPalaces } from '../../shared/palaceUtils.js';
import { getStarInfo } from '../data/starCatalog.js';
import { getElementRelation } from './elementRelations.js';
import { generateInterpretation, generateOverallSummary } from './interpretationRules.js';
import { getModeMapping } from './palaceMapping.js';
import { computeOverallScore, computePairScore } from './scoringWeights.js';
import { analyzeStars } from './starCompatibility.js';

const compatibilityCache = new Map();

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function toSafePalace(palaceName) {
  return {
    id: null,
    name: palaceName,
    element: '',
    stars: [],
  };
}

function resolvePalace(chart, palaceName) {
  const palace = findPalaceByName(chart, palaceName);
  if (!palace) {
    return { palace: toSafePalace(palaceName), missing: true };
  }
  return { palace, missing: false };
}

function analyzeElements(palaceA, palaceB) {
  return getElementRelation(palaceA.element, palaceB.element);
}

export function analyzeCrossInteraction(palaceA, palaceB) {
  let score = 0;
  const details = [];

  const applyDirectionalCheck = (stars, targetElement, directionLabel) => {
    if (!targetElement) return;

    for (const starName of stars) {
      const star = getStarInfo(starName);
      if (!star.element) continue;

      const relation = getElementRelation(star.element, targetElement);
      if (relation.type === 'sinh') {
        score += 0.25;
        details.push(`${directionLabel}: ${star.name}(${star.element}) sinh ${targetElement}`);
      } else if (relation.type === 'khac') {
        score -= 0.25;
        details.push(`${directionLabel}: ${star.name}(${star.element}) khắc ${targetElement}`);
      }
    }
  };

  applyDirectionalCheck(palaceA.stars || [], palaceB.element, 'A→B');
  applyDirectionalCheck(palaceB.stars || [], palaceA.element, 'B→A');

  return {
    score: clamp(score, -3, 3),
    interactions: details.length,
    details: details.slice(0, 12),
  };
}

function buildChartSignature(normalizedChart) {
  return normalizedChart.map((palace) => (
    `${palace.name}:${palace.element}:${(palace.stars || []).join('|')}`
  )).join(';');
}

function createComparisonError(comp, error) {
  return {
    comparisonId: comp.id,
    category: comp.category,
    description: comp.description,
    weight: comp.weight,
    palaceA: {
      name: comp.palaceA,
      element: '',
      stars: [],
    },
    palaceB: {
      name: comp.palaceB,
      element: '',
      stars: [],
    },
    elementResult: {
      type: 'unknown',
      score: 0,
      direction: null,
      label: 'Không thể phân tích hành ở cặp cung này',
      elementA: '',
      elementB: '',
    },
    starResult: {
      totalA: 0,
      totalB: 0,
      catA: 0,
      catB: 0,
      hungA: 0,
      hungB: 0,
      commonStars: [],
      specialPairs: [],
      score: 0,
    },
    crossResult: {
      score: 0,
      interactions: 0,
      details: [],
    },
    pairScore: 0,
    weightedScore: 0,
    interpretation: `Không thể luận giải do lỗi dữ liệu: ${error.message || 'Lỗi không xác định'}.`,
    issues: ['Lỗi xử lý cặp cung'],
  };
}

function calculateCompatibilityNormalized(normalizedA, normalizedB, mode = 'romance') {
  const warnings = [];
  const mapping = getModeMapping(mode);
  const comparisons = [];

  for (const comp of mapping.comparisons) {
    try {
      const resolvedA = resolvePalace(normalizedA, comp.palaceA);
      const resolvedB = resolvePalace(normalizedB, comp.palaceB);
      const palaceA = resolvedA.palace;
      const palaceB = resolvedB.palace;
      const issues = [];

      if (resolvedA.missing) {
        issues.push(`Thiếu cung "${comp.palaceA}" ở lá số A`);
      }
      if (resolvedB.missing) {
        issues.push(`Thiếu cung "${comp.palaceB}" ở lá số B`);
      }
      if (!Array.isArray(palaceA.stars) || palaceA.stars.length === 0) {
        issues.push(`Cung "${palaceA.name}" phía A chưa có sao`);
      }
      if (!Array.isArray(palaceB.stars) || palaceB.stars.length === 0) {
        issues.push(`Cung "${palaceB.name}" phía B chưa có sao`);
      }

      const elementResult = analyzeElements(palaceA, palaceB);
      if (elementResult.type === 'unknown') {
        issues.push(`Không nhận dạng được hành của cặp "${comp.palaceA} ↔ ${comp.palaceB}"`);
      }

      const starResult = analyzeStars(palaceA.stars, palaceB.stars);
      const crossResult = analyzeCrossInteraction(palaceA, palaceB);
      const pairScore = computePairScore(elementResult, starResult, crossResult, mapping.id);
      const interpretation = generateInterpretation(
        comp,
        elementResult,
        starResult,
        crossResult,
        pairScore,
        mapping.id,
      );

      const resultItem = {
        comparisonId: comp.id,
        category: comp.category,
        description: comp.description,
        weight: comp.weight,
        palaceA: {
          name: palaceA.name,
          element: palaceA.element,
          stars: palaceA.stars,
        },
        palaceB: {
          name: palaceB.name,
          element: palaceB.element,
          stars: palaceB.stars,
        },
        elementResult,
        starResult,
        crossResult,
        pairScore,
        weightedScore: pairScore * comp.weight,
        interpretation,
        issues,
      };
      comparisons.push(resultItem);

      issues.forEach((issue) => {
        warnings.push(`[${comp.id}] ${issue}`);
      });
    } catch (error) {
      warnings.push(`[${comp.id}] Lỗi xử lý: ${error.message || 'Không xác định'}`);
      comparisons.push(createComparisonError(comp, error));
    }
  }

  const overall = computeOverallScore(comparisons.filter((item) => Number.isFinite(item.weightedScore)));
  const summary = generateOverallSummary(overall, comparisons, mapping.id);
  const diagnostics = {
    warningsCount: warnings.length,
    comparisonsWithIssues: comparisons.filter((item) => (item.issues || []).length > 0).length,
    unknownElementComparisons: comparisons.filter((item) => item.elementResult?.type === 'unknown').length,
    emptyStarComparisons: comparisons.filter((item) => (
      (item.palaceA.stars || []).length === 0 || (item.palaceB.stars || []).length === 0
    )).length,
  };

  return {
    mode: mapping.id,
    modeLabel: mapping.label,
    comparisons,
    overall,
    summary,
    warnings,
    diagnostics,
    timestamp: new Date().toISOString(),
  };
}

export function clearCompatibilityCache() {
  compatibilityCache.clear();
}

export function calculateCompatibility(chartA, chartB, mode = 'romance') {
  if (!Array.isArray(chartA) || !Array.isArray(chartB)) {
    throw new Error('Input phải là 2 mảng dữ liệu lá số.');
  }
  const normalizedA = normalizeChartPalaces(chartA);
  const normalizedB = normalizeChartPalaces(chartB);
  return calculateCompatibilityNormalized(normalizedA, normalizedB, mode);
}

export function calculateCompatibilityMemoized(chartA, chartB, mode = 'romance') {
  if (!Array.isArray(chartA) || !Array.isArray(chartB)) {
    throw new Error('Input phải là 2 mảng dữ liệu lá số.');
  }

  const normalizedA = normalizeChartPalaces(chartA);
  const normalizedB = normalizeChartPalaces(chartB);
  const key = `${mode}::${buildChartSignature(normalizedA)}::${buildChartSignature(normalizedB)}`;

  if (compatibilityCache.has(key)) {
    return compatibilityCache.get(key);
  }

  const result = calculateCompatibilityNormalized(normalizedA, normalizedB, mode);
  compatibilityCache.set(key, result);
  return result;
}
