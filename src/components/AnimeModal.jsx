import { useEffect, useRef, useState } from 'react';
import { useModalDialog } from '../hooks/useModalDialog.js';
import { assetUrl } from '../utils/assets.js';
import { formatSeason } from '../utils/season.js';

function hexToRgba(hex, alpha = 1) {
  if (!hex) return null;
  const m = hex.replace('#', '');
  const r = parseInt(m.substring(0, 2), 16);
  const g = parseInt(m.substring(2, 4), 16);
  const b = parseInt(m.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function StatCard({ mark, label, value, color }) {
  return (
    <div className="modal-stat">
      <span className="modal-stat-mark" style={{ backgroundColor: color }}>{mark}</span>
      <p>{label}</p>
      <strong className="line-clamp-1">{value}</strong>
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

  useModalDialog(panelRef, onClose);

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
  return (
    <div
      className="anime-modal-backdrop fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto p-4 animate-modal-in md:p-6"
      style={backdropBg ? { backgroundImage: backdropBg } : undefined}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="anime-modal-title"
    >
      <div
        ref={panelRef}
        className="anime-modal-panel relative my-auto w-full max-w-[980px] max-h-[88vh] overflow-hidden animate-modal-panel-in md:max-h-[90vh]"
        style={{
          transform: dragY > 0 ? `translateY(${dragY}px)` : undefined,
          transition: isDragging ? 'none' : 'transform 0.3s ease-out',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <button
          type="button"
          onClick={onClose}
          className="modal-close absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center"
          aria-label="Cerrar"
        >
          <span aria-hidden="true">×</span>
        </button>

        <div className="modal-layout md:flex md:max-h-[90vh]">
          <div className="modal-cover relative h-64 w-full overflow-hidden md:h-auto md:w-[38%] md:shrink-0"
          >
            {anime.coverImage ? (
              <img
                src={anime.coverImage}
                alt={anime.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center bg-[#ece7dc]">
                <img src={assetUrl('placeholder.png')} alt="Sin portada" className="h-24 w-24 border-2 border-black object-cover opacity-70" />
                <span className="mt-3 text-[10px] font-black uppercase tracking-[.2em]">No image</span>
              </div>
            )}
            <div className="modal-cover-index" aria-hidden="true"><span>ARCHIVE</span><strong>音</strong></div>
            {color && (
              <div
                className="pointer-events-none absolute inset-0 mix-blend-multiply"
                style={{ background: `linear-gradient(180deg, ${hexToRgba(color, 0)} 55%, ${hexToRgba(color, 0.2)} 100%)` }}
              />
            )}
          </div>

          <div
            data-modal-scroll
            className="modal-content flex max-h-[calc(88vh-16rem)] flex-col gap-6 overflow-y-auto p-5 md:max-h-[90vh] md:flex-1 md:gap-7 md:p-8 lg:p-10"
          >
            <div>
              <p className="modal-season">
                <span>FILE DATA</span> {formatSeason(anime.season)} / {anime.year}
              </p>
              <h2 id="anime-modal-title" className="modal-title">
                {anime.title}
              </h2>
            </div>

            {anime.genres && anime.genres.length > 0 && (
              <div className="modal-genres flex flex-wrap gap-2">
                {anime.genres.map((g) => (
                  <span
                    key={g}
                  >
                    {g}
                  </span>
                ))}
              </div>
            )}

            <div className="modal-stats grid grid-cols-3">
              <StatCard
                mark="★"
                label="Score"
                value={formatScore(anime.score)}
                color="#f2c63d"
              />
              <StatCard
                mark="話"
                label="Episodios"
                value={anime.episodes ?? '—'}
                color="#5a98cb"
              />
              <StatCard
                mark="作"
                label="Estudio"
                value={anime.studios && anime.studios.length > 0 ? anime.studios[0] : '—'}
                color="#e94b3c"
              />
            </div>

            {hasDetails ? (
              <div className="modal-synopsis">
                <div className="mb-3 flex items-center gap-2">
                  <h3>
                    Sinopsis
                  </h3>
                  <span>
                    en inglés
                  </span>
                </div>
                <p>
                  {anime.synopsis || 'Sin sinopsis disponible.'}
                </p>
              </div>
            ) : (
              <div className="border-2 border-dashed border-black/40 bg-black/5 p-5 text-center">
                <p className="text-[14px] text-black/60">
                  No hay detalles adicionales disponibles para este anime.
                </p>
              </div>
            )}

            <div className="modal-actions flex flex-wrap gap-3 pt-2">
              {anime.downloadLink && (
                <a
                  href={anime.downloadLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="modal-action modal-action-primary"
                >
                  <span aria-hidden="true">↓</span> Descargar
                </a>
              )}
              {anime.malUrl && (
                <a
                  href={anime.malUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="modal-action"
                >
                  MyAnimeList <span aria-hidden="true">↗</span>
                </a>
              )}
              {anime.sourceUrl && anime.sourceUrl !== anime.malUrl && (
                <a
                  href={anime.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="modal-action"
                >
                  {anime.sourceLabel || 'Fuente'} <span aria-hidden="true">↗</span>
                </a>
              )}
              {anime.trailerUrl && (
                <a
                  href={anime.trailerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="modal-action"
                >
                  <span aria-hidden="true">▶</span> Trailer
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
