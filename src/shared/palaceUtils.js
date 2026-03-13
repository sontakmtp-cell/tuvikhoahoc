const PALACE_DEFINITIONS = [
  { canonical: 'Mệnh', aliases: ['menh'] },
  { canonical: 'Phụ Mẫu', aliases: ['phumau', 'phu mau'] },
  { canonical: 'Phúc Đức', aliases: ['phucduc', 'phuc duc'] },
  { canonical: 'Điền Trạch', aliases: ['dientrach', 'dien trach'] },
  { canonical: 'Quan Lộc', aliases: ['quanloc', 'quan loc'] },
  { canonical: 'Nô Bộc', aliases: ['noboc', 'no boc'] },
  { canonical: 'Thiên Di', aliases: ['thiendi', 'thien di'] },
  { canonical: 'Tật Ách', aliases: ['tatach', 'tat ach'] },
  { canonical: 'Tài Bạch', aliases: ['taibach', 'tai bach'] },
  { canonical: 'Tử Tức', aliases: ['tutuc', 'tu tuc'] },
  { canonical: 'Phu Thê', aliases: ['phuthe', 'phu the', 'phoingau', 'phoi ngau'] },
  { canonical: 'Huynh Đệ', aliases: ['huynhde', 'huynh de'] },
];

const ALIAS_LOOKUP = new Map();
for (const item of PALACE_DEFINITIONS) {
  ALIAS_LOOKUP.set(normalizeKey(item.canonical), item.canonical);
  item.aliases.forEach((alias) => ALIAS_LOOKUP.set(normalizeKey(alias), item.canonical));
}

export function stripVietnameseDiacritics(value) {
  if (typeof value !== 'string') return '';
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, (char) => (char === 'đ' ? 'd' : 'D'));
}

function normalizeKey(value) {
  return stripVietnameseDiacritics(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
}

function toDisplayCase(value) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function normalizePalaceName(name) {
  if (typeof name !== 'string') return '';
  const trimmed = name.trim();
  if (!trimmed) return '';
  return ALIAS_LOOKUP.get(normalizeKey(trimmed)) || toDisplayCase(trimmed);
}

export function normalizeStarName(name) {
  if (typeof name !== 'string') return '';
  const compact = name.trim().replace(/\s+/g, ' ');
  if (!compact) return '';
  return toDisplayCase(compact);
}

export function findPalaceByName(chart, palaceName) {
  if (!Array.isArray(chart)) return null;
  const target = normalizePalaceName(palaceName);
  if (!target) return null;
  return chart.find((palace) => normalizePalaceName(palace?.name) === target) || null;
}

export function findPalaceById(chart, palaceId) {
  if (!Array.isArray(chart)) return null;
  return chart.find((palace) => Number(palace?.id) === Number(palaceId)) || null;
}

export function normalizeChartPalaces(chart) {
  if (!Array.isArray(chart)) return [];
  return chart.map((palace, index) => ({
    ...palace,
    id: Number.isFinite(Number(palace?.id)) ? Number(palace.id) : index + 1,
    name: normalizePalaceName(palace?.name) || `Cung ${index + 1}`,
    element: typeof palace?.element === 'string' ? toDisplayCase(palace.element.trim()) : '',
    stars: Array.isArray(palace?.stars)
      ? palace.stars.map(normalizeStarName).filter(Boolean)
      : [],
  }));
}
