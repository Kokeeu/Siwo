import { useCallback, useMemo, useReducer } from 'react';
import AnimeModal from './AnimeModal.jsx';
import Footer from './Footer.jsx';
import ArchiveResults from './search/ArchiveResults.jsx';
import HeaderNav from './search/HeaderNav.jsx';
import Hero from './search/Hero.jsx';
import SearchControls from './search/SearchControls.jsx';
import { useCatalog } from '../hooks/useCatalog.js';
import { useReveal } from '../hooks/useReveal.js';
import { useScrolledHeader } from '../hooks/useScrolledHeader.js';
import { useSearchUrlState } from '../hooks/useSearchUrlState.js';
import { INITIAL_SEARCH_STATE, searchReducer } from '../state/searchState.js';
import {
  filterCatalog,
  getAvailableSeasons,
  getAvailableYears,
  getPaginationItems,
  paginateCatalog,
} from '../utils/catalog.js';

export default function SearchApp({
  initialAnimes = [],
  animeCount = initialAnimes.length,
  dataUrl,
  generatedAt,
}) {
  const { animes, loading } = useCatalog(initialAnimes, dataUrl);
  const [searchState, dispatch] = useReducer(searchReducer, INITIAL_SEARCH_STATE);
  const scrolled = useScrolledHeader();

  const seasons = useMemo(() => getAvailableSeasons(animes), [animes]);
  const years = useMemo(() => getAvailableYears(animes), [animes]);
  const filtered = useMemo(
    () => filterCatalog(animes, searchState),
    [animes, searchState.query, searchState.season, searchState.year]
  );
  const page = paginateCatalog(filtered, searchState.currentPage);
  const paginationItems = getPaginationItems(page.currentPage, page.totalPages);
  const selectedAnime = searchState.selectedAnimeIndex === null
    ? null
    : animes[searchState.selectedAnimeIndex] || null;
  const hasFilters =
    searchState.query.trim() !== '' ||
    searchState.season !== 'All' ||
    searchState.year !== 'All';

  useSearchUrlState(
    {
      ...searchState,
      currentPage: page.currentPage,
    },
    dispatch
  );
  useReveal(
    `${loading}:${page.currentPage}:${searchState.query}:${searchState.season}:${searchState.year}`
  );

  const handleAnimeClick = useCallback(
    (anime) => {
      const index = animes.indexOf(anime);
      if (index >= 0) dispatch({ type: 'open-anime', index });
    },
    [animes]
  );

  const closeModal = useCallback(() => {
    dispatch({ type: 'close-anime' });
  }, []);

  const goToPage = (nextPage) => {
    if (nextPage === page.currentPage || nextPage < 1 || nextPage > page.totalPages) return;
    dispatch({ type: 'set-page', page: nextPage });

    window.requestAnimationFrame(() => {
      const results = document.getElementById('resultados');
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      results?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
    });
  };

  return (
    <div className="manga-page relative flex min-h-screen flex-col overflow-hidden font-inter">
      <div className="paper-grid pointer-events-none fixed inset-0 z-0" aria-hidden="true" />

      <HeaderNav scrolled={scrolled} />
      <Hero animeCount={animeCount} />

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

            <SearchControls
              query={searchState.query}
              season={searchState.season}
              year={searchState.year}
              seasons={seasons}
              years={years}
              hasFilters={hasFilters}
              onQueryChange={(query) => dispatch({ type: 'set-query', query })}
              onSeasonChange={(season) => dispatch({ type: 'set-season', season })}
              onYearChange={(year) => dispatch({ type: 'set-year', year })}
              onReset={() => dispatch({ type: 'reset-filters' })}
            />

            <ArchiveResults
              loading={loading}
              filteredCount={filtered.length}
              currentPage={page.currentPage}
              totalPages={page.totalPages}
              displayed={page.items}
              pageStart={page.start}
              paginationItems={paginationItems}
              onAnimeClick={handleAnimeClick}
              onPageChange={goToPage}
            />
          </div>
        </section>
      </main>

      <Footer generatedAt={generatedAt} />

      {selectedAnime && (
        <AnimeModal anime={selectedAnime} onClose={closeModal} />
      )}
    </div>
  );
}
