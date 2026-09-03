import localCountries from '../data/countries.js';

const BASE_URL = process.env.REST_COUNTRIES_BASE_URL || 'https://restcountries.com/v3.1';
const FETCH_FIELDS = 'name,capital,population,flags,languages,region,subregion,currencies';

const EXCLUDED_CODES = new Set(['RU', 'RUS']);
const EXCLUDED_NAMES = ['russia', 'russian federation', 'росія', 'россия'];

/**
 * Checks whether a country matches the excluded entity.
 */
function isExcludedCountry(country) {
  if (!country) return true;
  const alpha2 = (country.alpha2Code || country.cca2 || '').toUpperCase();
  const alpha3 = (country.alpha3Code || country.cca3 || '').toUpperCase();
  if (EXCLUDED_CODES.has(alpha2) || EXCLUDED_CODES.has(alpha3)) return true;

  const rawName =
    typeof country.name === 'object'
      ? `${country.name.official || ''} ${country.name.common || ''}`
      : String(country.name || '');
  const nameLower = rawName.toLowerCase();
  return EXCLUDED_NAMES.some(term => nameLower.includes(term));
}

/**
 * Normalizes country objects from either REST Countries API v2/v3.1 or local dataset
 * into a standardized model for the application.
 */
function normalizeCountry(country) {
  // Normalize Name
  const officialName =
    typeof country.name === 'object'
      ? country.name.official || country.name.common
      : country.name;
  const commonName =
    typeof country.name === 'object'
      ? country.name.common || country.name.official
      : country.name;

  // Normalize Flags
  const flags = {
    svg: country.flags?.svg || country.flag || '',
    png: country.flags?.png || ''
  };

  // Normalize Capital
  let capital = 'N/A';
  if (Array.isArray(country.capital) && country.capital.length > 0) {
    capital = country.capital.join(', ');
  } else if (typeof country.capital === 'string' && country.capital) {
    capital = country.capital;
  }

  // Normalize Languages
  let languages = 'N/A';
  if (Array.isArray(country.languages)) {
    languages = country.languages.map(l => l.name || l).join(', ');
  } else if (typeof country.languages === 'object' && country.languages !== null) {
    languages = Object.values(country.languages).join(', ');
  }

  // Normalize Currencies
  let currencies = 'N/A';
  if (Array.isArray(country.currencies)) {
    currencies = country.currencies
      .map(c => (c.symbol ? `${c.name} (${c.symbol})` : c.name))
      .join(', ');
  } else if (typeof country.currencies === 'object' && country.currencies !== null) {
    currencies = Object.values(country.currencies)
      .map(c => (c.symbol ? `${c.name} (${c.symbol})` : c.name))
      .join(', ');
  }

  // Population
  const population = Number(country.population) || 0;

  return {
    officialName,
    commonName,
    flags,
    capital,
    languages,
    currencies,
    population,
    region: country.region || 'N/A',
    subregion: country.subregion || 'N/A',
    nativeName: country.nativeName || commonName
  };
}

/**
 * Searches local dataset as a resilient fallback or primary search engine.
 */
function searchLocalCountries(query) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return [];

  const matched = localCountries.filter(item => {
    if (isExcludedCountry(item)) return false;

    const common = (typeof item.name === 'object' ? item.name.common : item.name) || '';
    const official = (typeof item.name === 'object' ? item.name.official : item.name) || '';
    const native = item.nativeName || '';
    const alpha2 = item.alpha2Code || item.cca2 || '';
    const alpha3 = item.alpha3Code || item.cca3 || '';

    return (
      common.toLowerCase().includes(normalizedQuery) ||
      official.toLowerCase().includes(normalizedQuery) ||
      native.toLowerCase().includes(normalizedQuery) ||
      alpha2.toLowerCase() === normalizedQuery ||
      alpha3.toLowerCase() === normalizedQuery
    );
  });

  return matched.map(normalizeCountry);
}

/**
 * Fetches countries by name with async/await, AbortController support,
 * error handling, and guaranteed fallback to reliable country data.
 *
 * @param {string} name - Country name to search
 * @param {AbortSignal} [signal] - Optional AbortSignal for request cancellation
 * @returns {Promise<Array>} List of normalized country objects
 */
export async function fetchCountries(name, signal) {
  const query = name.trim();
  if (!query) return [];

  const lower = query.toLowerCase();
  if (EXCLUDED_NAMES.includes(lower) || lower === 'ru' || lower === 'rus') {
    throw new Error('NOT_FOUND');
  }

  const encodedName = encodeURIComponent(query);
  const endpoint = `${BASE_URL}/name/${encodedName}?fields=${FETCH_FIELDS}`;

  try {
    const response = await fetch(endpoint, { signal });

    if (response.ok) {
      const data = await response.json();

      // REST Countries deprecation check: returns HTTP 200 with success: false
      if (data && data.success === false) {
        console.warn('Remote API returned deprecation/error response. Using verified local dataset.');
        const fallback = searchLocalCountries(query);
        if (fallback.length === 0) {
          throw new Error('NOT_FOUND');
        }
        return fallback;
      }

      if (Array.isArray(data) && data.length > 0) {
        const filtered = data.filter(c => !isExcludedCountry(c));
        if (filtered.length === 0) {
          throw new Error('NOT_FOUND');
        }
        return filtered.map(normalizeCountry);
      }
    }

    if (response.status === 404) {
      // Check fallback before rejecting
      const fallback = searchLocalCountries(query);
      if (fallback.length > 0) return fallback;
      throw new Error('NOT_FOUND');
    }

    // On other HTTP error codes, attempt local dataset
    const fallback = searchLocalCountries(query);
    if (fallback.length > 0) return fallback;
    throw new Error(`HTTP_${response.status}`);
  } catch (error) {
    if (error.name === 'AbortError') {
      throw error; // Re-throw abort error to be handled by caller
    }

    // If network failed (offline, CORS, DNS), search local dataset
    const fallback = searchLocalCountries(query);
    if (fallback.length > 0) {
      return fallback;
    }

    throw new Error('NOT_FOUND');
  }
}
