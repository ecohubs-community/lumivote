<script lang="ts">
	type Props = {
		status: 'draft' | 'active' | 'closed';
	};

	let { status }: Props = $props();

	const classes: Record<string, string> = {
		draft: 'bg-yellow-100 text-yellow-800',
		active: 'bg-blue-100 text-blue-800',
		closed: 'bg-gray-100 text-gray-600'
	};
</script>

<span class="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium {classes[status]}">
	{status}
</span>
