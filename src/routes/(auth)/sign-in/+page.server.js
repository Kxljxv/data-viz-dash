import { redirect } from "@sveltejs/kit";
import { getUserSession, hasAeaAccess } from "$lib/server/auth";
import { SESSION_COOKIE_NAME, AUTH0_DOMAIN, AUTH0_CLIENT_ID } from "$config";

/** @type {import('./$types').PageServerLoad} */
export async function load({ cookies, platform, url }) {
	// Check if user already has a valid session
	const sessionResult = await getUserSession(platform, cookies);
	
	if (sessionResult.user && hasAeaAccess(sessionResult.user.roles)) {
		// Already authenticated, redirect to dashboard
		const redirectPath = url.searchParams.get("redirect") || "/dashboard";
		throw redirect(303, redirectPath);
	}

	// Construct Auth0 login URL for server-side flow
	const redirectUri = `${url.origin}/callback`;
	const state = url.searchParams.get("redirect") || "/dashboard";
	const auth0LoginUrl = `https://${AUTH0_DOMAIN}/authorize?` + new URLSearchParams({
		response_type: "code",
		client_id: AUTH0_CLIENT_ID,
		redirect_uri: redirectUri,
		scope: "openid profile email",
		state: state
	}).toString();

	return {
		error: url.searchParams.get("error"),
		auth0LoginUrl
	};
}

