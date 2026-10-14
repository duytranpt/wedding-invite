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
├── apps-script/Code.gs → backend RSVP (dán vào Apps Script của Google Sheet)
└── README.md    → file này
```

## 1. Sửa thông tin cưới

Mở `config.js`:

- Ngày ở bìa, giờ lễ, địa điểm — nằm trong `SIDES`, riêng cho nhà trai / nhà gái (xem mục 2).
- `ALBUMS` — 4 concept, mỗi concept gồm `slug`, `title`, `subtitle`, `folderId` (ID folder Drive chứa ảnh concept đó).
- `RSVP_ENDPOINT` — Web app URL của Google Apps Script để RSVP ghi vào Google Sheet (xem mục 5).

## 2. Phiên bản nhà trai / nhà gái

Cùng 1 trang, giờ lễ, địa điểm, bản đồ và đếm ngược đổi theo bên gửi thiệp. Sửa trong `SIDES` ở `config.js`:

- `qrFolderId` — folder Drive chứa ảnh QR mừng cưới riêng của bên đó.
- `heroDates` — ngày hiện ở bìa (`end: ''` nếu chỉ 1 ngày), ví dụ nhà trai "24 – 25 Tháng 10, 2026", nhà gái "25 Tháng 10, 2026".
- `events` — danh sách lễ (`kind`, `date` dạng `YYYY-MM-DD`, `time` dạng `HH:mm`, `place`). Thứ ngày tự format tiếng Việt; đếm ngược chạy tới lễ sớm nhất.
- `address` — địa chỉ hiện dưới phần thông tin lễ.
- `brideFirst` — `true` để tên cô dâu đứng trước chú rể (bìa, lời mời, footer, tiêu đề tab).
- `showRsvp` — `false` để ẩn phần Xác nhận tham dự.
- `showMap` — `false` để ẩn bản đồ.

Hiện tại bản nhà gái: tên cô dâu đứng trước, ẩn RSVP, ẩn bản đồ. Tên cô dâu chú rể sửa ở `GROOM` / `BRIDE`.
- `mapEmbed` — link nhúng Google Maps (Maps → Chia sẻ → Nhúng bản đồ → copy phần `src`). Để `''` thì tự tạo bản đồ theo `address`.

Link gửi khách:

| Bên gửi | Link |
|---|---|
| Nhà trai (mặc định) | `https://<username>.github.io/wedding-invite/` |
| Nhà gái | `https://<username>.github.io/wedding-invite/?side=nha-gai` |

Tham số `side` được giữ khi khách bấm qua lại trang album, và được ghi vào cột "Khách nhà" trong Google Sheet RSVP.

## 2.1 Sửa nội dung khác

Mở `index.html`, tìm các phần:

- `.hero` — tên cô dâu chú rể, ảnh bìa (đổi `REPLACE_WITH_GDRIVE_LINK_COVER.jpg` trong CSS `.hero{ background: ... url(...) }`)
- `.gift-box` — mã QR mừng cưới lấy tự động từ `qrFolderId` của từng bên trong `SIDES`

## 3. Ảnh từ Google Drive

Trang đã được cấu hình để **tự động lấy toàn bộ ảnh trong 1 folder Drive** — không cần dán link từng ảnh. Cách thiết lập:

### 3.1 Chia sẻ folder

1. Trên Drive, chuột phải **folder ảnh cưới** → **Chia sẻ** → đổi thành "Bất kỳ ai có đường liên kết" (Viewer)
2. Copy ID trong link folder, đoạn sau `/folders/`:
   ```
   https://drive.google.com/drive/folders/FOLDER_ID
   ```
3. Dán `FOLDER_ID` vào `folderId` của concept tương ứng trong `ALBUMS` (hoặc vào `qrFolderId` của nhà trai / nhà gái trong `SIDES`) trong `config.js`. Mỗi concept và QR là một folder riêng, đều phải chia sẻ "Bất kỳ ai có đường liên kết".

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

## 5. Kết nối RSVP với Google Sheet

Form "Xác nhận tham dự" ghi vào Google Sheet qua Apps Script trong [apps-script/Code.gs](apps-script/Code.gs). **Chưa cấu hình `RSVP_ENDPOINT` thì form không lưu được** — khách bấm gửi sẽ thấy lời nhắn liên hệ trực tiếp.

1. Tạo Google Sheet mới (ví dụ "RSVP đám cưới"), mở **Extensions → Apps Script**
2. Xoá code mặc định, dán toàn bộ nội dung `apps-script/Code.gs` vào, bấm **Save**
3. **Deploy → New deployment** → bánh răng chọn **Web app**:
   - *Execute as*: **Me**
   - *Who has access*: **Anyone** (bắt buộc, để khách không cần đăng nhập Google)
4. Bấm **Deploy**, cấp quyền cho script (Google sẽ cảnh báo "unverified app" → *Advanced → Go to ...*)
5. Copy **Web app URL** (dạng `https://script.google.com/macros/s/.../exec`), dán vào `RSVP_ENDPOINT` trong `config.js`
6. Kiểm tra: mở URL đó trên trình duyệt phải thấy `{"ok":true}`; gửi thử 1 RSVP trên trang → sheet `RSVP` tự tạo với dòng tiêu đề và dòng dữ liệu mới

Sheet có các cột: Thời gian, Họ và tên, Tham dự (Có / Có thể / Không), Số người đi cùng, Lời chúc, User agent, Khách nhà (Nhà trai / Nhà gái).

**Lưu ý khi sửa `Code.gs` sau này:** phải vào **Deploy → Manage deployments → ✏️ Edit → Version: New version → Deploy** thì thay đổi mới có hiệu lực. Làm cách này URL giữ nguyên; nếu tạo "New deployment" thì URL đổi và phải dán lại vào `config.js`.
