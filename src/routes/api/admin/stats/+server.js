import { json } from "@sveltejs/kit";
import { getUserSession, isAdmin } from "$lib/server/auth";

/** @type {import('./$types').RequestHandler} */
export async function GET({ platform, cookies }) {
    const session = await getUserSession(platform, cookies);
    
    if (!session.user || !isAdmin(session.user.roles)) {
        return json({ error: "Unauthorized" }, { status: 401 });
    }

    const kv = platform?.env?.DATA_CACHE;
    if (!kv) {
        return json({ error: "KV not bound" }, { status: 503 });
    }

    try {
        // 1. List all keys in KV to find profiles and analyses
        const profileKeys = [];
        const analysisKeys = [];
        
        let cursor = undefined;
        do {
            const list = await kv.list({ cursor });
            for (const key of list.keys) {
                if (key.name.startsWith("user_profile:")) {
                    profileKeys.push(key.name);
                } else if (key.name.startsWith("user_analyses:")) {
                    analysisKeys.push(key.name);
                }
            }
            cursor = list.cursor;
        } while (cursor);

        // 2. Fetch all profiles
        const profiles = await Promise.all(
            profileKeys.map(async (key) => {
                const userId = key.replace("user_profile:", "");
                const data = await kv.get(key, { type: "json" });
                return { userId, ...data };
            })
        );

        // 3. Fetch analysis metadata (counts)
        const analysesStats = await Promise.all(
            analysisKeys.map(async (key) => {
                const userId = key.replace("user_analyses:", "");
                const data = await kv.get(key, { type: "json" });
                return {
                    userId,
                    count: data?.length || 0,
                    lastAnalysis: data?.length > 0 ? data[0].timestamp : null
                };
            })
        );

        // 4. Combine data
        const userStats = profiles.map(profile => {
            const stats = analysesStats.find(s => s.userId === profile.userId);
            return {
                ...profile,
                analysisCount: stats?.count || 0,
                lastActive: stats?.lastAnalysis || profile.updatedAt
            };
        });

        // 5. Aggregate statistics
        const totalUsers = userStats.length;
        const totalAnalyses = userStats.reduce((acc, curr) => acc + curr.analysisCount, 0);
        
        const kvDistribution = userStats.reduce((acc, curr) => {
            const kv = curr.kreisverband || "Unbekannt";
            acc[kv] = (acc[kv] || 0) + 1;
            return acc;
        }, {});

        return json({
            summary: {
                totalUsers,
                totalAnalyses,
                activeUsersLast7Days: userStats.filter(u => {
                    if (!u.lastActive) return false;
                    const lastActive = new Date(u.lastActive);
                    const sevenDaysAgo = new Date();
                    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                    return lastActive > sevenDaysAgo;
                }).length
            },
            users: userStats,
            kvDistribution
        });
    } catch (err) {
        console.error("Error fetching admin stats:", err);
        return json({ error: "Internal server error" }, { status: 500 });
    }
}
