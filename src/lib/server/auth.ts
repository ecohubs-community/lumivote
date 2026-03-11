import { betterAuth } from 'better-auth/minimal';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { env } from '$env/dynamic/private';
import { getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import * as authSchema from '$lib/server/db/auth.schema';

export const auth = betterAuth({
	baseURL: env.ORIGIN,
	secret: env.BETTER_AUTH_SECRET,
	database: drizzleAdapter(db, {
		provider: 'sqlite',
		schema: {
			user: authSchema.user,
			session: authSchema.session,
			account: authSchema.account,
			verification: authSchema.verification
		}
	}),
	emailAndPassword: { enabled: true },
	user: {
		additionalFields: {
			walletAddress: {
				type: 'string',
				required: false,
				input: false // not settable during normal signup
			},
			displayName: {
				type: 'string',
				required: false,
				input: true
			},
			avatarUrl: {
				type: 'string',
				required: false,
				input: true
			}
		}
	},
	plugins: [sveltekitCookies(getRequestEvent)] // make sure this is the last plugin in the array
});
