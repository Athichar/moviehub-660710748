// ชั้นกลางสำหรับคุยกับ Backend ของทีมเรา (วันนี้คือ mock ที่พอร์ต 4000 สัปดาห์หน้าคือ Go)
// ต่างจาก tmdb.js ตรงที่มี POST / PUT / DELETE และต้องแนบ token สำหรับ endpoint ที่ต้อง login

// '' = origin เดียวกับหน้าเว็บ CRA จะ proxy /api ไปที่ http://localhost:4000 ให้ (ตั้งใน package.json)
// ตอนต่อ Go จริง ตั้ง REACT_APP_API_URL=https://api.ทีมเรา.xyz ใน .env และบน Vercel
const BASE = process.env.REACT_APP_API_URL || '';

// ฟังก์ชันเดียวที่ fetch จริง ทุกฟังก์ชันด้านล่างเรียกผ่านตัวนี้
export async function apiFetch(path, { method = 'GET', body, token } = {}) {
  // 1) headers: บอก server ว่าเราส่ง JSON และแนบ token ถ้ามี
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  // 2) ยิง fetch โดย body ต้องผ่าน JSON.stringify ก่อน (ถ้ามี)
  const res = await fetch(BASE + path, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // 3) 204 = ไม่มี body ให้คืน null
  if (res.status === 204) return null;

  // 4) อ่าน JSON ถ้าไม่ ok ให้ throw พร้อมแนบ status
  let data;
  try {
    data = await res.json();
  } catch (e) {
    const err = new Error(`server ไม่ได้ตอบเป็น JSON (status ${res.status}) ตรวจสอบว่ารัน mock server ที่พอร์ต 4000 แล้วหรือยัง`);
    err.status = res.status;
    throw err;
  }

  if (!res.ok) {
    const err = new Error(data.error);
    err.status = res.status;
    throw err;
  }
  return data;
}

// ---------- สมาชิก ----------
export function register(email, password, displayName) {
  return apiFetch('/api/auth/register', { method: 'POST', body: { email, password, displayName } });
}
export function login(email, password) {
  return apiFetch('/api/auth/login', { method: 'POST', body: { email, password } });   // ได้ { token, member }
}
export function getMe(token) {
  return apiFetch('/api/me', { token });
}

// ---------- รีวิว ----------
export function getReviews(movieId) {
  return apiFetch(`/api/movies/${movieId}/reviews`);                                   // ได้ { items }
}
export function postReview(movieId, text, token) {
  return apiFetch(`/api/movies/${movieId}/reviews`, { method: 'POST', body: { text }, token });
}

// ---------- คะแนน ----------
export function putVote(movieId, score, token) {
  return apiFetch(`/api/movies/${movieId}/vote`, { method: 'PUT', body: { score }, token });
}

// ---------- Wishlist ----------
export function getWishlist(token) {
  return apiFetch('/api/me/wishlist', { token });                                       // ได้ { items }
}
export function addToWishlist(movieId, token) {
  return apiFetch(`/api/me/wishlist/${movieId}`, { method: 'PUT', token });
}
export function removeFromWishlist(movieId, token) {
  return apiFetch(`/api/me/wishlist/${movieId}`, { method: 'DELETE', token });
}

// ---------- หนัง (สัปดาห์หน้า: เปลี่ยนหน้า Movies จาก tmdb.js มาใช้ตัวนี้) ----------
export async function getMovies() {
  const data = await apiFetch('/api/movies');
  return data.items;
}