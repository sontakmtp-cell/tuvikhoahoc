import { normalizeStarName, stripVietnameseDiacritics } from '../../shared/palaceUtils.js';

const STAR_ENTRIES = [
  ['Tử Vi', { group: 'chinh', nature: 'cat', power: 10, element: 'Thổ', meaning: 'Đế tinh, quyền lực, lãnh đạo' }],
  ['Thiên Cơ', { group: 'chinh', nature: 'cat', power: 8, element: 'Mộc', meaning: 'Mưu trí, linh hoạt' }],
  ['Thái Dương', { group: 'chinh', nature: 'cat', power: 9, element: 'Hỏa', meaning: 'Quang minh, chủ động' }],
  ['Vũ Khúc', { group: 'chinh', nature: 'cat', power: 8, element: 'Kim', meaning: 'Tài chính, quyết đoán' }],
  ['Thiên Đồng', { group: 'chinh', nature: 'cat', power: 7, element: 'Thủy', meaning: 'Phúc hậu, nhu hòa' }],
  ['Liêm Trinh', { group: 'chinh', nature: 'trung', power: 7, element: 'Hỏa', meaning: 'Chính trực, kỷ luật' }],
  ['Thiên Phủ', { group: 'chinh', nature: 'cat', power: 9, element: 'Thổ', meaning: 'Kho tàng, ổn định' }],
  ['Thái Âm', { group: 'chinh', nature: 'cat', power: 9, element: 'Thủy', meaning: 'Tài lộc, tinh tế' }],
  ['Tham Lang', { group: 'chinh', nature: 'trung', power: 8, element: 'Thủy', meaning: 'Giao thiệp, đa tài' }],
  ['Cự Môn', { group: 'chinh', nature: 'trung', power: 7, element: 'Thủy', meaning: 'Biện luận, thị phi' }],
  ['Thiên Tướng', { group: 'chinh', nature: 'cat', power: 8, element: 'Thủy', meaning: 'Hỗ trợ, công tâm' }],
  ['Thiên Lương', { group: 'chinh', nature: 'cat', power: 8, element: 'Mộc', meaning: 'Bảo hộ, nhân từ' }],
  ['Thất Sát', { group: 'chinh', nature: 'hung', power: 9, element: 'Kim', meaning: 'Mạnh mẽ, cực đoan' }],
  ['Phá Quân', { group: 'chinh', nature: 'hung', power: 9, element: 'Thủy', meaning: 'Phá cách, biến động' }],

  ['Tả Phụ', { group: 'phu', nature: 'cat', power: 6, element: 'Thổ' }],
  ['Hữu Bật', { group: 'phu', nature: 'cat', power: 6, element: 'Thủy' }],
  ['Văn Xương', { group: 'phu', nature: 'cat', power: 6, element: 'Kim' }],
  ['Văn Khúc', { group: 'phu', nature: 'cat', power: 6, element: 'Thủy' }],
  ['Lộc Tồn', { group: 'phu', nature: 'cat', power: 7, element: 'Thổ' }],
  ['Thiên Khôi', { group: 'phu', nature: 'cat', power: 6, element: 'Hỏa' }],
  ['Thiên Việt', { group: 'phu', nature: 'cat', power: 6, element: 'Hỏa' }],
  ['Thiên Quan', { group: 'phu', nature: 'cat', power: 5, element: 'Hỏa' }],
  ['Thiên Phúc', { group: 'phu', nature: 'cat', power: 5, element: 'Mộc' }],
  ['Thiên Quý', { group: 'phu', nature: 'cat', power: 5, element: 'Thổ' }],
  ['Long Trì', { group: 'phu', nature: 'cat', power: 5, element: 'Thủy' }],
  ['Phượng Các', { group: 'phu', nature: 'cat', power: 5, element: 'Hỏa' }],
  ['Tam Thai', { group: 'phu', nature: 'cat', power: 4, element: 'Kim' }],
  ['Bát Tọa', { group: 'phu', nature: 'cat', power: 4, element: 'Thổ' }],
  ['Ân Quang', { group: 'phu', nature: 'cat', power: 4, element: 'Kim' }],
  ['Thiên Đức', { group: 'phu', nature: 'cat', power: 4, element: 'Mộc' }],
  ['Nguyệt Đức', { group: 'phu', nature: 'cat', power: 4, element: 'Thủy' }],
  ['Giải Thần', { group: 'phu', nature: 'cat', power: 4, element: 'Mộc' }],
  ['Thiên Giải', { group: 'phu', nature: 'cat', power: 4, element: 'Mộc' }],
  ['Địa Giải', { group: 'phu', nature: 'cat', power: 4, element: 'Thổ' }],
  ['Thiên Trù', { group: 'phu', nature: 'cat', power: 4, element: 'Thổ' }],
  ['Thai Phụ', { group: 'phu', nature: 'cat', power: 4, element: 'Thổ' }],
  ['Phong Cáo', { group: 'phu', nature: 'cat', power: 4, element: 'Mộc' }],
  ['Quốc Ấn', { group: 'phu', nature: 'cat', power: 5, element: 'Thổ' }],
  ['Thiên Tài', { group: 'phu', nature: 'cat', power: 4, element: 'Mộc' }],
  ['Thiên Thọ', { group: 'phu', nature: 'cat', power: 4, element: 'Thổ' }],
  ['Thiên Mã', { group: 'phu', nature: 'cat', power: 5, element: 'Hỏa' }],
  ['Thanh Long', { group: 'phu', nature: 'cat', power: 4, element: 'Thủy' }],
  ['Hỷ Thần', { group: 'phu', nature: 'cat', power: 4, element: 'Hỏa' }],
  ['Thiên Hỷ', { group: 'phu', nature: 'cat', power: 4, element: 'Hỏa' }],
  ['Hồng Loan', { group: 'phu', nature: 'cat', power: 5, element: 'Thủy' }],
  ['Đào Hoa', { group: 'phu', nature: 'cat', power: 5, element: 'Mộc' }],
  ['Hóa Lộc', { group: 'hoa', nature: 'cat', power: 8, element: null }],
  ['Hóa Quyền', { group: 'hoa', nature: 'cat', power: 7, element: null }],
  ['Hóa Khoa', { group: 'hoa', nature: 'cat', power: 7, element: null }],

  ['Kình Dương', { group: 'sat', nature: 'hung', power: 8, element: 'Kim' }],
  ['Đà La', { group: 'sat', nature: 'hung', power: 7, element: 'Kim' }],
  ['Hỏa Tinh', { group: 'sat', nature: 'hung', power: 7, element: 'Hỏa' }],
  ['Linh Tinh', { group: 'sat', nature: 'hung', power: 7, element: 'Hỏa' }],
  ['Địa Không', { group: 'sat', nature: 'hung', power: 7, element: 'Hỏa' }],
  ['Địa Kiếp', { group: 'sat', nature: 'hung', power: 7, element: 'Hỏa' }],
  ['Thiên Không', { group: 'sat', nature: 'hung', power: 6, element: 'Hỏa' }],
  ['Hóa Kỵ', { group: 'hoa', nature: 'hung', power: 8, element: null }],
  ['Cô Thần', { group: 'sat', nature: 'hung', power: 5, element: 'Thổ' }],
  ['Quả Tú', { group: 'sat', nature: 'hung', power: 5, element: 'Kim' }],
  ['Tang Môn', { group: 'sat', nature: 'hung', power: 6, element: 'Mộc' }],
  ['Bạch Hổ', { group: 'sat', nature: 'hung', power: 6, element: 'Kim' }],
  ['Thiên Khốc', { group: 'sat', nature: 'hung', power: 5, element: 'Thủy' }],
  ['Thiên Hư', { group: 'sat', nature: 'hung', power: 5, element: 'Thủy' }],
  ['Điếu Khách', { group: 'sat', nature: 'hung', power: 5, element: 'Kim' }],
  ['Tiểu Hao', { group: 'sat', nature: 'hung', power: 5, element: 'Hỏa' }],
  ['Đại Hao', { group: 'sat', nature: 'hung', power: 6, element: 'Hỏa' }],
  ['Phục Binh', { group: 'sat', nature: 'hung', power: 5, element: 'Thủy' }],
  ['Quan Phù', { group: 'sat', nature: 'hung', power: 5, element: 'Hỏa' }],
  ['Quan Phủ', { group: 'sat', nature: 'hung', power: 5, element: 'Hỏa' }],
  ['Thiên Hình', { group: 'sat', nature: 'hung', power: 6, element: 'Kim' }],
  ['Thiên Sứ', { group: 'sat', nature: 'hung', power: 4, element: 'Kim' }],
  ['Kiếp Sát', { group: 'sat', nature: 'hung', power: 6, element: 'Hỏa' }],
  ['Bệnh Phù', { group: 'sat', nature: 'hung', power: 5, element: 'Thổ' }],
  ['Tử Phù', { group: 'sat', nature: 'hung', power: 5, element: 'Thủy' }],
  ['Phá Toái', { group: 'sat', nature: 'hung', power: 5, element: 'Kim' }],
  ['Lưu Hà', { group: 'sat', nature: 'hung', power: 4, element: 'Thủy' }],

  ['Thiếu Dương', { group: 'phu', nature: 'trung', power: 4, element: 'Hỏa' }],
  ['Thiếu Âm', { group: 'phu', nature: 'trung', power: 4, element: 'Thủy' }],
  ['Thiên Riêu', { group: 'phu', nature: 'trung', power: 4, element: 'Thủy' }],
  ['Đẩu Quân', { group: 'phu', nature: 'trung', power: 3, element: 'Kim' }],
  ['Tướng Quân', { group: 'phu', nature: 'trung', power: 4, element: 'Kim' }],
  ['Trực Phù', { group: 'phu', nature: 'trung', power: 3, element: 'Thổ' }],
  ['Tẩu Thư', { group: 'phu', nature: 'trung', power: 3, element: 'Mộc' }],
  ['Đường Phù', { group: 'phu', nature: 'trung', power: 3, element: 'Thổ' }],
  ['Phi Liêm', { group: 'phu', nature: 'trung', power: 3, element: 'Hỏa' }],
  ['Thiên Y', { group: 'phu', nature: 'cat', power: 4, element: 'Mộc' }],
  ['Lâm Quan', { group: 'vong', nature: 'trung', power: 3, element: null }],
  ['Trường Sinh', { group: 'vong', nature: 'cat', power: 4, element: null }],
  ['Mộc Dục', { group: 'vong', nature: 'trung', power: 3, element: null }],
  ['Quan Đới', { group: 'vong', nature: 'trung', power: 3, element: null }],
  ['Đế Vượng', { group: 'vong', nature: 'cat', power: 4, element: null }],
  ['Suy', { group: 'vong', nature: 'trung', power: 2, element: null }],
  ['Bệnh', { group: 'vong', nature: 'hung', power: 3, element: null }],
  ['Tử', { group: 'vong', nature: 'hung', power: 3, element: null }],
  ['Mộ', { group: 'vong', nature: 'trung', power: 2, element: null }],
  ['Tuyệt', { group: 'vong', nature: 'hung', power: 3, element: null }],
  ['Thai', { group: 'vong', nature: 'cat', power: 3, element: null }],
  ['Dưỡng', { group: 'vong', nature: 'cat', power: 3, element: null }],
];

export const STAR_CATALOG = Object.freeze(
  Object.fromEntries(
    STAR_ENTRIES.map(([name, info]) => [
      name,
      Object.freeze({
        name,
        ...info,
      }),
    ]),
  ),
);

export const DEFAULT_STAR_INFO = Object.freeze({
  group: 'phu',
  nature: 'trung',
  power: 3,
  element: null,
  meaning: 'Chưa có dữ liệu chi tiết',
});

function normalizeLookupKey(value) {
  if (typeof value !== 'string') return '';
  return stripVietnameseDiacritics(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
}

const STAR_LOOKUP = new Map();
for (const [name, info] of Object.entries(STAR_CATALOG)) {
  STAR_LOOKUP.set(normalizeLookupKey(name), info);
}

const STAR_ALIASES = {
  taubat: 'Tả Phụ',
  taphu: 'Tả Phụ',
  huubat: 'Hữu Bật',
  hoaky: 'Hóa Kỵ',
  khongkiep: 'Địa Không',
};

for (const [alias, canonical] of Object.entries(STAR_ALIASES)) {
  const info = STAR_CATALOG[canonical];
  if (info) STAR_LOOKUP.set(alias, info);
}

export function getStarInfo(starName) {
  const normalizedName = normalizeStarName(starName);
  const key = normalizeLookupKey(normalizedName);
  const info = STAR_LOOKUP.get(key);

  if (!info) {
    return {
      name: normalizedName || 'Không rõ',
      ...DEFAULT_STAR_INFO,
    };
  }

  return {
    ...info,
  };
}
