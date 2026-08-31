import { useEffect, useState } from 'react';

export function useCatalog(initialAnimes, dataUrl) {
  const [animes, setAnimes] = useState(initialAnimes);
  const [loading, setLoading] = useState(Boolean(dataUrl));

  useEffect(() => {
    if (!dataUrl) {
      setLoading(false);
      return undefined;
    }

    const controller = new AbortController();

    async function loadCatalog() {
      try {
        const response = await fetch(dataUrl, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`No se pudo cargar el catálogo (${response.status})`);
        }

        const payload = await response.json();
        const catalog = Array.isArray(payload) ? payload : payload.animes;
        if (Array.isArray(catalog) && catalog.length > 0) setAnimes(catalog);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error(
            'No se pudo cargar el catálogo completo; se usará la primera página.',
            error
          );
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadCatalog();
    return () => controller.abort();
  }, [dataUrl]);

  return { animes, loading };
}
