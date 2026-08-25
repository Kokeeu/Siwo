export default function AnimeSkeleton({ count = 20 }) {
  return (
    <div className="anime-grid" aria-label="Cargando animes">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="skeleton-card animate-pulse"
        >
          <div className="h-8 border-b-2 border-black bg-[#f2c63d]/40" />
          <div className="aspect-[3/4] border-b-2 border-black bg-black/10" />
          <div className="p-3">
            <div className="mb-3 h-3 w-1/3 bg-black/10" />
            <div className="mb-2 h-4 w-3/4 bg-black/15" />
            <div className="h-4 w-1/2 bg-black/15" />
          </div>
        </div>
      ))}
    </div>
  );
}
