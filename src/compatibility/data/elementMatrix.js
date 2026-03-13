export const ELEMENTS = ['Kim', 'Thủy', 'Mộc', 'Hỏa', 'Thổ'];

export const TUONG_SINH = {
  Kim: 'Thủy',
  Thủy: 'Mộc',
  Mộc: 'Hỏa',
  Hỏa: 'Thổ',
  Thổ: 'Kim',
};

export const TUONG_KHAC = {
  Kim: 'Mộc',
  Mộc: 'Thổ',
  Thổ: 'Thủy',
  Thủy: 'Hỏa',
  Hỏa: 'Kim',
};

function buildCell(elementA, elementB) {
  if (elementA === elementB) {
    return {
      type: 'hoa',
      score: 1,
      direction: null,
      label: 'Tỷ Hòa (cùng hành)',
    };
  }

  if (TUONG_SINH[elementA] === elementB) {
    return {
      type: 'sinh',
      score: 2,
      direction: 'A→B',
      label: `${elementA} sinh ${elementB}`,
    };
  }

  if (TUONG_SINH[elementB] === elementA) {
    return {
      type: 'sinh',
      score: 1.5,
      direction: 'B→A',
      label: `${elementB} sinh ${elementA}`,
    };
  }

  if (TUONG_KHAC[elementA] === elementB) {
    return {
      type: 'khac',
      score: -2,
      direction: 'A→B',
      label: `${elementA} khắc ${elementB}`,
    };
  }

  if (TUONG_KHAC[elementB] === elementA) {
    return {
      type: 'khac',
      score: -1.5,
      direction: 'B→A',
      label: `${elementB} khắc ${elementA}`,
    };
  }

  return {
    type: 'trung',
    score: 0,
    direction: null,
    label: 'Không tương tác trực tiếp',
  };
}

export const ELEMENT_MATRIX = Object.fromEntries(
  ELEMENTS.map((source) => [
    source,
    Object.fromEntries(ELEMENTS.map((target) => [target, buildCell(source, target)])),
  ]),
);

