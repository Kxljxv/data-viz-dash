import { json } from "@sveltejs/kit";
import path from "node:path";

/** @type {import('./$types').RequestHandler} */
export async function GET() {
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

    const dbDir = path.join(process.cwd(), "static", "data", "database");
    const amendmentsPath = path.join(dbDir, "amendments.sqlite");
    const personsPath = path.join(dbDir, "persons.sqlite");

    const amendDb = new Database(amendmentsPath, { readonly: true });
    const personsDb = new Database(personsPath, { readonly: true });

    const amendmentsRows = amendDb
        .prepare("SELECT id, convention, url, label, applicant_id, supporter_ids FROM amendments")
        .all();

    const personsRows = personsDb
        .prepare("SELECT id, name, kv, applicated_ids, applicated_count, supported_ids, supported_count, conventions FROM persons")
        .all();

    const personById = new Map();
    for (const p of personsRows) {
        personById.set(p.id, {
            id: p.id,
            name: p.name || "",
            kv: p.kv || "",
            applicated_ids: safeJsonParseArray(p.applicated_ids),
            supported_ids: safeJsonParseArray(p.supported_ids),
            applicated_count: Number(p.applicated_count || 0),
            supported_count: Number(p.supported_count || 0),
            conventions: safeJsonParseArray(p.conventions),
        });
    }

    const amendmentLabelById = new Map();
    for (const a of amendmentsRows) {
        amendmentLabelById.set(a.id, a.label || a.id);
    }

    const supporters = personsRows.map((p) => {
        const graphId = p.kv ? `${p.name} | ${p.kv}` : (p.name || p.id);
        const supported = safeJsonParseArray(p.supported_ids).map((aid) => ({
            id: aid,
            label: amendmentLabelById.get(aid) || aid,
        }));
        const applied = safeJsonParseArray(p.applicated_ids).map((aid) => ({
            id: aid,
            label: amendmentLabelById.get(aid) || aid,
        }));
        return {
            id: crypto.randomUUID(),
            graphId,
            name: p.name,
            kv: p.kv,
            project: (safeJsonParseArray(p.conventions)[0]) || "",
            supported,
            applied,
            supportedCount: p.supported_count || supported.length,
            applicatedCount: p.applicated_count || applied.length,
        };
    });

    const amendments = amendmentsRows.map((a) => {
        const supportersIds = safeJsonParseArray(a.supporter_ids);
        const supportersList = supportersIds.map((pid) => {
            const person = personById.get(pid);
            return {
                id: pid,
                label: person?.name || pid,
                kv: person?.kv || "",
            };
        });
        const applicant = personById.get(a.applicant_id);
        const applicants = applicant
            ? [{ id: a.applicant_id, label: applicant.name || a.applicant_id, kv: applicant.kv || "" }]
            : [];
        return {
            id: a.id,
            label: a.label,
            project: a.convention || "",
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
