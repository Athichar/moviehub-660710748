import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMovies } from '../api/backend';

export default function Movies() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [genre, setGenre] = useState('ทั้งหมด');

  function load() {
    setLoading(true);
    setError(null);
    getMovies()
      .then(setMovies)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  // แนวหนังสร้างจากข้อมูลจริง ไม่ฮาร์ดโค้ด
  const genres = [...new Set(movies.map((m) => m.genre))];

  // กรองในเครื่อง ไม่เรียก backend ซ้ำ
  const q = query.trim().toLowerCase();
  const filtered = movies.filter((m) => {
    const matchGenre = genre === 'ทั้งหมด' || m.genre === genre;
    const matchText =
      !q ||
      m.title.toLowerCase().includes(q) ||
      (m.titleTh || '').toLowerCase().includes(q);
    return matchGenre && matchText;
  });

  if (error) {
    return (
      <div>
        <p>โหลดข้อมูลไม่สำเร็จ</p>
        <p>{error}</p>
        <button onClick={load}>ลองใหม่</button>
      </div>
    );
  }

  if (loading) return <p>กำลังโหลด...</p>;

  return (
    <div>
      <input
        placeholder="พิมพ์ชื่อหนัง..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div>
        <button onClick={() => setGenre('ทั้งหมด')}>ทั้งหมด</button>
        {genres.map((g) => (
          <button key={g} onClick={() => setGenre(g)}>
            {g}
          </button>
        ))}
      </div>

      <div>
        {filtered.map((m) => (
          <Link key={m.id} to={`/movies/${m.id}`}>
            <h3>{m.title}</h3>
            {m.titleTh && <p>{m.titleTh}</p>}
            <p>
              {m.genre} · {m.year} · {m.rating ?? '-'}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}