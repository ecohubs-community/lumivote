/**
 * Shared types and pagination utilities for the service layer.
 */

// ─── Pagination ──────────────────────────────────────────────────────────────

/** Input accepted by paginated list functions. */
export interface PaginationParams {
	limit?: number;
	cursor?: string;
}

/** Output returned by paginated list functions. */
export interface PaginatedResult<T> {
	items: T[];
	nextCursor: string | null;
}

/**
 * Encode a compound cursor from the last item's timestamp and id.
 * Uses base64url so the value is safe in query strings.
 */
export function encodeCursor(timestamp: Date, id: string): string {
	return Buffer.from(JSON.stringify({ ts: timestamp.getTime(), id })).toString('base64url');
}

/**
 * Decode a cursor string back into timestamp + id.
 * Returns null if the cursor is malformed.
 */
export function decodeCursor(cursor: string): { ts: number; id: string } | null {
	try {
		const parsed = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf-8'));
		if (typeof parsed.ts === 'number' && typeof parsed.id === 'string') return parsed;
		return null;
	} catch {
		return null;
	}
}

/**
 * Clamp a user-supplied limit to a safe range.
 * Returns `defaultLimit` when the input is missing or invalid.
 */
export function clampLimit(limit?: number, defaultLimit = 20, maxLimit = 100): number {
	if (!limit || limit < 1) return defaultLimit;
	return Math.min(limit, maxLimit);
}

// ─── Database helper type ────────────────────────────────────────────────────

/**
 * The type of the `db` object from `$lib/server/db`.
 * Used as a parameter type so services can accept a test database.
 */
export type Database = typeof import('$lib/server/db').db;
