import { stripVietnameseDiacritics } from '../../shared/palaceUtils.js';
import { ELEMENT_MATRIX, ELEMENTS } from '../data/elementMatrix.js';

const ELEMENT_ALIASES = new Map([
  ['kim', 'Kim'],
  ['moc', 'Mộc'],
  ['thuy', 'Thủy'],
  ['hoa', 'Hỏa'],
  ['tho', 'Thổ'],
]);

function normalizeElementKey(value) {
  if (typeof value !== 'string') return '';
  return stripVietnameseDiacritics(value).toLowerCase().replace(/[^a-z]+/g, '');
}

export function normalizeElement(value) {
  const alias = ELEMENT_ALIASES.get(normalizeElementKey(value));
  if (alias) return alias;

  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  return ELEMENTS.includes(trimmed) ? trimmed : '';
}

export function getElementRelation(elementA, elementB) {
  const normalizedA = normalizeElement(elementA);
  const normalizedB = normalizeElement(elementB);

  if (!normalizedA || !normalizedB) {
    return {
      type: 'unknown',
      score: 0,
      direction: null,
      label: 'Thiếu dữ liệu hành để đánh giá',
      elementA: normalizedA || '',
      elementB: normalizedB || '',
    };
  }

  const relation = ELEMENT_MATRIX[normalizedA]?.[normalizedB];
  if (!relation) {
    return {
      type: 'trung',
      score: 0,
      direction: null,
      label: 'Không tương tác trực tiếp',
      elementA: normalizedA,
      elementB: normalizedB,
    };
  }

  return {
    ...relation,
    elementA: normalizedA,
    elementB: normalizedB,
  };
}
