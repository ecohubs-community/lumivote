<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<svelte:head>
	<title>Join {data.community.name} — LumiVote</title>
</svelte:head>

<div class="mx-auto max-w-md py-12">
	<div class="rounded-lg border border-gray-200 p-6 text-center">
		<h1 class="text-2xl font-bold text-gray-900">Join {data.community.name}</h1>

		{#if data.community.description}
			<p class="mt-2 text-sm text-gray-600">{data.community.description}</p>
		{/if}

		{#if form?.error}
			<div
				class="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
			>
				{form.error}
			</div>
		{/if}

		{#if data.expired}
			<p class="mt-6 text-sm text-red-600">This invite link has expired.</p>
		{:else if data.exhausted}
			<p class="mt-6 text-sm text-red-600">This invite link has reached its usage limit.</p>
		{:else if data.alreadyMember}
			<p class="mt-6 text-sm text-gray-600">You're already a member of this community.</p>
			<a
				href="/communities/{data.community.slug}"
				class="mt-4 inline-block rounded-md bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
			>
				Go to Community
			</a>
		{:else if data.user}
			<form method="POST" use:enhance class="mt-6">
				<button
					type="submit"
					class="rounded-md bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
				>
					Join {data.community.name}
				</button>
			</form>
		{:else}
			<p class="mt-6 text-sm text-gray-600">You need an account to join this community.</p>
			<div class="mt-4 flex items-center justify-center gap-3">
				<a
					href="/login?redirect=/join/{data.token}"
					class="rounded-md bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
				>
					Sign In
				</a>
				<a
					href="/register?redirect=/join/{data.token}"
					class="rounded-md border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
				>
					Register
				</a>
			</div>
		{/if}
	</div>
</div>
