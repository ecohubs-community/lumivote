<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { authClient } from '$lib/auth-client';
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: any } = $props();

	const handleSignOut = async () => {
		await authClient.signOut();
		window.location.href = '/';
	};
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<nav class="border-b border-gray-200 bg-white px-4 py-3">
	<div class="mx-auto flex max-w-5xl items-center justify-between">
		<a href="/" class="text-lg font-semibold text-gray-900">LumiVote</a>
		<div class="flex items-center gap-4">
			{#if data.user}
				<span class="text-sm text-gray-600">
					{data.user.displayName || data.user.name || data.user.email}
				</span>
				<button
					onclick={handleSignOut}
					class="text-sm text-gray-500 hover:text-gray-700"
				>
					Sign out
				</button>
			{:else}
				<a href="/login" class="text-sm text-gray-600 hover:text-gray-900">Sign in</a>
				<a
					href="/register"
					class="rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
				>
					Register
				</a>
			{/if}
		</div>
	</div>
</nav>

<main class="mx-auto max-w-5xl p-4">
	{@render children()}
</main>
