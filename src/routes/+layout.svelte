<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { authClient } from '$lib/auth-client';
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: any } = $props();
	let mobileMenuOpen = $state(false);

	const handleSignOut = async () => {
		await authClient.signOut();
		window.location.href = '/';
	};
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<nav class="border-b border-gray-200 bg-white px-4 py-3">
	<div class="mx-auto flex max-w-5xl items-center justify-between">
		<a href="/" class="text-lg font-semibold text-gray-900">LumiVote</a>

		<!-- Desktop nav -->
		<div class="hidden items-center gap-4 sm:flex">
			{#if data.user}
				<a href="/" class="text-sm text-gray-600 hover:text-gray-900">Communities</a>
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

		<!-- Mobile hamburger -->
		<button
			onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
			class="inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 sm:hidden"
			aria-label="Toggle menu"
		>
			{#if mobileMenuOpen}
				<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
				</svg>
			{:else}
				<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
				</svg>
			{/if}
		</button>
	</div>

	<!-- Mobile dropdown -->
	{#if mobileMenuOpen}
		<div class="mx-auto mt-3 max-w-5xl space-y-2 border-t border-gray-100 pt-3 sm:hidden">
			{#if data.user}
				<div class="px-1 text-sm font-medium text-gray-900">
					{data.user.displayName || data.user.name || data.user.email}
				</div>
				<a href="/" class="block rounded-md px-1 py-1.5 text-sm text-gray-600 hover:bg-gray-50">Communities</a>
				<button
					onclick={handleSignOut}
					class="block w-full rounded-md px-1 py-1.5 text-left text-sm text-gray-500 hover:bg-gray-50"
				>
					Sign out
				</button>
			{:else}
				<a href="/login" class="block rounded-md px-1 py-1.5 text-sm text-gray-600 hover:bg-gray-50">Sign in</a>
				<a href="/register" class="block rounded-md px-1 py-1.5 text-sm font-medium text-blue-600 hover:bg-gray-50">Register</a>
			{/if}
		</div>
	{/if}
</nav>

<main class="mx-auto max-w-5xl p-4">
	{@render children()}
</main>

<footer class="mt-12 border-t border-gray-200 px-4 py-6 text-center text-xs text-gray-400">
	&copy; {new Date().getFullYear()} LumiVote &middot; Community Governance, Simplified
</footer>
