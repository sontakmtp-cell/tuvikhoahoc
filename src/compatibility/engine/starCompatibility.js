import { getStarInfo } from '../data/starCatalog.js';

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function toSet(values) {
  return new Set(values.filter(Boolean));
}

export const SPECIAL_STAR_PAIRS = [
  { a: 'Thái Dương', b: 'Thái Âm', bonus: 2, label: 'Nhật Nguyệt giao huy - Âm Dương hòa hợp' },
  { a: 'Tả Phụ', b: 'Hữu Bật', bonus: 1.5, label: 'Tả Hữu phò trì - Hỗ trợ đắc lực' },
  { a: 'Văn Xương', b: 'Văn Khúc', bonus: 1.5, label: 'Song Văn hội tụ - Trí tuệ bổ sung' },
  { a: 'Thiên Khôi', b: 'Thiên Việt', bonus: 1, label: 'Quý nhân tương trợ' },
  { a: 'Tử Vi', b: 'Thiên Phủ', bonus: 2, label: 'Đế Phủ triều viên - Khả năng phối hợp quyền - tài' },
  { a: 'Kình Dương', b: 'Đà La', bonus: -1.5, label: 'Song Sát hội tụ - Dễ bùng phát mâu thuẫn' },
  { a: 'Hỏa Tinh', b: 'Linh Tinh', bonus: -1, label: 'Song Hỏa - Nóng nảy song phương' },
  { a: 'Thất Sát', b: 'Phá Quân', bonus: -1.5, label: 'Sát Phá - Biến động mạnh' },
];

export function checkSpecialStarPairs(infoA, infoB) {
  const namesA = toSet(infoA.map((item) => item.name));
  const namesB = toSet(infoB.map((item) => item.name));
  const pairs = [];
  let bonus = 0;

  for (const pair of SPECIAL_STAR_PAIRS) {
    const matchAB = namesA.has(pair.a) && namesB.has(pair.b);
    const matchBA = namesA.has(pair.b) && namesB.has(pair.a);
    if (matchAB || matchBA) {
      pairs.push(pair);
      bonus += pair.bonus;
    }
  }

  return { bonus, pairs };
}

export function analyzeStars(starsA = [], starsB = []) {
  const infoA = starsA.map((star) => getStarInfo(star));
  const infoB = starsB.map((star) => getStarInfo(star));
  const setA = toSet(infoA.map((item) => item.name));
  const setB = toSet(infoB.map((item) => item.name));

  const commonStars = [...setA].filter((name) => setB.has(name));
  const catA = infoA.filter((star) => star.nature === 'cat');
  const catB = infoB.filter((star) => star.nature === 'cat');
  const hungA = infoA.filter((star) => star.nature === 'hung');
  const hungB = infoB.filter((star) => star.nature === 'hung');

  let score = 0;
  score += Math.min(catA.length, catB.length) * 0.5;
  score -= Math.min(hungA.length, hungB.length) * 0.4;

  for (const starName of commonStars) {
    const star = getStarInfo(starName);
    if (star.nature === 'cat') score += 0.8;
    if (star.nature === 'hung') score -= 0.6;
  }

  const special = checkSpecialStarPairs(infoA, infoB);
  score += special.bonus;

  const imbalancePenalty = (Math.abs(catA.length - catB.length) * 0.08)
    + (Math.abs(hungA.length - hungB.length) * 0.05);
  score -= imbalancePenalty;

  return {
    totalA: infoA.length,
    totalB: infoB.length,
    catA: catA.length,
    catB: catB.length,
    hungA: hungA.length,
    hungB: hungB.length,
    commonStars,
    specialPairs: special.pairs,
    score: clamp(score, -5, 5),
  };
}
