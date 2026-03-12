import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getProposal, getProposalResults } from '$lib/server/services/proposal-service';
import { getCommunityById } from '$lib/server/services/community-service';
import { getMember } from '$lib/server/services/membership-service';
import { ServiceError } from '$lib/server/services/errors';

export const load: PageServerLoad = async ({ params, locals }) => {
	const userId = locals.user?.id;

	try {
		const proposal = await getProposal(params.id, userId);
		const [results, community, membership] = await Promise.all([
			getProposalResults(params.id, userId),
			getCommunityById(proposal.communityId, userId),
			userId ? getMember(proposal.communityId, userId) : Promise.resolve(null)
		]);

		return {
			proposal,
			results,
			community,
			membership
		};
	} catch (e) {
		if (e instanceof ServiceError) {
			error(e.statusCode, e.message);
		}
		throw e;
	}
};
