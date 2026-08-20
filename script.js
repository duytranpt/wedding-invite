/* ============================================================
   TÙY CHỈNH NỘI DUNG — chỉ cần sửa các giá trị trong khối này
   ============================================================ */

// Ngày giờ cưới (dùng cho đếm ngược). Định dạng: 'YYYY-MM-DDTHH:mm:ss'
const WEDDING_DATE = '2026-09-20T10:00:00';

// Album ảnh tự động lấy TOÀN BỘ ảnh từ 1 folder Google Drive (không cần dán từng link).
// Cách thiết lập — xem hướng dẫn chi tiết trong README mục "3. Ảnh từ Google Drive":
//   1. Folder Drive -> chuột phải -> "Chia sẻ" -> đổi thành "Bất kỳ ai có đường liên kết"
//   2. Copy ID trong link folder: https://drive.google.com/drive/folders/FOLDER_ID
//   3. Tạo API key ở Google Cloud Console (bật "Google Drive API", giới hạn key theo domain
//      GitHub Pages của bạn để tránh bị người khác lạm dụng key)
//   4. Dán FOLDER_ID và API_KEY vào 2 biến bên dưới
const DRIVE_FOLDER_ID = '1CphJRX9hxMk4tJomzIr5HXPoNlYIzb4D';
const DRIVE_API_KEY = 'AIzaSyAeEgMTPJJhbUsgxsAry2kml1b4XVv4Kug'; // dán API key vào đây

// Danh sách ảnh dự phòng, dùng khi chưa cấu hình DRIVE_API_KEY hoặc khi gọi Drive API lỗi.
// Có thể để trống — trang sẽ hiện khung placeholder đẹp thay thế.
const PHOTOS = [
  // { url: 'https://drive.google.com/thumbnail?id=XXXXXXXX&sz=w1000', alt: 'Ảnh cưới 1' },
];

// Link webhook Google Apps Script để ghi RSVP vào Google Sheet (tuỳ chọn).
// Nếu bạn đã có sẵn Apps Script từ dự án đặt sân bóng, có thể tái dùng
// pattern doPost(e) tương tự. Để trống '' nếu chưa muốn nối RSVP tự động —
// khi đó form sẽ chỉ hiện lời cảm ơn mà không gửi đi đâu.
const RSVP_ENDPOINT = '';

/* ============================================================
   PHẦN LOGIC — không cần sửa bên dưới trừ khi muốn thay đổi hành vi
   ============================================================ */

// ---- Đếm ngược ----
function updateCountdown(){
  const target = new Date(WEDDING_DATE).getTime();
  const now = Date.now();
  const diff = Math.max(0, target - now);

  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);

  const pad = n => String(n).padStart(2, '0');
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = pad(val); };
  set('cd-days', d);
  set('cd-hours', h);
  set('cd-mins', m);
  set('cd-secs', s);
}
updateCountdown();
setInterval(updateCountdown, 1000);

// ---- Ngày hiển thị ở hero, lấy tự động từ WEDDING_DATE ----
(function renderHeroDate(){
  const el = document.getElementById('hero-date');
  if(!el) return;
  const date = new Date(WEDDING_DATE);
  const weekday = date.toLocaleDateString('vi-VN', { weekday: 'long' });
  const formatted = date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' });
  const cap = weekday.charAt(0).toUpperCase() + weekday.slice(1);
  el.textContent = `${cap}, ${formatted}`;
})();

// ---- Hiệu ứng xuất hiện khi cuộn ----
(function scrollReveal(){
  const items = document.querySelectorAll('.reveal');
  if(!('IntersectionObserver' in window)){
    items.forEach(el => el.classList.add('is-visible'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  items.forEach(el => io.observe(el));
})();

// ---- Lấy toàn bộ ảnh từ 1 folder Google Drive qua Drive API v3 ----
async function fetchDriveFolderPhotos(){
  if(!DRIVE_FOLDER_ID || !DRIVE_API_KEY) return null;

  const q = `'${DRIVE_FOLDER_ID}' in parents and mimeType contains 'image/' and trashed = false`;
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&key=${DRIVE_API_KEY}&fields=files(id,name)&orderBy=name&pageSize=1000`;

  try{
    const res = await fetch(url);
    if(!res.ok) throw new Error(`Drive API trả về lỗi ${res.status}`);
    const data = await res.json();
    const files = data.files || [];
    return files.map(f => ({
      url: `https://drive.google.com/thumbnail?id=${f.id}&sz=w1000`,
      alt: f.name
    }));
  } catch(err){
    console.error('Không lấy được ảnh từ Drive folder, dùng danh sách dự phòng PHOTOS:', err);
    return null;
  }
}

// ---- Dựng album ảnh ----
(async function renderGallery(){
  const grid = document.getElementById('gallery-grid');
  if(!grid) return;

  const drivePhotos = await fetchDriveFolderPhotos();
  const photos = (drivePhotos && drivePhotos.length) ? drivePhotos : PHOTOS;

  const slots = Math.max(photos.length, 6);
  for(let i = 0; i < slots; i++){
    const fig = document.createElement('figure');
    const photo = photos[i];
    if(photo){
      const img = document.createElement('img');
      img.src = photo.url;
      img.alt = photo.alt || `Ảnh cưới ${i + 1}`;
      img.loading = 'lazy';
      fig.appendChild(img);
    } else {
      const note = document.createElement('div');
      note.className = 'ph-note';
      note.textContent = `Ảnh ${i + 1}\n(thêm link Drive trong script.js)`;
      fig.appendChild(note);
    }
    grid.appendChild(fig);
  }
})();

// ---- Xử lý RSVP ----
(function handleRsvp(){
  const form = document.getElementById('rsvp-form');
  const status = document.getElementById('rsvp-status');
  if(!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    data.timestamp = new Date().toISOString();

    const submitBtn = form.querySelector('.rsvp-submit');
    submitBtn.disabled = true;

    try{
      if(RSVP_ENDPOINT){
        await fetch(RSVP_ENDPOINT, {
          method: 'POST',
          mode: 'no-cors', // Apps Script webhook thường cần no-cors từ trình duyệt
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
      }
      status.textContent = 'Cảm ơn bạn! Lời xác nhận đã được gửi tới cô dâu chú rể 💌';
      form.reset();
    } catch(err){
      status.textContent = 'Có lỗi khi gửi, bạn thử lại giúp mình nhé.';
      console.error('RSVP submit error:', err);
    } finally {
      submitBtn.disabled = false;
    }
  });
})();
