import type { RequestHandler } from './$types';
import { requireAuth, successNoData, handleError, parseBody } from '$lib/server/api-utils';
import { castVote, type CastVoteInput } from '$lib/server/services/vote-service';

/** POST /api/votes — cast a vote on an active proposal. */
export const POST: RequestHandler = async ({ locals, request }) => {
	try {
		const user = requireAuth(locals);
		const body = await parseBody<CastVoteInput>(request);
		await castVote(user.id, body);
		return successNoData(201);
	} catch (error) {
		return handleError(error);
	}
};
