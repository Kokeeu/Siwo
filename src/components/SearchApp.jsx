import { useState, useMemo } from 'react';
import ParticlesBackground from './ParticlesBackground.jsx';

const GLASS =
  'bg-white/80 backdrop-blur-md border border-[#e2e8f0] shadow-[rgba(0,0,0,0.04)_0px_1px_2px_0px]';

export default function SearchApp({ animes }) {
  const [query, setQuery] = useState('');
  const [season, setSeason] = useState('All');
  const [year, setYear] = useState('All');

  const seasons = useMemo(
    () => ['All', ...new Set(animes.map((a) => a.season))],
    [animes]
  );

  const years = useMemo(
    () => ['All', ...new Set(animes.map((a) => a.year).sort((a, b) => b - a))],
    [animes]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return animes.filter((a) => {
      const matchesQuery = a.title.toLowerCase().includes(q);
      const matchesSeason = season === 'All' || a.season === season;
      const matchesYear = year === 'All' || String(a.year) === year;
      return matchesQuery && matchesSeason && matchesYear;
    });
  }, [animes, query, season, year]);

  return (
    <div className="min-h-screen flex flex-col bg-[#ffffff] font-inter">
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#e2e8f0] shadow-[rgba(0,0,0,0.04)_0px_1px_2px_0px]">
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="avatar.jpg"
              alt="Siwö"
              className="w-8 h-8 rounded-full object-cover border border-[#e2e8f0]"
            />
            <span className="font-space font-bold text-[18px] tracking-[0.02em] text-[#1d242f]">
              Siwö
            </span>
          </div>
          <a
            href="https://anitousen.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[14px] font-medium text-[#6b7280] hover:text-[#14b8a6] transition"
          >
            AniTousen
          </a>
        </div>
      </nav>

      <section className="relative overflow-hidden border-b border-[#e2e8f0]">
        <ParticlesBackground />
        <div className="relative max-w-[1200px] mx-auto px-6 py-20 md:py-24 text-center">
          <h1 className="font-space font-black text-[56px] md:text-[64px] leading-[1.13] tracking-[0.1em] text-[#1d242f] mb-6">
            Siwö
          </h1>
          <p className="font-inter text-[18px] leading-[1.5] text-[#6b7280] max-w-xl mx-auto mb-8">
            Openings & Endings de anime
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#explore"
              className="inline-flex items-center justify-center px-6 py-3 bg-[#14b8a6] hover:bg-[#0d9488] text-white font-inter font-semibold text-[15px] rounded-[6px] transition"
            >
              Explorar
            </a>
            <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-[#e2e8f0] rounded-[6px] text-[#111827] font-inter text-[14px]">
              <span className="text-[#6b7280]">$0.00</span>
              <span className="font-medium">Gratis para siempre</span>
            </div>
          </div>
        </div>
      </section>

      <main id="explore" className="flex-1 max-w-[1200px] mx-auto px-6 py-16 w-full">
        <div className="flex flex-col md:flex-row gap-3 mb-10">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar anime..."
            className={`${GLASS} flex-1 px-4 py-3 rounded-[6px] outline-none transition focus:border-[#14b8a6] focus:ring-1 focus:ring-[#14b8a6] text-[#111827] placeholder:text-[#9ca3af]`}
          />
          <select
            value={season}
            onChange={(e) => setSeason(e.target.value)}
            className={`${GLASS} px-4 py-3 rounded-[6px] appearance-none cursor-pointer min-w-[140px] text-[#111827] outline-none focus:border-[#14b8a6] focus:ring-1 focus:ring-[#14b8a6]`}
          >
            {seasons.map((s) => (
              <option key={s} value={s}>
                {s === 'All' ? 'Temporada' : s}
              </option>
            ))}
          </select>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className={`${GLASS} px-4 py-3 rounded-[6px] appearance-none cursor-pointer min-w-[120px] text-[#111827] outline-none focus:border-[#14b8a6] focus:ring-1 focus:ring-[#14b8a6]`}
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y === 'All' ? 'Año' : y}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((anime) => (
            <a
              key={`${anime.title}-${anime.year}`}
              href={anime.downloadLink || anime.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`${GLASS} group rounded-[10px] overflow-hidden transition hover:border-[#14b8a6] hover:shadow-[rgba(0,0,0,0.04)_0px_1px_2px_0px]`}
            >
              {anime.coverImage ? (
                <div className="aspect-[2/3] overflow-hidden">
                  <img
                    src={anime.coverImage}
                    alt={anime.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
              ) : (
                <div className="aspect-[2/3] flex items-center justify-center bg-[#f3f4f6]">
                  <span className="text-[11px] text-[#718096] uppercase tracking-widest">
                    No Image
                  </span>
                </div>
              )}
              <div className="p-3">
                <h2 className="font-inter font-semibold text-[14px] leading-[1.4] text-[#1d242f] mb-1 line-clamp-2 group-hover:text-[#14b8a6] transition"
                >
                  {anime.title}
                </h2>
                <p className="text-[12px] text-[#6b7280]">
                  {anime.season} {anime.year}
                </p>
              </div>
            </a>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-[#6b7280] mt-16 text-[16px]">
            No se encontraron resultados.
          </p>
        )}
      </main>

      <footer className="border-t border-[#e2e8f0] bg-white">
        <div className="max-w-[1200px] mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src="avatar.jpg"
              alt="Siwö"
              className="w-8 h-8 rounded-full object-cover border border-[#e2e8f0]"
            />
            <span className="font-space font-bold text-[16px] text-[#1d242f]">
              Siwö
            </span>
          </div>
          <p className="text-[14px] text-[#6b7280] text-center">
            Datos proporcionados por{' '}
            <a
              href="https://anitousen.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#14b8a6] hover:text-[#0d9488] font-medium transition"
            >
              AniTousen
            </a>
          </p>
          <span className="text-[13px] text-[#9ca3af]">
            {filtered.length} resultados
          </span>
        </div>
      </footer>
    </div>
  );
}
