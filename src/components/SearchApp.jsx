import { useState, useMemo, useEffect, useRef } from 'react';
import AnimeModal from './AnimeModal.jsx';
import AnimeSkeleton from './AnimeSkeleton.jsx';
import Footer from './Footer.jsx';
import { formatSeason } from '../utils/season.js';

const BASE_URL = import.meta.env.BASE_URL || '/';
const HOME_URL = BASE_URL.endsWith('/') ? BASE_URL : BASE_URL + '/';
const PAGE_SIZE = 20;

function getPaginationItems(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set([1, totalPages]);
  for (let page = currentPage - 1; page <= currentPage + 1; page += 1) {
    if (page > 1 && page < totalPages) pages.add(page);
  }

  const sortedPages = [...pages].sort((a, b) => a - b);
  return sortedPages.flatMap((page, index) => {
    const previousPage = sortedPages[index - 1];
    return previousPage && page - previousPage > 1 ? ['ellipsis-' + page, page] : [page];
  });
}

function AnimeCard({ anime, index, onClick }) {
  const itemNumber = String(index + 1).padStart(2, '0');
  const entranceDelay = Math.min(index, 12) * 55;

  return (
    <button
      type="button"
      onClick={() => onClick(anime)}
      className="anime-card group relative text-left"
      aria-label={`Ver detalles de ${anime.title}`}
      data-reveal
      style={{ '--reveal-delay': `${entranceDelay}ms` }}
    >
      <div>
        <div className="anime-card-index" aria-hidden="true">
          <span>FILE</span>
          <strong>{itemNumber}</strong>
        </div>

        {anime.coverImage ? (
          <div className="anime-card-cover">
            <img
              src={anime.coverImage}
              alt={anime.title}
              loading="lazy"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
            />
            <span className="anime-card-jp" aria-hidden="true">音楽</span>
          </div>
        ) : (
          <div className="anime-card-cover flex flex-col items-center justify-center bg-[#ece7dc]">
            <img src={`${HOME_URL}placeholder.png`} alt="Sin portada" className="mb-3 h-24 w-24 border-2 border-black object-cover opacity-70" />
            <span className="text-[10px] font-black uppercase tracking-[.2em] text-black/50">No image</span>
          </div>
        )}

        {anime.score != null && anime.score !== undefined && (
          <div className="anime-card-score">
            <span aria-hidden="true">★</span>
            <strong>{Number(anime.score).toFixed(1)}</strong>
          </div>
        )}

        <div className="anime-card-copy">
          <div className="anime-card-meta">
            <span>{formatSeason(anime.season)}</span>
            <span>{anime.year || '—'}</span>
          </div>
          <h2 className="line-clamp-2">
            {anime.title}
          </h2>
          <div className="anime-card-action" aria-hidden="true">
            <span>Ver ficha</span>
            <span>↗</span>
          </div>
        </div>
      </div>
    </button>
  );
}

export default function SearchApp({ initialAnimes = [], animeCount = initialAnimes.length, dataUrl, generatedAt }) {
  const [animes, setAnimes] = useState(initialAnimes);
  const [query, setQuery] = useState('');
  const [season, setSeason] = useState('All');
  const [year, setYear] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
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
    if (!dataUrl) {
      setLoading(false);
      return undefined;
    }

    const controller = new AbortController();

    async function loadCatalog() {
      try {
        const response = await fetch(dataUrl, { signal: controller.signal });
        if (!response.ok) throw new Error(`No se pudo cargar el catálogo (${response.status})`);

        const payload = await response.json();
        const catalog = Array.isArray(payload) ? payload : payload.animes;
        if (Array.isArray(catalog) && catalog.length > 0) setAnimes(catalog);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('No se pudo cargar el catálogo completo; se usará la primera página.', error);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadCatalog();
    return () => controller.abort();
  }, [dataUrl]);

  const openingFromUrl = useRef(false);
  const wasOpen = useRef(false);
  const isFirstSync = useRef(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q') || '';
    const s = params.get('season') || 'All';
    const y = params.get('year') || 'All';
    const page = Number.parseInt(params.get('page') || '1', 10);
    const animeIdx = params.get('anime');
    if (q) setQuery(q);
    if (s !== 'All') setSeason(s);
    if (y !== 'All') setYear(y);
    if (Number.isInteger(page) && page > 1) setCurrentPage(page);
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
    if (currentPage > 1) params.set('page', String(currentPage));
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
  }, [query, season, year, currentPage, selectedAnime, animes]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handlePopState = () => {
      setSelectedAnime((prev) => (prev ? null : prev));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const targets = document.querySelectorAll('[data-reveal]');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reducedMotion || !('IntersectionObserver' in window)) {
      targets.forEach((target) => target.classList.add('is-visible'));
      return;
    }

    targets.forEach((target) => target.classList.add('reveal-pending'));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );

    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [loading, currentPage, query, season, year]);

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
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageStart = (safeCurrentPage - 1) * PAGE_SIZE;
  const displayed = filtered.slice(pageStart, pageStart + PAGE_SIZE);
  const paginationItems = getPaginationItems(safeCurrentPage, totalPages);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const resetFilters = () => {
    setQuery('');
    setSeason('All');
    setYear('All');
    setCurrentPage(1);
  };

  const goToPage = (page) => {
    if (page === safeCurrentPage || page < 1 || page > totalPages) return;
    setCurrentPage(page);

    window.requestAnimationFrame(() => {
      const results = document.getElementById('resultados');
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      results?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
    });
  };

  return (
    <div className="manga-page relative flex min-h-screen flex-col overflow-hidden font-inter">
      <div className="paper-grid pointer-events-none fixed inset-0 z-0" aria-hidden="true" />

      <nav
        className={`manga-nav fixed left-0 right-0 top-0 z-50 transition-transform duration-300 ${scrolled ? 'translate-y-0' : '-translate-y-full'}`}
      >
        <div className="mx-auto flex h-16 max-w-[1320px] items-center justify-between px-5 md:px-8">
          <a href={HOME_URL} className="flex items-center gap-3" aria-label="Volver al inicio de Siwö">
            <img
              src={`${HOME_URL}avatar.jpg`}
              alt="Siwö"
              className="h-9 w-9 border-2 border-black object-cover"
            />
            <span className="font-display text-[18px] uppercase tracking-[-0.04em] text-black">Siwö</span>
          </a>
          <div className="hidden items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] md:flex">
            <span>Anime music index</span>
            <span className="bg-black px-2 py-1 text-white">音楽検索</span>
          </div>
        </div>
      </nav>

      <section className="manga-hero relative z-10 overflow-hidden" aria-labelledby="hero-title">
        <div className="hero-side-label" aria-hidden="true">
          <span>SIWÖ ARCHIVE</span>
          <span>VOL. 01</span>
        </div>

        <div className="hero-shell">
          <div className="hero-kicker">
            <span className="hero-kicker-mark">＊</span>
            <span>Openings / Endings</span>
            <span className="hero-kicker-jp">アニメ音楽</span>
          </div>

          <div className="hero-collage">
            <div className="hero-copy">
              <p className="hero-eyebrow">Tu archivo de canciones anime</p>
              <h1 id="hero-title" className="hero-title">
                <span>ANIME</span>
                <span className="hero-title-blue">SOUND</span>
                <span>ARCHIVE</span>
              </h1>
              <p className="hero-intro">
                Encuentra ese opening que no sale de tu cabeza. Explora, escucha y descarga la música de tus series favoritas.
              </p>

              <div className="hero-stats" aria-label="Resumen del archivo">
                <div><strong>{animeCount}</strong><span>series</span></div>
                <div><strong>OP + ED</strong><span>colección</span></div>
                <div><strong>毎週</strong><span>actualizado</span></div>
              </div>
            </div>

            <div className="hero-art" aria-label="Collage editorial manga de Siwö">
              <div className="hero-art-blue" aria-hidden="true">音</div>
              <div className="hero-art-yellow" aria-hidden="true">楽</div>
              <span className="hero-print-code" aria-hidden="true">FILE 001 / SOUND INDEX</span>
              <span className="hero-registration" aria-hidden="true">＋</span>
              <figure className="hero-frame hero-frame-profile" aria-hidden="true">
                <img src={`${HOME_URL}editorial/hero-panel-profile.jpg`} alt="" />
              </figure>
              <figure className="hero-frame hero-frame-top" aria-hidden="true">
                <img src={`${HOME_URL}editorial/hero-panel-expression.jpg`} alt="" />
              </figure>
              <figure className="hero-frame hero-frame-scene" aria-hidden="true">
                <img src={`${HOME_URL}editorial/hero-panel-scene.jpg`} alt="" />
              </figure>
              <figure className="hero-frame hero-frame-smile" aria-hidden="true">
                <img src={`${HOME_URL}editorial/hero-panel-smile.jpg`} alt="" />
              </figure>
              <figure className="hero-character">
                <img src={`${HOME_URL}editorial/hero-character.jpg`} alt="Personaje manga caminando con una bolsa de anime" />
              </figure>
              <div className="hero-stamp" aria-hidden="true">
                <span>LISTEN</span>
                <strong>01</strong>
              </div>
              <span className="hero-crop-mark hero-crop-mark-a" aria-hidden="true" />
              <span className="hero-crop-mark hero-crop-mark-b" aria-hidden="true" />
            </div>
          </div>

          <a className="hero-scroll" href="#explorar">
            <span>Explorar archivo</span>
            <span aria-hidden="true">↓</span>
          </a>
        </div>
      </section>

      <main id="explorar" className="relative z-10 flex-1 scroll-mt-20">
        <section className="archive-section">
          <div className="archive-margin-note" aria-hidden="true">CATALOGUE / {animeCount} FILES / 音楽</div>
          <div className="mx-auto max-w-[1320px] px-5 py-16 md:px-8 md:py-24">
            <header className="archive-header" data-reveal>
              <div>
                <p className="archive-overline"><span>02</span> Explora la colección</p>
                <h2>ENCUENTRA<br /><span>TU CANCIÓN</span></h2>
              </div>
              <p className="archive-header-jp" aria-hidden="true">検索<br />音楽<br />一覧</p>
            </header>

            <div className="search-panel" role="search" data-reveal>
              <div className="search-field">
                <label htmlFor="anime-search">Buscar por título</label>
                <div className="search-input-wrap">
                  <span aria-hidden="true">⌕</span>
                  <input
                    id="anime-search"
                    type="search"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Escribe el nombre de un anime..."
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={() => {
                        setQuery('');
                        setCurrentPage(1);
                      }}
                      aria-label="Limpiar búsqueda"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>

              <div className="filter-field">
                <label htmlFor="season-filter">Temporada</label>
                <select
                  id="season-filter"
                  value={season}
                  onChange={(e) => {
                    setSeason(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  {seasons.map((s) => (
                    <option key={s} value={s}>{s === 'All' ? 'Todas' : formatSeason(s)}</option>
                  ))}
                </select>
              </div>

              <div className="filter-field">
                <label htmlFor="year-filter">Año</label>
                <select
                  id="year-filter"
                  value={year}
                  onChange={(e) => {
                    setYear(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  {years.map((y) => (
                    <option key={y} value={y}>{y === 'All' ? 'Todos' : y}</option>
                  ))}
                </select>
              </div>

              {hasFilters && (
                <button
                  type="button"
                  className="clear-filters"
                  onClick={resetFilters}
                >
                  Limpiar<br />filtros
                </button>
              )}
            </div>

            <div id="resultados" className="results-bar scroll-mt-24" aria-live="polite" data-reveal>
              <p><strong>{filtered.length}</strong> resultados en el archivo</p>
              <span>
                {filtered.length > 0 ? `Página ${safeCurrentPage} de ${totalPages}` : 'Sin páginas'} // 音楽
              </span>
            </div>

          {loading ? (
            <AnimeSkeleton count={20} />
          ) : (
            <>
              <div className="anime-grid">
                {displayed.map((anime, index) => (
                  <AnimeCard
                    key={`${anime.title}-${anime.year}`}
                    anime={anime}
                    index={pageStart + index}
                    onClick={setSelectedAnime}
                  />
                ))}
              </div>

              {filtered.length > 0 && totalPages > 1 && (
                <nav className="pagination" aria-label="Paginación de resultados">
                  <button
                    type="button"
                    className="pagination-arrow"
                    onClick={() => goToPage(safeCurrentPage - 1)}
                    disabled={safeCurrentPage === 1}
                    aria-label="Ir a la página anterior"
                  >
                    <span aria-hidden="true">←</span>
                    <span>Anterior</span>
                  </button>

                  <div className="pagination-pages">
                    {paginationItems.map((item) => (
                      typeof item === 'number' ? (
                        <button
                          key={item}
                          type="button"
                          className={item === safeCurrentPage ? 'is-current' : ''}
                          onClick={() => goToPage(item)}
                          aria-label={`Ir a la página ${item}`}
                          aria-current={item === safeCurrentPage ? 'page' : undefined}
                        >
                          {String(item).padStart(2, '0')}
                        </button>
                      ) : (
                        <span key={item} className="pagination-ellipsis" aria-hidden="true">•••</span>
                      )
                    ))}
                  </div>

                  <button
                    type="button"
                    className="pagination-arrow"
                    onClick={() => goToPage(safeCurrentPage + 1)}
                    disabled={safeCurrentPage === totalPages}
                    aria-label="Ir a la página siguiente"
                  >
                    <span>Siguiente</span>
                    <span aria-hidden="true">→</span>
                  </button>
                </nav>
              )}

              {filtered.length === 0 && (
                <div className="empty-state">
                  <span aria-hidden="true">404</span>
                  <div>
                    <h3>Sin coincidencias</h3>
                    <p>Prueba con otro título, temporada o año.</p>
                  </div>
                </div>
              )}
            </>
          )}
          </div>
        </section>
      </main>

      <Footer generatedAt={generatedAt} />

      {selectedAnime && (
        <AnimeModal anime={selectedAnime} onClose={() => setSelectedAnime(null)} />
      )}
    </div>
  );
}
