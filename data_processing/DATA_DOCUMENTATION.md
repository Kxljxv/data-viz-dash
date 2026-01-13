# Data Processing Documentation

This document describes the data structures, scripts, and files within the `data_processing` directory of the project.

## Directory Overview

The `data_processing` folder contains the tools and data used to scrape, process, and visualize amendment data from various Green Party conventions.

### Subdirectories

- **`html_starting_pages/`**: Contains the main overview HTML files for each convention (e.g., `43bdk.html`). These are used as entry points for the scraper.
- **`amendments_html/`**: A large collection of HTML files, each representing an individual amendment's page. These are downloaded and parsed to extract details like authors and supporters.

## Core Data Files

### `amendments_pipeline.yaml`
The primary data source for the network graph and other visualizations. It contains a structured list of all scraped amendments.

**Structure:**
- **Key**: Unique slug for each amendment (e.g., `43bdk-motion-789`).
- **Fields**:
  - `convention`: ID of the convention (e.g., `43bdk`).
  - `url`: Direct link to the amendment on the original website.
  - `label`: The title or descriptive label of the amendment.
  - `author`: Name of the primary author (if available).
  - `isperson`: Boolean indicating if the applicant is a person or an organization.
  - `type`: The category (e.g., `motion`, `amendment`).
  - `applicant_details`: Dictionary containing `id`, `name`, and `kv` (district association).
  - `supporters`: A list of individuals supporting the amendment, each with `id`, `name`, and `kv`.

### `conventions_network.gexf`
A network graph file in GEXF format, suitable for visualization in tools like Gephi or web-based graph libraries.

**Graph Model:**
- **Bipartite Graph**: Contains two types of nodes: `amendment` and `person`.
- **Node Weights**:
  - **Amendment**: Number of supporters.
  - **Person**: `(Number of supported amendments) + (Number of authored amendments * 5)`.
- **Edges**:
  - **Authorship**: Connects a person to an amendment they authored (Weight: 5).
  - **Support**: Connects a person to an amendment they supported (Weight: 1).
- **Filtering**: Nodes with no connections (isolated nodes) are excluded.

### SQLite Databases
- **`amendments.sqlite`**: Stores amendment data in a relational format for efficient querying.
- **`persons.sqlite`**: Stores information about individuals (authors and supporters).

## Scripts

### `pipeline_scraper.py`
The main scraping engine.
- Downloads overview pages and individual amendment pages.
- Parses HTML using BeautifulSoup.
- Handles retries and asynchronous downloads for performance.
- Generates `amendments_pipeline.yaml`.

### `generate_conventions_gexf.py`
Generates the network graph from the YAML data.
- Processes authors and supporters to create a person-to-amendment network.
- Calculates dynamic weights for nodes and edges.
- Ensures XML validity by escaping special characters.
- Filters out isolated nodes to keep the graph focused.

### `yaml_to_sqlite.py`
Utility script to migrate data from the `amendments_pipeline.yaml` file into the SQLite databases for use in the dashboard.

### `yaml_to_gexf.py`
An alternative or older script for GEXF generation (superseded by `generate_conventions_gexf.py`).

## Other Files
- **`error.log`**: Records any issues encountered during scraping or processing.
- **`old.zip`**: Archive of legacy data or scripts.
