<script lang="ts">
	import { authClient } from '$lib/auth-client';

	let name = $state('');
	let email = $state('');
	let password = $state('');
	let error = $state('');
	let loading = $state(false);

	const handleRegister = async (e: SubmitEvent) => {
		e.preventDefault();
		error = '';

		if (password.length < 8) {
			error = 'Password must be at least 8 characters.';
			return;
		}

		loading = true;

		try {
			const result = await authClient.signUp.email({
				name,
				email,
				password
			});

			if (result.error) {
				error = result.error.message ?? 'Registration failed. Please try again.';
			} else {
				window.location.href = '/';
			}
		} catch (err) {
			error = 'An unexpected error occurred. Please try again.';
		} finally {
			loading = false;
		}
	};
</script>

<svelte:head>
	<title>Register — LumiVote</title>
</svelte:head>

<div class="mx-auto mt-12 max-w-md">
	<h1 class="mb-8 text-center text-2xl font-bold text-gray-900">Create your account</h1>

	{#if error}
		<div class="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-700" role="alert">
			{error}
		</div>
	{/if}

	<form onsubmit={handleRegister} class="space-y-4">
		<div>
			<label for="name" class="block text-sm font-medium text-gray-700">Name</label>
			<input
				id="name"
				type="text"
				bind:value={name}
				required
				autocomplete="name"
				class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
				placeholder="Your name"
			/>
		</div>

		<div>
			<label for="email" class="block text-sm font-medium text-gray-700">Email</label>
			<input
				id="email"
				type="email"
				bind:value={email}
				required
				autocomplete="email"
				class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
				placeholder="you@example.com"
			/>
		</div>

		<div>
			<label for="password" class="block text-sm font-medium text-gray-700">Password</label>
			<input
				id="password"
				type="password"
				bind:value={password}
				required
				minlength={8}
				autocomplete="new-password"
				class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
				placeholder="At least 8 characters"
			/>
		</div>

		<button
			type="submit"
			disabled={loading}
			class="w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
		>
			{#if loading}
				Creating account...
			{:else}
				Create account
			{/if}
		</button>
	</form>

	<p class="mt-6 text-center text-sm text-gray-500">
		Already have an account?
		<a href="/login" class="font-medium text-blue-600 hover:text-blue-500">Sign in</a>
	</p>
</div>
