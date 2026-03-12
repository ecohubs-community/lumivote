import type { RequestHandler } from './$types';
import { success, handleError } from '$lib/server/api-utils';
import { getProposalResults } from '$lib/server/services/proposal-service';

/** GET /api/proposals/:id/results — get voting results for a proposal. */
export const GET: RequestHandler = async ({ locals, params }) => {
	try {
		const userId = locals.user?.id;
		const result = await getProposalResults(params.id, userId);
		return success(result);
	} catch (error) {
		return handleError(error);
	}
};
