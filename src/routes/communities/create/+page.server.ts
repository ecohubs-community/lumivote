import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { createCommunity } from '$lib/server/services/community-service';
import { ServiceError } from '$lib/server/services/errors';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		redirect(302, '/login');
	}
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		if (!locals.user) {
			redirect(302, '/login');
		}

		const formData = await request.formData();

		const name = (formData.get('name') as string) ?? '';
		const slug = (formData.get('slug') as string) ?? '';
		const description = (formData.get('description') as string) ?? '';
		const visibility = (formData.get('visibility') as string) ?? 'public';

		try {
			const result = await createCommunity(locals.user.id, {
				name,
				slug,
				description: description || undefined,
				visibility: visibility as 'public' | 'community'
			});

			redirect(303, `/communities/${result.slug}`);
		} catch (e) {
			if (e instanceof ServiceError) {
				return fail(e.statusCode, { error: e.message, name, slug, description, visibility });
			}
			throw e;
		}
	}
};
