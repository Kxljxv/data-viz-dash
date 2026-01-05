import yaml from 'js-yaml';
import { AVAILABLE_PROJECTS } from '$config';

// Import the descriptions file
const descriptionsRaw = import.meta.glob('../../../../../../static/data/descriptions.yaml', { 
    query: '?raw',
    import: 'default',
    eager: true 
});

// Import all GEXF files to detect available graphs
const gexfFiles = import.meta.glob('../../../../../../static/data/*.gexf*', { 
    query: '?url',
    import: 'default',
    eager: true 
});

/** @type {import('./$types').PageServerLoad} */
export async function load() {
    const projects = [];
    
    // Load descriptions
    let descriptions = {};
    const descPath = Object.keys(descriptionsRaw)[0];
    if (descPath && descriptionsRaw[descPath]) {
        try {
            descriptions = yaml.load(descriptionsRaw[descPath]) || {};
        } catch (e) {
            console.error("Error loading descriptions.yaml:", e);
        }
    }

    // Process available GEXF files
    const foundProjectIds = new Set();
    
    for (const filePath of Object.keys(gexfFiles)) {
        // Extract filename from path
        const fileName = filePath.split('/').pop();
        if (!fileName) continue;
        
        // Extract project ID (e.g., "51bdk" from "51bdk.gexf.gz")
        const id = fileName.split('.')[0];
        if (!id || foundProjectIds.has(id)) continue;
        
        foundProjectIds.add(id);
        
        const desc = descriptions[id] || {};
        
        projects.push({
            id,
            name: desc.medium || desc.short || id,
            description: desc.long || desc.medium || '',
            date: desc.date || '',
            nodeCount: desc.nodeCount || 0,
            heading: {
                short: desc.short || id,
                medium: desc.medium || id,
                long: desc.long || id
            }
        });
    }

    // Sort projects by ID or date if available
    projects.sort((a, b) => a.id.localeCompare(b.id));

    return {
        projects
    };
}