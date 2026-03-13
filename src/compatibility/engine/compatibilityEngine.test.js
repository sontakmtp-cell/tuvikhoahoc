import assert from 'node:assert/strict';
import test from 'node:test';
import {
  calculateCompatibility,
  calculateCompatibilityMemoized,
  clearCompatibilityCache,
} from './compatibilityEngine.js';
import { getElementRelation } from './elementRelations.js';

const PALACE_ORDER = [
  'Mệnh',
  'Phụ Mẫu',
  'Phúc Đức',
  'Điền Trạch',
  'Quan Lộc',
  'Nô Bộc',
  'Thiên Di',
  'Tật Ách',
  'Tài Bạch',
  'Tử Tức',
  'Phu Thê',
  'Huynh Đệ',
];

function buildChart(overrides = {}) {
  return PALACE_ORDER.map((name, index) => {
    const custom = overrides[name] || {};
    return {
      id: index + 1,
      name,
      element: custom.element || 'Thổ',
      stars: custom.stars || [],
    };
  });
}

test('getElementRelation should identify sinh relation', () => {
  const relation = getElementRelation('Kim', 'Thủy');
  assert.equal(relation.type, 'sinh');
  assert.equal(relation.score, 2);
  assert.equal(relation.label, 'Kim sinh Thủy');
});

test('calculateCompatibility should return full structure for romance mode', () => {
  const chartA = buildChart({
    Mệnh: { element: 'Hỏa', stars: ['Thái Dương', 'Hóa Lộc', 'Tả Phụ'] },
    'Phu Thê': { element: 'Thổ', stars: ['Thái Âm', 'Văn Khúc', 'Hữu Bật'] },
    'Phúc Đức': { element: 'Mộc', stars: ['Thiên Lương', 'Thiên Việt'] },
    'Tử Tức': { element: 'Kim', stars: ['Thiên Đồng', 'Hóa Khoa'] },
    'Tài Bạch': { element: 'Thổ', stars: ['Vũ Khúc', 'Lộc Tồn'] },
    'Tật Ách': { element: 'Thủy', stars: ['Thiên Phủ'] },
  });
  const chartB = buildChart({
    Mệnh: { element: 'Thổ', stars: ['Thái Âm', 'Hóa Lộc', 'Hữu Bật'] },
    'Phu Thê': { element: 'Hỏa', stars: ['Thái Dương', 'Văn Xương', 'Tả Phụ'] },
    'Phúc Đức': { element: 'Mộc', stars: ['Thiên Cơ', 'Thiên Khôi'] },
    'Tử Tức': { element: 'Kim', stars: ['Thiên Đồng', 'Hóa Khoa'] },
    'Tài Bạch': { element: 'Thổ', stars: ['Vũ Khúc', 'Lộc Tồn'] },
    'Tật Ách': { element: 'Thủy', stars: ['Thiên Phủ'] },
  });

  const result = calculateCompatibility(chartA, chartB, 'romance');

  assert.equal(result.mode, 'romance');
  assert.equal(result.comparisons.length, 7);
  assert.equal(typeof result.timestamp, 'string');
  assert.ok(result.overall.percentage >= 0 && result.overall.percentage <= 100);
  assert.equal(typeof result.summary, 'string');
  assert.ok(result.summary.length > 40);
  assert.ok(result.comparisons.every((item) => typeof item.interpretation === 'string' && item.interpretation.length > 30));
});

test('engine should give high score for similar supportive charts', () => {
  const chartA = buildChart({
    Mệnh: { element: 'Thổ', stars: ['Tử Vi', 'Tả Phụ', 'Hóa Lộc'] },
    'Phu Thê': { element: 'Thổ', stars: ['Thiên Phủ', 'Văn Xương', 'Hóa Khoa'] },
    'Phúc Đức': { element: 'Thủy', stars: ['Thiên Lương', 'Thiên Việt'] },
    'Tử Tức': { element: 'Mộc', stars: ['Thiên Đồng', 'Thiên Phúc'] },
    'Tài Bạch': { element: 'Kim', stars: ['Vũ Khúc', 'Lộc Tồn'] },
    'Tật Ách': { element: 'Thủy', stars: ['Thiên Đồng', 'Thiên Thọ'] },
  });
  const chartB = buildChart({
    Mệnh: { element: 'Thổ', stars: ['Tử Vi', 'Hữu Bật', 'Hóa Lộc'] },
    'Phu Thê': { element: 'Thổ', stars: ['Thiên Phủ', 'Văn Khúc', 'Hóa Khoa'] },
    'Phúc Đức': { element: 'Thủy', stars: ['Thiên Cơ', 'Thiên Khôi'] },
    'Tử Tức': { element: 'Mộc', stars: ['Thiên Đồng', 'Thiên Phúc'] },
    'Tài Bạch': { element: 'Kim', stars: ['Vũ Khúc', 'Lộc Tồn'] },
    'Tật Ách': { element: 'Thủy', stars: ['Thiên Đồng', 'Thiên Thọ'] },
  });

  const result = calculateCompatibility(chartA, chartB, 'romance');
  assert.ok(result.overall.percentage >= 70);
});

test('engine should give low score for heavy conflict charts', () => {
  const chartA = buildChart({
    Mệnh: { element: 'Hỏa', stars: ['Kình Dương', 'Đà La', 'Hóa Kỵ'] },
    'Phu Thê': { element: 'Kim', stars: ['Hỏa Tinh', 'Linh Tinh', 'Bạch Hổ'] },
    'Phúc Đức': { element: 'Hỏa', stars: ['Địa Không', 'Địa Kiếp'] },
    'Tử Tức': { element: 'Hỏa', stars: ['Quan Phù', 'Phục Binh'] },
    'Tài Bạch': { element: 'Mộc', stars: ['Đại Hao', 'Tiểu Hao'] },
    'Tật Ách': { element: 'Hỏa', stars: ['Thiên Hư', 'Thiên Khốc'] },
  });
  const chartB = buildChart({
    Mệnh: { element: 'Kim', stars: ['Kình Dương', 'Đà La', 'Hóa Kỵ'] },
    'Phu Thê': { element: 'Thủy', stars: ['Hỏa Tinh', 'Linh Tinh', 'Bạch Hổ'] },
    'Phúc Đức': { element: 'Kim', stars: ['Địa Không', 'Địa Kiếp'] },
    'Tử Tức': { element: 'Kim', stars: ['Quan Phù', 'Phục Binh'] },
    'Tài Bạch': { element: 'Thổ', stars: ['Đại Hao', 'Tiểu Hao'] },
    'Tật Ách': { element: 'Kim', stars: ['Thiên Hư', 'Thiên Khốc'] },
  });

  const result = calculateCompatibility(chartA, chartB, 'romance');
  assert.ok(result.overall.percentage <= 35);
});

test('interpretation tone should change by mode', () => {
  const chartA = buildChart({
    Mệnh: { element: 'Thổ', stars: ['Tử Vi', 'Hóa Lộc', 'Tả Phụ'] },
    'Quan Lộc': { element: 'Kim', stars: ['Vũ Khúc', 'Văn Xương'] },
    'Tài Bạch': { element: 'Kim', stars: ['Lộc Tồn', 'Hóa Khoa'] },
    'Nô Bộc': { element: 'Thổ', stars: ['Thiên Tướng', 'Thiên Khôi'] },
    'Thiên Di': { element: 'Thủy', stars: ['Thiên Đồng', 'Thiên Việt'] },
    'Điền Trạch': { element: 'Thổ', stars: ['Thiên Phủ', 'Hóa Quyền'] },
    'Phu Thê': { element: 'Thổ', stars: ['Thái Âm', 'Hữu Bật'] },
  });
  const chartB = buildChart({
    Mệnh: { element: 'Thổ', stars: ['Tử Vi', 'Hóa Lộc', 'Hữu Bật'] },
    'Quan Lộc': { element: 'Kim', stars: ['Vũ Khúc', 'Văn Khúc'] },
    'Tài Bạch': { element: 'Kim', stars: ['Lộc Tồn', 'Hóa Khoa'] },
    'Nô Bộc': { element: 'Thổ', stars: ['Thiên Tướng', 'Thiên Việt'] },
    'Thiên Di': { element: 'Thủy', stars: ['Thiên Đồng', 'Thiên Khôi'] },
    'Điền Trạch': { element: 'Thổ', stars: ['Thiên Phủ', 'Hóa Quyền'] },
    'Phu Thê': { element: 'Thổ', stars: ['Thái Dương', 'Tả Phụ'] },
  });

  const romance = calculateCompatibility(chartA, chartB, 'romance');
  const business = calculateCompatibility(chartA, chartB, 'business');

  assert.notEqual(romance.summary, business.summary);
  assert.ok(
    romance.summary.includes('tình') || romance.summary.includes('cảm xúc'),
    'romance summary should use emotional wording',
  );
  assert.ok(
    business.summary.includes('hợp tác') || business.summary.includes('vận hành'),
    'business summary should use business wording',
  );
});

test('engine should expose warnings and diagnostics for unknown element / missing stars', () => {
  const chartA = buildChart({
    Mệnh: { element: 'Không rõ', stars: [] },
    'Phu Thê': { element: 'Thổ', stars: [] },
  });
  const chartB = buildChart({
    Mệnh: { element: '???', stars: [] },
    'Phu Thê': { element: 'Thổ', stars: [] },
  });

  const result = calculateCompatibility(chartA, chartB, 'romance');

  assert.ok(Array.isArray(result.warnings));
  assert.ok(result.warnings.length > 0);
  assert.ok(result.diagnostics.warningsCount > 0);
  assert.ok(result.diagnostics.unknownElementComparisons > 0);
  assert.ok(result.comparisons.some((item) => item.issues.length > 0));
});

test('memoized engine should reuse cached result for same input', () => {
  clearCompatibilityCache();
  const chartA = buildChart({
    Mệnh: { element: 'Thổ', stars: ['Tử Vi', 'Hóa Lộc'] },
  });
  const chartB = buildChart({
    Mệnh: { element: 'Thổ', stars: ['Tử Vi', 'Hóa Lộc'] },
  });

  const first = calculateCompatibilityMemoized(chartA, chartB, 'romance');
  const second = calculateCompatibilityMemoized(chartA, chartB, 'romance');
  assert.equal(first, second);
});
