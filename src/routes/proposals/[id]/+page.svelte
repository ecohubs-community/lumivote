<script lang="ts">
	import { enhance } from '$app/forms';
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import { formatRelativeTime } from '$lib/utils/format';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let selectedChoiceId = $state<string | null>(null);
	let submitting = $state(false);

	const timeContext = $derived.by(() => {
		if (data.proposal.status === 'active') {
			return `Voting ends ${formatRelativeTime(data.proposal.endTime)}`;
		}
		if (data.proposal.status === 'closed') {
			return `Voting ended ${formatRelativeTime(data.proposal.endTime)}`;
		}
		return `Voting starts ${formatRelativeTime(data.proposal.startTime)}`;
	});

	const votingState = $derived.by(() => {
		if (data.proposal.status !== 'active') return 'read-only' as const;
		if (!data.user) return 'not-logged-in' as const;
		if (!data.membership) return 'not-member' as const;
		if (data.userVote) return 'already-voted' as const;
		return 'can-vote' as const;
	});

	const maxVotes = $derived(Math.max(...data.results.results.map((r) => r.votes), 1));
</script>

<svelte:head>
	<title>{data.proposal.title} — LumiVote</title>
</svelte:head>

<!-- Breadcrumb -->
<div class="mb-6">
	<a href="/communities/{data.community.slug}" class="text-sm text-blue-600 hover:text-blue-800">
		&larr; Back to {data.community.name}
	</a>
</div>

<!-- Header -->
<section class="border-b border-gray-200 pb-6">
	<div class="flex items-start justify-between gap-4">
		<div>
			<h1 class="text-3xl font-bold text-gray-900">{data.proposal.title}</h1>
			<div class="mt-2 flex items-center gap-3">
				<StatusBadge status={data.proposal.status as 'draft' | 'active' | 'closed'} />
				<span class="text-sm text-gray-500">{timeContext}</span>
			</div>
		</div>

		{#if data.proposal.status === 'draft' && (data.proposal.createdBy === data.user?.id || data.membership?.role === 'admin')}
			<span class="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-500">
				Edit (coming soon)
			</span>
		{/if}
	</div>
</section>

<!-- Body -->
<section class="mt-6">
	<h2 class="text-lg font-semibold text-gray-900">Description</h2>
	<div class="mt-2 whitespace-pre-wrap text-gray-700">{data.proposal.body}</div>
</section>

<!-- Choices / Voting -->
<section class="mt-8">
	<h2 class="text-lg font-semibold text-gray-900">Choices</h2>

	{#if form?.error}
		<div class="mt-3 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
			{form.error}
		</div>
	{/if}

	{#if form?.success}
		<div
			class="mt-3 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
		>
			Your vote has been recorded.
		</div>
	{/if}

	{#if votingState === 'can-vote'}
		<!-- Active proposal, member, hasn't voted -->
		<form
			method="POST"
			action="?/vote"
			use:enhance={() => {
				submitting = true;
				return async ({ update }) => {
					submitting = false;
					await update();
				};
			}}
		>
			<fieldset disabled={submitting} class="mt-3 space-y-2">
				{#each data.proposal.choices as choice}
					<label
						class="flex cursor-pointer items-center gap-3 rounded-md border px-4 py-3 text-sm transition-colors
							{selectedChoiceId === choice.id
							? 'border-blue-500 bg-blue-50 text-blue-900'
							: 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'}"
					>
						<input
							type="radio"
							name="choiceId"
							value={choice.id}
							bind:group={selectedChoiceId}
							class="h-4 w-4 text-blue-600 focus:ring-blue-500"
						/>
						{choice.label}
					</label>
				{/each}
			</fieldset>

			<button
				type="submit"
				disabled={!selectedChoiceId || submitting}
				class="mt-4 rounded-md bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
			>
				{submitting ? 'Submitting...' : 'Submit Vote'}
			</button>
		</form>
	{:else if votingState === 'already-voted'}
		<!-- Active proposal, member, already voted -->
		<ul class="mt-3 space-y-2">
			{#each data.proposal.choices as choice}
				{@const isUserChoice = data.userVote?.choiceId === choice.id}
				<li
					class="flex items-center gap-3 rounded-md border px-4 py-2 text-sm {isUserChoice
						? 'border-blue-500 bg-blue-50 font-medium text-blue-900'
						: 'border-gray-200 text-gray-700'}"
				>
					{#if isUserChoice}
						<svg
							class="h-4 w-4 shrink-0 text-blue-600"
							fill="currentColor"
							viewBox="0 0 20 20"
						>
							<path
								fill-rule="evenodd"
								d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
								clip-rule="evenodd"
							/>
						</svg>
					{/if}
					{choice.label}
				</li>
			{/each}
		</ul>
		<p class="mt-3 text-sm text-green-700">
			You voted for "{data.proposal.choices.find((c) => c.id === data.userVote?.choiceId)
				?.label}". Your vote is locked.
		</p>
	{:else if votingState === 'not-member'}
		<!-- Active proposal, logged in, not a member -->
		<ul class="mt-3 space-y-2">
			{#each data.proposal.choices as choice}
				<li class="rounded-md border border-gray-200 px-4 py-2 text-sm text-gray-700">
					{choice.label}
				</li>
			{/each}
		</ul>
		<p class="mt-3 text-sm text-gray-500">
			You must be a member of this community to vote.
			<a
				href="/communities/{data.community.slug}"
				class="font-medium text-blue-600 hover:text-blue-800"
			>
				View community
			</a>
		</p>
	{:else if votingState === 'not-logged-in'}
		<!-- Active proposal, not logged in -->
		<ul class="mt-3 space-y-2">
			{#each data.proposal.choices as choice}
				<li class="rounded-md border border-gray-200 px-4 py-2 text-sm text-gray-700">
					{choice.label}
				</li>
			{/each}
		</ul>
		<p class="mt-3 text-sm text-gray-500">
			<a href="/login" class="font-medium text-blue-600 hover:text-blue-800">Sign in</a>
			to vote on this proposal.
		</p>
	{:else}
		<!-- Draft or closed — read-only -->
		<ul class="mt-3 space-y-2">
			{#each data.proposal.choices as choice}
				<li class="rounded-md border border-gray-200 px-4 py-2 text-sm text-gray-700">
					{choice.label}
				</li>
			{/each}
		</ul>
	{/if}
</section>

<!-- Results -->
{#if data.proposal.status === 'active' || data.proposal.status === 'closed'}
	<section class="mt-8 pb-8">
		<h2 class="text-lg font-semibold text-gray-900">
			Results
			<span class="ml-2 text-sm font-normal text-gray-500">
				({data.results.totalVotes} {data.results.totalVotes === 1 ? 'vote' : 'votes'})
			</span>
		</h2>

		{#if data.results.totalVotes === 0}
			<p class="mt-3 text-sm text-gray-500">No votes yet.</p>
		{:else}
			<div class="mt-4 space-y-3">
				{#each data.results.results as result}
					{@const pct = data.results.totalVotes > 0
						? Math.round((result.votes / data.results.totalVotes) * 100)
						: 0}
					<div>
						<div class="flex items-center justify-between text-sm">
							<span class="font-medium text-gray-700">{result.label}</span>
							<span class="text-gray-500">{result.votes} ({pct}%)</span>
						</div>
						<div class="mt-1 h-2.5 w-full rounded-full bg-gray-100">
							<div class="h-2.5 rounded-full bg-blue-500" style="width: {pct}%"></div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</section>
{/if}
