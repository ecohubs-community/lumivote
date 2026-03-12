import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getCommunityBySlug } from '$lib/server/services/community-service';
import { listProposals, type ProposalFilters } from '$lib/server/services/proposal-service';
import { getMember } from '$lib/server/services/membership-service';
import { ServiceError } from '$lib/server/services/errors';

export const load: PageServerLoad = async ({ params, locals, url }) => {
	const userId = locals.user?.id;

	try {
		const community = await getCommunityBySlug(params.slug, userId);

		// Parse optional filters
		const statusParam = url.searchParams.get('status');
		const filters: ProposalFilters = {};
		if (statusParam === 'draft' || statusParam === 'active' || statusParam === 'closed') {
			filters.status = statusParam;
		}

		const cursor = url.searchParams.get('cursor') ?? undefined;

		const [proposals, membership] = await Promise.all([
			listProposals(community.id, filters, { limit: 20, cursor }),
			userId ? getMember(community.id, userId) : Promise.resolve(null)
		]);

		return {
			community,
			proposals,
			membership,
			statusFilter: filters.status ?? null
		};
	} catch (e) {
		if (e instanceof ServiceError) {
			error(e.statusCode, e.message);
		}
		throw e;
	}
};
