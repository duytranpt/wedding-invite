# Thiệp Cưới Online — Duy Trần & Thanh Huệ

Trang thiệp cưới tĩnh (HTML/CSS/JS thuần), phong cách **cổ điển sang trọng** — tông ivory, burgundy, gold. Không cần build tool, deploy free trên GitHub Pages.

## Cấu trúc file

```
wedding-invite/
├── index.html   → nội dung & bố cục trang
├── script.js    → nơi bạn sửa thông tin (ngày cưới, ảnh, endpoint RSVP)
└── README.md    → file này
```

## 1. Sửa thông tin cưới

Mở `script.js`, sửa 3 biến đầu file:

- `WEDDING_DATE` — ngày giờ cưới thật, dùng cho đồng hồ đếm ngược và ngày hiển thị ở trang bìa (tự động format tiếng Việt).
- `PHOTOS` — mảng ảnh cho phần Album. Xem hướng dẫn lấy link Google Drive ngay trong comment của file.
- `RSVP_ENDPOINT` — (tuỳ chọn) link webhook Google Apps Script nếu muốn RSVP tự ghi vào Google Sheet, tương tự cách bạn từng làm với hệ thống đặt sân bóng (`handleSet()` trong `Code.gs`). Có thể viết một `doPost(e)` đơn giản nhận JSON và append vào Sheet.

## 2. Sửa nội dung/địa điểm

Mở `index.html`, tìm các phần:

- `.hero` — tên cô dâu chú rể, ảnh bìa (đổi `REPLACE_WITH_GDRIVE_LINK_COVER.jpg` trong CSS `.hero{ background: ... url(...) }`)
- `.event-card` — giờ lễ Vu Quy / Tiệc Cưới, địa chỉ (hiện đang để `22 Láng Hạ, Đống Đa, Hà Nội` — sửa số nhà/quận cho đúng)
- `.map-frame iframe src` — bản đồ tự lấy theo địa chỉ trong query string, sửa theo địa chỉ thật nếu khác
- `.gift-box` — tên ngân hàng, số tài khoản, và dán ảnh mã QR chuyển khoản (thay đoạn text placeholder bằng thẻ `<img>`)

## 3. Ảnh từ Google Drive

Trang đã được cấu hình để **tự động lấy toàn bộ ảnh trong 1 folder Drive** — không cần dán link từng ảnh. Cách thiết lập:

### 3.1 Chia sẻ folder

1. Trên Drive, chuột phải **folder ảnh cưới** → **Chia sẻ** → đổi thành "Bất kỳ ai có đường liên kết" (Viewer)
2. Copy ID trong link folder, đoạn sau `/folders/`:
   ```
   https://drive.google.com/drive/folders/FOLDER_ID
   ```
3. Dán `FOLDER_ID` vào biến `DRIVE_FOLDER_ID` trong `script.js` (đã điền sẵn theo link bạn gửi, kiểm tra lại cho chắc).

### 3.2 Tạo API key (bắt buộc để gọi được Drive API)

1. Vào [Google Cloud Console](https://console.cloud.google.com/) → tạo project mới (hoặc dùng project có sẵn)
2. Vào **APIs & Services → Library**, tìm **Google Drive API** → bấm **Enable**
3. Vào **APIs & Services → Credentials** → **Create Credentials → API key**
4. Copy API key vừa tạo, dán vào biến `DRIVE_API_KEY` trong `script.js`
5. **Quan trọng** — giới hạn key để tránh bị lộ/lạm dụng (vì key này sẽ nằm public trong `script.js` trên GitHub Pages):
   - Bấm vào key vừa tạo → **Application restrictions** → chọn **Websites** → thêm domain GitHub Pages của bạn, ví dụ `https://<username>.github.io/*`
   - **API restrictions** → chọn **Restrict key** → chỉ tick **Google Drive API**

Với giới hạn này, key chỉ gọi được Drive API và chỉ hoạt động khi request đến từ đúng domain trang thiệp cưới.

### 3.3 Cách hoạt động

`script.js` gọi Drive API v3 (`files.list`) để lấy toàn bộ file ảnh (`mimeType contains 'image/'`) trong `DRIVE_FOLDER_ID`, rồi tự dựng ảnh vào Album bằng link dạng:
```
https://drive.google.com/thumbnail?id=FILE_ID&sz=w1000
```
Thêm/xoá ảnh trong folder Drive → trang tự cập nhật ở lần tải sau, không cần sửa code.

Nếu chưa điền `DRIVE_API_KEY` (hoặc Drive API gọi lỗi), trang tự fallback về mảng `PHOTOS` khai báo thủ công trong `script.js` — dùng theo định dạng link ảnh đơn lẻ:
```
https://drive.google.com/thumbnail?id=FILE_ID&sz=w1000
```

## 4. Deploy lên GitHub Pages (free)

```bash
git init
git add .
git commit -m "Thiệp cưới Duy Trần & Thanh Huệ"
git branch -M main
git remote add origin https://github.com/<username>/wedding-invite.git
git push -u origin main
```

Sau đó vào repo → **Settings → Pages → Branch: main /(root)** → Save.
Link thiệp sẽ có dạng: `https://<username>.github.io/wedding-invite/`

Muốn tên miền ngắn gọn hơn để gửi khách, có thể rút gọn bằng bit.ly hoặc mua domain riêng rồi trỏ CNAME vào GitHub Pages.

## 5. Kết nối RSVP với Google Sheet (tuỳ chọn)

Nếu muốn danh sách khách xác nhận tự đổ vào Google Sheet:

1. Tạo Google Sheet mới, mở **Extensions → Apps Script**
2. Viết hàm `doPost(e)` nhận JSON từ form, append vào sheet (tương tự cấu trúc bạn đã dùng cho `Code.gs` ở dự án đặt sân)
3. Deploy dưới dạng **Web app**, copy URL, dán vào `RSVP_ENDPOINT` trong `script.js`

Nếu bạn muốn, mình có thể viết sẵn đoạn `Code.gs` cho phần này ở lượt sau — chỉ cần nói.
