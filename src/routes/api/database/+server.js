import { json } from "@sveltejs/kit";
import path from "node:path";
import { getProjects } from "$lib/server/projects";

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
    let Database;
    try {
        const mod = await import("better-sqlite3");
        Database = mod.default || mod;
    } catch (e) {
        return new Response(
            JSON.stringify({ error: "SQLite not available in this runtime" }),
            { status: 501, headers: { "content-type": "application/json" } }
        );
    }

    const availableProjects = getProjects();
    const defaultProject = availableProjects.find(p => p.id === 'bdk_all')?.id || availableProjects[0]?.id || "bdk_all";
    const requestedProject = url.searchParams.get('project') || defaultProject;

    const dbDir = path.join(process.cwd(), "static", "data", "database");
    const amendmentsPath = path.join(dbDir, "amendments.sqlite");
    const personsPath = path.join(dbDir, "persons.sqlite");

    const amendDb = new Database(amendmentsPath, { readonly: true });
    const personsDb = new Database(personsPath, { readonly: true });

    const amendmentsRows = amendDb
        .prepare("SELECT amendment_id as id, convention_id as convention, amendment_url_html as url, amendment_title_with_prefix as label, amendment_initiators as applicant_id, amendment_supporters as supporter_ids FROM amendments")
        .all();

    const personsRows = personsDb
        .prepare("SELECT person_id as id, person_name as name, person_organization as kv, initiated_amendments as applicated_ids, person_initiated_amount as applicated_count, supported_amendments as supported_ids, person_supported_amount as supported_count FROM persons")
        .all();

    const personById = new Map();
    for (const p of personsRows) {
        // Safe parse organizations (kv) - it's a JSON list of strings in the new DB
        const kvList = safeJsonParseArray(p.kv);
        const kvDisplay = kvList.length > 0 ? kvList[0] : "";

        // The new DB stores supported_amendments as JSON: [[id, date], ...]
        // We need to extract just the IDs for the frontend compatibility
        const rawSupported = safeJsonParseArray(p.supported_ids);
        const supportedIds = Array.isArray(rawSupported) && Array.isArray(rawSupported[0]) 
            ? rawSupported.map(item => item[0]) 
            : rawSupported;

        const rawInitiated = safeJsonParseArray(p.applicated_ids);
        const initiatedIds = Array.isArray(rawInitiated) && Array.isArray(rawInitiated[0]) 
            ? rawInitiated.map(item => item[0]) 
            : rawInitiated;

        personById.set(p.id, {
            id: p.id,
            name: p.name || "",
            kv: kvDisplay,
            applicated_ids: initiatedIds,
            supported_ids: supportedIds,
            applicated_count: Number(p.applicated_count || 0),
            supported_count: Number(p.supported_count || 0),
            conventions: [], // The new schema doesn't have a direct conventions list per person yet, but we can derive it if needed
        });
    }

    const amendmentLabelById = new Map();
    for (const a of amendmentsRows) {
        amendmentLabelById.set(String(a.id), a.label || String(a.id));
    }

    const supporters = personsRows.map((p) => {
        const personData = personById.get(p.id);
        const graphId = personData.kv ? `${personData.name} | ${personData.kv}` : (personData.name || p.id);
        
        const supported = personData.supported_ids.map((aid) => ({
            id: String(aid),
            label: amendmentLabelById.get(String(aid)) || String(aid),
        }));
        
        const applied = personData.applicated_ids.map((aid) => ({
            id: String(aid),
            label: amendmentLabelById.get(String(aid)) || String(aid),
        }));

        // Default to requestedProject for now, as it's the main visualization
        const project = requestedProject;

        return {
            id: crypto.randomUUID(),
            graphId,
            name: personData.name,
            kv: personData.kv,
            project,
            supported,
            applied,
            supportedCount: personData.supported_count || supported.length,
            applicatedCount: personData.applicated_count || applied.length,
        };
    });

    const amendments = amendmentsRows.map((a) => {
        // In the new DB, initiators and supporters are JSON lists of person objects/IDs
        const rawSupporters = safeJsonParseArray(a.supporter_ids);
        // Extract IDs from objects if they are objects, otherwise assume they are IDs
        const supportersIds = rawSupporters.map(s => (typeof s === 'object' && s !== null) ? s.person_id : s);
        
        const supportersList = supportersIds.map((pid) => {
            const person = personById.get(pid);
            return {
                id: pid,
                label: person?.name || pid,
                kv: person?.kv || "",
            };
        });

        const rawInitiators = safeJsonParseArray(a.applicant_id);
        const initiatorsIds = rawInitiators.map(i => (typeof i === 'object' && i !== null) ? i.person_id : i);
        
        const applicants = initiatorsIds.map(pid => {
            const person = personById.get(pid);
            return { 
                id: pid, 
                label: person?.name || pid, 
                kv: person?.kv || "" 
            };
        });

        // Map BDK conventions to requestedProject for combined visualization
        let project = a.convention || "";
        if (project.toLowerCase().includes('bdk')) {
            project = requestedProject;
        }

        return {
            id: String(a.id),
            label: a.label,
            project,
            applicants,
            applicantLabels: applicants.map((x) => x.label).join(", "),
            supporterCount: supportersIds.length,
            supporters: supportersList,
            url: a.url || "",
        };
    });

    amendDb.close();
    personsDb.close();

    return json({ supporters, amendments });
}

function safeJsonParseArray(value) {
    if (!value) return [];
    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}
