import { json } from "@sveltejs/kit";
import { AVAILABLE_PROJECTS } from "$config";

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, platform }) {
	try {
		const { project, groups, options } = await request.json();

		// 1. Validation
		if (!AVAILABLE_PROJECTS.includes(project)) {
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
		if (platform?.env?.DATA_CACHE) {
			await platform.env.DATA_CACHE.put(
				`density_project:${projectId}`,
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
		const projectData = await platform.env.DATA_CACHE.get(`density_project:${projectId}`, { type: "json" });
		if (projectData) {
			return json(projectData);
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
