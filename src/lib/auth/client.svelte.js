import { createAuth0Client } from '@auth0/auth0-spa-js';
import { AUTH0_DOMAIN, AUTH0_CLIENT_ID } from '$config';

const auth0Config = {
	domain: AUTH0_DOMAIN,
	clientId: AUTH0_CLIENT_ID,
	authorizationParams: {
		redirect_uri: typeof window !== 'undefined' ? window.location.origin + '/callback' : ''
	}
};

export function createAuth() {
	let client = $state(null);
	let isAuthenticated = $state(false);
	let user = $state(null);
	let roles = $state([]);
	let loading = $state(true);

	async function init() {
		if (typeof window === 'undefined') return;

		try {
			client = await createAuth0Client({
				domain: auth0Config.domain,
				clientId: auth0Config.clientId,
				authorizationParams: {
					redirect_uri: auth0Config.authorizationParams.redirect_uri
				},
				cacheLocation: 'localstorage',
				useRefreshTokens: true
			});

			// Check if we're returning from Auth0 callback
			const query = window.location.search;
			if (query.includes("code=") && query.includes("state=")) {
				// This will be handled by the server-side callback route
				// Just wait for the redirect
				return;
			}

			isAuthenticated = await client.isAuthenticated();
			if (isAuthenticated) {
				user = await client.getUser();
				
				// Extract roles
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
					const roleKey = Object.keys(user).find(key => key.endsWith('/roles'));
					if (roleKey && Array.isArray(user[roleKey])) {
						foundRoles = user[roleKey];
					}
				}
				roles = foundRoles;
			}
		} catch (err) {
			console.error("Auth0 init error:", err);
		} finally {
			loading = false;
		}
	}

	async function login(redirectPath = '/dashboard') {
		if (!client) return;
		await client.loginWithRedirect({
			appState: { targetUrl: redirectPath },
			authorizationParams: {
				redirect_uri: auth0Config.authorizationParams.redirect_uri
			}
		});
	}

	async function logout() {
		if (!client) return;
		await client.logout({
			logoutParams: {
				returnTo: window.location.origin
			}
		});
	}

	async function getAccessToken() {
		if (!client) return null;
		try {
			return await client.getTokenSilently();
		} catch (err) {
			console.error("Error getting access token:", err);
			return null;
		}
	}

	return {
		get isAuthenticated() { return isAuthenticated },
		get user() { return user },
		get roles() { return roles },
		get loading() { return loading },
		get hasAeaRole() { return roles.includes('AEA_User') || roles.includes('rol_p2JLyXK9UfqFXzCI') },
		get isAdmin() { return roles.includes('Admin') || roles.includes('rol_85l7HNkIgBLXRw5B') },
		init,
		login,
		logout,
		getAccessToken
	};
}

export const auth = createAuth();

