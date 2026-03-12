<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let choices = $state<string[]>(['', '']);

	$effect(() => {
		if (form?.choices?.length) {
			choices = [...form.choices];
		}
	});

	function addChoice() {
		if (choices.length < 20) {
			choices = [...choices, ''];
		}
	}

	function removeChoice(index: number) {
		if (choices.length > 2) {
			choices = choices.filter((_, i) => i !== index);
		}
	}
</script>

<svelte:head>
	<title>Create Proposal — {data.community.name} — LumiVote</title>
</svelte:head>

<div class="mb-6">
	<a
		href="/communities/{data.community.slug}"
		class="text-sm text-blue-600 hover:text-blue-800"
	>
		&larr; Back to {data.community.name}
	</a>
</div>

<h1 class="text-3xl font-bold text-gray-900">Create Proposal</h1>
<p class="mt-1 text-sm text-gray-600">For {data.community.name}</p>

{#if form?.error}
	<div class="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
		{form.error}
	</div>
{/if}

<form method="POST" use:enhance class="mt-6 space-y-6">
	<!-- Title -->
	<div>
		<label for="title" class="block text-sm font-medium text-gray-700">Title</label>
		<input
			type="text"
			id="title"
			name="title"
			required
			maxlength="200"
			value={form?.title ?? ''}
			class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
			placeholder="What should the community decide?"
		/>
	</div>

	<!-- Description -->
	<div>
		<label for="body" class="block text-sm font-medium text-gray-700">Description</label>
		<textarea
			id="body"
			name="body"
			required
			rows="6"
			class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
			placeholder="Provide context and details about this proposal..."
		>{form?.body ?? ''}</textarea>
	</div>

	<!-- Choices -->
	<div>
		<span class="block text-sm font-medium text-gray-700">Choices (min 2, max 20)</span>
		<div class="mt-2 space-y-2">
			{#each choices as choice, i}
				<div class="flex items-center gap-2">
					<input
						type="text"
						name="choices"
						required
						maxlength="200"
						bind:value={choices[i]}
						class="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
						placeholder="Choice {i + 1}"
					/>
					{#if choices.length > 2}
						<button
							type="button"
							onclick={() => removeChoice(i)}
							class="shrink-0 rounded-md px-2 py-2 text-sm text-red-600 hover:bg-red-50"
						>
							Remove
						</button>
					{/if}
				</div>
			{/each}
		</div>
		{#if choices.length < 20}
			<button
				type="button"
				onclick={addChoice}
				class="mt-2 text-sm font-medium text-blue-600 hover:text-blue-800"
			>
				+ Add choice
			</button>
		{/if}
	</div>

	<!-- Times -->
	<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
		<div>
			<label for="startTime" class="block text-sm font-medium text-gray-700">Start time</label>
			<input
				type="datetime-local"
				id="startTime"
				name="startTime"
				required
				value={form?.startTime ?? ''}
				class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
			/>
		</div>
		<div>
			<label for="endTime" class="block text-sm font-medium text-gray-700">End time</label>
			<input
				type="datetime-local"
				id="endTime"
				name="endTime"
				required
				value={form?.endTime ?? ''}
				class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
			/>
		</div>
	</div>

	<!-- Submit -->
	<div class="border-t border-gray-200 pt-6">
		<button
			type="submit"
			class="rounded-md bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
		>
			Create Proposal
		</button>
	</div>
</form>
