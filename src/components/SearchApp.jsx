import { useState, useMemo, useEffect } from 'react';
import ParticlesBackground from './ParticlesBackground.jsx';

const GLASS =
  'bg-white/80 backdrop-blur-md border border-[#e2e8f0] shadow-[rgba(0,0,0,0.04)_0px_1px_2px_0px]';

export default function SearchApp({ animes }) {
  const [query, setQuery] = useState('');
  const [season, setSeason] = useState('All');
  const [year, setYear] = useState('All');
  const [showAll, setShowAll] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const hasFilters = query.trim() !== '' || season !== 'All' || year !== 'All';
  const displayed = hasFilters
    ? filtered
    : filtered.slice(0, showAll ? filtered.length : 20);
  const showLoadMore = !hasFilters && filtered.length > 20 && !showAll;

  return (
    <div className="min-h-screen flex flex-col bg-[#ffffff] font-inter">
      <nav
        className={`fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#e2e8f0] shadow-[rgba(0,0,0,0.04)_0px_1px_2px_0px] transition-transform duration-300 ${scrolled ? 'translate-y-0' : '-translate-y-full'}`}
      >
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center gap-3">
          <img
            src="avatar.jpg"
            alt="Siwö"
            className="w-8 h-8 rounded-full object-cover border border-[#e2e8f0]"
          />
          <span className="font-space font-bold text-[18px] tracking-[0.02em] text-[#1d242f]">
            Siwö
          </span>
        </div>
      </nav>

      <section className="relative overflow-hidden">
        <ParticlesBackground />
        <div className="relative max-w-[1200px] mx-auto px-6 py-14 md:py-20 text-center">
          <img
            src="avatar.jpg"
            alt="Siwö"
            className="w-16 h-16 md:w-24 md:h-24 rounded-full object-cover border border-[#e2e8f0] mx-auto mb-5"
          />
          <h1 className="font-space font-black text-[42px] md:text-[64px] leading-[1.13] tracking-[0.1em] text-[#1d242f] mb-4">
            Siwö
          </h1>
          <p className="font-inter text-[16px] md:text-[18px] leading-[1.5] text-[#6b7280] max-w-xl mx-auto">
            Openings & Endings de anime
          </p>
        </div>
      </section>

      <main className="flex-1 bg-[#ffffff] w-full">
        <div className="max-w-[1200px] mx-auto px-6 py-16 w-full">
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
          {displayed.map((anime, index) => (
            <a
              key={`${anime.title}-${anime.year}`}
              href={anime.downloadLink || anime.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`${GLASS} group rounded-[10px] overflow-hidden transition duration-300 hover:border-[#14b8a6] hover:shadow-lg hover:-translate-y-0.5 animate-fade-in-up`}
              style={{ animationDelay: `${index * 50}ms` }}
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
                <div className="aspect-[2/3] flex flex-col items-center justify-center bg-gradient-to-br from-[#f3f4f6] to-[#e5e7eb]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-14 h-14 mb-3"
                    viewBox="0 0 100 100"
                    fill="none"
                  >
                    <path
                      d="M50 10 C30 10 15 28 15 55 C15 70 22 82 32 88 C38 91 44 92 50 92 C56 92 62 91 68 88 C78 82 85 70 85 55 C85 28 70 10 50 10 Z"
                      stroke="#9ca3af"
                      strokeWidth="3"
                      fill="#f3f4f6"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M22 45 C22 30 35 18 50 18 C65 18 78 30 78 45 C78 45 70 35 50 35 C30 35 22 45 22 45"
                      stroke="#9ca3af"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M18 50 C16 65 20 80 28 86"
                      stroke="#9ca3af"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M82 50 C84 65 80 80 72 86"
                      stroke="#9ca3af"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <circle cx="36" cy="56" r="5" fill="#14b8a6" />
                    <circle cx="64" cy="56" r="5" fill="#14b8a6" />
                    <circle cx="37" cy="54" r="1.5" fill="#ffffff" />
                    <circle cx="65" cy="54" r="1.5" fill="#ffffff" />
                    <path
                      d="M40 72 Q50 80 60 72"
                      stroke="#9ca3af"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="text-[11px] text-[#9ca3af] uppercase tracking-widest">
                    No Image
                  </span>
                </div>
              )}
              <div className="p-3">
                <h2
                  className="font-inter font-semibold text-[14px] leading-[1.4] text-[#1d242f] mb-1 line-clamp-2 group-hover:text-[#14b8a6] transition"
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

        {showLoadMore && (
          <div className="flex justify-center mt-10">
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="px-6 py-3 bg-white border border-[#e2e8f0] hover:border-[#14b8a6] hover:text-[#14b8a6] text-[#1d242f] font-inter font-semibold text-[15px] rounded-[6px] transition"
            >
              Ver más
            </button>
          </div>
        )}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center text-center mt-20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-12 h-12 text-[#9ca3af] mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <p className="text-[#6b7280] text-[16px]">
              No se encontraron resultados.
            </p>
          </div>
        )}
      </div>
      </main>

      <footer className="border-t border-[#e2e8f0] bg-white">
        <div className="max-w-[1200px] mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
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
        </div>
      </footer>
    </div>
  );
}
