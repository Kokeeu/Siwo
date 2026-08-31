import { formatSeason } from '../../utils/season.js';
import FilterSelect from './FilterSelect.jsx';

export default function SearchControls({
  query,
  season,
  year,
  seasons,
  years,
  hasFilters,
  onQueryChange,
  onSeasonChange,
  onYearChange,
  onReset,
}) {
  return (
    <div className="search-panel" role="search" data-reveal>
      <div className="search-field">
        <label htmlFor="anime-search">Buscar por título</label>
        <div className="search-input-wrap">
          <span aria-hidden="true">⌕</span>
          <input
            id="anime-search"
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Escribe el nombre de un anime..."
          />
          {query && (
            <button
              type="button"
              onClick={() => onQueryChange('')}
              aria-label="Limpiar búsqueda"
            >
              ×
            </button>
          )}
        </div>
      </div>

      <FilterSelect
        id="season-filter"
        label="Temporada"
        value={season}
        options={seasons.map((item) => ({
          value: item,
          label: item === 'All' ? 'Todas' : formatSeason(item),
        }))}
        onChange={onSeasonChange}
      />

      <FilterSelect
        id="year-filter"
        label="Año"
        value={year}
        options={years.map((item) => ({
          value: String(item),
          label: item === 'All' ? 'Todos' : String(item),
        }))}
        onChange={onYearChange}
      />

      {hasFilters && (
        <button
          type="button"
          className="clear-filters"
          onClick={onReset}
        >
          Limpiar<br />filtros
        </button>
      )}
    </div>
  );
}
