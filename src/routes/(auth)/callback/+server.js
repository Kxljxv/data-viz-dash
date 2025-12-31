import { redirect } from "@sveltejs/kit";
import { exchangeAuth0Code, validateAuth0Token, extractRoles, createSessionToken, hasAeaAccess } from "$lib/server/auth";
import { write_login_session } from "$lib/server/session";
import { SESSION_COOKIE_NAME, SESSION_TOKEN_TTL, AUTH0_DOMAIN, AUTH0_CLIENT_ID } from "$config";
import { log_message } from "$lib/server/log";

/** @type {import('./$types').RequestHandler} */
export async function GET({ url, platform, cookies, getClientAddress }) {
	const code = url.searchParams.get("code");
	const state = url.searchParams.get("state");
	const error = url.searchParams.get("error");
	const errorDescription = url.searchParams.get("error_description");

	const app_env = import.meta.env.DEV ? "development" : "production";
	const place = "auth-callback";

	// Handle Auth0 errors
	if (error) {
		log_message(platform, app_env, place, "error", `Auth0 error: ${error} - ${errorDescription || ""}`);
		throw redirect(303, `/sign-in?error=${encodeURIComponent(error)}`);
	}

	if (!code) {
		log_message(platform, app_env, place, "error", "No authorization code provided");
		throw redirect(303, "/sign-in?error=no_code");
	}

	// Get redirect URI
	const redirectUri = `${url.origin}/callback`;

	// Exchange authorization code for tokens
	const tokenResult = await exchangeAuth0Code(code, redirectUri);
	if (!tokenResult.success) {
		log_message(platform, app_env, place, "error", `Token exchange failed: ${tokenResult.error}`);
		throw redirect(303, "/sign-in?error=token_exchange_failed");
	}

	const { access_token, id_token } = tokenResult.tokens;

	// Validate token and get user info
	const userResult = await validateAuth0Token(access_token);
	if (!userResult.success) {
		log_message(platform, app_env, place, "error", `Token validation failed: ${userResult.error}`);
		throw redirect(303, "/sign-in?error=token_validation_failed");
	}

	const user = userResult.user;
	const roles = extractRoles(user);

	// Check if user has AEA access
	if (!hasAeaAccess(roles)) {
		log_message(platform, app_env, place, "warn", `User ${user.email} lacks AEA access`);
		throw redirect(303, "/sign-in?error=no_access");
	}

	// Create session token
	const sessionInfo = {
		sub: user.sub,
		email: user.email,
		nickname: user.nickname || user.name || user.email.split("@")[0],
		roles: roles
	};

	const sessionToken = await createSessionToken(sessionInfo, SESSION_TOKEN_TTL);

	// Store session in KV
	const headers = {
		"cf-connecting-ip": getClientAddress(),
		"user-agent": "unknown"
	};

	await write_login_session(
		platform,
		headers,
		sessionInfo,
		sessionToken,
		SESSION_TOKEN_TTL
	);

	// Set session cookie
	cookies.set(SESSION_COOKIE_NAME, sessionToken, {
		path: "/",
		httpOnly: true,
		secure: !import.meta.env.DEV,
		sameSite: "lax",
		maxAge: SESSION_TOKEN_TTL
	});

	log_message(platform, app_env, place, "info", `User ${user.email} authenticated successfully`);

	// Redirect to dashboard or original target
	const redirectPath = url.searchParams.get("state") 
		? decodeURIComponent(url.searchParams.get("state"))
		: "/dashboard";

	throw redirect(303, redirectPath);
}

