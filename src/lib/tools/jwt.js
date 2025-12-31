import jwt from "@tsndr/cloudflare-worker-jwt";

/**
 * Extracts UUID/subject from JWT token without verification
 * @param {string} token - JWT token
 * @returns {string|null} UUID or null if invalid
 */
export function get_uuid_from_jwt(token) {
	try {
		const decoded = jwt.decode(token);
		return decoded?.sub || decoded?.uuid || null;
	} catch (error) {
		return null;
	}
}

