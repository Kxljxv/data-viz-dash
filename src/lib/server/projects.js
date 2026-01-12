import yaml from 'js-yaml';

// Note: import.meta.glob must be called with a literal string.
// These globs will find all relevant files in the static/data directory.
const descriptionsRaw = import.meta.glob('../../../static/data/**/descriptions.yaml', { 
    query: '?raw',
    import: 'default',
    eager: true 
});

const settingsRaw = import.meta.glob('../../../static/data/**/view-settings.yaml', { 
    query: '?raw',
    import: 'default',
    eager: true 
});

const gexfFiles = import.meta.glob('../../../static/data/**/*.gexf*', { 
    query: '?url',
    import: 'default',
    eager: true 
});

export function getProjects() {
    const projects = [];
    
    // Load and merge all descriptions
    let descriptions = {};
    for (const path in descriptionsRaw) {
        try {
            const content = yaml.load(descriptionsRaw[path]) || {};
            descriptions = { ...descriptions, ...content };
        } catch (e) {
            console.error(`Error loading descriptions from ${path}:`, e);
        }
    }

    // Load and merge all settings
    let viewSettings = {};
    for (const path in settingsRaw) {
        try {
            const content = yaml.load(settingsRaw[path]) || {};
            if (content.default) {
                viewSettings.default = { ...(viewSettings.default || {}), ...content.default };
                delete content.default;
            }
            viewSettings = { ...viewSettings, ...content };
        } catch (e) {
            console.error(`Error loading settings from ${path}:`, e);
        }
    }

    // Merge settings from descriptions.yaml
    for (const path in descriptionsRaw) {
        try {
            const content = yaml.load(descriptionsRaw[path]) || {};
            for (const id in content) {
                if (content[id].viewSettings) {
                    viewSettings[id] = { ...(viewSettings[id] || {}), ...content[id].viewSettings };
                }
            }
        } catch (e) {
            console.error(`Error loading settings from description ${path}:`, e);
        }
    }

    const defaultSettings = viewSettings.default || {
        showLabels: false,
        showLinks: true,
        showAntraege: true,
        showSupporters: true,
        nodeSize: 1,
        linearZoom: true,
        disableHover: false
    };

    const foundProjectIds = new Set();
    
    for (const filePath of Object.keys(gexfFiles)) {
        const fileName = filePath.split('/').pop();
        if (!fileName) continue;
        
        const id = fileName.split('.')[0];
        if (!id || foundProjectIds.has(id)) continue;
        
        foundProjectIds.add(id);
        
        const desc = descriptions[id] || {};
        const projectSettings = viewSettings[id] || {};
        
        projects.push({
            id,
            name: desc.medium || desc.short || id,
            description: desc.long || desc.medium || '',
            date: desc.date || '',
            nodeCount: desc.nodeCount || desc.nodes || 0,
            heading: {
                short: desc.short || id,
                medium: desc.medium || id,
                long: desc.long || id
            },
            viewSettings: {
                ...defaultSettings,
                ...projectSettings
            }
        });
    }

    projects.sort((a, b) => a.id.localeCompare(b.id));
    return projects;
}

export function getViewSettings(id) {
    let viewSettings = {};
    for (const path in settingsRaw) {
        try {
            const content = yaml.load(settingsRaw[path]) || {};
            if (content.default) {
                viewSettings.default = { ...(viewSettings.default || {}), ...content.default };
                delete content.default;
            }
            viewSettings = { ...viewSettings, ...content };
        } catch (e) {
            console.error(`Error loading settings from ${path}:`, e);
        }
    }

    // Merge settings from descriptions.yaml
    for (const path in descriptionsRaw) {
        try {
            const content = yaml.load(descriptionsRaw[path]) || {};
            for (const projId in content) {
                if (content[projId].viewSettings) {
                    viewSettings[projId] = { ...(viewSettings[projId] || {}), ...content[projId].viewSettings };
                }
            }
        } catch (e) {
            console.error(`Error loading settings from description ${path}:`, e);
        }
    }

    const defaultSettings = viewSettings.default || {
        showLabels: false,
        showLinks: true,
        showAntraege: true,
        showSupporters: true,
        nodeSize: 1,
        linearZoom: true,
        disableHover: false
    };

    const projectSettings = viewSettings[id] || {};
    return {
        ...defaultSettings,
        ...projectSettings
    };
}

export function isValidProject(id) {
    const foundProjectIds = new Set();
    for (const filePath of Object.keys(gexfFiles)) {
        const fileName = filePath.split('/').pop();
        if (!fileName) continue;
        const projectId = fileName.split('.')[0];
        if (projectId) foundProjectIds.add(projectId);
    }
    return foundProjectIds.has(id);
}
