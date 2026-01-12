import { getProjects } from '$lib/server/projects';

/** @type {import('./$types').PageServerLoad} */
export async function load() {
    return {
        projects: getProjects()
    };
}
