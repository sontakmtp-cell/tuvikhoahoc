# Kế Hoạch Triển Khai: Timeline Vận Hạn Trực Quan

## 1) Mục tiêu và phạm vi
- Thêm thanh timeline ngang 2 mức: `Năm` và `Tháng`.
- Mỗi mốc có màu theo mức `thuận/nghịch` (xanh-vàng-đỏ).
- Click mốc timeline sẽ tự động highlight các cung và sao liên quan trong `TuViScene`.
- Phạm vi v1: áp dụng cho màn `Xem Lá Số` (single chart), chưa áp dụng cho màn compare.

## 2) Thiết kế dữ liệu và engine timeline
- Tạo module mới: `src/timeline/timelineEngine.js`.
- Ưu tiên parse dữ liệu có cấu trúc (nếu JSON cung cấp):
  - `fortuneTimeline.years[].months[]` gồm:
    - `year`, `month`, `score` (-100..100), `relatedPalaceIds`, `relatedStars`, `label`, `summary`.
- Fallback khi JSON chưa có timeline chuẩn:
  - Dùng `calculateExtendedPalaceScore` để sinh score nền theo cung.
  - Sinh 12 tháng cho năm hiện tại.
  - `relatedPalaceIds` lấy từ top cung theo |điểm|.
  - `relatedStars` lấy từ sao chủ đạo của các cung đó.
- Chuẩn output cho UI:
  - `years[]`, `monthsByYear[year]`, `defaultSelection`, `legend`.
- Helper bổ sung:
  - `scoreToColor(score)`, `scoreToLevel(score)`.

## 3) UI timeline và tích hợp scene
- Tạo component: `src/timeline/FortuneTimeline.jsx`.
- UI gồm:
  - Switch `Năm / Tháng`.
  - Thanh timeline ngang scroll được trên mobile.
  - Tooltip ngắn khi hover/click: tháng/năm, mức thuận-nghịch, tóm tắt.
- Tích hợp vào `TuViScene`:
  - Thêm state `timelineSelection` chứa `relatedPalaceIds`, `relatedStars`.
  - Khi click mốc timeline:
    - Highlight nhiều cung cùng lúc.
    - Highlight sao liên quan trong các cung đó.
    - Tự focus cung ưu tiên đầu tiên để panel bên phải hiển thị.
- Cập nhật `SatelliteStars` để nhận danh sách sao cần nhấn mạnh (size/emissive cao hơn).
- Cập nhật CSS trong `src/index.css` cho timeline/legend/responsive.

## 4) Luồng tương tác
- Khi mở `Xem Lá Số`:
  - Engine tạo timeline data.
  - Mặc định chọn tháng hiện tại của năm hiện tại.
  - Scene tự highlight theo mốc mặc định.
- Khi đổi năm:
  - Render lại 12 mốc tháng của năm đó.
  - Giữ selection nếu có tháng tương ứng; nếu không chọn tháng 1.
- Khi click mốc:
  - Cập nhật selection.
  - Scene cập nhật highlight tức thì, không reload canvas.

## 5) Kiểm thử và tiêu chí nghiệm thu
- Unit test cho `timelineEngine`:
  - Parse structured timeline đúng.
  - Fallback generation chạy đúng khi thiếu timeline.
  - Màu/level map đúng theo score.
  - `defaultSelection` hợp lệ.
- Integration/manual:
  - Timeline hiển thị đúng năm/tháng.
  - Click mốc đổi active + cập nhật highlight cung/sao trong scene.
  - Mobile scroll timeline mượt, không vỡ layout.
- Acceptance:
  - User nhìn timeline hiểu nhanh tháng nào thuận/nghịch.
  - Click một mốc, highlight cập nhật dưới 200ms.
  - Không làm giảm trải nghiệm hiện tại của `TuViScene`.

## 6) Giả định mặc định
- Dữ liệu JSON hiện tại chưa có timeline chuẩn -> v1 dùng fallback tự sinh.
- Timeline mặc định hiển thị năm hiện tại + 12 tháng.
- Khi sau này JSON có timeline chuẩn, engine ưu tiên dữ liệu chuẩn và giảm fallback.
