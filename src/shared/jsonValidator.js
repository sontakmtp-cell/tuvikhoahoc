import { normalizeChartPalaces, normalizePalaceName } from './palaceUtils';

const REQUIRED_PALACE_COUNT = 12;
const VALID_ELEMENTS = new Set(['Kim', 'Mộc', 'Thủy', 'Hỏa', 'Thổ']);
const CHART_KEYS = [
  'chart',
  'data',
  'palaces',
  'tuViData',
  'tuviData',
  'tuVi',
  'tuvi',
  'laSo',
  'laso',
];

function parseInput(rawInput) {
  if (typeof rawInput === 'string') {
    return JSON.parse(rawInput);
  }
  return rawInput;
}

function extractChart(payload) {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== 'object') return null;

  for (const key of CHART_KEYS) {
    if (Array.isArray(payload[key])) {
      return payload[key];
    }
  }

  return null;
}

export function getChartPreviewName(chart, fileName = '') {
  if (!Array.isArray(chart) || chart.length === 0) return fileName || 'Lá số chưa rõ';

  const menh = chart.find((palace) => normalizePalaceName(palace?.name) === 'Mệnh');
  const baseName = fileName?.replace(/\.[^.]+$/u, '').trim() || 'Lá số';
  if (!menh) return baseName;

  const element = typeof menh.element === 'string' && menh.element.trim()
    ? menh.element.trim()
    : 'N/A';
  return `${baseName} · Mệnh ${element}`;
}

export function validateChartJson(rawInput, options = {}) {
  const { requireFullChart = true } = options;
  const errors = [];
  const warnings = [];

  let payload;
  try {
    payload = parseInput(rawInput);
  } catch (error) {
    return {
      valid: false,
      data: null,
      errors: [`JSON không hợp lệ: ${error.message}`],
      warnings,
    };
  }

  const chart = extractChart(payload);
  if (!chart) {
    return {
      valid: false,
      data: null,
      errors: ['Không tìm thấy mảng dữ liệu 12 cung trong JSON.'],
      warnings,
    };
  }

  if (requireFullChart && chart.length !== REQUIRED_PALACE_COUNT) {
    errors.push(`Dữ liệu phải có đúng ${REQUIRED_PALACE_COUNT} cung, hiện tại là ${chart.length}.`);
  }

  const normalized = normalizeChartPalaces(chart);
  const usedIds = new Set();

  normalized.forEach((palace, index) => {
    const rawPalace = chart[index] || {};

    if (typeof rawPalace.name !== 'string' || !rawPalace.name.trim()) {
      errors.push(`Cung #${index + 1} thiếu tên hợp lệ.`);
    }

    if (!Array.isArray(rawPalace.stars)) {
      errors.push(`Cung "${palace.name}" thiếu danh sách sao.`);
    } else if (palace.stars.length === 0) {
      warnings.push(`Cung "${palace.name}" chưa có sao.`);
    }

    if (!palace.element) {
      errors.push(`Cung "${palace.name}" thiếu hành.`);
    } else if (!VALID_ELEMENTS.has(palace.element)) {
      warnings.push(`Cung "${palace.name}" có hành lạ: "${palace.element}".`);
    }

    if (usedIds.has(palace.id)) {
      warnings.push(`Phát hiện id cung trùng: ${palace.id}.`);
    }
    usedIds.add(palace.id);
  });

  return {
    valid: errors.length === 0,
    data: errors.length === 0 ? normalized : null,
    errors,
    warnings,
  };
}
