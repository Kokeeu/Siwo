import { useEffect } from 'react';

export default function AnimeModal({ anime, onClose }) {
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKey);
    };
  }, [onClose]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const formatScore = (score) => {
    if (score === null || score === undefined) return '—';
    return Number(score).toFixed(1);
  };

  const hasDetails =
    anime.synopsis ||
    (anime.genres && anime.genres.length > 0) ||
    anime.score ||
    anime.episodes ||
    (anime.studios && anime.studios.length > 0);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#0b1120]/60 p-4 backdrop-blur-md animate-modal-in md:p-6"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="anime-modal-title"
    >
      <div className="relative my-auto w-full max-w-[920px] max-h-[85vh] overflow-y-auto rounded-[20px] border border-white/40 bg-white/80 shadow-2xl backdrop-blur-2xl animate-modal-panel-in md:max-h-[90vh] md:overflow-hidden"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[#1d242f] shadow-md backdrop-blur-sm transition hover:bg-white hover:text-[#14b8a6]"
          aria-label="Cerrar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] lg:grid-cols-[300px_1fr]">
          <div className="relative h-48 w-full overflow-hidden bg-[#f3f4f6] md:h-auto md:min-h-full">
            {anime.coverImage ? (
              <img
                src={anime.coverImage}
                alt={anime.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-[#f3f4f6] to-[#e2e8f0]">
                <img src="placeholder.png" alt="No image" className="h-24 w-24 rounded-full opacity-70" />
                <span className="mt-3 text-[11px] uppercase tracking-widest text-[#9ca3af]">No Image</span>
              </div>
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent md:hidden" />
          </div>

          <div className="flex flex-col p-5 md:max-h-[90vh] md:overflow-y-auto md:p-8">
            <div className="mb-4">
              <p className="mb-2 text-[12px] font-semibold uppercase tracking-widest text-[#14b8a6]">
                {anime.season} {anime.year}
              </p>
              <h2 id="anime-modal-title" className="font-space text-[20px] font-bold leading-[1.25] text-[#1d242f] md:text-[26px]">
                {anime.title}
              </h2>
            </div>

            {anime.genres && anime.genres.length > 0 && (
              <div className="mb-5 flex flex-wrap gap-2">
                {anime.genres.map((g) => (
                  <span
                    key={g}
                    className="rounded-full border border-[#14b8a6]/20 bg-[#14b8a6]/10 px-3 py-1 text-[12px] font-medium text-[#0d9488]"
                  >
                    {g}
                  </span>
                ))}
              </div>
            )}

            <div className="mb-6 grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-[#e2e8f0]/60 bg-white/60 p-3 text-center backdrop-blur-sm">
                <p className="text-[11px] uppercase tracking-wider text-[#6b7280]">Score</p>
                <p className="font-space text-[17px] font-bold text-[#1d242f]">{formatScore(anime.score)}</p>
              </div>
              <div className="rounded-xl border border-[#e2e8f0]/60 bg-white/60 p-3 text-center backdrop-blur-sm">
                <p className="text-[11px] uppercase tracking-wider text-[#6b7280]">Episodios</p>
                <p className="font-space text-[17px] font-bold text-[#1d242f]">{anime.episodes ?? '—'}</p>
              </div>
              <div className="rounded-xl border border-[#e2e8f0]/60 bg-white/60 p-3 text-center backdrop-blur-sm">
                <p className="text-[11px] uppercase tracking-wider text-[#6b7280]">Estudio</p>
                <p className="truncate text-[13px] font-semibold text-[#1d242f]">
                  {anime.studios && anime.studios.length > 0 ? anime.studios[0] : '—'}
                </p>
              </div>
            </div>

            {hasDetails ? (
              <div className="mb-6">
                <div className="mb-2 flex items-center gap-2">
                  <h3 className="font-space text-[14px] font-bold uppercase tracking-wider text-[#6b7280]">
                    Sinopsis
                  </h3>
                  <span className="rounded-full bg-[#f59e0b]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#d97706]">
                    en inglés
                  </span>
                </div>
                <p className="text-[14px] leading-[1.7] text-[#374151]">
                  {anime.synopsis || 'Sin sinopsis disponible.'}
                </p>
              </div>
            ) : (
              <div className="mb-6 rounded-xl border border-dashed border-[#e2e8f0] bg-[#f9fafb] p-5 text-center">
                <p className="text-[14px] text-[#6b7280]">
                  No hay detalles adicionales disponibles para este anime.
                </p>
              </div>
            )}

            <div className="mt-auto flex flex-wrap gap-3">
              {anime.downloadLink && (
                <a
                  href={anime.downloadLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#14b8a6] px-5 py-3 text-[14px] font-semibold text-white shadow-lg shadow-[#14b8a6]/20 transition hover:-translate-y-0.5 hover:bg-[#0d9488]"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Descargar
                </a>
              )}
              {anime.malUrl && (
                <a
                  href={anime.malUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-[#e2e8f0] bg-white/70 px-5 py-3 text-[14px] font-semibold text-[#1d242f] transition hover:border-[#14b8a6] hover:text-[#14b8a6]"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  MyAnimeList
                </a>
              )}
              {anime.trailerUrl && (
                <a
                  href={anime.trailerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-[#e2e8f0] bg-white/70 px-5 py-3 text-[14px] font-semibold text-[#1d242f] transition hover:border-red-400 hover:text-red-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Trailer
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
