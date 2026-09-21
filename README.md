# Thiệp Cưới Online — Duy Trần & Thanh Huệ

Trang thiệp cưới tĩnh (HTML/CSS/JS thuần), phong cách **cổ điển sang trọng** — tông ivory, burgundy, gold. Không cần build tool, deploy free trên GitHub Pages.

## Cấu trúc file

```
wedding-invite/
├── index.html   → trang chủ (bìa, lời mời, đếm ngược, 4 concept, chi tiết lễ, RSVP, QR mừng cưới)
├── album.html   → trang xem ảnh của 1 concept (album.html?c=concept-1)
├── config.js    → NƠI SỬA THÔNG TIN: ngày cưới, folder Drive các concept, folder QR, endpoint RSVP
├── script.js    → logic trang chủ
├── album.js     → logic trang album
├── style.css    → giao diện dùng chung
└── README.md    → file này
```

## 1. Sửa thông tin cưới

Mở `config.js`:

- `WEDDING_DATE` / `WEDDING_END_DATE` — ngày giờ cưới (đếm ngược lấy theo `WEDDING_DATE`; ngày hiển thị ở bìa tự format tiếng Việt, ví dụ "24 – 25 Tháng 10, 2026").
- `ALBUMS` — 4 concept, mỗi concept gồm `slug`, `title`, `subtitle`, `folderId` (ID folder Drive chứa ảnh concept đó).
- `QR_FOLDER_ID` — folder Drive chứa ảnh mã QR nhận mừng cưới (để nhiều QR cũng được; tên file hiện làm chú thích).
- `RSVP_ENDPOINT` — (tuỳ chọn) link webhook Google Apps Script để RSVP ghi vào Google Sheet.

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
3. Dán `FOLDER_ID` vào `folderId` của concept tương ứng trong `ALBUMS` (hoặc vào `QR_FOLDER_ID`) trong `config.js`. Mỗi concept và QR là một folder riêng, đều phải chia sẻ "Bất kỳ ai có đường liên kết".

### 3.2 Tạo API key (bắt buộc để gọi được Drive API)

1. Vào [Google Cloud Console](https://console.cloud.google.com/) → tạo project mới (hoặc dùng project có sẵn)
2. Vào **APIs & Services → Library**, tìm **Google Drive API** → bấm **Enable**
3. Vào **APIs & Services → Credentials** → **Create Credentials → API key**
4. Copy API key vừa tạo, dán vào biến `DRIVE_API_KEY` trong `config.js`
5. **Quan trọng** — giới hạn key để tránh bị lộ/lạm dụng (vì key này sẽ nằm public trong `config.js` trên GitHub Pages):
   - Bấm vào key vừa tạo → **Application restrictions** → chọn **Websites** → thêm domain GitHub Pages của bạn, ví dụ `https://<username>.github.io/*`
   - **API restrictions** → chọn **Restrict key** → chỉ tick **Google Drive API**

Với giới hạn này, key chỉ gọi được Drive API và chỉ hoạt động khi request đến từ đúng domain trang thiệp cưới.

### 3.3 Cách hoạt động

`config.js` gọi Drive API v3 (`files.list`) lấy các file ảnh trong từng folder rồi dựng link dạng:
```
https://drive.google.com/thumbnail?id=FILE_ID&sz=w1000
```
- Trang chủ: mỗi concept hiện ảnh đầu tiên (theo thứ tự tên file) làm ảnh bìa, bấm "Xem thêm" mở `album.html?c=<slug>`.
- Trang album: hiện toàn bộ ảnh của concept, bấm ảnh để mở bản lớn.
- Thêm/xoá ảnh trong folder Drive → trang tự cập nhật, không cần sửa code. Đặt tên file `01.jpg`, `02.jpg`… để kiểm soát thứ tự.

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
3. Deploy dưới dạng **Web app**, copy URL, dán vào `RSVP_ENDPOINT` trong `config.js`

Nếu bạn muốn, mình có thể viết sẵn đoạn `Code.gs` cho phần này ở lượt sau — chỉ cần nói.
