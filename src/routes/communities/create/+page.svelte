<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();

	let name = $state('');
	let slug = $state('');
	let slugManuallyEdited = $state(false);

	$effect(() => {
		if (form) {
			name = form.name ?? '';
			slug = form.slug ?? '';
		}
	});

	function generateSlug(value: string): string {
		return value
			.toLowerCase()
			.trim()
			.replace(/\s+/g, '-')
			.replace(/[^a-z0-9-]/g, '')
			.replace(/-+/g, '-')
			.replace(/^-|-$/g, '')
			.slice(0, 60);
	}

	function handleNameInput() {
		if (!slugManuallyEdited) {
			slug = generateSlug(name);
		}
	}

	function handleSlugInput() {
		slugManuallyEdited = true;
	}
</script>

<svelte:head>
	<title>Create Community — LumiVote</title>
</svelte:head>

<div class="mb-6">
	<a href="/" class="text-sm text-blue-600 hover:text-blue-800">&larr; Back to home</a>
</div>

<h1 class="text-3xl font-bold text-gray-900">Create Community</h1>
<p class="mt-1 text-sm text-gray-600">
	Start a new community for your group to govern together.
</p>

{#if form?.error}
	<div class="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
		{form.error}
	</div>
{/if}

<form method="POST" use:enhance class="mt-6 space-y-6">
	<!-- Name -->
	<div>
		<label for="name" class="block text-sm font-medium text-gray-700">Name</label>
		<input
			type="text"
			id="name"
			name="name"
			required
			maxlength="100"
			bind:value={name}
			oninput={handleNameInput}
			class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
			placeholder="My Community"
		/>
	</div>

	<!-- Slug -->
	<div>
		<label for="slug" class="block text-sm font-medium text-gray-700">URL Slug</label>
		<input
			type="text"
			id="slug"
			name="slug"
			required
			minlength="2"
			maxlength="60"
			pattern="[a-z0-9](?:[a-z0-9-]*[a-z0-9])?"
			bind:value={slug}
			oninput={handleSlugInput}
			class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
			placeholder="my-community"
		/>
		<p class="mt-1 text-xs text-gray-500">
			Lowercase letters, numbers, and hyphens. This will be your community's URL:
			<span class="font-medium">/communities/{slug || '...'}</span>
		</p>
	</div>

	<!-- Description -->
	<div>
		<label for="description" class="block text-sm font-medium text-gray-700">
			Description
			<span class="font-normal text-gray-400">(optional)</span>
		</label>
		<textarea
			id="description"
			name="description"
			rows="4"
			maxlength="2000"
			class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
			placeholder="What is this community about?"
		>{form?.description ?? ''}</textarea>
	</div>

	<!-- Visibility -->
	<fieldset>
		<legend class="block text-sm font-medium text-gray-700">Visibility</legend>
		<div class="mt-2 space-y-2">
			<label class="flex items-center gap-2">
				<input
					type="radio"
					name="visibility"
					value="public"
					checked={form?.visibility !== 'community'}
					class="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
				/>
				<span class="text-sm text-gray-700">Public — Anyone can discover and view this community</span>
			</label>
			<label class="flex items-center gap-2">
				<input
					type="radio"
					name="visibility"
					value="community"
					checked={form?.visibility === 'community'}
					class="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
				/>
				<span class="text-sm text-gray-700">Community only — Only members can view</span>
			</label>
		</div>
	</fieldset>

	<!-- Submit -->
	<div class="border-t border-gray-200 pt-6">
		<button
			type="submit"
			class="rounded-md bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
		>
			Create Community
		</button>
	</div>
</form>
