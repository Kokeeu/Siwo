const SEASON_NAMES = {
  Winter: 'Invierno',
  Spring: 'Primavera',
  Summer: 'Verano',
  Fall: 'Otoño',
};

export function formatSeason(season) {
  return SEASON_NAMES[season] || season || 'Anime';
}
