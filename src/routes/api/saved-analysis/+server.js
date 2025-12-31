import { json } from "@sveltejs/kit";
import { getUserSession } from "$lib/server/auth";

/** @type {import('./$types').RequestHandler} */
export async function GET({ platform, cookies }) {
    const session = await getUserSession(platform, cookies);
    if (!session.user) {
        return json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.sub || session.user.email;
    const kv = platform?.env?.DATA_CACHE;

    if (!kv) {
        return json({ analyses: [] }); // Development fallback
    }

    try {
        const key = `user_analyses:${userId}`;
        const data = await kv.get(key, { type: "json" });
        return json({ analyses: data || [] });
    } catch (err) {
        console.error("Error fetching saved analyses:", err);
        return json({ error: "Internal server error" }, { status: 500 });
    }
}

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, platform, cookies }) {
    const session = await getUserSession(platform, cookies);
    if (!session.user) {
        return json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { analyses } = await request.json();
        const userId = session.user.sub || session.user.email;
        const kv = platform?.env?.DATA_CACHE;

        if (!kv) {
            return json({ success: true, message: "Development mode: Data not persisted to KV" });
        }

        const key = `user_analyses:${userId}`;
        await kv.put(key, JSON.stringify(analyses));

        return json({ success: true });
    } catch (err) {
        console.error("Error saving analyses:", err);
        return json({ error: "Internal server error" }, { status: 500 });
    }
}
