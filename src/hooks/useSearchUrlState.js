import { useEffect, useRef, useState } from 'react';
import { parseSearchState, serializeSearchState } from '../state/searchState.js';

export function useSearchUrlState(state, dispatch) {
  const [isInitialized, setIsInitialized] = useState(false);
  const wasModalOpen = useRef(false);

  useEffect(() => {
    const applyLocation = () => {
      const nextState = parseSearchState(window.location.search);
      wasModalOpen.current = nextState.selectedAnimeIndex !== null;
      dispatch({ type: 'hydrate', state: nextState });
    };

    applyLocation();
    setIsInitialized(true);
    window.addEventListener('popstate', applyLocation);
    return () => window.removeEventListener('popstate', applyLocation);
  }, [dispatch]);

  useEffect(() => {
    if (!isInitialized) return;

    const params = serializeSearchState(state);
    const search = params.toString();
    const nextUrl = `${window.location.pathname}${search ? `?${search}` : ''}`;
    const currentUrl = `${window.location.pathname}${window.location.search}`;
    const isModalOpen = state.selectedAnimeIndex !== null;

    if (nextUrl !== currentUrl) {
      if (isModalOpen && !wasModalOpen.current) {
        window.history.pushState(null, '', nextUrl);
      } else {
        window.history.replaceState(null, '', nextUrl);
      }
    }

    wasModalOpen.current = isModalOpen;
  }, [
    dispatch,
    isInitialized,
    state.currentPage,
    state.query,
    state.season,
    state.selectedAnimeIndex,
    state.year,
  ]);
}
