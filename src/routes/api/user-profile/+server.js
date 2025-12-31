import { json } from "@sveltejs/kit";
import { getUserSession } from "$lib/server/auth";

/** @type {import('./$types').RequestHandler} */
export async function POST({ request, platform, cookies }) {
    const session = await getUserSession(platform, cookies);
    if (!session.user) {
        return json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { fullName, kreisverband } = await request.json();
        
        if (!fullName || !kreisverband) {
            return json({ error: "Missing required fields" }, { status: 400 });
        }

        const userId = session.user.sub;
        const kv = platform?.env?.DATA_CACHE;

        if (!kv) {
            return json({ 
                error: "KV_NOT_BOUND",
                message: "Cloudflare KV 'DATA_CACHE' ist nicht konfiguriert." 
            }, { status: 503 });
        }

        const profile = {
            fullName,
            kreisverband,
            updatedAt: new Date().toISOString()
        };

        const key = `user_profile:${userId}`;
        await kv.put(key, JSON.stringify(profile));

        return json({ success: true, profile });
    } catch (err) {
        console.error("Error saving user profile:", err);
        return json({ error: "Internal server error" }, { status: 500 });
    }
}
