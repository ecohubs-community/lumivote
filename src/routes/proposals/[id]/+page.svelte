<script lang="ts">
	import StatusBadge from '$lib/components/StatusBadge.svelte';
	import { formatRelativeTime } from '$lib/utils/format';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const timeContext = $derived.by(() => {
		if (data.proposal.status === 'active') {
			return `Voting ends ${formatRelativeTime(data.proposal.endTime)}`;
		}
		if (data.proposal.status === 'closed') {
			return `Voting ended ${formatRelativeTime(data.proposal.endTime)}`;
		}
		return `Voting starts ${formatRelativeTime(data.proposal.startTime)}`;
	});

	const maxVotes = $derived(
		Math.max(...data.results.results.map((r) => r.votes), 1)
	);
</script>

<svelte:head>
	<title>{data.proposal.title} — LumiVote</title>
</svelte:head>

<!-- Breadcrumb -->
<div class="mb-6">
	<a
		href="/communities/{data.community.slug}"
		class="text-sm text-blue-600 hover:text-blue-800"
	>
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

<!-- Choices -->
<section class="mt-8">
	<h2 class="text-lg font-semibold text-gray-900">Choices</h2>
	<ul class="mt-3 space-y-2">
		{#each data.proposal.choices as choice}
			<li class="rounded-md border border-gray-200 px-4 py-2 text-sm text-gray-700">
				{choice.label}
			</li>
		{/each}
	</ul>
	{#if data.proposal.status === 'active' && data.membership}
		<p class="mt-3 text-sm text-gray-500">Voting UI coming in Step 8.</p>
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
							<div
								class="h-2.5 rounded-full bg-blue-500"
								style="width: {pct}%"
							></div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</section>
{/if}
