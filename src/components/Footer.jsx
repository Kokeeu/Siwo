const BASE_URL = import.meta.env.BASE_URL || '/';
const HOME_URL = BASE_URL.endsWith('/') ? BASE_URL : BASE_URL + '/';
const ABOUT_URL = HOME_URL + 'about';

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
      <div className="mx-auto max-w-[1200px] px-6 py-8">
        <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
          <div className="flex items-center gap-3">
            <img
              src="avatar.jpg"
              alt="Siwö"
              className="h-8 w-8 rounded-full border border-[#e2e8f0] object-cover"
            />
            <span className="font-space text-[16px] font-bold text-[#1d242f]">Siwö</span>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-5">
            <a
              href={HOME_URL}
              className="text-[14px] text-[#6b7280] transition hover:text-[#14b8a6]"
            >
              Inicio
            </a>
            <a
              href={ABOUT_URL}
              className="text-[14px] text-[#6b7280] transition hover:text-[#14b8a6]"
            >
              Acerca de
            </a>
            <a
              href="https://github.com/Kokeeu/anitousen-search"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[14px] text-[#6b7280] transition hover:text-[#14b8a6]"
            >
              GitHub
            </a>
            <a
              href="https://www.tiktok.com/@___siwo___"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[14px] text-[#6b7280] transition hover:text-[#14b8a6]"
            >
              TikTok
            </a>
          </nav>
        </div>

        <div className="mt-6 flex flex-col items-center justify-between gap-3 border-t border-[#e2e8f0]/60 pt-6 md:flex-row">
          <p className="text-center text-[13px] text-[#6b7280]">
            Datos proporcionados por{' '}
            <a
              href="https://anitousen.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[#14b8a6] transition hover:text-[#0d9488]"
            >
              AniTousen
            </a>
            . Imágenes y detalles por Jikan / AniList.
          </p>
          {updateDate && (
            <p className="text-[12px] text-[#9ca3af]">
              Última actualización: {updateDate}
            </p>
          )}
        </div>
      </div>
    </footer>
  );
}
