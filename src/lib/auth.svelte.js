import { createAuth0Client } from '@auth0/auth0-spa-js';

const auth0Config = {
    domain: "dev-l3cgimaqtit76flm.us.auth0.com",
    clientId: "KOZ8r6x1r1GmvKSTFMb9Y0sTg3tz1P3a",
    authorizationParams: {
        redirect_uri: typeof window !== 'undefined' ? window.location.origin + window.location.pathname : ''
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

            const query = window.location.search;
            if (query.includes("code=") && query.includes("state=")) {
                const result = await client.handleRedirectCallback();
                const targetUrl = result.appState?.targetUrl || window.location.pathname;
                window.history.replaceState({}, document.title, targetUrl);
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

    async function login() {
        if (!client) return;
        await client.loginWithRedirect({
            appState: { targetUrl: window.location.href }
        });
    }

    async function logout() {
        if (!client) return;
        await client.logout({
            logoutParams: {
                returnTo: window.location.origin + window.location.pathname
            }
        });
    }

    return {
        get isAuthenticated() { return isAuthenticated },
        get user() { return user },
        get roles() { return roles },
        get loading() { return loading },
        get hasAeaRole() { return roles.includes('AEA_User') },
        init,
        login,
        logout
    };
}

export const auth = createAuth();
