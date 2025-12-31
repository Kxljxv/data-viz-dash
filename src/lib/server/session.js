// Simplified session management for Auth0 hybrid integration
import { dev } from "$app/environment";
import { SESSION_TOKEN_TTL, SESSION_COOKIE_NAME } from "$config";

const app_env = dev ? "development" : "production";
const place = "session";

/**
 * Writes a login session to KV
 * @param {object} platform - Cloudflare platform object
 * @param {object} headers - Request headers (for logging)
 * @param {object} sessionInfo - Session information
 * @param {string} sessionId - Session ID (JWT token)
 * @param {number} ttl - Time to live in seconds
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function write_login_session(platform, headers, sessionInfo, sessionId, ttl = SESSION_TOKEN_TTL) {
	if (!platform?.env?.LOGIN_SESSION_CACHE) {
		// In development without KV, just return success
		if (dev) {
			console.log(`[${place}] KV not available, skipping session write (dev mode)`);
			return { success: true };
		}
		return { error: true, message: "KV namespace not available" };
	}

	try {
		const sessionData = {
			...sessionInfo,
			session_id: sessionId,
			created_at: Date.now(),
			expire_at: Date.now() + (ttl * 1000)
		};

		await platform.env.LOGIN_SESSION_CACHE.put(
			sessionId,
			JSON.stringify(sessionData),
			{ expirationTtl: ttl }
		);

		console.log(`[${place}] Session written to KV: ${sessionId.substring(0, 20)}...`);
		return { success: true };
	} catch (err) {
		console.error(`[${place}] KV write error:`, err);
		return { error: true, message: err.message };
	}
}

/**
 * Gets a login session from KV
 * @param {object} platform - Cloudflare platform object
 * @param {string} sessionId - Session ID (JWT token)
 * @returns {Promise<{existed: boolean, info?: object}>}
 */
export async function get_login_session(platform, sessionId) {
	if (!platform?.env?.LOGIN_SESSION_CACHE) {
		// In development without KV, return not found
		if (dev) {
			return { existed: false };
		}
		return { existed: false };
	}

	try {
		const kvRes = await platform.env.LOGIN_SESSION_CACHE.get(sessionId, { type: "json" });
		
		if (kvRes !== null) {
			return {
				existed: true,
				info: kvRes
			};
		}
	} catch (err) {
		console.error(`[${place}] KV get error:`, err);
	}

	return { existed: false };
}

/**
 * Deletes a login session from KV
 * @param {object} platform - Cloudflare platform object
 * @param {string} sessionId - Session ID (JWT token)
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function delete_login_session(platform, sessionId) {
	if (!platform?.env?.LOGIN_SESSION_CACHE) {
		// In development without KV, just return success
		if (dev) {
			return { success: true };
		}
		return { error: true, message: "KV namespace not available" };
	}

	try {
		await platform.env.LOGIN_SESSION_CACHE.delete(sessionId);
		console.log(`[${place}] Session deleted from KV: ${sessionId.substring(0, 20)}...`);
		return { success: true };
	} catch (err) {
		console.error(`[${place}] KV delete error:`, err);
		return { error: true, message: err.message };
	}
}

