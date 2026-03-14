// Mock the DB module to prevent opening local.db during import resolution
vi.mock('$lib/server/db', () => ({ db: null }));

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { emit, clearSubscribers } from '../events';
import type { GovernanceEvent } from '../events';
import { registerPlugin, initPlugins, clearPlugins, getRegisteredPlugins } from './registry';
import {
	votingAnalyticsPlugin,
	getProposalVoteCount,
	getCommunityStats,
	clearAnalytics
} from './voting-analytics';
import type { Plugin } from './types';

// ─── Registry tests ─────────────────────────────────────────────────────────

describe('plugin registry', () => {
	beforeEach(() => {
		clearPlugins();
		clearSubscribers();
	});

	it('registerPlugin wires handlers to event bus', async () => {
		const handler = vi.fn();
		const plugin: Plugin = {
			name: 'test-plugin',
			handlers: { 'community.created': handler }
		};

		registerPlugin(plugin);
		emit('community.created', { communityId: 'c1', createdBy: 'u1' });

		await vi.waitFor(() => expect(handler).toHaveBeenCalledTimes(1));

		const envelope = handler.mock.calls[0][0] as GovernanceEvent;
		expect(envelope.event).toBe('community.created');
		expect(envelope.data).toEqual({ communityId: 'c1', createdBy: 'u1' });
	});

	it('multiple plugins receive the same event', async () => {
		const handler1 = vi.fn();
		const handler2 = vi.fn();

		registerPlugin({ name: 'plugin-a', handlers: { 'vote.cast': handler1 } });
		registerPlugin({ name: 'plugin-b', handlers: { 'vote.cast': handler2 } });

		emit('vote.cast', { voteId: 'v1', proposalId: 'p1', userId: 'u1', choiceId: 'ch1' });

		await vi.waitFor(() => expect(handler1).toHaveBeenCalledTimes(1));
		expect(handler2).toHaveBeenCalledTimes(1);
	});

	it('handler receives correctly typed proposal.closed data', async () => {
		const handler = vi.fn();
		registerPlugin({ name: 'closed-listener', handlers: { 'proposal.closed': handler } });

		const results = {
			proposalId: 'p1',
			totalVotes: 10,
			results: [
				{ choiceId: 'ch1', label: 'Yes', votes: 7, votingPower: 7 },
				{ choiceId: 'ch2', label: 'No', votes: 3, votingPower: 3 }
			]
		};

		emit('proposal.closed', { proposalId: 'p1', communityId: 'c1', results });

		await vi.waitFor(() => expect(handler).toHaveBeenCalledTimes(1));

		const envelope = handler.mock.calls[0][0];
		expect(envelope.data.results.totalVotes).toBe(10);
		expect(envelope.data.results.results).toHaveLength(2);
	});

	it('duplicate plugin registration is skipped', async () => {
		const handler = vi.fn();
		const plugin: Plugin = {
			name: 'dupe',
			handlers: { 'community.created': handler }
		};

		registerPlugin(plugin);
		registerPlugin(plugin);

		expect(getRegisteredPlugins()).toEqual(['dupe']);

		emit('community.created', { communityId: 'c1', createdBy: 'u1' });

		await vi.waitFor(() => expect(handler).toHaveBeenCalledTimes(1));
		// Should be called once, not twice
		expect(handler).toHaveBeenCalledTimes(1);
	});

	it('clearPlugins removes all subscriptions', async () => {
		const handler = vi.fn();
		registerPlugin({ name: 'temp', handlers: { 'member.joined': handler } });

		clearPlugins();

		emit('member.joined', { communityId: 'c1', userId: 'u1' });

		await new Promise((resolve) => setTimeout(resolve, 10));
		expect(handler).not.toHaveBeenCalled();
		expect(getRegisteredPlugins()).toEqual([]);
	});

	it('getRegisteredPlugins returns names', () => {
		registerPlugin({ name: 'alpha', handlers: {} });
		registerPlugin({ name: 'beta', handlers: {} });

		expect(getRegisteredPlugins()).toEqual(['alpha', 'beta']);
	});

	it('plugin handler only called for subscribed events', async () => {
		const handler = vi.fn();
		registerPlugin({ name: 'selective', handlers: { 'vote.cast': handler } });

		emit('community.created', { communityId: 'c1', createdBy: 'u1' });

		await new Promise((resolve) => setTimeout(resolve, 10));
		expect(handler).not.toHaveBeenCalled();
	});

	it('initPlugins registers the built-in voting analytics plugin', () => {
		initPlugins();

		expect(getRegisteredPlugins()).toContain('votingAnalytics');
	});
});

// ─── Voting analytics plugin tests ──────────────────────────────────────────

describe('voting analytics plugin', () => {
	beforeEach(() => {
		clearPlugins();
		clearSubscribers();
		clearAnalytics();
	});

	it('vote.cast increments proposal vote count', async () => {
		registerPlugin(votingAnalyticsPlugin);

		emit('vote.cast', { voteId: 'v1', proposalId: 'p1', userId: 'u1', choiceId: 'ch1' });
		await vi.waitFor(() => expect(getProposalVoteCount('p1')).toBe(1));

		emit('vote.cast', { voteId: 'v2', proposalId: 'p1', userId: 'u2', choiceId: 'ch1' });
		await vi.waitFor(() => expect(getProposalVoteCount('p1')).toBe(2));
	});

	it('tracks different proposals independently', async () => {
		registerPlugin(votingAnalyticsPlugin);

		emit('vote.cast', { voteId: 'v1', proposalId: 'p1', userId: 'u1', choiceId: 'ch1' });
		emit('vote.cast', { voteId: 'v2', proposalId: 'p2', userId: 'u2', choiceId: 'ch2' });
		emit('vote.cast', { voteId: 'v3', proposalId: 'p1', userId: 'u3', choiceId: 'ch1' });

		await vi.waitFor(() => expect(getProposalVoteCount('p1')).toBe(2));
		expect(getProposalVoteCount('p2')).toBe(1);
	});

	it('proposal.closed updates community stats', async () => {
		registerPlugin(votingAnalyticsPlugin);

		emit('proposal.closed', {
			proposalId: 'p1',
			communityId: 'c1',
			results: {
				proposalId: 'p1',
				totalVotes: 5,
				results: [{ choiceId: 'ch1', label: 'Yes', votes: 5, votingPower: 5 }]
			}
		});

		await vi.waitFor(() => {
			const stats = getCommunityStats('c1');
			expect(stats).not.toBeNull();
		});

		const stats = getCommunityStats('c1')!;
		expect(stats.totalProposalsClosed).toBe(1);
		expect(stats.totalVotesCast).toBe(5);
		expect(stats.averageVotesPerProposal).toBe(5);
	});

	it('accumulates stats across multiple proposals', async () => {
		registerPlugin(votingAnalyticsPlugin);

		emit('proposal.closed', {
			proposalId: 'p1',
			communityId: 'c1',
			results: {
				proposalId: 'p1',
				totalVotes: 5,
				results: [{ choiceId: 'ch1', label: 'Yes', votes: 5, votingPower: 5 }]
			}
		});

		await vi.waitFor(() => expect(getCommunityStats('c1')).not.toBeNull());

		emit('proposal.closed', {
			proposalId: 'p2',
			communityId: 'c1',
			results: {
				proposalId: 'p2',
				totalVotes: 3,
				results: [{ choiceId: 'ch1', label: 'Yes', votes: 3, votingPower: 3 }]
			}
		});

		await vi.waitFor(() => {
			const stats = getCommunityStats('c1')!;
			expect(stats.totalProposalsClosed).toBe(2);
		});

		const stats = getCommunityStats('c1')!;
		expect(stats.totalVotesCast).toBe(8);
		expect(stats.averageVotesPerProposal).toBe(4);
	});

	it('getCommunityStats returns null for unknown community', () => {
		expect(getCommunityStats('nonexistent')).toBeNull();
	});

	it('getProposalVoteCount returns 0 for untracked proposal', () => {
		expect(getProposalVoteCount('nonexistent')).toBe(0);
	});

	it('clearAnalytics resets all data', async () => {
		registerPlugin(votingAnalyticsPlugin);

		emit('vote.cast', { voteId: 'v1', proposalId: 'p1', userId: 'u1', choiceId: 'ch1' });
		await vi.waitFor(() => expect(getProposalVoteCount('p1')).toBe(1));

		clearAnalytics();

		expect(getProposalVoteCount('p1')).toBe(0);
		expect(getCommunityStats('c1')).toBeNull();
	});
});
