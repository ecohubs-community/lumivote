import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';
import { requireAuth, success, handleError, parseBody } from '$lib/server/api-utils';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/auth.schema';
import { ServiceError, ErrorCode } from '$lib/server/services/errors';

/** GET /api/me — return current authenticated user profile. */
export const GET: RequestHandler = async ({ locals }) => {
	try {
		const authUser = requireAuth(locals);
		return success({
			id: authUser.id,
			email: authUser.email,
			name: authUser.name,
			walletAddress: authUser.walletAddress,
			displayName: authUser.displayName,
			avatarUrl: authUser.avatarUrl
		});
	} catch (error) {
		return handleError(error);
	}
};

/** PATCH /api/me — update current user profile. */
export const PATCH: RequestHandler = async ({ locals, request }) => {
	try {
		const authUser = requireAuth(locals);
		const body = await parseBody<{ displayName?: string; avatarUrl?: string }>(request);

		const updates: Record<string, unknown> = {};

		if (body.displayName !== undefined) {
			if (typeof body.displayName !== 'string' || body.displayName.length > 100) {
				throw new ServiceError(
					ErrorCode.INVALID_REQUEST,
					'displayName must be a string of at most 100 characters'
				);
			}
			updates.displayName = body.displayName;
		}

		if (body.avatarUrl !== undefined) {
			if (typeof body.avatarUrl !== 'string' || body.avatarUrl.length > 500) {
				throw new ServiceError(
					ErrorCode.INVALID_REQUEST,
					'avatarUrl must be a string of at most 500 characters'
				);
			}
			updates.avatarUrl = body.avatarUrl;
		}

		if (Object.keys(updates).length === 0) {
			throw new ServiceError(ErrorCode.INVALID_REQUEST, 'No valid fields to update');
		}

		await db.update(user).set(updates).where(eq(user.id, authUser.id));

		// Re-query updated user
		const updated = db.select().from(user).where(eq(user.id, authUser.id)).get();

		return success({
			id: updated!.id,
			email: updated!.email,
			name: updated!.name,
			displayName: updated!.displayName,
			avatarUrl: updated!.avatarUrl
		});
	} catch (error) {
		return handleError(error);
	}
};
