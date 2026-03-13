# Tử Vi 3D + So Sánh Tương Hợp

Ứng dụng React + Vite để:

- Xem lá số Tử Vi ở chế độ 3D đơn.
- So sánh 2 lá số JSON theo 2 mode:
1. `Tình Duyên`
2. `Làm Ăn`
- Tính điểm tương hợp theo ngũ hành + sao + tương tác chéo.
- Sinh luận giải văn bản từng cặp cung và tổng thể.
- Xem báo cáo 2D (tabs: Tổng Quan, Chi Tiết, Radar, 3D View).
- Export báo cáo dạng `PNG` hoặc `PDF`.

## Yêu cầu

- Node.js 20+ (khuyến nghị)
- npm 10+

## Chạy dự án

```bash
npm install
npm run dev
```

Mở URL do Vite cung cấp (thường là `http://localhost:5173`).

## Scripts

- `npm run dev`: chạy local dev server.
- `npm run build`: build production.
- `npm run preview`: xem build production local.
- `npm run test`: chạy unit test (`node --test`).
- `npm run lint`: lint toàn repo.

## Luồng dùng tính năng So Sánh

1. Vào tab `So Sánh ★`.
2. Upload 2 file JSON lá số.
3. Chọn mode `Tình Duyên` hoặc `Làm Ăn`.
4. Bấm `Phân Tích`.
5. Xem kết quả qua các tab báo cáo:
- `Tổng Quan`: điểm %, luận giải tổng, cảnh báo dữ liệu.
- `Chi Tiết Cung`: card từng cặp cung, expand xem luận giải.
- `Radar`: biểu đồ radar điểm cặp cung và điểm trọng số.
- `3D View`: hai hệ 3D và đường nối tương hợp/xung khắc.

## Export báo cáo

Trong phần report:

- `Tải ảnh PNG`: xuất ảnh báo cáo.
- `Tải PDF`: xuất báo cáo thành PDF.

Lưu ý:

- Nếu export lỗi trên tab `3D View`, thử chuyển sang tab `Tổng Quan` rồi export lại.
- Nội dung export bám theo report đang hiển thị.

## Cấu trúc chính

- `src/compatibility/data`: catalog sao, ma trận hành, template luận giải.
- `src/compatibility/engine`: engine tính điểm + luận giải + memoization.
- `src/compatibility`: UI report, radar, dual scene 3D, uploader, mode selector.
- `src/shared`: validate JSON và utility cung/sao.

## Kiểm thử

Các test chính nằm ở:

- `src/compatibility/engine/compatibilityEngine.test.js`

Bao gồm:

- Quan hệ ngũ hành.
- Cấu trúc output engine.
- Kịch bản điểm cao/thấp.
- Khác biệt giọng luận giải theo mode.
- Diagnostics cảnh báo dữ liệu.
- Cache memoized cho engine.

