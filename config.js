/* ============================================================
   TÙY CHỈNH NỘI DUNG — chỉ cần sửa các giá trị trong khối này
   (dùng chung cho index.html và album.html)
   ============================================================ */

// Ngày giờ cưới. Định dạng: 'YYYY-MM-DDTHH:mm:ss'
// WEDDING_DATE là mốc đếm ngược (ngày đầu). WEDDING_END_DATE là ngày cuối (để '' nếu chỉ cưới 1 ngày).
const WEDDING_DATE = '2026-10-24T10:00:00';
const WEDDING_END_DATE = '2026-10-25T18:00:00';

// Google Drive: mỗi album/QR là 1 folder riêng.
// Cách thiết lập — xem README mục "3. Ảnh từ Google Drive":
//   1. Folder Drive -> chuột phải -> "Chia sẻ" -> "Bất kỳ ai có đường liên kết" (Viewer)
//   2. Copy ID trong link folder: https://drive.google.com/drive/folders/FOLDER_ID
//   3. Dùng chung 1 API key (Google Cloud Console, bật "Google Drive API", giới hạn theo domain GitHub Pages)
const DRIVE_API_KEY = 'AIzaSyAeEgMTPJJhbUsgxsAry2kml1b4XVv4Kug';

// 4 concept ảnh cưới. `slug` là phần định danh trên URL (album.html?c=slug), không dấu, không khoảng trắng.
// Để folderId '' nếu chưa có ảnh — thẻ vẫn hiện nhưng chưa có ảnh bìa.
const ALBUMS = [
  { slug: 'concept-1', title: 'Concept 1', subtitle: 'Mô tả ngắn', folderId: '1htNJVBclu9UC5s1cvk22WJLVWvnRISPQ' },
  { slug: 'concept-2', title: 'Concept 2', subtitle: 'Mô tả ngắn', folderId: '1qkodPd2b9xAbLaoLqcOVTasr4pOHgtf6' },
  { slug: 'concept-3', title: 'Concept 3', subtitle: 'Mô tả ngắn', folderId: '13Nm-9LLx3lV-_SR0iprOzqESjp7dQo6n' },
  { slug: 'concept-4', title: 'Concept 4', subtitle: 'Mô tả ngắn', folderId: '1llvwZ1AghGa3HAQIUd3HZjv26_yF_Qvo' },
];

// Folder chứa ảnh mã QR nhận mừng cưới. Tên file ảnh sẽ hiện làm chú thích dưới mỗi QR
// (ví dụ "Duy Trần - Vietcombank.png" -> "Duy Trần - Vietcombank"). Có thể để nhiều QR.
const QR_FOLDER_ID = '';

// Link webhook Google Apps Script để ghi RSVP vào Google Sheet (tuỳ chọn).
const RSVP_ENDPOINT = '';

/* ============================================================
   HÀM DÙNG CHUNG
   ============================================================ */

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
