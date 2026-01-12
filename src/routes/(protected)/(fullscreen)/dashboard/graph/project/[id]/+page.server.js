import { getViewSettings } from '$lib/server/projects';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
    const id = params.id;
    return {
        viewSettings: getViewSettings(id)
    };
}
