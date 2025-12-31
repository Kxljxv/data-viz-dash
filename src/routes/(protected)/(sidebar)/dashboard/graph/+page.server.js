import yaml from 'js-yaml';
import { AVAILABLE_PROJECTS } from '$config';

// Import all project.yaml files at build time using Vite's glob import
// We use a relative path from this file to the static/data directory
const projectConfigs = import.meta.glob('../../../../../../static/data/*/project.yaml', { 
    as: 'raw', 
    eager: true 
});

/** @type {import('./$types').PageServerLoad} */
export async function load() {
    const projects = [];

    // Process the imported configurations
    for (const [filePath, content] of Object.entries(projectConfigs)) {
        try {
            // Extract the project ID from the file path (e.g., .../static/data/bdk/project.yaml -> bdk)
            const pathParts = filePath.split('/');
            const id = pathParts[pathParts.length - 2];
            
            // Only include if it's in our list of available projects
            if (AVAILABLE_PROJECTS.includes(id)) {
                const config = yaml.load(content);
                
                projects.push({
                    id,
                    name: config.heading?.medium || config.heading?.short || id,
                    description: config.description || '',
                    date: config.date || '',
                    nodeCount: config.nodeCount || 0,
                    heading: config.heading
                });
            }
        } catch (e) {
            console.error(`Error processing project config from ${filePath}:`, e);
        }
    }

    // Sort projects by date descending
    projects.sort((a, b) => {
        const dateA = a.date ? new Date(a.date) : new Date(0);
        const dateB = b.date ? new Date(b.date) : new Date(0);
        return dateB - dateA;
    });

    return {
        projects
    };
}