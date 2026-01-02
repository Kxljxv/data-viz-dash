import { json } from "@sveltejs/kit";
import { AVAILABLE_PROJECTS } from "$config";

/** @type {import('./$types').RequestHandler} */
export async function GET({ fetch }) {
    const supporters = [];
    const amendments = [];

    // Helper to find or create a supporter entry
    // Since "Supporters from different projects with the same name are not combined!",
    // we scope the cache by project.
    const getSupporter = (projectMap, name, kv, project) => {
        const key = `${name}|${kv}`;
        if (!projectMap.has(key)) {
            const cleanName = name.trim();
            const cleanKv = (kv || '').trim();
            const graphId = cleanKv ? `${cleanName} | ${cleanKv}` : cleanName;

            const newSupporter = {
                id: crypto.randomUUID(), // Unique ID for UI keys
                graphId: graphId,
                name,
                kv,
                project,
                supported: [], // List of amendment objects { id, label }
                applied: []    // List of amendment objects { id, label }
            };
            projectMap.set(key, newSupporter);
            supporters.push(newSupporter);
        }
        return projectMap.get(key);
    };

    for (const project of AVAILABLE_PROJECTS) {
        if (project === "LA") continue; // Exclude LA project
        if (project === "la") continue; // Exclude la project case-insensitive

        try {
            const response = await fetch(`/data/${project}/data.json`);
            if (!response.ok) {
                console.warn(`Failed to fetch data for project ${project}`);
                continue;
            }

            const data = await response.json();
            const projectSupporters = new Map(); // Local map for this project

            Object.values(data).forEach(item => {
                // 1. Process Amendment
                const amendment = {
                    id: item.application_id,
                    label: item.heading,
                    project: project,
                    applicants: [], // List of names
                    supporterCount: item.supporters ? item.supporters.length : 0,
                    supporters: [], // List of names for the modal
                    url: item.url || `/data/${project}/pdf/${item.application_id.replace('TO', 'A')}.pdf`
                };
                
                // Refine URL: In the file list, PDFs are like 51BDK-A-02-137.pdf
                // The IDs are like 51BDK-TO-01-008.
                // It seems 'TO' maps to something else or the ID structure varies.
                // For now, we'll try a best-effort link or just link to the graph.
                // Re-reading requirements: "URL" column. 
                // Let's use a generic PDF path if possible, or leave it if unknown.
                // Actually, let's look at the data again. 
                // "heading": "51BDK-TO-01-008: ..."
                // PDF files: 51BDK-A-... 
                // Maybe TO stands for Tagesordnung?
                
                amendments.push(amendment);

                // 2. Process Applicants
                if (item.applicant) {
                    // item.applicant can be a list of strings or list of lists?
                    // "applicant": ["Jürgen Blümer", "KV Warendorf"] -> This looks like ONE applicant with Name + KV.
                    // Or is it multiple applicants? 
                    // Looking at data.json: "applicant": ["Name", "KV"] seems to be a single tuple.
                    // Wait, let's check if it's an array of arrays.
                    // In data.json: "applicant": ["Jürgen Blümer", "KV Warendorf"]
                    // "supporters": [ ["Name", "KV"], ["Name", "KV"] ]
                    // So "applicant" seems to be a single entry [Name, KV].
                    // But typically there can be multiple applicants.
                    // Let's assume for now it is one [Name, KV] tuple based on the sample.
                    
                    // Robust check:
                    let applicantsList = [];
                    if (Array.isArray(item.applicant) && item.applicant.length > 0) {
                        if (Array.isArray(item.applicant[0])) {
                             // Array of arrays
                             applicantsList = item.applicant;
                        } else {
                             // Single array [Name, KV]
                             applicantsList = [item.applicant];
                        }
                    }

                    applicantsList.forEach(([name, kv]) => {
                        const cleanName = name.trim();
                        const cleanKv = (kv || '').trim();
                        const graphId = cleanKv ? `${cleanName} | ${cleanKv}` : cleanName;
                        
                        amendment.applicants.push({
                            label: name,
                            kv: kv,
                            id: graphId
                        });
                        const supp = getSupporter(projectSupporters, name, kv, project);
                        supp.applied.push({ id: amendment.id, label: amendment.label });
                    });
                }

                // 3. Process Supporters
                if (item.supporters && Array.isArray(item.supporters)) {
                    item.supporters.forEach(([name, kv]) => {
                        const cleanName = name.trim();
                        const cleanKv = (kv || '').trim();
                        const graphId = cleanKv ? `${cleanName} | ${cleanKv}` : cleanName;
                        
                        amendment.supporters.push({
                            label: name,
                            kv: kv,
                            id: graphId
                        });
                        const supp = getSupporter(projectSupporters, name, kv, project);
                        supp.supported.push({ id: amendment.id, label: amendment.label });
                    });
                }
            });

        } catch (error) {
            console.error(`Error processing project ${project}:`, error);
        }
    }

    return json({
        supporters,
        amendments
    });
}
