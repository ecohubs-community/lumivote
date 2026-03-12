/**
 * Shared utilities for REST API route handlers.
 *
 * Provides auth guards, standardized JSON response wrappers,
 * request body parsing, and ServiceError-to-HTTP mapping.
 */

import { json } from '@sveltejs/kit';
import { ServiceError, ErrorCode } from './services/errors';
import type { PaginationParams } from './services/types';

// ─── Auth guard ──────────────────────────────────────────────────────────────

/**
 * Require an authenticated user in the request.
 * Throws 401 ServiceError if no user is attached to locals.
 */
export function requireAuth(locals: App.Locals) {
	if (!locals.user) {
		throw new ServiceError(ErrorCode.UNAUTHORIZED, 'Authentication required');
	}
	return locals.user;
}

// ─── Response helpers ────────────────────────────────────────────────────────

/** Wrap data in the standard `{ success: true, data }` envelope. */
export function success(data: unknown, status = 200) {
	return json({ success: true, data }, { status });
}

/** Return `{ success: true }` with no data payload. */
export function successNoData(status = 200) {
	return json({ success: true }, { status });
}

/**
 * Convert a caught error into a standard JSON error response.
 *
 * - `ServiceError` → uses its `code`, `message`, and `statusCode`
 * - Unknown errors  → logs to console and returns a generic 500
 */
export function handleError(error: unknown) {
	if (error instanceof ServiceError) {
		return json(
			{ success: false, error: { code: error.code, message: error.message } },
			{ status: error.statusCode }
		);
	}

	console.error('Unhandled API error:', error);
	return json(
		{ success: false, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
		{ status: 500 }
	);
}

// ─── Request parsing ─────────────────────────────────────────────────────────

/**
 * Parse the JSON body from a request.
 * Throws INVALID_REQUEST if the body is not valid JSON.
 */
export async function parseBody<T = Record<string, unknown>>(request: Request): Promise<T> {
	try {
		return (await request.json()) as T;
	} catch {
		throw new ServiceError(ErrorCode.INVALID_REQUEST, 'Invalid JSON body');
	}
}

/**
 * Extract pagination params (limit, cursor) from URL search params.
 */
export function parsePagination(url: URL): PaginationParams {
	const limitStr = url.searchParams.get('limit');
	const cursor = url.searchParams.get('cursor');

	return {
		limit: limitStr ? parseInt(limitStr, 10) || undefined : undefined,
		cursor: cursor ?? undefined
	};
}
