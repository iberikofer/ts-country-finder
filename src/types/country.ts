export interface CountryFlags {
  svg: string;
  png: string;
}

export interface Country {
  officialName: string;
  commonName: string;
  flags: CountryFlags;
  capital: string;
  languages: string;
  currencies: string;
  population: number;
  region: string;
  subregion: string;
  nativeName: string;
}

export interface RawCountryName {
  common?: string;
  official?: string;
  nativeName?: Record<string, { official?: string; common?: string }>;
}

export interface RawCurrency {
  name?: string;
  symbol?: string;
  code?: string;
}

export interface RawLanguage {
  name?: string;
  nativeName?: string;
  iso639_1?: string;
  iso639_2?: string;
}

export interface RawCountry {
  name?: string | RawCountryName;
  flags?: {
    svg?: string;
    png?: string;
  };
  flag?: string;
  capital?: string | string[];
  languages?: Record<string, string> | RawLanguage[] | string[];
  currencies?: Record<string, RawCurrency> | RawCurrency[];
  population?: number | string;
  region?: string;
  subregion?: string;
  nativeName?: string;
  alpha2Code?: string;
  alpha3Code?: string;
  cca2?: string;
  cca3?: string;
  [key: string]: unknown;
}
