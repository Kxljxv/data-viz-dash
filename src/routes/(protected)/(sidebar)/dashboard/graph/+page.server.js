import yaml from 'js-yaml';
import { AVAILABLE_PROJECTS } from '$config';

// Import all project configuration files at build time using Vite's glob import
// We support both project.yaml and project_config.yaml
const projectConfigs = import.meta.glob('../../../../../../static/data/*/project*.yaml', { 
    as: 'raw', 
    eager: true 
});

/** @type {import('./$types').PageServerLoad} */
export async function load() {
    const projects = [];

    // Process the imported configurations
    for (const [filePath, content] of Object.entries(projectConfigs)) {
        try {
            // Extract the project ID from the file path
            const normalizedPath = filePath.replace(/\\/g, '/');
            const pathParts = normalizedPath.split('/');
            const id = pathParts[pathParts.length - 2];
            
            // Only include if it's in our list of available projects
            if (AVAILABLE_PROJECTS.includes(id)) {
                // Skip if we already processed this project
                if (projects.some(p => p.id === id)) continue;

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