import type { RequestHandler } from './$types';
import { requireAuth, successNoData, handleError } from '$lib/server/api-utils';
import { removeMember } from '$lib/server/services/membership-service';

/** DELETE /api/communities/:id/members/:userId — remove a member. Admin required. */
export const DELETE: RequestHandler = async ({ locals, params }) => {
	try {
		const user = requireAuth(locals);
		await removeMember(user.id, params.id, params.userId);
		return successNoData();
	} catch (error) {
		return handleError(error);
	}
};
