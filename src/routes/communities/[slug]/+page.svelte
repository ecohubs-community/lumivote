<script lang="ts">
	import { enhance } from '$app/forms';
	import ProposalCard from '$lib/components/ProposalCard.svelte';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let showInviteForm = $state(false);
	let copied = $state(false);

	const statuses = [
		{ label: 'All', value: null },
		{ label: 'Active', value: 'active' },
		{ label: 'Draft', value: 'draft' },
		{ label: 'Closed', value: 'closed' }
	] as const;

	// Default expiration: 7 days from now
	const defaultExpiry = $derived.by(() => {
		const d = new Date();
		d.setDate(d.getDate() + 7);
		// Format for datetime-local: YYYY-MM-DDTHH:mm
		return d.toISOString().slice(0, 16);
	});

	async function copyInviteUrl() {
		if (form?.inviteUrl) {
			await navigator.clipboard.writeText(form.inviteUrl);
			copied = true;
			setTimeout(() => (copied = false), 2000);
		}
	}
</script>

<svelte:head>
	<title>{data.community.name} — LumiVote</title>
</svelte:head>

<!-- Header -->
<section class="border-b border-gray-200 pb-6">
	<div class="flex items-start justify-between gap-4">
		<div>
			<h1 class="text-3xl font-bold text-gray-900">{data.community.name}</h1>
			{#if data.community.description}
				<p class="mt-2 text-gray-600">{data.community.description}</p>
			{/if}
		</div>

		<div class="flex items-center gap-3">
			{#if data.membership}
				<span class="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
					{data.membership.role === 'admin' ? 'Admin' : 'Member'}
				</span>
				{#if data.membership.role === 'admin'}
					<button
						onclick={() => (showInviteForm = !showInviteForm)}
						class="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
					>
						Invite Members
					</button>
				{/if}
				<a
					href="/communities/{data.community.slug}/create-proposal"
					class="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
				>
					Create Proposal
				</a>
			{/if}
		</div>
	</div>
</section>

<!-- Invite form (admin only) -->
{#if showInviteForm && data.membership?.role === 'admin'}
	<section class="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
		<h3 class="text-sm font-semibold text-gray-900">Generate Invite Link</h3>

		{#if form?.inviteError}
			<div
				class="mt-3 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
			>
				{form.inviteError}
			</div>
		{/if}

		{#if form?.inviteUrl}
			<div class="mt-3">
				<p class="text-sm text-green-700">Invite link generated:</p>
				<div class="mt-1 flex items-center gap-2">
					<input
						type="text"
						readonly
						value={form.inviteUrl}
						class="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700"
					/>
					<button
						onclick={copyInviteUrl}
						class="shrink-0 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
					>
						{copied ? 'Copied!' : 'Copy'}
					</button>
				</div>
			</div>
		{/if}

		<form
			method="POST"
			action="?/invite"
			use:enhance
			class="mt-3 flex flex-wrap items-end gap-4"
		>
			<div>
				<label for="maxUses" class="block text-xs font-medium text-gray-600">
					Max uses
					<span class="font-normal text-gray-400">(optional)</span>
				</label>
				<input
					type="number"
					id="maxUses"
					name="maxUses"
					min="1"
					placeholder="Unlimited"
					class="mt-1 block w-28 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
				/>
			</div>

			<div>
				<label for="expiresAt" class="block text-xs font-medium text-gray-600">Expires at</label>
				<input
					type="datetime-local"
					id="expiresAt"
					name="expiresAt"
					required
					value={defaultExpiry}
					class="mt-1 block rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
				/>
			</div>

			<button
				type="submit"
				class="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
			>
				Generate Link
			</button>
		</form>
	</section>
{/if}

<!-- Status filter tabs -->
<div class="mt-6 flex gap-2">
	{#each statuses as { label, value }}
		{@const isActive = data.statusFilter === value}
		<a
			href="/communities/{data.community.slug}{value ? `?status=${value}` : ''}"
			class="rounded-md px-3 py-1.5 text-sm font-medium {isActive
				? 'bg-blue-600 text-white'
				: 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
		>
			{label}
		</a>
	{/each}
</div>

<!-- Proposals list -->
<section class="mt-6">
	{#if data.proposals.items.length > 0}
		<div class="space-y-3">
			{#each data.proposals.items as proposal}
				<ProposalCard
					proposal={{
						id: proposal.id,
						title: proposal.title,
						status: proposal.status,
						startTime: proposal.startTime,
						endTime: proposal.endTime
					}}
				/>
			{/each}
		</div>

		{#if data.proposals.nextCursor}
			<div class="mt-6 text-center">
				<a
					href="/communities/{data.community.slug}?cursor={data.proposals
						.nextCursor}{data.statusFilter ? `&status=${data.statusFilter}` : ''}"
					class="text-sm font-medium text-blue-600 hover:text-blue-800"
				>
					Load more
				</a>
			</div>
		{/if}
	{:else}
		<div class="py-12 text-center">
			<p class="text-gray-500">No proposals yet.</p>
			{#if data.membership}
				<a
					href="/communities/{data.community.slug}/create-proposal"
					class="mt-2 inline-block text-sm font-medium text-blue-600 hover:text-blue-800"
				>
					Create the first proposal
				</a>
			{/if}
		</div>
	{/if}
</section>
