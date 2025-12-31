# AEA Graph Visualization - Repository Overview

## Project Overview
The AEA (Antrags- und Entitäts-Analyse) Graph Visualization platform is a high-performance, interactive network visualization tool built with **Svelte 5** and **D3.js**. It is designed to analyze complex relationships between political motions and their supporters.

## Tech Stack
- **Frontend**: Svelte 5 (Runes), SvelteKit, D3.js, Tailwind CSS v4, Lucide Svelte.
- **Backend & Infrastructure**: Cloudflare Pages (Adapter Cloudflare), Node.js.
- **Data Processing**: Python (Scraping and Data Preparation).
- **Authentication**: Auth0 via `@auth0/auth0-spa-js`.
- **Testing**: Vitest.

## Project Structure
- `src/`: Main application source code.
  - `lib/`: Shared components, utilities, and logic (Auth, i18n, etc.).
  - `routes/`: SvelteKit routes (Public, Protected, Auth, API).
- `data_processing/`: Python scripts for data extraction and preparation.
- `design_library/`: Component documentation and design assets.
- `static/`: Static assets and data files.
- `tests/`: Unit and integration tests.

## Getting Started
### Prerequisites
- Node.js (v18+)
- npm

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Build & Preview
```bash
npm run build
npm run preview
```

## Data Processing
The `data_processing/` directory contains Python scripts for fetching and processing data:
- `download_pdfs.py`: Downloads PDF documents.
- `extract_data.py`: Main data extraction logic.
- `urls_getter.py`: Utility for gathering source URLs.

## Deployment
The project is configured for deployment on **Cloudflare Pages**.
```bash
npm run deploy
```
