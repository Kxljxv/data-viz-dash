import { json } from "@sveltejs/kit";
import { AVAILABLE_PROJECTS } from "$config";

/** @type {import('./$types').RequestHandler} */
export async function GET({ params, platform, url }) {
	const { project } = params;

	// Validate project
	if (!AVAILABLE_PROJECTS.includes(project)) {
		return json({ error: "Invalid project" }, { status: 400 });
	}

	// Check cache first (if KV is available)
	const cacheKey = `data:${project}:centrality`;
	
	if (platform?.env?.DATA_CACHE) {
		try {
			const cachedCentrality = await platform.env.DATA_CACHE.get(cacheKey, { type: "json" });
			if (cachedCentrality) {
				return json({ centrality: cachedCentrality }, {
					headers: {
						"Cache-Control": "public, max-age=3600",
						"X-Cache": "HIT"
					}
				});
			}
		} catch (err) {
			console.error("KV cache read error:", err);
		}
	}

	return json({ error: "Centrality not cached" }, { status: 404 });
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ params, request, platform }) {
	const { project } = params;
	const { centrality } = await request.json();

	if (!AVAILABLE_PROJECTS.includes(project)) {
		return json({ error: "Invalid project" }, { status: 400 });
	}

	if (platform?.env?.DATA_CACHE) {
		const cacheKey = `data:${project}:centrality`;
		try {
			await platform.env.DATA_CACHE.put(cacheKey, JSON.stringify(centrality));
			return json({ success: true });
		} catch (err) {
			console.error("KV cache write error:", err);
			return json({ error: "Failed to save to KV" }, { status: 500 });
		}
	}

	return json({ error: "KV not available" }, { status: 501 });
}

