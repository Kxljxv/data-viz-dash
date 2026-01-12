import { json } from "@sveltejs/kit";
import { getUserSession, getSafeUserId } from "$lib/server/auth";

/** @type {import('./$types').RequestHandler} */
export async function GET({ platform, cookies }) {
    const session = await getUserSession(platform, cookies);
    if (!session.user) {
        return json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.sub || session.user.email;
    const safeUserId = getSafeUserId(userId);
    const kv = platform?.env?.DATA_CACHE;

    if (!kv) {
        // Return a special warning but don't error out, allowing frontend fallback to localStorage
        return json({ analyses: [], warning: "KV_NOT_BOUND", development: true });
    }

    try {
        const key = `user_analyses__${safeUserId}`;
        let data = null;
        try {
            data = await kv.get(key, { type: "json" });
        } catch (kvError) {
            console.error("KV GET failed, likely local dev issue:", kvError);
            return json({ analyses: [], warning: "KV_ERROR", details: kvError.message, development: true });
        }
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
        const safeUserId = getSafeUserId(userId);
        const kv = platform?.env?.DATA_CACHE;

        if (!kv) {
            // In development without KV, we just return success: false with a specific code
            // The frontend will see this and rely on its localStorage fallback
            return json({ 
                success: false, 
                error: "KV_NOT_BOUND",
                development: true,
                message: "Cloudflare KV 'DATA_CACHE' ist nicht konfiguriert. Daten werden nur lokal im Browser gespeichert." 
            });
        }

        const key = `user_analyses__${safeUserId}`;
        try {
            await kv.put(key, JSON.stringify(analyses));
        } catch (kvError) {
            console.error("KV PUT failed:", kvError);
            return json({ 
                success: false, 
                error: "KV_ERROR", 
                development: true,
                message: "Speichern im Cloudflare KV fehlgeschlagen. Daten werden nur lokal im Browser gespeichert." 
            });
        }
        
        return json({ success: true });
    } catch (err) {
        console.error("Error saving analyses:", err);
        return json({ error: "Internal server error" }, { status: 500 });
    }
}
