import { redirect } from "@sveltejs/kit";
import { isAdmin } from "$lib/server/auth";

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ parent }) {
	const { user } = await parent();

	if (!isAdmin(user.roles)) {
		throw redirect(303, "/dashboard?error=admin_required");
	}

	return {
		user
	};
}

