import { assetUrl } from '../utils/assets.js';

function formatDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

export default function Footer({ generatedAt }) {
  const updateDate = formatDate(generatedAt);

  return (
    <footer className="manga-footer relative z-10">
      <div className="footer-ticker" aria-hidden="true">
        <div className="footer-ticker-track">
          {[0, 1].map((group) => (
            <div className="footer-ticker-group" key={group}>
              <span>ANIME SOUND ARCHIVE</span>
              <span>音楽検索</span>
              <span>OPENINGS + ENDINGS</span>
              <span>SIWÖ / 2026</span>
            </div>
          ))}
        </div>
      </div>

      <div className="footer-art-background" aria-hidden="true">
        <img className="footer-art-panel footer-art-panel-cowboy" src={assetUrl('editorial/interlude-cowboy.jpg')} alt="" />
        <img className="footer-art-panel footer-art-panel-lain" src={assetUrl('editorial/interlude-lain.jpg')} alt="" />
        <img className="footer-art-panel footer-art-panel-band" src={assetUrl('editorial/interlude-band.jpg')} alt="" />
        <img className="footer-art-panel footer-art-panel-lookback" src={assetUrl('editorial/interlude-look-back.jpg')} alt="" />
        <img className="footer-art-panel footer-art-panel-eri" src={assetUrl('editorial/interlude-goodbye-eri.jpg')} alt="" />
      </div>

      <div className="footer-content mx-auto max-w-[1320px] px-5 py-14 md:px-8 md:py-20">
        <div className="footer-grid" data-reveal>
          <div className="footer-brand">
            <div className="mb-5 flex items-center gap-4">
              <img
                src={assetUrl('avatar.jpg')}
                alt="Siwö"
                className="h-14 w-14 border-2 border-white object-cover"
              />
              <div>
                <span className="font-display block text-[28px] uppercase leading-none">Siwö</span>
                <span className="text-[8px] font-black uppercase tracking-[.24em] text-white/55">Anime sound archive</span>
              </div>
            </div>
            <p className="max-w-md text-[14px] font-medium leading-[1.75] text-white/65">
              Siwö es un buscador de openings y endings de anime. Recopilamos
              enlaces de descarga de{' '}
              <a
                href="https://anitousen.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-[#f2c63d] transition hover:text-white"
              >
                AniTousen
              </a>{' '}
              y los organizamos como un archivo editorial para amantes del anime.
            </p>
            {updateDate && (
              <p className="footer-update">
                <span>UPDATE</span> {updateDate}
              </p>
            )}
          </div>

          <div className="footer-links">
            <h3><span>03</span> Créditos</h3>
            <ul>
              <li>
                <a
                  href="https://anitousen.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition hover:text-[#f2c63d]"
                >
                  AniTousen
                </a>
              </li>
              <li>
                <a
                  href="https://jikan.moe/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition hover:text-[#f2c63d]"
                >
                  Jikan
                </a>
              </li>
              <li>
                <a
                  href="https://anilist.co/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition hover:text-[#f2c63d]"
                >
                  AniList
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/Kokeeu/Siwo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition hover:text-[#f2c63d]"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>

          <div className="footer-social">
            <p className="footer-jp" aria-hidden="true">音<br />楽</p>
            <h3><span>04</span> Comunidad</h3>
            <p>
              Nuevos lanzamientos, hallazgos y más música anime en{' '}
              <a
                href="https://www.tiktok.com/@___siwo___"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-[#f2c63d] transition hover:text-white"
              >
                TikTok
              </a>
              .
            </p>
            <a className="footer-cta" href="https://www.tiktok.com/@___siwo___" target="_blank" rel="noopener noreferrer">
              Seguir en TikTok <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>

        <div className="footer-bottom" data-reveal>
          <p>© {new Date().getFullYear()} Siwö. Hecho para escuchar en repeat.</p>
          <p>Data // AniTousen · Jikan · AniList</p>
        </div>
      </div>
    </footer>
  );
}
