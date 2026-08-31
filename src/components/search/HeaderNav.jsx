import { HOME_URL, assetUrl } from '../../utils/assets.js';

export default function HeaderNav({ scrolled }) {
  return (
    <nav
      className={`manga-nav fixed left-0 right-0 top-0 z-50 transition-transform duration-300 ${scrolled ? 'translate-y-0' : '-translate-y-full'}`}
    >
      <div className="mx-auto flex h-16 max-w-[1320px] items-center justify-between px-5 md:px-8">
        <a href={HOME_URL} className="flex items-center gap-3" aria-label="Volver al inicio de Siwö">
          <img
            src={assetUrl('avatar.jpg')}
            alt="Siwö"
            className="h-9 w-9 border-2 border-black object-cover"
          />
          <span className="font-display text-[18px] uppercase tracking-[-0.04em] text-black">Siwö</span>
        </a>
        <div className="hidden items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] md:flex">
          <span>Anime music index</span>
          <span className="bg-black px-2 py-1 text-white">音楽検索</span>
        </div>
      </div>
    </nav>
  );
}
