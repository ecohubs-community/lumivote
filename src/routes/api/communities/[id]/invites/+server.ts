import type { RequestHandler } from './$types';
import { requireAuth, success, handleError, parseBody } from '$lib/server/api-utils';
import { createInvite } from '$lib/server/services/membership-service';

/** POST /api/communities/:id/invites — create an invite link. Admin required. */
export const POST: RequestHandler = async ({ locals, params, request, url }) => {
	try {
		const user = requireAuth(locals);
		const body = await parseBody<{ maxUses?: number; expiresAt: string }>(request);
		const invite = await createInvite(user.id, params.id, body);
		const inviteUrl = `${url.origin}/join/${invite.token}`;
		return success({ inviteUrl }, 201);
	} catch (error) {
		return handleError(error);
	}
};
