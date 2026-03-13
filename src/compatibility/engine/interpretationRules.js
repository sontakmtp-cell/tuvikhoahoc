import { INTERPRETATION_TEMPLATES } from '../data/interpretationTemplates.js';

function stableIndex(seed, length) {
  if (!length) return 0;
  let acc = 0;
  const text = String(seed || '');
  for (let i = 0; i < text.length; i += 1) {
    acc = (acc + text.charCodeAt(i) * (i + 3)) % 1000003;
  }
  return acc % length;
}

function pickTemplate(candidates, seed, fallback) {
  if (!Array.isArray(candidates) || candidates.length === 0) return fallback;
  return candidates[stableIndex(seed, candidates.length)];
}

function getScoreBand(score) {
  if (score >= 5) return 'veryGood';
  if (score > 0) return 'good';
  if (score >= -2) return 'neutral';
  if (score >= -6) return 'bad';
  return 'veryBad';
}

function getCrossBand(score) {
  if (score >= 0.8) return 'positive';
  if (score <= -0.8) return 'negative';
  return 'neutral';
}

function getCommonStarBand(commonCount) {
  if (commonCount >= 4) return 'manyCommon';
  if (commonCount >= 1) return 'fewCommon';
  return 'noCommon';
}

function getElementKey(elementResult) {
  if (!elementResult?.type) return 'unknown';
  if (['sinh', 'khac', 'hoa', 'trung'].includes(elementResult.type)) return elementResult.type;
  return 'unknown';
}

function buildSpecialSentence(modeTemplates, specialPairs, compId) {
  if (!Array.isArray(specialPairs) || specialPairs.length === 0) return '';

  const totalBonus = specialPairs.reduce((sum, pair) => sum + (pair.bonus || 0), 0);
  const list = specialPairs.slice(0, 2).map((pair) => pair.label).join('; ');
  const toneKey = totalBonus >= 0 ? 'positiveSpecial' : 'negativeSpecial';
  const toneLine = pickTemplate(modeTemplates.stars[toneKey], `${compId}_${toneKey}`, '');
  return `${toneLine} Các dấu hiệu nổi bật: ${list}.`;
}

function buildCommonStarsSentence(modeTemplates, commonStars, compId) {
  const commonCount = Array.isArray(commonStars) ? commonStars.length : 0;
  const key = getCommonStarBand(commonCount);
  const base = pickTemplate(modeTemplates.stars[key], `${compId}_${key}`, '');
  if (!commonCount) return base;

  const starList = commonStars.slice(0, 4).join(', ');
  return `${base} Sao đồng vị đáng chú ý: ${starList}${commonCount > 4 ? ', ...' : ''}.`;
}

function buildCrossSentence(modeTemplates, crossResult, compId) {
  const band = getCrossBand(crossResult?.score || 0);
  const sentence = pickTemplate(modeTemplates.cross[band], `${compId}_${band}`, '');
  const detail = crossResult?.details?.[0];
  if (!detail) return sentence;
  return `${sentence} Tín hiệu chéo điển hình: ${detail}.`;
}

function buildScoreSentence(modeTemplates, score, compId) {
  const band = getScoreBand(score);
  return pickTemplate(modeTemplates.score[band], `${compId}_${band}`, '');
}

export function generateInterpretation(comp, elementResult, starResult, crossResult, score, mode) {
  const modeTemplates = INTERPRETATION_TEMPLATES[mode] || INTERPRETATION_TEMPLATES.romance;
  const elementKey = getElementKey(elementResult);

  const parts = [];

  const elementLine = pickTemplate(
    modeTemplates.element[elementKey],
    `${comp.id}_${elementKey}`,
    'Chưa đủ dữ liệu để luận giải ngũ hành.',
  );
  parts.push(elementLine);

  parts.push(buildCommonStarsSentence(modeTemplates, starResult?.commonStars, comp.id));

  const specialLine = buildSpecialSentence(modeTemplates, starResult?.specialPairs, comp.id);
  if (specialLine) {
    parts.push(specialLine);
  } else {
    const catBalance = (starResult?.catA || 0) + (starResult?.catB || 0);
    const hungBalance = (starResult?.hungA || 0) + (starResult?.hungB || 0);
    if (catBalance >= hungBalance) {
      parts.push(
        mode === 'business'
          ? 'Tỷ lệ cát tinh nhỉnh hơn giúp biên an toàn vận hành tốt hơn mức trung bình.'
          : 'Tỷ lệ cát tinh đang nhỉnh hơn, là điểm tựa để giữ sự êm dịu khi có va chạm.',
      );
    } else {
      parts.push(
        mode === 'business'
          ? 'Hung tinh chiếm ưu thế tương đối, cần siết quy tắc phối hợp để tránh lệch nhịp.'
          : 'Hung tinh đang lấn nhẹ, cần giữ bình tĩnh khi trao đổi chuyện nhạy cảm.',
      );
    }
  }

  parts.push(buildCrossSentence(modeTemplates, crossResult, comp.id));
  parts.push(buildScoreSentence(modeTemplates, score, comp.id));

  return parts.filter(Boolean).join(' ');
}

function formatPairLabel(item) {
  return `${item.palaceA.name}↔${item.palaceB.name}`;
}

export function generateOverallSummary(overall, comparisons, mode) {
  const modeKey = mode === 'business' ? 'business' : 'romance';
  const overallTemplates = INTERPRETATION_TEMPLATES.overall[modeKey];

  const sorted = [...(comparisons || [])].sort((a, b) => b.pairScore - a.pairScore);
  const strongest = sorted.slice(0, 2).filter((item) => item.pairScore > 0);
  const weakest = sorted.slice(-2).reverse().filter((item) => item.pairScore < 0);

  const introSeed = `${overall.level}_${overall.percentage}_${modeKey}`;
  const intro = pickTemplate(overallTemplates.intro, introSeed, 'Tổng quan tương hợp ở mức');
  const advice = pickTemplate(overallTemplates.advice, `${introSeed}_advice`, '');

  const lines = [];
  lines.push(`${intro} ${overall.level} (${overall.percentage}%).`);

  if (strongest.length > 0) {
    lines.push(`Điểm mạnh nổi bật: ${strongest.map(formatPairLabel).join(', ')}.`);
  } else {
    lines.push(
      modeKey === 'business'
        ? 'Hiện chưa có cụm cung tạo ưu thế rõ, nên ưu tiên giai đoạn thử nghiệm ngắn.'
        : 'Hiện chưa có cụm cung vượt trội, cần thêm thời gian để xây độ đồng điệu.',
    );
  }

  if (weakest.length > 0) {
    lines.push(`Điểm cần lưu ý: ${weakest.map(formatPairLabel).join(', ')}.`);
  } else {
    lines.push(
      modeKey === 'business'
        ? 'Không thấy vùng xung đột lớn, có thể mở rộng hợp tác theo lộ trình.'
        : 'Không thấy vùng xung đột lớn, có thể tiến chậm nhưng ổn định.',
    );
  }

  lines.push(advice);
  return lines.join(' ');
}

