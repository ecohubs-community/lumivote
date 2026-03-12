import type { RequestHandler } from './$types';
import { success, handleError } from '$lib/server/api-utils';
import { getPublicCommunities } from '$lib/server/services/community-service';

/** GET /api/communities/public — list public communities for discovery. No auth required. */
export const GET: RequestHandler = async ({ url }) => {
	try {
		const sort = url.searchParams.get('sort') as 'newest' | 'most_active' | null;
		const limitStr = url.searchParams.get('limit');
		const limit = limitStr ? parseInt(limitStr, 10) || 6 : 6;

		const items = await getPublicCommunities(sort ?? 'newest', limit);
		return success({ items });
	} catch (error) {
		return handleError(error);
	}
};
