const BASE_URL = import.meta.env.BASE_URL || '/';
const HOME_URL = BASE_URL.endsWith('/') ? BASE_URL : BASE_URL + '/';

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
    <footer className="relative z-10 border-t border-[#e2e8f0]/80 bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-[1200px] px-6 py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-2">
            <div className="mb-4 flex items-center gap-3">
              <img
                src={`${HOME_URL}avatar.jpg`}
                alt="Siwö"
                className="h-10 w-10 rounded-full border border-[#e2e8f0] object-cover"
              />
              <span className="font-space text-[20px] font-bold text-[#1d242f]">Siwö</span>
            </div>
            <p className="max-w-md text-[14px] leading-[1.7] text-[#6b7280]">
              Siwö es un buscador de openings y endings de anime. Recopilamos
              enlaces de descarga de{' '}
              <a
                href="https://anitousen.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[#14b8a6] transition hover:text-[#0d9488]"
              >
                AniTousen
              </a>{' '}
              y los presentamos en una interfaz limpia con metadatos enriquecidos.
            </p>
            {updateDate && (
              <p className="mt-4 text-[12px] text-[#9ca3af]">
                Última actualización: {updateDate}
              </p>
            )}
          </div>

          <div>
            <h3 className="mb-4 font-space text-[14px] font-bold uppercase tracking-wider text-[#1d242f]">
              Créditos
            </h3>
            <ul className="space-y-2 text-[14px] text-[#6b7280]">
              <li>
                <a
                  href="https://anitousen.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition hover:text-[#14b8a6]"
                >
                  AniTousen
                </a>
              </li>
              <li>
                <a
                  href="https://jikan.moe/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition hover:text-[#14b8a6]"
                >
                  Jikan
                </a>
              </li>
              <li>
                <a
                  href="https://anilist.co/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition hover:text-[#14b8a6]"
                >
                  AniList
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/Kokeeu/anitousen-search"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition hover:text-[#14b8a6]"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 font-space text-[14px] font-bold uppercase tracking-wider text-[#1d242f]">
              Sígueme
            </h3>
            <p className="text-[14px] leading-[1.7] text-[#6b7280]">
              Si te gusta el proyecto, sígueme en{' '}
              <a
                href="https://www.tiktok.com/@___siwo___"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[#14b8a6] transition hover:text-[#0d9488]"
              >
                TikTok
              </a>
              .
            </p>
          </div>
        </div>

        <div className="mt-10 border-t border-[#e2e8f0]/60 pt-6 text-center">
          <p className="text-[13px] text-[#6b7280]">
            © {new Date().getFullYear()} Siwö. Datos de AniTousen, Jikan y AniList.
          </p>
        </div>
      </div>
    </footer>
  );
}
