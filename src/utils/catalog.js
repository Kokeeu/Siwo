export const PAGE_SIZE = 20;

const SEASON_ORDER = ['Winter', 'Spring', 'Summer', 'Fall'];

export function getPaginationItems(currentPage, totalPages) {
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
    return previousPage && page - previousPage > 1
      ? [`ellipsis-${page}`, page]
      : [page];
  });
}

export function getAvailableSeasons(animes) {
  const availableSeasons = new Set(animes.map((anime) => anime.season));
  const orderedSeasons = SEASON_ORDER.filter((season) => availableSeasons.delete(season));
  return ['All', ...orderedSeasons, ...availableSeasons];
}

export function getAvailableYears(animes) {
  const years = animes.map((anime) => anime.year).sort((a, b) => b - a);
  return ['All', ...new Set(years)];
}

export function filterCatalog(animes, { query, season, year }) {
  const normalizedQuery = query.trim().toLowerCase();

  return animes.filter((anime) => {
    const matchesQuery = anime.title.toLowerCase().includes(normalizedQuery);
    const matchesSeason = season === 'All' || anime.season === season;
    const matchesYear = year === 'All' || String(anime.year) === year;
    return matchesQuery && matchesSeason && matchesYear;
  });
}

export function paginateCatalog(animes, requestedPage, pageSize = PAGE_SIZE) {
  const totalPages = Math.max(1, Math.ceil(animes.length / pageSize));
  const currentPage = Math.min(Math.max(1, requestedPage), totalPages);
  const start = (currentPage - 1) * pageSize;

  return {
    currentPage,
    totalPages,
    start,
    items: animes.slice(start, start + pageSize),
  };
}
