import { useState, useMemo, useEffect, useRef } from 'react';
import ParticlesBackground from './ParticlesBackground.jsx';
import AnimeModal from './AnimeModal.jsx';
import AnimeSkeleton from './AnimeSkeleton.jsx';
import Footer from './Footer.jsx';

const BASE_URL = import.meta.env.BASE_URL || '/';
const HOME_URL = BASE_URL.endsWith('/') ? BASE_URL : BASE_URL + '/';

const GLASS =
  'bg-white/70 backdrop-blur-xl border border-white/60 shadow-[rgba(0,0,0,0.06)_0px_4px_12px_-2px]';

function AnimeCard({ anime, index, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(anime)}
      className={`group relative overflow-hidden rounded-[14px] border border-white/60 bg-white/70 text-left shadow-[rgba(0,0,0,0.06)_0px_4px_12px_-2px] backdrop-blur-xl transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-[#14b8a6]/40 hover:shadow-[rgba(20,184,166,0.12)_0px_12px_24px_-4px]`}
    >
      <div className="animate-fade-in-up" style={{ animationDelay: `${index * 40}ms` }}>
        {anime.coverImage ? (
          <div className="aspect-[2/3] overflow-hidden">
            <img
              src={anime.coverImage}
              alt={anime.title}
              loading="lazy"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          </div>
        ) : (
          <div className="aspect-[2/3] flex flex-col items-center justify-center bg-gradient-to-br from-[#f8fafc] to-[#e2e8f0]">
            <img src={`${HOME_URL}placeholder.png`} alt="No image" className="mb-3 h-24 w-24 rounded-full opacity-70" />
            <span className="text-[11px] uppercase tracking-widest text-[#9ca3af]">No Image</span>
          </div>
        )}

        {anime.score != null && anime.score !== undefined && (
          <div className="pointer-events-none absolute top-2 right-2 z-20 flex items-center gap-1 rounded-full border border-white/60 bg-white/85 px-2 py-0.5 shadow-sm backdrop-blur-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor" stroke="none" style={{ color: '#f59e0b' }}>
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
            <span className="font-space text-[11px] font-bold text-[#1d242f]">
              {Number(anime.score).toFixed(1)}
            </span>
          </div>
        )}

        <div className="p-3">
          <h2 className="line-clamp-2 font-inter text-[14px] font-semibold leading-[1.4] text-[#1d242f] transition group-hover:text-[#14b8a6]">
            {anime.title}
          </h2>
          <p className="mt-1 text-[12px] text-[#6b7280]">
            {anime.season} {anime.year}
          </p>
        </div>
      </div>
    </button>
  );
}

export default function SearchApp({ animes, generatedAt }) {
  const [query, setQuery] = useState('');
  const [season, setSeason] = useState('All');
  const [year, setYear] = useState('All');
  const [showAll, setShowAll] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [selectedAnime, setSelectedAnime] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 250);
    return () => clearTimeout(timer);
  }, []);

  const openingFromUrl = useRef(false);
  const wasOpen = useRef(false);
  const isFirstSync = useRef(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q') || '';
    const s = params.get('season') || 'All';
    const y = params.get('year') || 'All';
    const animeIdx = params.get('anime');
    if (q) setQuery(q);
    if (s !== 'All') setSeason(s);
    if (y !== 'All') setYear(y);
    if (animeIdx !== null) {
      const idx = parseInt(animeIdx, 10);
      if (!isNaN(idx) && idx >= 0 && idx < animes.length) {
        openingFromUrl.current = true;
        setSelectedAnime(animes[idx]);
      }
    }
  }, [animes]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isFirstSync.current) {
      isFirstSync.current = false;
      wasOpen.current = !!selectedAnime;
      return;
    }
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (season !== 'All') params.set('season', season);
    if (year !== 'All') params.set('year', String(year));
    const isOpen = !!selectedAnime;
    if (selectedAnime) {
      const idx = animes.indexOf(selectedAnime);
      if (idx >= 0) params.set('anime', String(idx));
    }
    const search = params.toString();
    const url = window.location.pathname + (search ? '?' + search : '');
    if (isOpen && !wasOpen.current && !openingFromUrl.current) {
      window.history.pushState(null, '', url);
    } else {
      window.history.replaceState(null, '', url);
    }
    wasOpen.current = isOpen;
    openingFromUrl.current = false;
  }, [query, season, year, selectedAnime, animes]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handlePopState = () => {
      setSelectedAnime((prev) => (prev ? null : prev));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
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
    <div className="relative flex min-h-screen flex-col overflow-hidden font-inter">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -left-[20%] top-[5%] h-[500px] w-[500px] rounded-full bg-[#14b8a6]/8 blur-[120px]" />
        <div className="absolute -right-[10%] top-[30%] h-[400px] w-[400px] rounded-full bg-[#38bdf8]/8 blur-[120px]" />
        <div className="absolute bottom-[5%] left-[30%] h-[450px] w-[450px] rounded-full bg-[#f59e0b]/8 blur-[140px]" />
      </div>

      <nav
        className={`fixed top-0 left-0 right-0 z-50 border-b border-white/60 bg-white/80 shadow-[rgba(0,0,0,0.04)_0px_1px_2px_0px] backdrop-blur-xl transition-transform duration-300 ${scrolled ? 'translate-y-0' : '-translate-y-full'}`}
      >
        <div className="mx-auto flex h-16 max-w-[1200px] items-center px-6">
          <a href={HOME_URL} className="flex items-center gap-3">
            <img
              src={`${HOME_URL}avatar.jpg`}
              alt="Siwö"
              className="h-8 w-8 rounded-full border border-[#e2e8f0] object-cover"
            />
            <span className="font-space text-[18px] font-bold tracking-[0.02em] text-[#1d242f]">
              Siwö
            </span>
          </a>
        </div>
      </nav>

      <section className="relative z-10 overflow-hidden">
        <ParticlesBackground />
        <div className="relative mx-auto max-w-[1200px] px-6 py-14 text-center md:py-20">
          <div className="mx-auto mb-5 h-fit w-fit">
            <img
              src={`${HOME_URL}avatar.jpg`}
              alt="Siwö"
              className="h-16 w-16 rounded-full border border-[#e2e8f0] object-cover shadow-[0_8px_30px_rgba(0,0,0,0.08)] md:h-24 md:w-24"
            />
          </div>
          <h1 className="mb-4 font-space text-[42px] font-black leading-[1.13] tracking-[0.1em] text-[#1d242f] md:text-[64px]">
            Siwö
          </h1>
          <p className="mx-auto max-w-xl font-inter text-[16px] leading-[1.5] text-[#6b7280] md:text-[18px]">
            Openings & Endings de anime
          </p>
        </div>
      </section>

      <main className="relative z-10 flex-1">
        <div className="mx-auto max-w-[1200px] px-6 py-16">
          <div className="mb-10 flex flex-col gap-3 md:flex-row">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar anime..."
              className={`${GLASS} flex-1 rounded-[12px] px-4 py-3 text-[#111827] placeholder:text-[#9ca3af] outline-none transition focus:border-[#14b8a6] focus:ring-2 focus:ring-[#14b8a6]/20`}
            />
            <select
              value={season}
              onChange={(e) => setSeason(e.target.value)}
              className={`${GLASS} min-w-[140px] cursor-pointer appearance-none rounded-[12px] px-4 py-3 text-[#111827] outline-none focus:border-[#14b8a6] focus:ring-2 focus:ring-[#14b8a6]/20`}
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
              className={`${GLASS} min-w-[120px] cursor-pointer appearance-none rounded-[12px] px-4 py-3 text-[#111827] outline-none focus:border-[#14b8a6] focus:ring-2 focus:ring-[#14b8a6]/20`}
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y === 'All' ? 'Año' : y}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <AnimeSkeleton count={20} />
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {displayed.map((anime, index) => (
                  <AnimeCard
                    key={`${anime.title}-${anime.year}`}
                    anime={anime}
                    index={index}
                    onClick={setSelectedAnime}
                  />
                ))}
              </div>

              {showLoadMore && (
                <div className="mt-10 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setShowAll(true)}
                    className="relative overflow-hidden rounded-[12px] border border-[#e2e8f0] bg-white px-8 py-3 font-inter text-[15px] font-semibold text-[#1d242f] shadow-sm transition hover:-translate-y-0.5 hover:border-[#14b8a6] hover:text-[#14b8a6] hover:shadow-md"
                  >
                    Ver más
                  </button>
                </div>
              )}

              {filtered.length === 0 && (
                <div className="mt-20 flex flex-col items-center text-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mb-3 h-12 w-12 text-[#9ca3af]"
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
                  <p className="text-[16px] text-[#6b7280]">
                    No se encontraron resultados.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer generatedAt={generatedAt} />

      {selectedAnime && (
        <AnimeModal anime={selectedAnime} onClose={() => setSelectedAnime(null)} />
      )}
    </div>
  );
}
