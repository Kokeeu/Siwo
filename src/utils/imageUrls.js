// Helpers para portadas del catálogo.
//
// Algunos proveedores (p. ej. Kitsu vía Backblaze B2) devuelven URLs firmadas
// con validez limitada (?X-Amz-...&X-Amz-Signature=...). Si esa URL se cachea
// en data.json, la imagen muere días después y la UI muestra un hueco vacío
// en vez del placeholder. Estas funciones detectan esas URLs para no
// almacenarlas como portada.

const EXPIRABLE_PARAM_PATTERN = /(?:^|[?&])(X-Amz-[^&=]*|Signature|Expires|sig)=/i;

export function isExpirableImageUrl(url) {
  if (typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (trimmed === '') return false;
  return EXPIRABLE_PARAM_PATTERN.test(trimmed);
}

export function sanitizeCoverImage(url) {
  if (typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (trimmed === '' || isExpirableImageUrl(trimmed)) return null;
  return trimmed;
}
