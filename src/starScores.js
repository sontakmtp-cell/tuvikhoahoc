// Danh sách các Chính Tinh (không tính điểm theo cơ chế phụ tinh)
export const CHINH_TINH = [
  "Tử Vi", "Thiên Cơ", "Thái Dương", "Vũ Khúc", "Thiên Đồng", "Liêm Trinh",
  "Thiên Phủ", "Thái Âm", "Tham Lang", "Cự Môn", "Thiên Tướng", "Thiên Lương", 
  "Thất Sát", "Phá Quân"
];

// Bảng điểm cho cấu hình Phụ Tinh
export const PHU_TINH_SCORES = {
  // --- Lục cát tinh ---
  "Tả Phù": 5, "Hữu Bật": 5,
  "Văn Xương": 5, "Văn Khúc": 5,
  "Thiên Khôi": 6, "Thiên Việt": 6,
  
  // --- Tứ Hóa (trừ Kỵ) ---
  "Hóa Lộc": 8, "Hóa Quyền": 7, "Hóa Khoa": 7,
  
  // --- Cát tinh khác ---
  "Lộc Tồn": 8, "Thiên Mã": 5,
  "Ân Quang": 3, "Thiên Quý": 3,
  "Long Trì": 3, "Phượng Các": 3,
  "Tam Thai": 3, "Bát Tọa": 3,
  "Thiên Quan": 3, "Thiên Phúc": 3,
  "Thiên Tài": 2, "Thiên Thọ": 2,
  "Hồng Loan": 3, "Thiên Hỷ": 3, "Đào Hoa": 3, "Hỷ Thần": 2,
  "Thanh Long": 3, "Thiên Giải": 3, "Địa Giải": 3, "Giải Thần": 3,
  "Quốc Ấn": 3, "Đường Phù": 2, "Thai Phụ": 2, "Phong Cáo": 2,
  "Nguyệt Đức": 2, "Thiên Đức": 2, "Long Đức": 2, "Phúc Đức": 2,
  
  // --- Vòng Thái Tuế (Tốt) ---
  "Thái Tuế": 2, "Thiếu Dương": 2, "Thiếu Âm": 2, "Trực Phù": 1,
  
  // --- Vòng Lộc Tồn (Tốt) ---
  "Bác Sĩ": 2, "Lực Sĩ": 2, "Tướng Quân": 3,
  
  // --- Vòng Tràng Sinh (Tốt) ---
  "Trường Sinh": 4, "Mộc Dục": 1, "Quan Đới": 2, "Lâm Quan": 3, "Đế Vượng": 4, "Thai": 2, "Dưỡng": 2,

  // ==========================================
  // --- Hung / Sát tính (Sao xấu) ---
  
  // --- Lục sát tinh ---
  "Địa Không": -8, "Địa Kiếp": -8,
  "Kình Dương": -6, "Đà La": -6,
  "Hỏa Tinh": -5, "Linh Tinh": -5,
  
  // --- Tứ Hóa ---
  "Hóa Kỵ": -8,
  
  // --- Bại tinh ---
  "Đại Hao": -4, "Tiểu Hao": -2,
  "Thiên Khốc": -3, "Thiên Hư": -3,
  
  // --- Sát tinh / Ác tinh khác ---
  "Thiên Không": -5, "Kiếp Sát": -4,
  "Tang Môn": -4, "Bạch Hổ": -4, "Điếu Khách": -3, "Tuế Phá": -3,
  "Cô Thần": -3, "Quả Tú": -3,
  "Thiên Hình": -4, "Thiên Riêu": -3, "Thiên Y": 1, // Thiên Y thực chất là sao y thuật (có thể coi là tốt nhẹ)
  "Phá Toái": -3, "Đẩu Quân": -2, "Phi Liêm": -2,
  "Lưu Hà": -3, "Thiên Thương": -3, "Thiên Sứ": -3,
  "Thiên La": -4, "Địa Võng": -4,
  "Quan Phủ": -2, "Quan Phù": -2, "Tử Phù": -2, 
  "Tuần": -3, "Triệt": -3,
  
  // --- Vòng Tràng Sinh (Xấu) ---
  "Bệnh Phù": -2, "Suy": -2, "Bệnh": -2, "Tử": -2, "Mộ": 0, "Tuyệt": -3,
  "Phục Binh": -3
};

import { getRelatedPalaceIds } from './relationships';

/**
 * Hàm tính điểm tổng các phụ tinh của một cung đơn lẻ
 * @param {Array<string>} starsArray - Mảng tên các sao
 * @returns {object} { total, positive, negative }
 */
export function calculatePalaceScore(starsArray) {
  if (!starsArray || !Array.isArray(starsArray)) {
    return { total: 0, positive: 0, negative: 0 };
  }

  let totalScore = 0;
  let positiveScore = 0;
  let negativeScore = 0;

  starsArray.forEach(star => {
    // Bỏ qua Chính Tinh
    if (CHINH_TINH.includes(star)) return;

    // Lấy điểm, nếu sao không có trong danh sách thì mặc định là 0
    const point = PHU_TINH_SCORES[star] || 0;
    
    totalScore += point;
    if (point > 0) {
      positiveScore += point;
    } else if (point < 0) {
      negativeScore += Math.abs(point);
    }
  });

  return {
    total: totalScore,
    positive: positiveScore,
    negative: negativeScore
  };
}

/**
 * Hàm tính điểm mở rộng cho một cung, bao gồm cả Bản Cung, Tam Hợp, Xung Chiếu và Nhị Hợp
 * @param {number} palaceId - ID của cung cần tính
 * @param {Array<object>} allPalacesData - Toàn bộ dữ liệu 12 cung
 * @returns {object} Điểm chi tiết
 */
export function calculateExtendedPalaceScore(palaceId, allPalacesData) {
  const currentPalace = allPalacesData.find(p => p.id === palaceId);
  if (!currentPalace) return null;

  // 1. Điểm Bản Cung (hệ số 1.0)
  const baseScore = calculatePalaceScore(currentPalace.stars);

  // Lấy danh sách ID các cung liên quan
  const relatedIds = getRelatedPalaceIds(palaceId);

  // 2. Điểm Tam Hợp (hệ số 0.5)
  let tamHopScore = { total: 0, positive: 0, negative: 0 };
  relatedIds.tamHop.forEach(id => {
    const palace = allPalacesData.find(p => p.id === id);
    if (palace) {
      const score = calculatePalaceScore(palace.stars);
      tamHopScore.total += score.total * 0.5;
      tamHopScore.positive += score.positive * 0.5;
      tamHopScore.negative += score.negative * 0.5;
    }
  });

  // 3. Điểm Xung Chiếu (hệ số 0.8)
  let xungChieuScore = { total: 0, positive: 0, negative: 0 };
  relatedIds.xungChieu.forEach(id => {
    const palace = allPalacesData.find(p => p.id === id);
    if (palace) {
      const score = calculatePalaceScore(palace.stars);
      xungChieuScore.total += score.total * 0.8;
      xungChieuScore.positive += score.positive * 0.8;
      xungChieuScore.negative += score.negative * 0.8;
    }
  });

  // 4. Điểm Nhị Hợp (hệ số 0.3)
  let nhiHopScore = { total: 0, positive: 0, negative: 0 };
  relatedIds.nhiHop.forEach(id => {
    const palace = allPalacesData.find(p => p.id === id);
    if (palace) {
      const score = calculatePalaceScore(palace.stars);
      nhiHopScore.total += score.total * 0.3;
      nhiHopScore.positive += score.positive * 0.3;
      nhiHopScore.negative += score.negative * 0.3;
    }
  });

  // Tổng hợp kết quả
  const finalTotal = baseScore.total + tamHopScore.total + xungChieuScore.total + nhiHopScore.total;
  const finalPositive = baseScore.positive + tamHopScore.positive + xungChieuScore.positive + nhiHopScore.positive;
  const finalNegative = baseScore.negative + tamHopScore.negative + xungChieuScore.negative + nhiHopScore.negative;

  return {
    base: baseScore,
    tamHop: tamHopScore,
    xungChieu: xungChieuScore,
    nhiHop: nhiHopScore,
    final: {
      total: Number(finalTotal.toFixed(1)),
      positive: Number(finalPositive.toFixed(1)),
      negative: Number(finalNegative.toFixed(1))
    }
  };
}
