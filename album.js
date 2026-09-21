// Trang album: đọc ?c=<slug>, lấy toàn bộ ảnh trong folder Drive của concept đó.
(async function renderAlbumPage(){
  const slug = new URLSearchParams(location.search).get('c');
  const album = ALBUMS.find(a => a.slug === slug) || ALBUMS[0];

  document.title = `${album.title} — Album ảnh cưới Duy Trần & Thanh Huệ`;
  document.getElementById('album-title').textContent = album.title;
  document.getElementById('album-sub').textContent = album.subtitle || '';

  // Nút chuyển nhanh giữa các concept
  const nav = document.getElementById('album-switch');
  ALBUMS.forEach(a => {
    const link = document.createElement('a');
    link.href = `album.html?c=${encodeURIComponent(a.slug)}`;
    link.textContent = a.title;
    if(a.slug === album.slug) link.setAttribute('aria-current', 'page');
    nav.appendChild(link);
  });

  const status = document.getElementById('album-status');
  const grid = document.getElementById('gallery-grid');
  const photos = await fetchDriveImages(album.folderId);

  if(!photos.length){
    status.textContent = 'Album này sắp được cập nhật.';
    return;
  }
  status.remove();

  photos.forEach((p, i) => {
    const fig = document.createElement('figure');
    const link = document.createElement('a');
    link.href = p.full;
    link.target = '_blank';
    link.rel = 'noopener';
    const img = document.createElement('img');
    img.src = p.url;
    img.alt = `${album.title} — ảnh ${i + 1}`;
    img.loading = 'lazy';
    link.appendChild(img);
    fig.appendChild(link);
    grid.appendChild(fig);
  });
})();
