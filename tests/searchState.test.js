import test from 'node:test';
import assert from 'node:assert/strict';
import {
  INITIAL_SEARCH_STATE,
  parseSearchState,
  searchReducer,
  serializeSearchState,
} from '../src/state/searchState.js';

test('parses all supported URL parameters', () => {
  assert.deepEqual(
    parseSearchState('?q=lain&season=Fall&year=1998&page=3&anime=42'),
    {
      query: 'lain',
      season: 'Fall',
      year: '1998',
      currentPage: 3,
      selectedAnimeIndex: 42,
    }
  );
});

test('rejects invalid numeric URL state', () => {
  const state = parseSearchState('?page=-2&anime=not-a-number');
  assert.equal(state.currentPage, 1);
  assert.equal(state.selectedAnimeIndex, null);
});

test('serializes only non-default state in a stable order', () => {
  const params = serializeSearchState({
    query: '  bebop  ',
    season: 'Spring',
    year: '1998',
    currentPage: 2,
    selectedAnimeIndex: 5,
  });

  assert.equal(params.toString(), 'q=bebop&season=Spring&year=1998&page=2&anime=5');
  assert.equal(serializeSearchState(INITIAL_SEARCH_STATE).toString(), '');
});

test('filter actions reset the page without closing the modal', () => {
  const current = {
    ...INITIAL_SEARCH_STATE,
    currentPage: 4,
    selectedAnimeIndex: 10,
  };
  const next = searchReducer(current, { type: 'set-query', query: 'frieren' });

  assert.equal(next.query, 'frieren');
  assert.equal(next.currentPage, 1);
  assert.equal(next.selectedAnimeIndex, 10);
});

test('hydration replaces stale state and reset preserves modal state', () => {
  const hydrated = searchReducer(
    { ...INITIAL_SEARCH_STATE, query: 'stale', selectedAnimeIndex: 1 },
    { type: 'hydrate', state: { ...INITIAL_SEARCH_STATE, season: 'Winter' } }
  );
  assert.deepEqual(hydrated, { ...INITIAL_SEARCH_STATE, season: 'Winter' });

  const reset = searchReducer(
    { ...hydrated, query: 'x', year: '2024', currentPage: 2, selectedAnimeIndex: 7 },
    { type: 'reset-filters' }
  );
  assert.deepEqual(reset, { ...INITIAL_SEARCH_STATE, selectedAnimeIndex: 7 });
});
