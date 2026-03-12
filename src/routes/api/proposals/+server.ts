import type { RequestHandler } from './$types';
import { requireAuth, success, handleError, parseBody } from '$lib/server/api-utils';
import { createProposal, type CreateProposalInput } from '$lib/server/services/proposal-service';

/** POST /api/proposals — create a new proposal. Requires community membership. */
export const POST: RequestHandler = async ({ locals, request }) => {
	try {
		const user = requireAuth(locals);
		const body = await parseBody<CreateProposalInput>(request);
		const result = await createProposal(user.id, body);
		return success({ proposalId: result.id }, 201);
	} catch (error) {
		return handleError(error);
	}
};
