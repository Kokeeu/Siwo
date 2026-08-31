import AnimeSkeleton from '../AnimeSkeleton.jsx';
import AnimeCard from './AnimeCard.jsx';

export default function ArchiveResults({
  loading,
  filteredCount,
  currentPage,
  totalPages,
  displayed,
  pageStart,
  paginationItems,
  onAnimeClick,
  onPageChange,
}) {
  return (
    <>
      <div id="resultados" className="results-bar scroll-mt-24" aria-live="polite" data-reveal>
        <p><strong>{filteredCount}</strong> resultados en el archivo</p>
        <span>
          {filteredCount > 0 ? `Página ${currentPage} de ${totalPages}` : 'Sin páginas'} // 音楽
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
                onClick={onAnimeClick}
              />
            ))}
          </div>

          {filteredCount > 0 && totalPages > 1 && (
            <nav className="pagination" aria-label="Paginación de resultados">
              <button
                type="button"
                className="pagination-arrow"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
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
                      className={item === currentPage ? 'is-current' : ''}
                      onClick={() => onPageChange(item)}
                      aria-label={`Ir a la página ${item}`}
                      aria-current={item === currentPage ? 'page' : undefined}
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
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Ir a la página siguiente"
              >
                <span>Siguiente</span>
                <span aria-hidden="true">→</span>
              </button>
            </nav>
          )}

          {filteredCount === 0 && (
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
    </>
  );
}
