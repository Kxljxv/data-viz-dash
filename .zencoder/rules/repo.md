---
description: Repository Information Overview
alwaysApply: true
---

# Repository Information Overview

## Repository Summary
The AEA (Antrags- und Entitäts-Analyse) Graph Visualization platform is a high-performance, interactive network visualization tool designed to analyze political motions and their supporters. It uses Svelte 5 (Runes) and D3.js for the frontend and is optimized for Cloudflare Pages deployment. A separate Python-based pipeline handles data extraction and preparation.

## Repository Structure
- **`src/`**: Core SvelteKit application source code including components, routes, and business logic.
- **`data_processing/`**: Python scripts for web scraping, PDF downloading, and data extraction.
- **`static/data/`**: Processed JSON data used by the visualization engine.
- **`tests/`**: Unit and integration tests for the frontend.
- **`design_library/` & `html_design_library/`**: Documentation and components for the project's design system.

### Main Repository Components
- **Frontend (SvelteKit)**: The main user interface and graph visualization engine.
- **Data Pipeline (Python)**: Utility scripts for preparing data from external sources.

## Projects

### AEA Graph Visualization (SvelteKit App)
**Configuration File**: `package.json`, `svelte.config.js`, `wrangler.toml`

#### Language & Runtime
**Language**: JavaScript / TypeScript  
**Version**: Node.js v18+  
**Build System**: Vite  
**Package Manager**: npm

#### Dependencies
**Main Dependencies**:
- `svelte`: ^5.43.8 (Runes)
- `d3`: ^7.9.0 (Graph engine)
- `@observablehq/plot`: ^0.6.17
- `pdfjs-dist`: ^5.4.449
- `@auth0/auth0-spa-js`: ^2.11.0
- `@tsndr/cloudflare-worker-jwt`: ^2.5.3

**Development Dependencies**:
- `@sveltejs/kit`: ^2.48.5
- `@sveltejs/adapter-cloudflare`: ^7.2.4
- `tailwindcss`: ^4.1.18
- `vitest`: ^2.0.0
- `wrangler`: ^4.56.0

#### Build & Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Deploy to Cloudflare
npm run deploy
```

#### Testing
**Framework**: Vitest
**Test Location**: `src/**/*.test.js`, `tests/`
**Naming Convention**: `*.test.js`
**Configuration**: `vitest.config.js`, `tests/setup.js`

**Run Command**:
```bash
npm run test
# Or specifically
npm run test:unit
npm run test:integration
```

### Data Processing Pipeline (Python)
**Type**: Suite of utility scripts

#### Specification & Tools
**Type**: Python Data Processing  
**Version**: Python 3.x  
**Required Tools**: Python 3, pip

#### Key Resources
**Main Files**:
- `data_processing/extract_data.py`: Main data extraction logic.
- `data_processing/download_pdfs.py`: Script for downloading source documents.
- `data_processing/urls_getter.py`: Utility for retrieving target URLs.

**Configuration Structure**:
- Scripts process data into `static/data/` for frontend consumption.

#### Usage & Operations
**Key Commands**:
```bash
# Example usage (commands depend on specific script needs)
python data_processing/extract_data.py
python data_processing/download_pdfs.py
```

#### Validation
**Quality Checks**: Manual verification of generated JSON data in `static/data/`.
**Testing Approach**: No automated test suite found for Python scripts; validation is performed via data inspection.
