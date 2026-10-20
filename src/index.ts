import './css/styles.css';
import debounce from 'lodash.debounce';
import { fetchCountries } from './ts/fetchCountries';
import Notiflix from 'notiflix';
import type { Country } from './types/country';

// Initialize Notiflix Theme
Notiflix.Notify.init({
  width: '340px',
  position: 'right-top',
  distance: '20px',
  borderRadius: '12px',
  timeout: 3500,
  clickToClose: true,
  useIcon: true,
  fontSize: '14px',
  fontFamily: 'Plus Jakarta Sans, -apple-system, BlinkMacSystemFont, sans-serif',
  cssAnimationStyle: 'from-right',
  info: {
    background: '#1e293b',
    textColor: '#f8fafc',
    notiflixIconColor: '#38bdf8'
  },
  failure: {
    background: '#7f1d1d',
    textColor: '#fef2f2',
    notiflixIconColor: '#f87171'
  },
  success: {
    background: '#064e3b',
    textColor: '#ecfdf5',
    notiflixIconColor: '#34d399'
  }
});

const DEBOUNCE_DELAY = 300;

// DOM Elements
const searchInput = document.querySelector<HTMLInputElement>('#search-box');
const clearBtn = document.querySelector<HTMLButtonElement>('#clear-search-btn');
const countryList = document.querySelector<HTMLUListElement>('#country-list');
const countryInfo = document.querySelector<HTMLDivElement>('#country-info');
const searchStatus = document.querySelector<HTMLDivElement>('#search-status');

// State
let abortController: AbortController | null = null;
let currentResults: Country[] = [];

// Event Listeners
if (searchInput) {
  searchInput.addEventListener('input', debounce(onInput, DEBOUNCE_DELAY));
  searchInput.addEventListener('input', toggleClearButton);
}

if (clearBtn) {
  clearBtn.addEventListener('click', onClearClick);
}

if (countryList) {
  countryList.addEventListener('click', onCountryItemClick);
  countryList.addEventListener('keydown', onCountryItemKeyDown);
}

/**
 * Toggles the clear button visibility based on input length
 */
function toggleClearButton(): void {
  if (clearBtn && searchInput) {
    clearBtn.hidden = searchInput.value.trim().length === 0;
  }
}

/**
 * Handles clearing the search bar and results
 */
function onClearClick(): void {
  if (abortController) {
    abortController.abort();
    abortController = null;
  }
  if (searchInput) {
    searchInput.value = '';
    searchInput.focus();
  }
  toggleClearButton();
  clearMarkup();
}

/**
 * Clears DOM elements and search state
 */
export function clearMarkup(): void {
  if (countryList) countryList.innerHTML = '';
  if (countryInfo) countryInfo.innerHTML = '';
  if (searchStatus) searchStatus.innerHTML = '';
  currentResults = [];
}

/**
 * Renders loading status
 */
function showLoading(): void {
  if (!searchStatus) return;
  searchStatus.innerHTML = `
    <div class="loader-container">
      <span class="spinner" aria-hidden="true"></span>
      <span class="loader-text">Searching countries...</span>
    </div>
  `;
}

/**
 * Removes loading status
 */
function hideLoading(): void {
  if (searchStatus) searchStatus.innerHTML = '';
}

/**
 * Main input handler with AbortController and async/await
 */
async function onInput(event: Event): Promise<void> {
  const target = event.target as HTMLInputElement | null;
  const query = target ? target.value.trim() : '';

  // Cancel any existing in-flight request
  if (abortController) {
    abortController.abort();
  }

  if (!query) {
    clearMarkup();
    return;
  }

  abortController = new AbortController();
  showLoading();

  try {
    const data = await fetchCountries(query, abortController.signal);
    hideLoading();
    currentResults = data;
    handleSearchResults(data);
  } catch (error: unknown) {
    // If request was cancelled by subsequent typing, ignore
    if (error instanceof Error && error.name === 'AbortError') {
      return;
    }
    hideLoading();
    clearMarkup();
    Notiflix.Notify.failure('Oops, there is no country with that name 😞');
  } finally {
    abortController = null;
  }
}

/**
 * Dispatches results according to length
 */
function handleSearchResults(data: Country[]): void {
  clearMarkup();
  currentResults = data;

  if (data.length > 10) {
    Notiflix.Notify.info(
      'Too many matches found. Please enter a more specific name. 🤔'
    );
  } else if (data.length >= 2) {
    if (countryList) countryList.innerHTML = buildCountryListMarkup(data);
  } else if (data.length === 1) {
    if (countryInfo) countryInfo.innerHTML = buildCountryDetailsMarkup(data[0]);
  }
}

/**
 * Builds HTML for 2-10 matching countries
 */
function buildCountryListMarkup(countries: Country[]): string {
  return countries
    .map((country, index) => {
      const { officialName, commonName, flags, region } = country;
      const displayName = commonName || officialName;
      return `
        <li class="country-list-item" data-index="${index}" tabindex="0" role="button" aria-label="View details for ${displayName}">
          <div class="flag-wrapper">
            <img
              src="${flags.svg}"
              alt="National flag of ${displayName}"
              class="country-flag-thumb"
              loading="lazy"
              width="48"
              height="32"
            />
          </div>
          <div class="country-list-meta">
            <span class="country-list-name">${displayName}</span>
            <span class="country-list-region">${region}</span>
          </div>
          <span class="arrow-hint" aria-hidden="true">&rarr;</span>
        </li>
      `;
    })
    .join('');
}

/**
 * Builds detailed HTML markup for a single country
 */
function buildCountryDetailsMarkup(country: Country): string {
  const {
    officialName,
    commonName,
    flags,
    capital,
    population,
    languages,
    currencies,
    region,
    subregion,
    nativeName
  } = country;

  const displayName = commonName || officialName;
  const isDifferentOfficial = officialName && officialName !== displayName;

  return `
    <article class="country-card">
      <header class="country-card-header">
        <div class="flag-card-wrapper">
          <img
            src="${flags.svg}"
            alt="National flag of ${displayName}"
            class="country-card-flag"
          />
        </div>
        <div class="header-titles">
          <h2 class="country-card-title">${displayName}</h2>
          ${
            isDifferentOfficial
              ? `<p class="country-official-name">${officialName}</p>`
              : ''
          }
          ${
            nativeName && nativeName !== displayName
              ? `<p class="country-native-name">Native: <span>${nativeName}</span></p>`
              : ''
          }
        </div>
      </header>

      <div class="country-stats-grid">
        <div class="stat-card">
          <span class="stat-label">Capital</span>
          <span class="stat-value">${capital}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Population</span>
          <span class="stat-value">${population.toLocaleString()}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Region</span>
          <span class="stat-value">${region}${subregion ? ` / ${subregion}` : ''}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Languages</span>
          <span class="stat-value">${languages}</span>
        </div>
        <div class="stat-card stat-card-wide">
          <span class="stat-label">Currencies</span>
          <span class="stat-value">${currencies}</span>
        </div>
      </div>
    </article>
  `;
}

/**
 * Handle click on a country list item to display its details
 */
function onCountryItemClick(event: Event): void {
  const target = event.target as HTMLElement | null;
  const item = target?.closest<HTMLElement>('.country-list-item');
  if (!item) return;

  const indexStr = item.dataset.index;
  if (indexStr === undefined) return;

  const index = parseInt(indexStr, 10);
  const selectedCountry = currentResults[index];
  if (selectedCountry) {
    if (countryList) countryList.innerHTML = '';
    if (countryInfo) countryInfo.innerHTML = buildCountryDetailsMarkup(selectedCountry);
  }
}

/**
 * Handle keyboard (Enter/Space) selection on list items for a11y
 */
function onCountryItemKeyDown(event: KeyboardEvent): void {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    onCountryItemClick(event);
  }
}
