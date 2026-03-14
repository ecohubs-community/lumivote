<script lang="ts">
	import StatusBadge from './StatusBadge.svelte';
	import { formatRelativeTime } from '$lib/utils/format';
	import { resolve } from '$app/paths';

	type Props = {
		proposal: {
			id: string;
			title: string;
			status: string;
			startTime: Date;
			endTime: Date;
			body?: string;
		};
	};

	let { proposal }: Props = $props();

	const timeContext = $derived.by(() => {
		if (proposal.status === 'active') {
			return `Ends ${formatRelativeTime(proposal.endTime)}`;
		}
		if (proposal.status === 'closed') {
			return `Ended ${formatRelativeTime(proposal.endTime)}`;
		}
		// draft
		return `Starts ${formatRelativeTime(proposal.startTime)}`;
	});

	const borderColor = $derived.by(() => {
		if (proposal.status === 'active') return 'border-l-blue-500';
		if (proposal.status === 'draft') return 'border-l-yellow-400';
		return 'border-l-gray-300';
	});
</script>

<a
	href={resolve(`/proposals/${proposal.id}`)}
	class="block rounded-lg border border-gray-200 border-l-4 {borderColor} p-4 transition-shadow hover:shadow-md"
>
	<div class="flex items-start justify-between gap-2">
		<h3 class="truncate text-base font-semibold text-gray-900">{proposal.title}</h3>
		<StatusBadge status={proposal.status as 'draft' | 'active' | 'closed'} />
	</div>

	{#if proposal.body}
		<p class="mt-1.5 truncate text-sm text-gray-500">{proposal.body}</p>
	{/if}

	<p class="mt-2 text-xs text-gray-400">{timeContext}</p>
</a>
