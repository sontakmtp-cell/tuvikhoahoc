/**
 * Quan hệ Tam Hợp và Xung Chiếu giữa 12 cung Tử Vi
 * 
 * Tam Hợp (Trine): 4 nhóm, mỗi nhóm 3 cung tạo thành tam giác
 * Xung Chiếu (Opposition): 6 cặp cung đối diện
 */

// Tam Hợp: mỗi nhóm 3 cung có mối liên kết chặt chẽ
export const tamHopGroups = [
  {
    name: "Mệnh – Tài – Quan",
    description: "Bản mệnh, Tài chính, Sự nghiệp",
    palaceIds: [1, 9, 5],   // Mệnh - Tài Bạch - Quan Lộc
    color: "#FFD700",        // gold
  },
  {
    name: "Phụ – Nô – Tử",
    description: "Cha mẹ, Bạn bè, Con cái",
    palaceIds: [2, 6, 10],   // Phụ Mẫu - Nô Bộc - Tử Tức
    color: "#FF69B4",        // pink
  },
  {
    name: "Phúc – Di – Thê",
    description: "Phúc đức, Di chuyển, Hôn nhân",
    palaceIds: [3, 7, 11],   // Phúc Đức - Thiên Di - Phu Thê
    color: "#00CED1",        // dark turquoise
  },
  {
    name: "Điền – Tật – Huynh",
    description: "Nhà cửa, Sức khỏe, Anh em",
    palaceIds: [4, 8, 12],   // Điền Trạch - Tật Ách - Huynh Đệ
    color: "#98FB98",        // pale green
  },
];

// Xung Chiếu: 6 cặp cung đối diện, luôn ảnh hưởng qua lại
export const xungChieuPairs = [
  { palaceIds: [1, 7],  name: "Mệnh ↔ Thiên Di" },
  { palaceIds: [2, 8],  name: "Phụ Mẫu ↔ Tật Ách" },
  { palaceIds: [3, 9],  name: "Phúc Đức ↔ Tài Bạch" },
  { palaceIds: [4, 10], name: "Điền Trạch ↔ Tử Tức" },
  { palaceIds: [5, 11], name: "Quan Lộc ↔ Phu Thê" },
  { palaceIds: [6, 12], name: "Nô Bộc ↔ Huynh Đệ" },
];

// Nhị Hợp: 6 cặp cung nhị hợp (Tý-Sửu, Dần-Hợi, Mão-Tuất, Thìn-Dậu, Tị-Thân, Ngọ-Mùi)
// ID các cung:
// Tý (8), Sửu (9), Dần (10), Mão (11), Thìn (12), Tỵ (1), Ngọ (2), Mùi (3), Thân (4), Dậu (5), Tuất (6), Hợi (7)
export const nhiHopPairs = [
  { palaceIds: [8, 9], name: "Tý ↔ Sửu" },
  { palaceIds: [10, 7], name: "Dần ↔ Hợi" },
  { palaceIds: [11, 6], name: "Mão ↔ Tuất" },
  { palaceIds: [12, 5], name: "Thìn ↔ Dậu" },
  { palaceIds: [1, 4], name: "Tỵ ↔ Thân" },
  { palaceIds: [2, 3], name: "Ngọ ↔ Mùi" },
];

/**
 * Tìm các nhóm Tam Hợp chứa cung đã cho
 */
export function getTamHopForPalace(palaceId) {
  return tamHopGroups.filter(g => g.palaceIds.includes(palaceId));
}

/**
 * Tìm cung Xung Chiếu đối diện
 */
export function getXungChieuForPalace(palaceId) {
  return xungChieuPairs.filter(p => p.palaceIds.includes(palaceId));
}

/**
 * Tìm cung Nhị Hợp
 */
export function getNhiHopForPalace(palaceId) {
  return nhiHopPairs.filter(p => p.palaceIds.includes(palaceId));
}

/**
 * Lấy tất cả palaceId liên quan (tam hợp + xung chiếu + nhị hợp) cho 1 cung
 */
export function getRelatedPalaceIds(palaceId) {
  const tamHop = new Set();
  const xungChieu = new Set();
  const nhiHop = new Set();

  getTamHopForPalace(palaceId).forEach(g => {
    g.palaceIds.forEach(id => { if (id !== palaceId) tamHop.add(id); });
  });

  getXungChieuForPalace(palaceId).forEach(p => {
    p.palaceIds.forEach(id => { if (id !== palaceId) xungChieu.add(id); });
  });

  getNhiHopForPalace(palaceId).forEach(p => {
    p.palaceIds.forEach(id => { if (id !== palaceId) nhiHop.add(id); });
  });

  return { tamHop: [...tamHop], xungChieu: [...xungChieu], nhiHop: [...nhiHop] };
}
