import { json } from "@sveltejs/kit";
import { isValidProject } from "$lib/server/projects";
import { getSafeUserId } from "$lib/server/auth";

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, platform }) {
	try {
		const { project, groups, options } = await request.json();

		// 1. Validation
		if (!isValidProject(project)) {
			return json({ error: "Invalid project" }, { status: 400 });
		}

		if (!groups || !Array.isArray(groups)) {
			return json({ error: "Invalid groups data" }, { status: 400 });
		}

        // 1.1 Malicious content check (simple JSON safety check)
        const jsonStr = JSON.stringify(groups);
        if (jsonStr.includes("<script") || jsonStr.includes("javascript:")) {
            return json({ error: "Potentially malicious content detected" }, { status: 400 });
        }

		// 2. Process Density Map
		// This is a placeholder for the actual density calculation logic
		// In a real implementation, this would involve complex spatial calculations
		const densityMap = calculateDensity(groups, options);

		// 3. Persistence (if KV is available)
		const projectId = `density_${project}_${Date.now()}`;
		const safeProjectId = getSafeUserId(projectId);
		if (platform?.env?.DATA_CACHE) {
			try {
				await platform.env.DATA_CACHE.put(
					`density_project__${safeProjectId}`,
					JSON.stringify({
						id: projectId,
						project,
						timestamp: new Date().toISOString(),
						data: densityMap,
						metadata: {
							groupCount: groups.length,
							options
						}
					})
				);
			} catch (kvError) {
				console.error("KV PUT failed for density analysis:", kvError);
				// We don't return an error here, just log it. 
				// The result is still returned to the user.
			}
		}

		return json({
			success: true,
			projectId,
			data: densityMap
		});

	} catch (err) {
		console.error("Density analysis error:", err);
		return json({ error: "Internal server error" }, { status: 500 });
	}
}

/** @type {import('./$types').RequestHandler} */
export async function GET({ url, platform }) {
	const projectId = url.searchParams.get("projectId");

	if (!projectId) {
		return json({ error: "Missing projectId" }, { status: 400 });
	}

	if (platform?.env?.DATA_CACHE) {
		const safeProjectId = getSafeUserId(projectId);
		try {
			const projectData = await platform.env.DATA_CACHE.get(`density_project__${safeProjectId}`, { type: "json" });
			if (projectData) {
				return json(projectData);
			}
		} catch (kvError) {
			console.error("KV GET failed for density analysis:", kvError);
			return json({ error: "Storage error", details: kvError.message }, { status: 500 });
		}
	}

	return json({ error: "Project not found" }, { status: 404 });
}

function calculateDensity(groups, options = {}) {
    if (!groups || groups.length === 0) {
        return {
            grid: [],
            contours: [],
            bounds: { x: [0, 100], y: [0, 100] }
        };
    }

    // Calculate actual bounds from the input groups
    const xCoords = groups.map(g => g.x);
    const yCoords = groups.map(g => g.y);
    
    const xMin = Math.min(...xCoords);
    const xMax = Math.max(...xCoords);
    const yMin = Math.min(...yCoords);
    const yMax = Math.max(...yCoords);

	return {
		grid: [], // Grid of density values
		contours: [], // Calculated contours for visualization
		bounds: { 
            x: [xMin, xMax], 
            y: [yMin, yMax] 
        }
	};
}
