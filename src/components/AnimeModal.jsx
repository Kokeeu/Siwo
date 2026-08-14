import { useEffect, useRef, useState } from 'react';

const BASE_URL = import.meta.env.BASE_URL || '/';
const HOME_URL = BASE_URL.endsWith('/') ? BASE_URL : BASE_URL + '/';

function hexToRgba(hex, alpha = 1) {
  if (!hex) return null;
  const m = hex.replace('#', '');
  const r = parseInt(m.substring(0, 2), 16);
  const g = parseInt(m.substring(2, 4), 16);
  const b = parseInt(m.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function StarIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={props.className} fill="currentColor" viewBox="0 0 24 24" stroke="none">
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  );
}

function EpisodeIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={props.className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16v12H4z M4 10h16" />
      <circle cx="9" cy="14" r="1.5" fill="currentColor" />
      <circle cx="15" cy="14" r="1.5" fill="currentColor" />
    </svg>
  );
}

function StudioIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={props.className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 21V8l9-5 9 5v13M9 21V12h6v9" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="flex flex-col items-center gap-1.5 rounded-2xl border border-white/60 bg-white/50 px-3 py-3.5 backdrop-blur-sm">
      <div
        className="flex h-9 w-9 items-center justify-center rounded-full"
        style={{ backgroundColor: color ? hexToRgba(color, 0.12) : 'rgba(20, 184, 166, 0.1)', color: color || '#14b8a6' }}
      >
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6b7280]">{label}</p>
      <p className="line-clamp-1 text-center font-space text-[14px] font-bold text-[#1d242f]">
        {value}
      </p>
    </div>
  );
}

export default function AnimeModal({ anime, onClose }) {
  const panelRef = useRef(null);
  const startYRef = useRef(0);
  const scrollTopRef = useRef(0);
  const isDraggingRef = useRef(false);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

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

  useEffect(() => {
    if (!panelRef.current) return;
    const innerScroll = panelRef.current.querySelector('[data-modal-scroll]');
    if (innerScroll) innerScroll.scrollTop = 0;
    setDragY(0);
    isDraggingRef.current = false;
    setIsDragging(false);
    startYRef.current = 0;
  }, [anime]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleTouchStart = (e) => {
    if (!panelRef.current) return;
    const innerScroll = panelRef.current.querySelector('[data-modal-scroll]');
    scrollTopRef.current = innerScroll ? innerScroll.scrollTop : 0;
    if (scrollTopRef.current > 10) return;
    startYRef.current = e.touches[0].clientY;
    isDraggingRef.current = true;
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDraggingRef.current) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - startYRef.current;
    if (diff > 0) {
      e.preventDefault();
      setDragY(diff);
    } else {
      setDragY(0);
    }
  };

  const handleTouchEnd = () => {
    if (dragY > 100) {
      onClose();
    } else {
      setDragY(0);
      isDraggingRef.current = false;
      setIsDragging(false);
    }
  };

  const formatScore = (score) => {
    if (score === null || score === undefined) return '—';
    return Number(score).toFixed(1);
  };

  const hasDetails =
    anime.synopsis ||
    (anime.genres && anime.genres.length > 0) ||
    anime.score != null ||
    anime.episodes != null ||
    (anime.studios && anime.studios.length > 0);

  const color = anime.dominantColor;
  const backdropBg = color
    ? `linear-gradient(180deg, ${hexToRgba(color, 0.55)} 0%, ${hexToRgba(color, 0.25)} 50%, #0b1120 100%)`
    : undefined;
  const panelRing = color ? `0 0 0 1px ${hexToRgba(color, 0.2)}` : undefined;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#0b1120]/70 p-4 backdrop-blur-md animate-modal-in md:p-6"
      style={backdropBg ? { backgroundImage: backdropBg } : undefined}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="anime-modal-title"
    >
      <div
        ref={panelRef}
        className="relative my-auto w-full max-w-[920px] max-h-[85vh] overflow-hidden rounded-[24px] border border-white/30 bg-white/85 shadow-2xl backdrop-blur-2xl animate-modal-panel-in md:max-h-[90vh]"
        style={{
          transform: dragY > 0 ? `translateY(${dragY}px)` : undefined,
          transition: isDragging ? 'none' : 'transform 0.3s ease-out',
          boxShadow: `0 25px 50px -12px rgba(0,0,0,0.25)${panelRing ? `, ${panelRing}` : ''}`,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[#1d242f] shadow-md backdrop-blur-sm transition hover:bg-white hover:text-[#14b8a6]"
          aria-label="Cerrar"
        >
          <CloseIcon />
        </button>

        <div className="md:flex md:max-h-[90vh]">
          <div className="relative h-56 w-full overflow-hidden bg-[#f3f4f6] shadow-[inset_-1px_0_0_0_rgba(255,255,255,0.5)] md:h-auto md:w-72 md:shrink-0 md:overflow-hidden md:border-r md:border-white/40 lg:w-80"
          >
            {anime.coverImage ? (
              <img
                src={anime.coverImage}
                alt={anime.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-[#f3f4f6] to-[#e2e8f0]">
                <img src={`${HOME_URL}placeholder.png`} alt="No image" className="h-24 w-24 rounded-full opacity-70" />
                <span className="mt-3 text-[11px] uppercase tracking-widest text-[#9ca3af]">No Image</span>
              </div>
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent md:hidden" />
            {color && (
              <div
                className="pointer-events-none absolute inset-0"
                style={{ background: `linear-gradient(180deg, ${hexToRgba(color, 0)} 60%, ${hexToRgba(color, 0.4)} 100%)` }}
              />
            )}
          </div>

          <div
            data-modal-scroll
            className="flex max-h-[calc(85vh-15rem)] flex-col gap-6 overflow-y-auto p-5 md:max-h-[90vh] md:flex-1 md:gap-7 md:p-8"
          >
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.15em] text-[#14b8a6]">
                {anime.season} {anime.year}
              </p>
              <h2 id="anime-modal-title" className="font-space text-[22px] font-black leading-[1.2] text-[#1d242f] md:text-[28px]">
                {anime.title}
              </h2>
            </div>

            {anime.genres && anime.genres.length > 0 && (
              <div className="flex flex-wrap gap-2">
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

            <div className="grid grid-cols-3 gap-2.5 md:gap-3">
              <StatCard
                icon={StarIcon}
                label="Score"
                value={formatScore(anime.score)}
                color="#f59e0b"
              />
              <StatCard
                icon={EpisodeIcon}
                label="Episodios"
                value={anime.episodes ?? '—'}
                color="#14b8a6"
              />
              <StatCard
                icon={StudioIcon}
                label="Estudio"
                value={anime.studios && anime.studios.length > 0 ? anime.studios[0] : '—'}
                color="#6366f1"
              />
            </div>

            {hasDetails ? (
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <h3 className="font-space text-[12px] font-bold uppercase tracking-[0.15em] text-[#6b7280]">
                    Sinopsis
                  </h3>
                  <span className="rounded-full bg-[#f59e0b]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#d97706]">
                    en inglés
                  </span>
                </div>
                <p className="text-[14px] leading-[1.75] text-[#374151]">
                  {anime.synopsis || 'Sin sinopsis disponible.'}
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-[#e2e8f0] bg-[#f9fafb] p-5 text-center">
                <p className="text-[14px] text-[#6b7280]">
                  No hay detalles adicionales disponibles para este anime.
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-3 pt-2">
              {anime.downloadLink && (
                <a
                  href={anime.downloadLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#14b8a6] px-5 py-3 text-[14px] font-semibold text-white shadow-lg shadow-[#14b8a6]/30 transition hover:-translate-y-0.5 hover:bg-[#0d9488]"
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
              {anime.sourceUrl && anime.sourceUrl !== anime.malUrl && (
                <a
                  href={anime.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-[#e2e8f0] bg-white/70 px-5 py-3 text-[14px] font-semibold text-[#1d242f] transition hover:border-[#14b8a6] hover:text-[#14b8a6]"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  {anime.sourceLabel || 'Fuente'}
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
