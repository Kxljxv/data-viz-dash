import { getUserSession, hasAeaAccess, isAdmin } from "$lib/server/auth";
import { SESSION_COOKIE_NAME } from "$config";
import { redirect } from "@sveltejs/kit";

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ cookies, platform }) {
	const sessionResult = await getUserSession(platform, cookies);

	if (!sessionResult.user) {
		throw redirect(303, "/sign-in");
	}

	if (!hasAeaAccess(sessionResult.user.roles)) {
		throw redirect(303, "/sign-in?error=no_access");
	}

	return {
		user: {
			sub: sessionResult.user.sub,
			email: sessionResult.user.email,
			nickname: sessionResult.user.nickname,
			roles: sessionResult.user.roles,
			profile: sessionResult.user.profile,
			role: isAdmin(sessionResult.user.roles) ? "admin" : "user"
		},
		session: sessionResult.session
	};
}

