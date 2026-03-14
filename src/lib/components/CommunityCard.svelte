<script lang="ts">
	import { formatRelativeTime } from '$lib/utils/format';

	type Props = {
		community: {
			name: string;
			slug: string;
			description: string;
			memberCount: number;
			voteCount: number;
			createdAt: Date;
		};
	};

	let { community }: Props = $props();
</script>

<a
	href="/communities/{community.slug}"
	class="block rounded-lg border border-gray-200 p-5 transition-shadow hover:shadow-md"
>
	<h3 class="truncate text-lg font-bold text-gray-900">{community.name}</h3>

	{#if community.description}
		<p class="mt-1.5 line-clamp-2 text-sm text-gray-600">
			{community.description}
		</p>
	{/if}

	<div class="mt-3 flex flex-wrap items-center gap-4 text-xs text-gray-500">
		<span class="inline-flex items-center gap-1">
			<svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
			</svg>
			{community.memberCount} {community.memberCount === 1 ? 'member' : 'members'}
		</span>
		<span class="inline-flex items-center gap-1">
			<svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
			</svg>
			{community.voteCount} {community.voteCount === 1 ? 'vote' : 'votes'}
		</span>
		<span class="text-gray-400">Created {formatRelativeTime(community.createdAt)}</span>
	</div>
</a>
