import type { RequestHandler } from './$types';
import { requireAuth, success, handleError, parseBody } from '$lib/server/api-utils';
import {
	getProposal,
	updateProposal,
	type UpdateProposalInput
} from '$lib/server/services/proposal-service';

/** GET /api/proposals/:id — get proposal details with choices. */
export const GET: RequestHandler = async ({ locals, params }) => {
	try {
		const userId = locals.user?.id;
		const result = await getProposal(params.id, userId);
		return success(result);
	} catch (error) {
		return handleError(error);
	}
};

/** PATCH /api/proposals/:id — update a draft proposal. Creator or admin required. */
export const PATCH: RequestHandler = async ({ locals, params, request }) => {
	try {
		const user = requireAuth(locals);
		const body = await parseBody<UpdateProposalInput>(request);
		const result = await updateProposal(user.id, params.id, body);
		return success(result);
	} catch (error) {
		return handleError(error);
	}
};
