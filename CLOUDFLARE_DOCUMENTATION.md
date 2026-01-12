# Internal Cloudflare Implementation Documentation

This document outlines the architectural implementation of Cloudflare's serverless infrastructure within the platform. The system leverages the Cloudflare Workers ecosystem to provide a high-performance, globally distributed backend.

## Architectural Components

The platform is designed to run entirely on the "Edge," utilizing the following Cloudflare services:

### 1. Compute: Cloudflare Workers
The entire backend logic is implemented as a Cloudflare Worker. This allows for:
*   **Zero Cold Starts**: Requests are handled immediately by the nearest data center.
*   **Global Distribution**: Code runs in 300+ cities worldwide, minimizing latency for the user.
*   **Platform Object Integration**: Access to environment variables and storage namespaces through a standardized `platform` object.

### 2. Storage: Workers KV (Key-Value Storage)
The platform utilizes Workers KV for high-read, low-latency data storage. It is used in two primary capacities:

#### A. Session Management (`LOGIN_SESSION_CACHE`)
*   **Purpose**: Stores active user session data to maintain state across requests.
*   **Logic**: When a session is created, the session metadata is stored in KV with a specific Time-To-Live (TTL). Subsequent requests verify the session against this cache.
*   **Key Structure**: `[session_id]` -> `JSON{user_id, email, roles, created_at, expire_at}`

#### B. Application Data (`DATA_CACHE`)
*   **Purpose**: Stores user-specific data and analytical results.
*   **Use Cases**:
    *   **User Profiles**: Storing preferences and metadata (e.g., associated organizations).
    *   **Saved Analyses**: Storing configuration and results of the Density Analysis tool.
*   **Key Structures**:
    *   `user_profile:[user_id]` -> `JSON{nickname, email, kreisverband, updatedAt}`
    *   `user_analyses:[user_id]` -> `Array<JSON{analysis_metadata, results}>`

### 3. Static Assets: Cloudflare Pages / Workers Sites
Static files (HTML, CSS, JavaScript, and fonts) are served directly from Cloudflare's edge, ensuring they are delivered with minimal latency.

---

## Internal Settings and Configuration

The following settings define the integration with the Cloudflare environment.

### Namespace Bindings
The platform expects the following KV namespaces to be bound to the Worker environment:

*   **`LOGIN_SESSION_CACHE`**
    *   **Description**: Dedicated storage for session persistence.
    *   **TTL Configuration**: Default is 86,400 seconds (1 day), matching the session cookie validity.
*   **`DATA_CACHE`**
    *   **Description**: General-purpose storage for user profiles and analytical data.
    *   **Persistence**: Data in this namespace is persistent unless explicitly deleted.

### Environment Variables
*   **`LOGIN_JWT_SECRET`**
    *   The secret key used for signing session tokens.
*   **`AUTH0_CLIENT_SECRET`**
    *   The secret key used for back-channel communication with the authentication provider.
*   **`VITE_APP_DOMAIN`**
    *   The public domain where the application is hosted (e.g., `data-viz-dash.koljav.workers.dev`).

---

## Deployment and Lifecycle

### Build and Deploy Process
The platform uses a standardized deployment pipeline:
1.  **Build**: The application is compiled into a single optimized worker script.
2.  **Preview**: Local development is handled using a simulator (`wrangler dev`) that mimics the Cloudflare environment.
3.  **Deploy**: The compiled script and static assets are pushed to Cloudflare using the `wrangler` CLI.

### Logging and Monitoring
*   **Internal Logger**: A centralized logging utility routes messages based on the environment (development vs. production).
*   **Edge Logs**: Real-time request logs are available through the Cloudflare dashboard for debugging and performance monitoring.
*   **Admin Statistics**: An internal API aggregates data across KV namespaces to provide insights into total users, active sessions, and data distribution.

---

## Development Mode Fallbacks
To facilitate development outside of the Cloudflare environment, the platform includes "mock" implementations:
*   If KV namespaces are not bound (e.g., during local testing), the system defaults to in-memory storage or empty responses to prevent crashes.
*   Errors related to missing bindings are logged as warnings rather than fatal errors in non-production environments.
