import { assetUrl } from '../../utils/assets.js';
import { formatSeason } from '../../utils/season.js';

export default function AnimeCard({ anime, index, onClick }) {
  const itemNumber = String(index + 1).padStart(2, '0');
  const entranceDelay = Math.min(index, 12) * 55;

  return (
    <button
      type="button"
      onClick={() => onClick(anime)}
      className="anime-card group relative text-left"
      aria-label={`Ver detalles de ${anime.title}`}
      data-reveal
      style={{ '--reveal-delay': `${entranceDelay}ms` }}
    >
      <div>
        <div className="anime-card-index" aria-hidden="true">
          <span>FILE</span>
          <strong>{itemNumber}</strong>
        </div>

        {anime.coverImage ? (
          <div className="anime-card-cover">
            <img
              src={anime.coverImage}
              alt={anime.title}
              loading="lazy"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
            />
            <span className="anime-card-jp" aria-hidden="true">音楽</span>
          </div>
        ) : (
          <div className="anime-card-cover flex flex-col items-center justify-center bg-[#ece7dc]">
            <img src={assetUrl('placeholder.png')} alt="Sin portada" className="mb-3 h-24 w-24 border-2 border-black object-cover opacity-70" />
            <span className="text-[10px] font-black uppercase tracking-[.2em] text-black/50">No image</span>
          </div>
        )}

        {anime.score != null && anime.score !== undefined && (
          <div className="anime-card-score">
            <span aria-hidden="true">★</span>
            <strong>{Number(anime.score).toFixed(1)}</strong>
          </div>
        )}

        <div className="anime-card-copy">
          <div className="anime-card-meta">
            <span>{formatSeason(anime.season)}</span>
            <span>{anime.year || '—'}</span>
          </div>
          <h2 className="line-clamp-2">
            {anime.title}
          </h2>
          <div className="anime-card-action" aria-hidden="true">
            <span>Ver ficha</span>
            <span>↗</span>
          </div>
        </div>
      </div>
    </button>
  );
}
