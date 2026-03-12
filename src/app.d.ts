import type { Session } from 'better-auth/minimal';
import type { auth } from '$lib/server/auth';

type AuthUser = (typeof auth)['$Infer']['Session']['user'];

// EIP-1193 Ethereum provider (MetaMask, etc.)
interface EthereumProvider {
	request(args: { method: string; params?: unknown[] }): Promise<unknown>;
	on(event: string, handler: (...args: unknown[]) => void): void;
	removeListener(event: string, handler: (...args: unknown[]) => void): void;
	isMetaMask?: boolean;
}

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			user?: AuthUser;
			session?: Session;
		}

		// interface Error {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	interface Window {
		ethereum?: EthereumProvider;
	}
}

export {};
