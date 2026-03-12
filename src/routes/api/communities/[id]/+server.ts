import type { RequestHandler } from './$types';
import { requireAuth, success, handleError, parseBody } from '$lib/server/api-utils';
import {
	getCommunityBySlug,
	updateCommunity,
	type UpdateCommunityInput
} from '$lib/server/services/community-service';

/**
 * GET /api/communities/:id — get community details.
 * The param is interpreted as a **slug** for lookup.
 */
export const GET: RequestHandler = async ({ locals, params }) => {
	try {
		const userId = locals.user?.id;
		const result = await getCommunityBySlug(params.id, userId);
		return success(result);
	} catch (error) {
		return handleError(error);
	}
};

/**
 * PATCH /api/communities/:id — update community settings.
 * The param is interpreted as a **UUID id** for the update.
 * Admin required.
 */
export const PATCH: RequestHandler = async ({ locals, params, request }) => {
	try {
		const user = requireAuth(locals);
		const body = await parseBody<UpdateCommunityInput>(request);
		const result = await updateCommunity(user.id, params.id, body);
		return success(result);
	} catch (error) {
		return handleError(error);
	}
};
