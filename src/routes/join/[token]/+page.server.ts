import { error, fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { getInviteByToken, redeemInvite, getMember } from '$lib/server/services/membership-service';
import { ServiceError } from '$lib/server/services/errors';

export const load: PageServerLoad = async ({ params, locals }) => {
	const userId = locals.user?.id;

	try {
		const { invite, community, expired, exhausted } = await getInviteByToken(params.token);

		const alreadyMember = userId ? !!(await getMember(invite.communityId, userId)) : false;

		return {
			community,
			expired,
			exhausted,
			alreadyMember,
			token: params.token
		};
	} catch (e) {
		if (e instanceof ServiceError) {
			error(e.statusCode, e.message);
		}
		throw e;
	}
};

export const actions: Actions = {
	default: async ({ locals, params }) => {
		if (!locals.user) {
			redirect(302, `/login?redirect=/join/${params.token}`);
		}

		try {
			const { community } = await getInviteByToken(params.token);
			await redeemInvite(locals.user.id, params.token);
			redirect(303, `/communities/${community.slug}`);
		} catch (e) {
			if (e instanceof ServiceError) {
				return fail(e.statusCode, { error: e.message });
			}
			throw e;
		}
	}
};
