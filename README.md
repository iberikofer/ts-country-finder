# 🌍 Country Finder

An interactive, responsive web application for searching and exploring country profiles, national flags, capitals, demographics, official languages, and currencies across the globe.

---

## ✨ Features

- **⚡ Instant Debounced Search**: Fast, responsive querying with 300ms debounce to minimize unnecessary computation.
- **🛡️ Resilient Dual-Data Architecture**: Queries the REST Countries API with an intelligent fallback to an embedded dataset, ensuring 100% offline availability and immunity to external API deprecations or rate limits.
- **🚫 Request Cancellation (Race Condition Prevention)**: Built-in `AbortController` cleanly terminates in-flight network requests as the user types or clears the search bar.
- **🎯 Smart Results Presentation**:
  - **Single Match**: Displays a rich, glassmorphic country profile card featuring high-resolution SVG flags, official and native names, capital city, population formatted with commas, region/subregion, languages, and currencies.
  - **2–10 Matches**: Displays an interactive grid of country preview cards with flags and regions; clicking or pressing Enter/Space instantly opens full country details.
  - **>10 Matches**: Prompts user with a polite toast notification to narrow down the query.
  - **0 Matches**: Informs the user when no country matches the query.
- **♿ Semantic HTML5 & Accessibility (A11y)**:
  - Accessible landmarks (`<header>`, `<main>`, `<section>`, `<footer>`, `<form role="search">`).
  - Screen reader announcements using `aria-live="polite"`.
  - Accessible keyboard navigation (`tabindex="0"`, Enter/Space key triggers).
  - Clear, accessible focus indicators and reduced-motion query support (`prefers-reduced-motion`).
- **🎨 Premium Modern Design**:
  - Curated cosmic slate palette with CSS Custom Properties.
  - Frosted glassmorphism surfaces (`backdrop-filter: blur()`).
  - Fluid micro-interactions and smooth transition animations.
  - Custom vector SVG favicon with world globe and compass motifs.
  - Fully responsive layout across mobile, tablet, and desktop viewports.

---

## 🛠️ Tech Stack

- **Core**: TypeScript (Strict Mode, ES2022), HTML5 Semantics
- **Styling**: Vanilla CSS3 (CSS Variables, Flexbox, CSS Grid, Glassmorphism)
- **Bundler**: [Parcel 2](https://parceljs.org/)
- **Utilities**:
  - `lodash.debounce` & `@types/lodash.debounce`: Debounced input handling
  - `notiflix`: Modern toast notifications
- **Data Source**: REST Countries v3.1 Standards / Open Country Intelligence
- **CI/CD**: GitHub Actions (`deploy.yml` on Ubuntu with Node 20 LTS)

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18.x, 20.x, or newer recommended)
- `npm` (version 9.x or newer)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/iberikofer/ts-country-finder.git
   cd ts-country-finder
   ```

2. **Install dependencies cleanly:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables (Optional):**
   Copy the `.env.example` template to `.env`:
   ```bash
   cp .env.example .env
   ```
   The `.env` file allows configuring a custom REST Countries API endpoint if needed:
   ```env
   REST_COUNTRIES_BASE_URL=https://restcountries.com/v3.1
   ```

---

## 💻 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm start` | Starts the Parcel development server with Hot Module Replacement (HMR) at `http://localhost:1234` |
| `npm run typecheck` | Validates TypeScript types across the entire project (`tsc --noEmit`) |
| `npm run build` | Runs type checking and bundles the production build into the `dist/` directory with public URL configured for GitHub Pages |

---

## 📁 Project Structure

```
ts-country-finder/
├── .github/
│   └── workflows/
│       └── deploy.yml          # Automated CI/CD pipeline for GitHub Pages
├── src/
│   ├── css/
│   │   └── styles.css          # Design system tokens, glassmorphism, responsive styles
│   ├── data/
│   │   └── countries.ts        # Normalized country intelligence fallback dataset
│   ├── ts/
│   │   └── fetchCountries.ts   # Pure async/await API & data resolution module
│   ├── types/
│   │   ├── country.ts          # Strongly-typed Country and RawCountry interfaces
│   │   └── declarations.d.ts   # Asset module declarations (CSS, SVG)
│   ├── favicon.svg             # Custom vector globe & compass favicon
│   ├── index.html              # Semantic HTML5 document with a11y landmarks
│   └── index.ts                # App state, DOM controllers, and event orchestration
├── .editorconfig               # Editor consistency settings
├── .env.example                # Environment configuration template
├── .gitignore                  # Stack-specific Git exclusion rules
├── .htmlnanorc                 # HTML minification settings
├── .parcelrc                   # Parcel bundler configuration
├── .prettierrc                 # Prettier code formatting rules
├── package.json                # Project dependencies and npm scripts
├── tsconfig.json               # TypeScript compiler configuration (strict mode)
└── README.md                   # Comprehensive project documentation
```

---

## 🌐 Deployment

The project is automatically deployed to **GitHub Pages** via GitHub Actions whenever changes are pushed to the `main` branch.

### Manual Workflow Dispatch
You can also manually trigger a deployment at any time from the GitHub repository:
1. Navigate to the **Actions** tab on GitHub.
2. Select **Build and deploy to GitHub Pages**.
3. Click **Run workflow** on branch `main`.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
