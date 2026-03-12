<script lang="ts">
	import { authClient } from '$lib/auth-client';

	let email = $state('');
	let password = $state('');
	let error = $state('');
	let loading = $state(false);
	let walletLoading = $state(false);
	let hasWallet = $state(false);

	$effect(() => {
		hasWallet = typeof window !== 'undefined' && !!window.ethereum;
	});

	const handleEmailLogin = async (e: SubmitEvent) => {
		e.preventDefault();
		error = '';
		loading = true;

		try {
			const result = await authClient.signIn.email({ email, password });

			if (result.error) {
				error = result.error.message ?? 'Sign in failed. Please check your credentials.';
			} else {
				window.location.href = '/';
			}
		} catch (err) {
			error = 'An unexpected error occurred. Please try again.';
		} finally {
			loading = false;
		}
	};

	const handleWalletConnect = async () => {
		if (!window.ethereum) {
			error = 'No Ethereum wallet detected. Please install MetaMask.';
			return;
		}

		error = '';
		walletLoading = true;

		try {
			// 1. Request account access
			const accounts = (await window.ethereum.request({
				method: 'eth_requestAccounts'
			})) as string[];

			if (!accounts || accounts.length === 0) {
				error = 'No accounts returned from wallet.';
				return;
			}

			const address = accounts[0];

			// 2. Get chain ID
			const chainIdHex = (await window.ethereum.request({
				method: 'eth_chainId'
			})) as string;
			const chainId = parseInt(chainIdHex, 16);

			// 3. Get nonce from server
			const nonceResult = await authClient.siwe.nonce({
				walletAddress: address,
				chainId
			});

			if (nonceResult.error || !nonceResult.data) {
				error = 'Failed to get authentication nonce.';
				return;
			}

			const nonce = nonceResult.data.nonce;

			// 4. Construct EIP-4361 SIWE message
			const domain = window.location.host;
			const origin = window.location.origin;
			const issuedAt = new Date().toISOString();

			const message = [
				`${domain} wants you to sign in with your Ethereum account:`,
				address,
				'',
				'Sign in to LumiVote',
				'',
				`URI: ${origin}`,
				`Version: 1`,
				`Chain ID: ${chainId}`,
				`Nonce: ${nonce}`,
				`Issued At: ${issuedAt}`
			].join('\n');

			// 5. Request signature
			const signature = (await window.ethereum.request({
				method: 'personal_sign',
				params: [message, address]
			})) as string;

			// 6. Verify with server
			const verifyResult = await authClient.siwe.verify({
				message,
				signature,
				walletAddress: address,
				chainId
			});

			if (verifyResult.error) {
				error = verifyResult.error.message ?? 'Wallet verification failed.';
			} else {
				window.location.href = '/';
			}
		} catch (err: unknown) {
			if (err && typeof err === 'object' && 'code' in err && (err as { code: number }).code === 4001) {
				error = 'Wallet connection was rejected.';
			} else {
				error = 'Wallet authentication failed. Please try again.';
			}
		} finally {
			walletLoading = false;
		}
	};
</script>

<svelte:head>
	<title>Sign in — LumiVote</title>
</svelte:head>

<div class="mx-auto mt-12 max-w-md">
	<h1 class="mb-8 text-center text-2xl font-bold text-gray-900">Sign in to LumiVote</h1>

	{#if error}
		<div class="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-700" role="alert">
			{error}
		</div>
	{/if}

	<!-- Wallet Connect -->
	{#if hasWallet}
		<button
			onclick={handleWalletConnect}
			disabled={walletLoading}
			class="mb-6 flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
		>
			{#if walletLoading}
				<span class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></span>
				Connecting wallet...
			{:else}
				<svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<rect x="2" y="6" width="20" height="14" rx="2" />
					<path d="M16 14h.01" />
					<path d="M2 10h20" />
				</svg>
				Connect wallet
			{/if}
		</button>

		<div class="relative mb-6">
			<div class="absolute inset-0 flex items-center">
				<div class="w-full border-t border-gray-300"></div>
			</div>
			<div class="relative flex justify-center text-sm">
				<span class="bg-white px-2 text-gray-500">or sign in with email</span>
			</div>
		</div>
	{/if}

	<!-- Email/Password Form -->
	<form onsubmit={handleEmailLogin} class="space-y-4">
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
				autocomplete="current-password"
				class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
				placeholder="Your password"
			/>
		</div>

		<button
			type="submit"
			disabled={loading}
			class="w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
		>
			{#if loading}
				Signing in...
			{:else}
				Sign in
			{/if}
		</button>
	</form>

	<p class="mt-6 text-center text-sm text-gray-500">
		Don't have an account?
		<a href="/register" class="font-medium text-blue-600 hover:text-blue-500">Register</a>
	</p>
</div>
