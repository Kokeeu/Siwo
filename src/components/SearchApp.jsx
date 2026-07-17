import { useState, useMemo } from 'react';

const GLASS =
  'bg-white/5 backdrop-blur-xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_8px_32px_rgba(0,0,0,0.12)]';

export default function SearchApp({ animes }) {
  const [query, setQuery] = useState('');
  const [season, setSeason] = useState('All');
  const [year, setYear] = useState('All');

  const seasons = useMemo(
    () => ['All', ...new Set(animes.map((a) => a.season))],
    [animes]
  );

  const years = useMemo(
    () => ['All', ...new Set(animes.map((a) => a.year).sort((a, b) => b - a))],
    [animes]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return animes.filter((a) => {
      const matchesQuery = a.title.toLowerCase().includes(q);
      const matchesSeason = season === 'All' || a.season === season;
      const matchesYear = year === 'All' || String(a.year) === year;
      return matchesQuery && matchesSeason && matchesYear;
    });
  }, [animes, query, season, year]);

  return (
    <main className="min-h-screen bg-[#1d242f] text-white font-sans selection:bg-teal-500/30">
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,#0d9488,transparent_45%)] opacity-25" />

      <div className="relative max-w-5xl mx-auto px-6 py-16">
        <h1 className="text-center text-4xl md:text-6xl font-bold tracking-tight mb-4">
          AniTousen
        </h1>
        <p className="text-center text-gray-400 mb-12 text-lg">
          Buscador de animes por temporada
        </p>

        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar anime..."
            className={`${GLASS} flex-1 px-6 py-3.5 rounded-full outline-none transition focus:border-teal-400/50 focus:bg-white/10`}
          />
          <select
            value={season}
            onChange={(e) => setSeason(e.target.value)}
            className={`${GLASS} px-6 py-3.5 rounded-full appearance-none cursor-pointer min-w-[140px]`}
          >
            {seasons.map((s) => (
              <option key={s} value={s}>
                {s === 'All' ? 'Temporada' : s}
              </option>
            ))}
          </select>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className={`${GLASS} px-6 py-3.5 rounded-full appearance-none cursor-pointer min-w-[120px]`}
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y === 'All' ? 'Año' : y}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((anime) => (
            <a
              key={`${anime.title}-${anime.year}`}
              href={anime.downloadLink || anime.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`${GLASS} group rounded-2xl overflow-hidden transition hover:border-teal-400/40 hover:bg-white/10 hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.5),0_12px_40px_rgba(0,0,0,0.2)]`}
            >
              {anime.coverImage ? (
                <div className="aspect-[2/3] overflow-hidden">
                  <img
                    src={anime.coverImage}
                    alt={anime.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
              ) : (
                <div className="aspect-[2/3] flex items-center justify-center bg-white/5">
                  <span className="text-xs text-gray-500 uppercase tracking-widest">
                    No Image
                  </span>
                </div>
              )}
              <div className="p-3">
                <h2 className="font-semibold text-sm leading-snug mb-1 group-hover:text-teal-300 transition line-clamp-2">
                  {anime.title}
                </h2>
                <p className="text-xs text-gray-400">
                  {anime.season} {anime.year}
                </p>
              </div>
            </a>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-gray-400 mt-16 text-lg">
            No se encontraron resultados.
          </p>
        )}

        <p className="text-center text-gray-500 text-sm mt-16">
          {filtered.length} resultados · Datos de AniTousen
        </p>
      </div>
    </main>
  );
}
