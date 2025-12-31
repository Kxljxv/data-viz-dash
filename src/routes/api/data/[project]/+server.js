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
	const cacheKey = `data:${project}`;
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

	// If not cached, try to load from static files
	// In production, this would typically load from R2 or another storage
	// For now, we'll return a response that tells the client to use static files
	// In a real implementation, you would read from R2 or the file system here

	return json(
		{ 
			error: "Data not cached. Please use static files in development.",
			hint: `Use /data/${project}/data.json for static files`
		},
		{ 
			status: 404,
			headers: {
				"X-Cache": "MISS"
			}
		}
	);
}

