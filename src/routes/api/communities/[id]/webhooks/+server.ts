import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';
import { requireAuth, success, handleError, parseBody } from '$lib/server/api-utils';
import { requireAdmin } from '$lib/server/services/membership-service';
import { ServiceError, ErrorCode } from '$lib/server/services/errors';
import { db } from '$lib/server/db';
import { webhook } from '$lib/server/db/governance.schema';

/** POST /api/communities/:id/webhooks — register a webhook. Admin required. */
export const POST: RequestHandler = async ({ locals, params, request }) => {
	try {
		const user = requireAuth(locals);
		await requireAdmin(params.id, user.id);

		const body = await parseBody<{ url: string; events: string[] }>(request);

		// Validate URL
		try {
			new URL(body.url);
		} catch {
			throw new ServiceError(ErrorCode.INVALID_REQUEST, 'Invalid webhook URL');
		}

		// Validate events array
		if (!Array.isArray(body.events) || body.events.length === 0) {
			throw new ServiceError(ErrorCode.INVALID_REQUEST, 'events must be a non-empty array');
		}

		const created = db
			.insert(webhook)
			.values({
				communityId: params.id,
				url: body.url,
				events: JSON.stringify(body.events)
			})
			.returning()
			.get();

		return success({ id: created.id, secret: created.secret }, 201);
	} catch (error) {
		return handleError(error);
	}
};

/** GET /api/communities/:id/webhooks — list community webhooks. Admin required. */
export const GET: RequestHandler = async ({ locals, params }) => {
	try {
		const user = requireAuth(locals);
		await requireAdmin(params.id, user.id);

		const webhooks = db.select().from(webhook).where(eq(webhook.communityId, params.id)).all();

		const items = webhooks.map((w) => ({
			id: w.id,
			url: w.url,
			events: JSON.parse(w.events) as string[],
			active: w.active,
			createdAt: w.createdAt
		}));

		return success({ items });
	} catch (error) {
		return handleError(error);
	}
};
