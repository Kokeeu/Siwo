import test from 'node:test';
import assert from 'node:assert/strict';
import {
  filterCatalog,
  getAvailableSeasons,
  getAvailableYears,
  getPaginationItems,
  paginateCatalog,
} from '../src/utils/catalog.js';

const catalog = [
  { title: 'Cowboy Bebop', season: 'Spring', year: 1998 },
  { title: 'Frieren', season: 'Fall', year: 2023 },
  { title: 'Odd Taxi', season: 'Spring', year: 2021 },
  { title: 'Custom Show', season: 'Special', year: 2024 },
];

test('orders seasons canonically and keeps unknown seasons', () => {
  assert.deepEqual(getAvailableSeasons(catalog), ['All', 'Spring', 'Fall', 'Special']);
});

test('orders unique years from newest to oldest', () => {
  assert.deepEqual(getAvailableYears(catalog), ['All', 2024, 2023, 2021, 1998]);
});

test('filters by query, season, and year together', () => {
  assert.deepEqual(
    filterCatalog(catalog, { query: 'taxi', season: 'Spring', year: '2021' }),
    [catalog[2]]
  );
});

test('clamps pages and returns the requested slice', () => {
  const items = Array.from({ length: 45 }, (_, index) => index);
  assert.deepEqual(paginateCatalog(items, 99), {
    currentPage: 3,
    totalPages: 3,
    start: 40,
    items: [40, 41, 42, 43, 44],
  });
});

test('builds compact pagination with stable ellipsis keys', () => {
  assert.deepEqual(getPaginationItems(5, 10), [
    1,
    'ellipsis-4',
    4,
    5,
    6,
    'ellipsis-10',
    10,
  ]);
});
