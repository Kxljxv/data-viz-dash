import jwt from "@tsndr/cloudflare-worker-jwt";
import { AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET, LOGIN_JWT_SECRET, ROLE_ADMIN, ROLE_AEA_USER, SESSION_COOKIE_NAME, SESSION_TOKEN_TTL } from "$config";
import { get_login_session, write_login_session, delete_login_session } from "./session";

/**
 * Validates Auth0 access token and extracts user information
 * @param {string} accessToken - Auth0 access token
 * @returns {Promise<{success: boolean, user?: object, error?: string}>}
 */
export async function validateAuth0Token(accessToken) {
	try {
		const response = await fetch(`https://${AUTH0_DOMAIN}/userinfo`, {
			headers: {
				Authorization: `Bearer ${accessToken}`
			}
		});

		if (!response.ok) {
			return { success: false, error: "Invalid token" };
		}

		const user = await response.json();
		return { success: true, user };
	} catch (error) {
		return { success: false, error: error.message };
	}
}

/**
 * Exchanges Auth0 authorization code for tokens
 * @param {string} code - Authorization code from Auth0
 * @param {string} redirectUri - Redirect URI used in authorization
 * @returns {Promise<{success: boolean, tokens?: object, error?: string}>}
 */
export async function exchangeAuth0Code(code, redirectUri) {
	try {
		const response = await fetch(`https://${AUTH0_DOMAIN}/oauth/token`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				grant_type: "authorization_code",
				client_id: AUTH0_CLIENT_ID,
				client_secret: AUTH0_CLIENT_SECRET,
				code: code,
				redirect_uri: redirectUri
			})
		});

		if (!response.ok) {
			const error = await response.text();
			return { success: false, error: error };
		}

		const tokens = await response.json();
		return { success: true, tokens };
	} catch (error) {
		return { success: false, error: error.message };
	}
}

/**
 * Extracts roles from Auth0 user object
 * @param {object} user - Auth0 user object
 * @returns {string[]} Array of role names
 */
export function extractRoles(user) {
	if (!user) return [];

	const possibleKeys = [
		'https://aea.com/roles',
		'https://kxljxv.github.io/aea/roles',
		'roles'
	];

	let foundRoles = [];
	for (const key of possibleKeys) {
		if (user[key] && Array.isArray(user[key])) {
			foundRoles = user[key];
			break;
		}
	}

	if (foundRoles.length === 0) {
		// Fallback: find any key ending with /roles
		const roleKey = Object.keys(user).find(key => key.endsWith('/roles'));
		if (roleKey && Array.isArray(user[roleKey])) {
			foundRoles = user[roleKey];
		}
	}

	// Also check app_metadata if it exists (common for role IDs)
	if (foundRoles.length === 0 && user.app_metadata?.roles) {
		foundRoles = user.app_metadata.roles;
	}

	return foundRoles;
}

/**
 * Checks if user has required role
 * @param {string[]} roles - User roles
 * @param {string} requiredRole - Required role name or ID
 * @returns {boolean}
 */
export function hasRole(roles, requiredRole) {
	return roles.includes(requiredRole) || roles.some(role => role === requiredRole);
}

/**
 * Checks if user is admin
 * @param {string[]} roles - User roles
 * @returns {boolean}
 */
export function isAdmin(roles) {
	if (!roles || !Array.isArray(roles)) return false;
	return hasRole(roles, ROLE_ADMIN) || hasRole(roles, "Admin");
}

/**
 * Checks if user has AEA access
 * @param {string[]} roles - User roles
 * @returns {boolean}
 */
export function hasAeaAccess(roles) {
	if (!roles || !Array.isArray(roles)) return false;
	return (
		hasRole(roles, ROLE_AEA_USER) || 
		hasRole(roles, "AEA_User") || 
		hasRole(roles, ROLE_ADMIN) || 
		hasRole(roles, "Admin")
	);
}

/**
 * Creates a JWT session token
 * @param {object} userInfo - User information to encode
 * @param {number} ttl - Time to live in seconds
 * @returns {Promise<string>} JWT token
 */
export async function createSessionToken(userInfo, ttl = SESSION_TOKEN_TTL) {
	const payload = {
		sub: userInfo.sub || userInfo.user_id,
		email: userInfo.email,
		nickname: userInfo.nickname || userInfo.name,
		roles: userInfo.roles || [],
		iat: Math.floor(Date.now() / 1000),
		exp: Math.floor(Date.now() / 1000) + ttl
	};

	return await jwt.sign(payload, LOGIN_JWT_SECRET);
}

/**
 * Verifies and decodes a JWT session token
 * @param {string} token - JWT token
 * @returns {Promise<{valid: boolean, payload?: object, error?: string}>}
 */
export async function verifySessionToken(token) {
	try {
		const isValid = await jwt.verify(token, LOGIN_JWT_SECRET);
		if (!isValid) {
			return { valid: false, error: "Invalid token signature" };
		}

		const decoded = jwt.decode(token);
		const payload = decoded.payload;
		
		if (!payload || payload.exp < Math.floor(Date.now() / 1000)) {
			return { valid: false, error: "Token expired" };
		}

		return { valid: true, payload };
	} catch (error) {
		return { valid: false, error: error.message };
	}
}

/**
 * Gets user session from cookie or KV
 * @param {object} platform - Cloudflare platform object
 * @param {object} cookies - Request cookies
 * @returns {Promise<{user?: object, session?: object, error?: string}>}
 */
export async function getUserSession(platform, cookies) {
	const sessionToken = cookies.get(SESSION_COOKIE_NAME);
	if (!sessionToken) {
		return { error: "No session token" };
	}

	// Verify JWT token
	const tokenResult = await verifySessionToken(sessionToken);
	if (!tokenResult.valid) {
		return { error: tokenResult.error || "Invalid session token" };
	}

	// Try to get session from KV cache
	const sessionResult = await get_login_session(platform, sessionToken);
	if (sessionResult.existed) {
		return {
			user: {
				sub: tokenResult.payload.sub,
				email: tokenResult.payload.email,
				nickname: tokenResult.payload.nickname,
				roles: tokenResult.payload.roles || []
			},
			session: sessionResult.info
		};
	}

	// If not in KV, use JWT payload (fallback)
	return {
		user: {
			sub: tokenResult.payload.sub,
			email: tokenResult.payload.email,
			nickname: tokenResult.payload.nickname,
			roles: tokenResult.payload.roles || []
		},
		session: { id: sessionToken }
	};
}

