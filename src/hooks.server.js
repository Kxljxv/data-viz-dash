import { redirect } from "@sveltejs/kit";
import { dev } from "$app/environment";
import { getUserSession, isAdmin, hasAeaAccess } from "$lib/server/auth";
import { SESSION_COOKIE_NAME } from "$config";
import { log_message } from "$lib/server/log";

const app_env = dev ? "development" : "production";
const place = "hooks";

// Protected routes that require authentication
const protected_routes = ["/dashboard", "/admin", "/profile"];

// Admin-only routes
const admin_routes = ["/admin"];

/**
 * Checks if a path matches any of the protected routes
 * @param {string} pathname - Path to check
 * @param {string[]} routes - Array of route patterns
 * @returns {boolean}
 */
function isProtectedRoute(pathname, routes) {
	return routes.some(route => pathname.startsWith(route));
}

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	const { url, cookies, platform } = event;
	const pathname = url.pathname;

	log_message(platform, app_env, place, "info", `Request to: ${pathname}`);

	// Skip auth for public routes and auth routes
	if (
		pathname.startsWith("/auth") ||
		pathname.startsWith("/api") ||
		pathname === "/" ||
		pathname.startsWith("/blog") ||
		pathname.startsWith("/contact") ||
		pathname.startsWith("/terms") ||
		pathname.startsWith("/data") // Static data files
	) {
		return await resolve(event);
	}

	// Check if route is protected
	if (isProtectedRoute(pathname, protected_routes)) {
		// Get user session from cookie
		const sessionResult = await getUserSession(platform, cookies);

		if (!sessionResult.user) {
			// No valid session, redirect to sign-in
			log_message(platform, app_env, place, "info", `No session, redirecting to sign-in from ${pathname}`);
			const redirectUrl = `/sign-in?redirect=${encodeURIComponent(pathname)}`;
			throw redirect(303, redirectUrl);
		}

		// Check if user has AEA access
		if (!hasAeaAccess(sessionResult.user.roles)) {
			log_message(platform, app_env, place, "warn", `User ${sessionResult.user.email} lacks AEA access. Roles: ${JSON.stringify(sessionResult.user.roles)}`);
			throw redirect(303, "/sign-in?error=no_access");
		}

		// Check admin routes
		if (isProtectedRoute(pathname, admin_routes) && !isAdmin(sessionResult.user.roles)) {
			log_message(platform, app_env, place, "warn", `User ${sessionResult.user.email} lacks admin access`);
			throw redirect(303, "/dashboard?error=admin_required");
		}

		// Set user in locals for use in load functions
		event.locals.user = sessionResult.user;
		event.locals.session = sessionResult.session;

		log_message(platform, app_env, place, "info", `Authenticated user: ${sessionResult.user.email}`);
	}

	return await resolve(event);
}

