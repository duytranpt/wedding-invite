/* ============================================================
   TÙY CHỈNH NỘI DUNG — chỉ cần sửa các giá trị trong khối này
   (dùng chung cho index.html và album.html)
   ============================================================ */

// Khoảng ngày cưới hiển thị ở bìa. Định dạng: 'YYYY-MM-DDTHH:mm:ss'
// WEDDING_END_DATE là ngày cuối (để '' nếu chỉ cưới 1 ngày). Đếm ngược lấy theo lễ đầu tiên của bên gửi thiệp (SIDES).
const WEDDING_DATE = '2026-10-24T10:00:00';
const WEDDING_END_DATE = '2026-10-25T18:00:00';

// Google Drive: mỗi album/QR là 1 folder riêng.
// Cách thiết lập — xem README mục "3. Ảnh từ Google Drive":
//   1. Folder Drive -> chuột phải -> "Chia sẻ" -> "Bất kỳ ai có đường liên kết" (Viewer)
//   2. Copy ID trong link folder: https://drive.google.com/drive/folders/FOLDER_ID
//   3. Dùng chung 1 API key (Google Cloud Console, bật "Google Drive API", giới hạn theo domain GitHub Pages)
const DRIVE_API_KEY = 'AIzaSyAeEgMTPJJhbUsgxsAry2kml1b4XVv4Kug';

// Mô tả từng concept — hiện dưới tiêu đề ở thẻ trang chủ và đầu trang album.
const DESC_XUAN = 'Mùa của những khởi đầu — trong trẻo, ngọt ngào và tình yêu vừa nở rộ.';
const DESC_HA = 'Rực rỡ nắng vàng — nồng nhiệt, tự do như tuổi thanh xuân bên nhau.';
const DESC_THU = 'Dịu dàng và trầm lắng — tình yêu của thấu hiểu và lựa chọn đồng hành.';
const DESC_DONG = 'Tĩnh lặng mà ấm áp — chỉ cần có nhau, mùa nào cũng là bình yên.';

// 4 concept ảnh cưới. `slug` là phần định danh trên URL (album.html?c=slug), không dấu, không khoảng trắng.
// Để folderId '' nếu chưa có ảnh — thẻ vẫn hiện nhưng chưa có ảnh bìa.
const ALBUMS = [
  { slug: 'concept-2', title: 'Xuân', subtitle: DESC_XUAN, folderId: '1qkodPd2b9xAbLaoLqcOVTasr4pOHgtf6' },
  { slug: 'concept-3', title: 'Hạ', subtitle: DESC_HA, folderId: '13Nm-9LLx3lV-_SR0iprOzqESjp7dQo6n' },
  { slug: 'concept-1', title: 'Thu', subtitle: DESC_THU , folderId: '1htNJVBclu9UC5s1cvk22WJLVWvnRISPQ' },
  { slug: 'concept-4', title: 'Đông', subtitle: DESC_DONG, folderId: '1llvwZ1AghGa3HAQIUd3HZjv26_yF_Qvo' },
];

// Phiên bản thiệp theo bên gửi — mỗi bên có giờ lễ, địa điểm, bản đồ riêng.
// Chọn bằng link: index.html (mặc định = DEFAULT_SIDE) hoặc index.html?side=nha-gai
//   events[].date: 'YYYY-MM-DD', events[].time: 'HH:mm'
//   showMap: false để ẩn bản đồ (vẫn hiện địa chỉ).
//   mapEmbed: link "Nhúng bản đồ" của Google Maps; để '' thì tự tạo bản đồ theo `address`.
const DEFAULT_SIDE = 'nha-trai';
const SIDES = {
  'nha-trai': {
    label: 'Nhà trai',
    address: 'Thôn 7 Hiền Lương, Phú Thọ',
    showMap: true,
    mapEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d927.7189097173604!2d104.94979029919739!3d21.55171749999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x313361003172d3ed%3A0x37db4b10004a8566!2zTkjDgCBWxIJOIEhPw4EgS2h1IDEyIFh1w6JuIMOBbmc!5e0!3m2!1svi!2s!4v1791771049840!5m2!1svi!2s',
    events: [
      { kind: 'Lễ Thành Hôn', date: '2026-10-25', time: '10:00', place: 'Tư gia nhà trai — Thôn 7 Hiền Lương, Phú Thọ' },
      { kind: 'Tiệc Cưới', date: '2026-10-25', time: '10:30', place: 'Tư gia nhà trai — Thôn 7 Hiền Lương, Phú Thọ' },
    ],
  },
  'nha-gai': {
    label: 'Nhà gái',
    address: 'Thôn 21 Hiền Lương, Phú Thọ',
    showMap: false,
    mapEmbed: '',
    events: [
      { kind: 'Lễ Vu Quy', date: '2026-10-25', time: '09:00', place: 'Tư gia nhà gái — Thôn 21 Hiền Lương, Phú Thọ' },
      { kind: 'Tiệc Cưới', date: '2026-10-25', time: '09:30', place: 'Tư gia nhà gái — Thôn 21 Hiền Lương, Phú Thọ' },
    ],
  },
};

// Folder chứa ảnh mã QR nhận mừng cưới. Tên file ảnh sẽ hiện làm chú thích dưới mỗi QR
// (ví dụ "Duy Trần - Vietcombank.png" -> "Duy Trần - Vietcombank"). Có thể để nhiều QR.
const QR_FOLDER_ID = '1HriU3eTAr46PeMcDFxpStqs6TNIGgLVO';

// Web app URL của Google Apps Script (apps-script/Code.gs) để ghi RSVP vào Google Sheet — xem README mục 5.
// Dạng: 'https://script.google.com/macros/s/XXXX/exec'. Để trống thì form không lưu được.
const RSVP_ENDPOINT = 'https://script.google.com/macros/s/AKfycbxkt3E7mGSbJSOlB_JyE2UAMqygmeRpY3BZzHBeOrjW6d7m5QoXPYaskcf_9RSOHxmM/exec';

/* ============================================================
   HÀM DÙNG CHUNG
   ============================================================ */

// Bên gửi thiệp hiện tại, đọc từ ?side=... (sai/thiếu thì dùng DEFAULT_SIDE).
const CURRENT_SIDE_KEY = (() => {
  const key = new URLSearchParams(location.search).get('side');
  return Object.prototype.hasOwnProperty.call(SIDES, key) ? key : DEFAULT_SIDE;
})();
const CURRENT_SIDE = SIDES[CURRENT_SIDE_KEY];

// Giữ ?side=... khi chuyển giữa trang chủ và trang album, để khách nhà gái không bị quay về bản nhà trai.
function withSide(url){
  if(CURRENT_SIDE_KEY === DEFAULT_SIDE) return url;
  const [path, hash] = url.split('#');
  const sep = path.includes('?') ? '&' : '?';
  return `${path}${sep}side=${encodeURIComponent(CURRENT_SIDE_KEY)}${hash ? '#' + hash : ''}`;
}

// Lấy danh sách ảnh trong 1 folder Drive. Trả về [] nếu thiếu cấu hình hoặc lỗi.
async function fetchDriveImages(folderId, { pageSize = 1000, thumb = 1000 } = {}){
  if(!folderId || !DRIVE_API_KEY) return [];

  const q = `'${folderId}' in parents and mimeType contains 'image/' and trashed = false`;
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&key=${DRIVE_API_KEY}&fields=files(id,name)&orderBy=name&pageSize=${pageSize}`;

  try{
    const res = await fetch(url);
    if(!res.ok) throw new Error(`Drive API trả về lỗi ${res.status}`);
    const data = await res.json();
    return (data.files || []).map(f => ({
      id: f.id,
      name: f.name.replace(/\.[^.]+$/, ''),
      url: `https://drive.google.com/thumbnail?id=${f.id}&sz=w${thumb}`,
      full: `https://drive.google.com/thumbnail?id=${f.id}&sz=w2400`
    }));
  } catch(err){
    console.error(`Không lấy được ảnh từ folder ${folderId}:`, err);
    return [];
  }
}
