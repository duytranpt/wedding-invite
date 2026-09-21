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

// ---- Ngày hiển thị ở hero, lấy tự động từ WEDDING_DATE / WEDDING_END_DATE ----
(function renderHeroDate(){
  const el = document.getElementById('hero-date');
  if(!el) return;
  const cap = t => t.charAt(0).toUpperCase() + t.slice(1);
  const start = new Date(WEDDING_DATE);
  const end = WEDDING_END_DATE ? new Date(WEDDING_END_DATE) : null;
  const wd = d => cap(d.toLocaleDateString('vi-VN', { weekday: 'long' }));

  if(end && end.toDateString() !== start.toDateString()){
    el.textContent = `${wd(start)} – ${wd(end)}, ${start.getDate()} – ${end.getDate()} Tháng ${end.getMonth() + 1}, ${end.getFullYear()}`;
  } else {
    el.textContent = `${wd(start)}, ${start.getDate()} Tháng ${start.getMonth() + 1}, ${start.getFullYear()}`;
  }
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

// ---- Thẻ 4 concept: ảnh bìa = ảnh đầu tiên trong folder, bấm để mở trang album ----
(async function renderAlbumCards(){
  const grid = document.getElementById('album-cards');
  if(!grid) return;

  ALBUMS.forEach(async (album) => {
    const a = document.createElement('a');
    a.className = 'album-card';
    a.href = `album.html?c=${encodeURIComponent(album.slug)}`;
    a.innerHTML = `
      <div class="cover"></div>
      <div class="meta">
        <div class="ttl"></div>
        <div class="sub"></div>
        <span class="more">Xem thêm →</span>
      </div>`;
    a.querySelector('.ttl').textContent = album.title;
    a.querySelector('.sub').textContent = album.subtitle || '';
    grid.appendChild(a);

    const [cover] = await fetchDriveImages(album.folderId, { pageSize: 1 });
    const box = a.querySelector('.cover');
    if(cover){
      const img = document.createElement('img');
      img.src = cover.url;
      img.alt = album.title;
      img.loading = 'lazy';
      box.appendChild(img);
    } else {
      box.textContent = 'Sắp cập nhật';
      box.classList.add('empty');
    }
  });
})();

// ---- Mã QR nhận mừng cưới: lấy toàn bộ ảnh trong QR_FOLDER_ID ----
(async function renderQr(){
  const box = document.getElementById('qr-list');
  if(!box) return;

  const items = await fetchDriveImages(QR_FOLDER_ID, { thumb: 800 });
  if(!items.length) return; // giữ nguyên khung placeholder trong HTML

  box.innerHTML = '';
  items.forEach(item => {
    const fig = document.createElement('figure');
    fig.className = 'qr-item';
    const link = document.createElement('a');
    link.href = item.full;
    link.target = '_blank';
    link.rel = 'noopener';
    const img = document.createElement('img');
    img.src = item.url;
    img.alt = `Mã QR ${item.name}`;
    img.loading = 'lazy';
    link.appendChild(img);
    const cap = document.createElement('figcaption');
    cap.textContent = item.name;
    fig.append(link, cap);
    box.appendChild(fig);
  });
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
