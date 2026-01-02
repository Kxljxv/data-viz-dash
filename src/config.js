import { dev } from "$app/environment";

// Auth0 Configuration
export const AUTH0_DOMAIN = "dev-l3cgimaqtit76flm.us.auth0.com";
export const AUTH0_CLIENT_ID = "KOZ8r6x1r1GmvKSTFMb9Y0sTg3tz1P3a";
export const AUTH0_CLIENT_SECRET = import.meta.env.AUTH0_CLIENT_SECRET || "";

// Role IDs
export const ROLE_ADMIN = "rol_85l7HNkIgBLXRw5B";
export const ROLE_AEA_USER = "rol_p2JLyXK9UfqFXzCI";

// Session Configuration
export const SESSION_COOKIE_NAME = "aea_session";
export const SESSION_TOKEN_TTL = 1 * 24 * (60 * 60); // 1 day in seconds
export const LOGIN_JWT_SECRET = import.meta.env.LOGIN_JWT_SECRET || "dev-secret-change-in-production";

// App Configuration
export const WEBSITE_NAME = "AEA Graph Visualization";
export const APP_DOMAIN = dev ? "localhost:5173" : (import.meta.env.VITE_APP_DOMAIN || "data-viz-dash.koljav.workers.dev");
export const WEBSITE_DESCRIPTION = "Interaktive Netzwerk-Visualisierung für politische Anträge und Unterstützer*innen";

// Data Projects
export const AVAILABLE_PROJECTS = ["bdk", "la", "ldk_la"];

