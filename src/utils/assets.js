const configuredBaseUrl = import.meta.env.BASE_URL || '/';

export const HOME_URL = configuredBaseUrl.endsWith('/')
  ? configuredBaseUrl
  : `${configuredBaseUrl}/`;

export function assetUrl(path) {
  return `${HOME_URL}${String(path).replace(/^\/+/, '')}`;
}
