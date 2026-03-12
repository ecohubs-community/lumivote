<script lang="ts">
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
	class="block rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md"
>
	<h3 class="truncate text-lg font-semibold text-gray-900">{community.name}</h3>

	{#if community.description}
		<p class="mt-1 line-clamp-2 text-sm text-gray-600">
			{community.description}
		</p>
	{/if}

	<div class="mt-3 flex items-center gap-4 text-xs text-gray-500">
		<span>{community.memberCount} {community.memberCount === 1 ? 'member' : 'members'}</span>
		<span>{community.voteCount} {community.voteCount === 1 ? 'vote' : 'votes'}</span>
	</div>
</a>
