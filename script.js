/* ============================================================
   PHẦN LOGIC — không cần sửa bên dưới trừ khi muốn thay đổi hành vi
   ============================================================ */

const eventDateTime = ev => new Date(`${ev.date}T${ev.time}:00`);

// ---- Đếm ngược tới lễ sớm nhất của bên gửi thiệp ----
const COUNTDOWN_TARGET = Math.min(...CURRENT_SIDE.events.map(ev => eventDateTime(ev).getTime()));

function updateCountdown(){
  const target = COUNTDOWN_TARGET;
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

// ---- Ngày hiển thị ở hero, theo heroDates của bên gửi thiệp ----
(function renderHeroDate(){
  const el = document.getElementById('hero-date');
  if(!el) return;
  const cap = t => t.charAt(0).toUpperCase() + t.slice(1);
  const { start: startDate, end: endDate } = CURRENT_SIDE.heroDates;
  const start = new Date(`${startDate}T00:00:00`);
  const end = endDate ? new Date(`${endDate}T00:00:00`) : null;
  const wd = d => cap(d.toLocaleDateString('vi-VN', { weekday: 'long' }));

  if(end && end.toDateString() !== start.toDateString()){
    el.textContent = `${wd(start)} – ${wd(end)}, ${start.getDate()} – ${end.getDate()} Tháng ${end.getMonth() + 1}, ${end.getFullYear()}`;
  } else {
    el.textContent = `${wd(start)}, ${start.getDate()} Tháng ${start.getMonth() + 1}, ${start.getFullYear()}`;
  }
})();

// ---- Tên cô dâu chú rể theo thứ tự của bên gửi thiệp ----
renderCoupleNames();
document.title = `${COUPLE_NAMES} — Thiệp Cưới`;

// ---- Thông tin buổi lễ + bản đồ theo bên gửi thiệp (SIDES trong config.js) ----
(function renderEvents(){
  const list = document.getElementById('events');
  if(!list) return;

  const cap = t => t.charAt(0).toUpperCase() + t.slice(1);
  const pad = n => String(n).padStart(2, '0');

  CURRENT_SIDE.events.forEach(ev => {
    const d = eventDateTime(ev);
    const card = document.createElement('div');
    card.className = 'event-card';
    card.innerHTML = '<div class="kind"></div><div class="time"></div><div class="place"><span class="day"></span><br><span class="where"></span></div>';
    card.querySelector('.kind').textContent = ev.kind;
    card.querySelector('.time').textContent = ev.time;
    card.querySelector('.day').textContent =
      `${cap(d.toLocaleDateString('vi-VN', { weekday: 'long' }))}, ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
    card.querySelector('.where').textContent = ev.place;
    list.appendChild(card);
  });

  const { address, mapEmbed, showMap } = CURRENT_SIDE;
  if(showMap === false){
    document.getElementById('event-map-frame').remove();
  } else {
    const map = document.getElementById('event-map');
    map.src = mapEmbed || `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
    map.title = address;
  }
  document.getElementById('event-address').textContent = address;
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
    a.href = withSide(`album.html?c=${encodeURIComponent(album.slug)}`);
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

// ---- Mã QR nhận mừng cưới: lấy toàn bộ ảnh trong qrFolderId của bên gửi thiệp ----
(async function renderQr(){
  const box = document.getElementById('qr-list');
  if(!box) return;

  const items = await fetchDriveImages(CURRENT_SIDE.qrFolderId, { thumb: 800 });
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
  if(CURRENT_SIDE.showRsvp === false){
    document.getElementById('rsvp')?.remove();
    return;
  }

  const form = document.getElementById('rsvp-form');
  const status = document.getElementById('rsvp-status');
  if(!form) return;

  const attendSelect = form.elements.attend;
  const guestsField = document.getElementById('rsvp-guests-field');
  const submitBtn = form.querySelector('.rsvp-submit');
  const submitLabel = submitBtn.textContent;

  const setStatus = (text, isError = false) => {
    status.textContent = text;
    status.classList.toggle('is-error', isError);
  };

  // Không đi thì không cần hỏi số người đi cùng.
  const syncGuestsField = () => {
    const isAttending = attendSelect.value !== 'no';
    guestsField.hidden = !isAttending;
    if(!isAttending) form.elements.guests.value = 0;
  };
  attendSelect.addEventListener('change', syncGuestsField);
  syncGuestsField();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if(!RSVP_ENDPOINT){
      console.warn('RSVP_ENDPOINT chưa được cấu hình trong config.js — xem README mục 5.');
      setStatus('Form xác nhận đang được cập nhật, bạn nhắn trực tiếp cho cô dâu chú rể giúp mình nhé.', true);
      return;
    }

    const data = Object.fromEntries(new FormData(form).entries());
    data.name = data.name.trim();
    data.side = CURRENT_SIDE.label;
    data.userAgent = navigator.userAgent;
    if(!data.name){
      setStatus('Bạn điền họ tên giúp mình nhé.', true);
      form.elements.name.focus();
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Đang gửi...';
    setStatus('');

    try{
      // Body là string -> Content-Type text/plain: "simple request", không bị CORS preflight
      // (Apps Script không trả lời OPTIONS), nhưng vẫn đọc được response để biết đã ghi thật chưa.
      const res = await fetch(RSVP_ENDPOINT, { method: 'POST', body: JSON.stringify(data) });
      const result = await res.json();
      if(!result.ok) throw new Error(result.error || 'unknown_error');

      form.hidden = true;
      setStatus(data.attend === 'no'
        ? 'Cảm ơn bạn đã báo tin và gửi lời chúc. Chúng mình sẽ nhớ đến bạn trong ngày vui 💌'
        : 'Cảm ơn bạn! Chúng mình rất mong được gặp bạn trong ngày vui 💌');
    } catch(err){
      console.error('RSVP submit error:', err);
      setStatus('Có lỗi khi gửi, bạn thử lại giúp mình nhé.', true);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = submitLabel;
    }
  });
})();
