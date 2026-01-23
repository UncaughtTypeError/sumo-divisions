import FlagJapan from './FlagJapan';
import FlagMongolia from './FlagMongolia';
import FlagUkraine from './FlagUkraine';
import FlagRussia from './FlagRussia';
import FlagChina from './FlagChina';
import FlagUSA from './FlagUSA';
import FlagPhilippines from './FlagPhilippines';
import FlagKazakhstan from './FlagKazakhstan';

/**
 * Map of country/region names to flag components and country codes
 * Keys are lowercase for case-insensitive matching
 */
export const FLAG_DATA = {
  // Japan
  japan: { component: FlagJapan, code: 'JPN', name: 'Japan' },
  // Mongolia
  mongolia: { component: FlagMongolia, code: 'MGL', name: 'Mongolia' },
  // Ukraine
  ukraine: { component: FlagUkraine, code: 'UKR', name: 'Ukraine' },
  // Russia
  russia: { component: FlagRussia, code: 'RUS', name: 'Russia' },
  // China
  china: { component: FlagChina, code: 'CHN', name: 'China' },
  // United States
  usa: { component: FlagUSA, code: 'USA', name: 'United States' },
  america: { component: FlagUSA, code: 'USA', name: 'United States' },
  'united states': { component: FlagUSA, code: 'USA', name: 'United States' },
  // Philippines
  philippines: { component: FlagPhilippines, code: 'PHL', name: 'Philippines' },
  // Kazakhstan
  kazakhstan: { component: FlagKazakhstan, code: 'KAZ', name: 'Kazakhstan' },
};

// Legacy export for backwards compatibility
export const FLAG_COMPONENTS = Object.fromEntries(
  Object.entries(FLAG_DATA).map(([key, value]) => [key, value.component])
);

/**
 * Japanese prefectures - all map to Japan flag
 * Includes both plain names and -ken suffix variations
 */
const JAPAN_PREFECTURES = [
  'tokyo',
  'osaka',
  'aichi',
  'fukuoka',
  'hokkaido',
  'hyogo',
  'kanagawa',
  'saitama',
  'chiba',
  'shizuoka',
  'hiroshima',
  'kyoto',
  'miyagi',
  'niigata',
  'nagano',
  'gifu',
  'tochigi',
  'gunma',
  'okayama',
  'mie',
  'kumamoto',
  'kagoshima',
  'yamaguchi',
  'nagasaki',
  'ehime',
  'aomori',
  'iwate',
  'oita',
  'ishikawa',
  'yamagata',
  'miyazaki',
  'toyama',
  'akita',
  'wakayama',
  'nara',
  'shiga',
  'fukushima',
  'saga',
  'kochi',
  'tokushima',
  'kagawa',
  'okinawa',
  'tottori',
  'shimane',
  'yamanashi',
  'fukui',
  'ibaraki',
];

/**
 * Get flag data (component and country code) from shusshin (birthplace/origin)
 *
 * @param {string} shusshin - The shusshin value from API (e.g., "Mongolia, Ulaanbaatar" or "Tokyo")
 * @returns {{ component: React.ComponentType, code: string }|null} Flag data or null if not found
 */
export function getFlagData(shusshin) {
  if (!shusshin) return null;

  const lowerShusshin = shusshin.toLowerCase();

  // Check for Japanese prefectures FIRST to avoid false positives
  // (e.g., "Oita-ken, Usa-shi" should not match "usa")
  // Check for -ken suffix pattern (e.g., "ibaraki-ken")
  if (lowerShusshin.includes('-ken')) {
    for (const prefecture of JAPAN_PREFECTURES) {
      if (lowerShusshin.includes(prefecture)) {
        return FLAG_DATA.japan;
      }
    }
  }

  // Check for Japanese prefectures without -ken suffix
  for (const prefecture of JAPAN_PREFECTURES) {
    if (lowerShusshin.includes(prefecture)) {
      return FLAG_DATA.japan;
    }
  }

  // Check for country match - use word boundary to avoid partial matches
  for (const [country, data] of Object.entries(FLAG_DATA)) {
    // Create a regex that matches the country as a whole word or at start of string
    const regex = new RegExp(`(^|[^a-z])${country}([^a-z]|$)`, 'i');
    if (regex.test(lowerShusshin)) {
      return data;
    }
  }

  // Default to Japan flag for Japanese names without recognizable prefecture
  // Most shusshin values without a country name are Japanese
  if (!lowerShusshin.includes(',') || lowerShusshin.match(/^[a-z\s]+$/)) {
    return FLAG_DATA.japan;
  }

  return null;
}

/**
 * Get flag component from shusshin (birthplace/origin)
 *
 * @param {string} shusshin - The shusshin value from API (e.g., "Mongolia, Ulaanbaatar" or "Tokyo")
 * @returns {React.ComponentType|null} Flag component or null if not found
 */
export function getFlagComponent(shusshin) {
  const data = getFlagData(shusshin);
  return data?.component || null;
}

// Export individual components for direct use
export {
  FlagJapan,
  FlagMongolia,
  FlagUkraine,
  FlagRussia,
  FlagChina,
  FlagUSA,
  FlagPhilippines,
  FlagKazakhstan,
};
