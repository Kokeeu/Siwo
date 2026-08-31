import { assetUrl } from '../../utils/assets.js';

export default function Hero({ animeCount }) {
  return (
    <section className="manga-hero relative z-10 overflow-hidden" aria-labelledby="hero-title">
      <div className="hero-side-label" aria-hidden="true">
        <span>SIWÖ ARCHIVE</span>
        <span>VOL. 01</span>
      </div>

      <div className="hero-shell">
        <div className="hero-kicker">
          <span className="hero-kicker-mark">＊</span>
          <span>Openings / Endings</span>
          <span className="hero-kicker-jp">アニメ音楽</span>
        </div>

        <div className="hero-collage">
          <div className="hero-copy">
            <p className="hero-eyebrow">Tu archivo de canciones anime</p>
            <h1 id="hero-title" className="hero-title">
              <span>ANIME</span>
              <span className="hero-title-blue">SOUND</span>
              <span>ARCHIVE</span>
            </h1>
            <p className="hero-intro">
              Encuentra ese opening que no sale de tu cabeza. Explora, escucha y descarga la música de tus series favoritas.
            </p>

            <div className="hero-stats" aria-label="Resumen del archivo">
              <div><strong>{animeCount}</strong><span>series</span></div>
              <div><strong>OP + ED</strong><span>colección</span></div>
              <div><strong>毎週</strong><span>actualizado</span></div>
            </div>
          </div>

          <div className="hero-art" aria-label="Collage editorial manga de Siwö">
            <div className="hero-art-blue" aria-hidden="true">音</div>
            <div className="hero-art-yellow" aria-hidden="true">楽</div>
            <span className="hero-print-code" aria-hidden="true">FILE 001 / SOUND INDEX</span>
            <span className="hero-registration" aria-hidden="true">＋</span>
            <figure className="hero-frame hero-frame-profile" aria-hidden="true">
              <img src={assetUrl('editorial/hero-panel-profile.jpg')} alt="" />
            </figure>
            <figure className="hero-frame hero-frame-top" aria-hidden="true">
              <img src={assetUrl('editorial/hero-panel-expression.jpg')} alt="" />
            </figure>
            <figure className="hero-frame hero-frame-scene" aria-hidden="true">
              <img src={assetUrl('editorial/hero-panel-scene.jpg')} alt="" />
            </figure>
            <figure className="hero-frame hero-frame-smile" aria-hidden="true">
              <img src={assetUrl('editorial/hero-panel-smile.jpg')} alt="" />
            </figure>
            <figure className="hero-character">
              <img src={assetUrl('editorial/hero-character.jpg')} alt="Personaje manga caminando con una bolsa de anime" />
            </figure>
            <div className="hero-stamp" aria-hidden="true">
              <span>LISTEN</span>
              <strong>01</strong>
            </div>
            <span className="hero-crop-mark hero-crop-mark-a" aria-hidden="true" />
            <span className="hero-crop-mark hero-crop-mark-b" aria-hidden="true" />
          </div>
        </div>

        <a className="hero-scroll" href="#explorar">
          <span>Explorar archivo</span>
          <span aria-hidden="true">↓</span>
        </a>
      </div>
    </section>
  );
}
