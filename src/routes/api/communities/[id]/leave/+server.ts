import type { RequestHandler } from './$types';
import { requireAuth, successNoData, handleError } from '$lib/server/api-utils';
import { leaveCommunity } from '$lib/server/services/membership-service';

/** POST /api/communities/:id/leave — leave a community. */
export const POST: RequestHandler = async ({ locals, params }) => {
	try {
		const user = requireAuth(locals);
		await leaveCommunity(user.id, params.id);
		return successNoData();
	} catch (error) {
		return handleError(error);
	}
};
