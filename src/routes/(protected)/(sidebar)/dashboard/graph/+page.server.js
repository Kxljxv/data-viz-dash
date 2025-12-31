import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

/** @type {import('./$types').PageServerLoad} */
export async function load() {
    const dataDir = path.resolve('static/data');
    const projects = [];

    try {
        const dirs = fs.readdirSync(dataDir).filter(file => {
            return fs.statSync(path.join(dataDir, file)).isDirectory();
        });

        for (const id of dirs) {
            const yamlPath = path.join(dataDir, id, 'project.yaml');
            if (fs.existsSync(yamlPath)) {
                try {
                    const fileContents = fs.readFileSync(yamlPath, 'utf8');
                    const config = yaml.load(fileContents);
                    
                    projects.push({
                        id,
                        name: config.heading?.medium || config.heading?.short || id,
                        description: config.description || '',
                        date: config.date || '',
                        nodeCount: config.nodeCount || 0,
                        heading: config.heading
                    });
                } catch (e) {
                    console.error(`Error parsing project.yaml for ${id}:`, e);
                }
            }
        }
    } catch (e) {
        console.error('Error reading data directory:', e);
    }

    // Sort projects by date descending
    projects.sort((a, b) => new Date(b.date) - new Date(a.date));

    return {
        projects
    };
}