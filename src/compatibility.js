// src/compatibility.js
// ===== HỆ THỐNG SO SÁNH LÁ SỐ TỬ VI =====

// ---- TẦNG 1: NGŨ HÀNH NẠP ÂM ----
const NGU_HANH_MATRIX = {
  "Kim":  { "Kim": 50, "Mộc": -80, "Thủy": 90,  "Hỏa": -70, "Thổ": 80  },
  "Mộc":  { "Kim": -80, "Mộc": 50, "Thủy": 80,  "Hỏa": 90,  "Thổ": -70 },
  "Thủy": { "Kim": 90,  "Mộc": 80, "Thủy": 50,  "Hỏa": -80, "Thổ": -70 },
  "Hỏa":  { "Kim": -70, "Mộc": 90, "Thủy": -80, "Hỏa": 50,  "Thổ": 80  },
  "Thổ":  { "Kim": 80,  "Mộc": -70,"Thủy": -70, "Hỏa": 80,  "Thổ": 50  },
};

function scoreNguHanh(hanhA, hanhB) {
  const raw = NGU_HANH_MATRIX[hanhA]?.[hanhB] ?? 0;
  // Normalize to 0-100
  return Math.round((raw + 100) / 2);
}

function labelNguHanh(hanhA, hanhB) {
  const TUONG_SINH = [
    ["Kim","Thủy"],["Thủy","Mộc"],["Mộc","Hỏa"],["Hỏa","Thổ"],["Thổ","Kim"]
  ];
  const TUONG_KHAC = [
    ["Kim","Mộc"],["Mộc","Thổ"],["Thổ","Thủy"],["Thủy","Hỏa"],["Hỏa","Kim"]
  ];
  if (hanhA === hanhB) return "Bình Hòa";
  if (TUONG_SINH.some(([a,b]) => 
    (a === hanhA && b === hanhB) || (a === hanhB && b === hanhA)
  )) return "Tương Sinh";
  if (TUONG_KHAC.some(([a,b]) => 
    (a === hanhA && b === hanhB) || (a === hanhB && b === hanhA)
  )) return "Tương Khắc";
  return "Không xác định";
}

// ---- TẦNG 2: ĐỊA CHI CUNG MỆNH ----
const DIA_CHI = ["Tý","Sửu","Dần","Mão","Thìn","Tỵ","Ngọ","Mùi","Thân","Dậu","Tuất","Hợi"];

const TAM_HOP = [
  ["Thân","Tý","Thìn"],
  ["Dần","Ngọ","Tuất"],
  ["Tỵ","Dậu","Sửu"],
  ["Hợi","Mão","Mùi"],
];

const LUC_HOP = [
  ["Tý","Sửu"],["Dần","Hợi"],["Mão","Tuất"],
  ["Thìn","Dậu"],["Tỵ","Thân"],["Ngọ","Mùi"],
];

const LUC_XUNG = [
  ["Tý","Ngọ"],["Sửu","Mùi"],["Dần","Thân"],
  ["Mão","Dậu"],["Thìn","Tuất"],["Tỵ","Hợi"],
];

const LUC_HAI = [
  ["Tý","Mùi"],["Sửu","Ngọ"],["Dần","Tỵ"],
  ["Mão","Thìn"],["Thân","Hợi"],["Dậu","Tuất"],
];

function scoreDiaChi(chiA, chiB) {
  if (chiA === chiB) return { score: 60, label: "Tự Hình" };
  
  const inTamHop = TAM_HOP.some(group => group.includes(chiA) && group.includes(chiB));
  if (inTamHop) return { score: 95, label: "Tam Hợp" };
  
  const inLucHop = LUC_HOP.some(([a,b]) => 
    (a === chiA && b === chiB) || (a === chiB && b === chiA));
  if (inLucHop) return { score: 85, label: "Lục Hợp" };
  
  const inLucXung = LUC_XUNG.some(([a,b]) => 
    (a === chiA && b === chiB) || (a === chiB && b === chiA));
  if (inLucXung) return { score: 15, label: "Lục Xung" };
  
  const inLucHai = LUC_HAI.some(([a,b]) => 
    (a === chiA && b === chiB) || (a === chiB && b === chiA));
  if (inLucHai) return { score: 25, label: "Lục Hại" };
  
  return { score: 50, label: "Bình thường" };
}

// ---- TẦNG 3: CUNG PHU THÊ CHÉO ----
const STAR_ELEMENT = {
  "Tử Vi": "Thổ", "Thiên Cơ": "Mộc", "Thái Dương": "Hỏa",
  "Vũ Khúc": "Kim", "Thiên Đồng": "Thủy", "Liêm Trinh": "Hỏa",
  "Thiên Phủ": "Thổ", "Thái Âm": "Thủy", "Tham Lang": "Thủy",
  "Cự Môn": "Thủy", "Thiên Tướng": "Thủy", "Thiên Lương": "Mộc",
  "Thất Sát": "Kim", "Phá Quân": "Thủy",
};

function scorePhuTheCheo(chartA, chartB) {
  const phuTheA = chartA["Phu Thê"]?.chinhTinh ?? [];
  const phuTheB = chartB["Phu Thê"]?.chinhTinh ?? [];
  const menhA = chartA["Mệnh"]?.chinhTinh ?? [];
  const menhB = chartB["Mệnh"]?.chinhTinh ?? [];

  let totalScore = 0;
  let count = 0;

  // Phu Thê A ↔ Mệnh B
  for (const starPT of phuTheA) {
    const hanhPT = STAR_ELEMENT[starPT.name] ?? "Thổ";
    for (const starM of menhB) {
      const hanhM = STAR_ELEMENT[starM.name] ?? "Thổ";
      totalScore += scoreNguHanh(hanhPT, hanhM);
      count++;
    }
  }

  // Phu Thê B ↔ Mệnh A
  for (const starPT of phuTheB) {
    const hanhPT = STAR_ELEMENT[starPT.name] ?? "Thổ";
    for (const starM of menhA) {
      const hanhM = STAR_ELEMENT[starM.name] ?? "Thổ";
      totalScore += scoreNguHanh(hanhPT, hanhM);
      count++;
    }
  }

  return count > 0 ? Math.round(totalScore / count) : 50;
}

// ---- TẦNG 4: CHÍNH TINH ĐỒNG CUNG ----
const STAR_SYNERGY = {
  "Tử Vi|Thiên Phủ": 95,
  "Thái Dương|Thái Âm": 95,
  "Thiên Cơ|Thiên Lương": 85,
  "Thiên Đồng|Thiên Lương": 80,
  "Tử Vi|Tham Lang": 60,
  "Thất Sát|Phá Quân": 20,
  "Liêm Trinh|Tham Lang": 30,
  "Liêm Trinh|Thất Sát": 25,
  "Vũ Khúc|Phá Quân": 30,
};

function scoreChinhTinhPair(chartA, chartB) {
  const menhA = chartA["Mệnh"]?.chinhTinh ?? [];
  const menhB = chartB["Mệnh"]?.chinhTinh ?? [];
  
  let totalScore = 0;
  let count = 0;

  for (const sA of menhA) {
    for (const sB of menhB) {
      const key1 = `${sA.name}|${sB.name}`;
      const key2 = `${sB.name}|${sA.name}`;
      if (STAR_SYNERGY[key1] !== undefined) {
        totalScore += STAR_SYNERGY[key1];
        count++;
      } else if (STAR_SYNERGY[key2] !== undefined) {
        totalScore += STAR_SYNERGY[key2];
        count++;
      } else {
        // Fallback: so sánh hành của 2 sao
        const hA = STAR_ELEMENT[sA.name] ?? "Thổ";
        const hB = STAR_ELEMENT[sB.name] ?? "Thổ";
        totalScore += scoreNguHanh(hA, hB);
        count++;
      }
    }
  }

  return count > 0 ? Math.round(totalScore / count) : 50;
}

// ---- TẦNG 5: SÁT TINH CHÉO ----
const HUNG_TINH = ["Kình Dương","Đà La","Hỏa Tinh","Linh Tinh","Địa Không","Địa Kiếp"];
const SENSITIVE_PALACES = ["Mệnh", "Phu Thê", "Phúc Đức"];

function scoreSatTinhCheo(chartA, chartB) {
  let penalty = 0;

  for (const palace of SENSITIVE_PALACES) {
    const phuTinhB = chartB[palace]?.phuTinh ?? [];
    for (const star of phuTinhB) {
      if (HUNG_TINH.includes(star.name)) {
        penalty += 15; // Mỗi hung tinh rơi vào cung nhạy cảm của đối phương
      }
    }
    const phuTinhA = chartA[palace]?.phuTinh ?? [];
    for (const star of phuTinhA) {
      if (HUNG_TINH.includes(star.name)) {
        penalty += 15;
      }
    }
  }

  return Math.max(0, 100 - penalty);
}

// ---- TỔNG HỢP ----
export function computeCompatibility(chartA, chartB, metaA, metaB) {
  // metaA/B = { nguHanh: "Kim", diaChi: "Tý" }
  
  const t1 = scoreNguHanh(metaA.nguHanh, metaB.nguHanh);
  const t1Label = labelNguHanh(metaA.nguHanh, metaB.nguHanh);
  const t2Obj = scoreDiaChi(metaA.diaChi, metaB.diaChi);
  const t3 = scorePhuTheCheo(chartA, chartB);
  const t4 = scoreChinhTinhPair(chartA, chartB);
  const t5 = scoreSatTinhCheo(chartA, chartB);

  const WEIGHTS = { t1: 0.25, t2: 0.20, t3: 0.25, t4: 0.20, t5: 0.10 };

  const finalScore = Math.round(
    t1 * WEIGHTS.t1 +
    t2Obj.score * WEIGHTS.t2 +
    t3 * WEIGHTS.t3 +
    t4 * WEIGHTS.t4 +
    t5 * WEIGHTS.t5
  );

  return {
    finalScore,
    breakdown: {
      nguHanh:     { score: t1, weight: "25%", label: t1Label, detail: `${metaA.nguHanh} ↔ ${metaB.nguHanh}` },
      diaChi:      { score: t2Obj.score, weight: "20%", label: t2Obj.label, detail: `${metaA.diaChi} ↔ ${metaB.diaChi}` },
      phuTheCheo:  { score: t3, weight: "25%", label: t3 >= 70 ? "Tương Hợp" : t3 >= 40 ? "Trung Bình" : "Bất Lợi" },
      chinhTinh:   { score: t4, weight: "20%", label: t4 >= 70 ? "Hỗ Trợ" : t4 >= 40 ? "Trung Bình" : "Xung Đột" },
      satTinh:     { score: t5, weight: "10%", label: t5 >= 70 ? "Ít Hung Tinh" : "Nhiều Hung Tinh" },
    },
    verdict: finalScore >= 80 ? "Rất Tương Hợp 💕" :
             finalScore >= 60 ? "Khá Tương Hợp 🤝" :
             finalScore >= 40 ? "Trung Bình ⚖️" :
             finalScore >= 20 ? "Khá Xung Khắc ⚡" :
                                "Rất Xung Khắc 🔥"
  };
}
