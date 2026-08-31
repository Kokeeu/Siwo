export const INITIAL_SEARCH_STATE = Object.freeze({
  query: '',
  season: 'All',
  year: 'All',
  currentPage: 1,
  selectedAnimeIndex: null,
});

function readNonNegativeInteger(value) {
  if (value === null || !/^\d+$/.test(value)) return null;
  const number = Number(value);
  return Number.isSafeInteger(number) ? number : null;
}

export function parseSearchState(search) {
  const params = new URLSearchParams(search);
  const page = readNonNegativeInteger(params.get('page'));

  return {
    query: params.get('q') || '',
    season: params.get('season') || 'All',
    year: params.get('year') || 'All',
    currentPage: page && page > 1 ? page : 1,
    selectedAnimeIndex: readNonNegativeInteger(params.get('anime')),
  };
}

export function serializeSearchState(state) {
  const params = new URLSearchParams();
  const query = state.query.trim();

  if (query) params.set('q', query);
  if (state.season !== 'All') params.set('season', state.season);
  if (state.year !== 'All') params.set('year', String(state.year));
  if (state.currentPage > 1) params.set('page', String(state.currentPage));
  if (state.selectedAnimeIndex !== null) {
    params.set('anime', String(state.selectedAnimeIndex));
  }

  return params;
}

export function searchReducer(state, action) {
  switch (action.type) {
    case 'hydrate':
      return { ...INITIAL_SEARCH_STATE, ...action.state };
    case 'set-query':
      return { ...state, query: action.query, currentPage: 1 };
    case 'set-season':
      return { ...state, season: action.season, currentPage: 1 };
    case 'set-year':
      return { ...state, year: action.year, currentPage: 1 };
    case 'set-page':
      return { ...state, currentPage: action.page };
    case 'open-anime':
      return { ...state, selectedAnimeIndex: action.index };
    case 'close-anime':
      return { ...state, selectedAnimeIndex: null };
    case 'reset-filters':
      return {
        ...state,
        query: INITIAL_SEARCH_STATE.query,
        season: INITIAL_SEARCH_STATE.season,
        year: INITIAL_SEARCH_STATE.year,
        currentPage: INITIAL_SEARCH_STATE.currentPage,
      };
    default:
      return state;
  }
}
