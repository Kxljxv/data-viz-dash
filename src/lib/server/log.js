// Simplified logging for development
// In production, this could integrate with Cloudflare Workers logging or external services

/**
 * Logs a message (simplified version)
 * @param {object} platform - Cloudflare platform object
 * @param {string} env - Environment (development/production)
 * @param {string} place - Place/component where log originates
 * @param {string} level - Log level (info, error, warn)
 * @param {string} message - Log message
 * @param {string} [userEmail] - Optional user email for context
 */
export async function log_message(platform, env, place, level, message, userEmail = null) {
	const timestamp = new Date().toISOString();
	const logEntry = `[${timestamp}] [${env}] [${place}] [${level.toUpperCase()}] ${message}${userEmail ? ` (user: ${userEmail})` : ""}`;
	
	if (level === "error") {
		console.error(logEntry);
	} else {
		console.log(logEntry);
	}

	// In production, you could send to external logging service
	// For now, just console logging
}

