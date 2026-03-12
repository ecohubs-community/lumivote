import type { RequestHandler } from './$types';
import { requireAuth, successNoData, handleError } from '$lib/server/api-utils';
import { redeemInvite } from '$lib/server/services/membership-service';

/** POST /api/join/:token — redeem an invite link and join the community. */
export const POST: RequestHandler = async ({ locals, params }) => {
	try {
		const user = requireAuth(locals);
		await redeemInvite(user.id, params.token);
		return successNoData();
	} catch (error) {
		return handleError(error);
	}
};
