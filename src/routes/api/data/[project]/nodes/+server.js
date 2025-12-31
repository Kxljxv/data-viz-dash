import { json } from "@sveltejs/kit";
import { AVAILABLE_PROJECTS } from "$config";

/** @type {import('./$types').RequestHandler} */
export async function GET({ params, platform }) {
	const { project } = params;

	// Validate project
	if (!AVAILABLE_PROJECTS.includes(project)) {
		return json({ error: "Invalid project" }, { status: 400 });
	}

	// Check cache first (if KV is available)
	const cacheKey = `nodes:${project}`;
	let cachedData = null;

	if (platform?.env?.DATA_CACHE) {
		try {
			cachedData = await platform.env.DATA_CACHE.get(cacheKey, { type: "json" });
		} catch (err) {
			console.error("KV cache read error:", err);
		}
	}

	if (cachedData) {
		return json(cachedData, {
			headers: {
				"Cache-Control": "public, max-age=3600",
				"X-Cache": "HIT"
			}
		});
	}

	// Return 404 to indicate static file should be used
	return json(
		{ 
			error: "Nodes data not cached. Please use static files in development.",
			hint: `Use /data/${project}/simulated/nodes.json for static files`
		},
		{ 
			status: 404,
			headers: {
				"X-Cache": "MISS"
			}
		}
	);
}

