import type { EventHandler } from '../events';
import type { Plugin } from './types';

// ─── In-memory analytics state ─────────────────────────────────────────────

/** Live vote count per proposal */
const proposalVoteCounts = new Map<string, number>();

/** Aggregate stats per community */
export interface CommunityStats {
	totalProposalsClosed: number;
	totalVotesCast: number;
	averageVotesPerProposal: number;
}

const communityStats = new Map<string, CommunityStats>();

// ─── Event handlers ─────────────────────────────────────────────────────────

const handleVoteCast: EventHandler<'vote.cast'> = (event) => {
	const { proposalId } = event.data;
	const current = proposalVoteCounts.get(proposalId) ?? 0;
	proposalVoteCounts.set(proposalId, current + 1);
};

const handleProposalClosed: EventHandler<'proposal.closed'> = (event) => {
	const { communityId, results } = event.data;

	const existing = communityStats.get(communityId) ?? {
		totalProposalsClosed: 0,
		totalVotesCast: 0,
		averageVotesPerProposal: 0
	};

	const newClosed = existing.totalProposalsClosed + 1;
	const newVotes = existing.totalVotesCast + results.totalVotes;

	communityStats.set(communityId, {
		totalProposalsClosed: newClosed,
		totalVotesCast: newVotes,
		averageVotesPerProposal: newVotes / newClosed
	});
};

// ─── Query functions ────────────────────────────────────────────────────────

/** Get the live vote count for a proposal. Returns 0 if not tracked. */
export function getProposalVoteCount(proposalId: string): number {
	return proposalVoteCounts.get(proposalId) ?? 0;
}

/** Get aggregate community stats. Returns null if no data. */
export function getCommunityStats(communityId: string): CommunityStats | null {
	return communityStats.get(communityId) ?? null;
}

/** Clear all analytics data. Test utility. */
export function clearAnalytics(): void {
	proposalVoteCounts.clear();
	communityStats.clear();
}

// ─── Plugin export ──────────────────────────────────────────────────────────

export const votingAnalyticsPlugin: Plugin = {
	name: 'votingAnalytics',
	handlers: {
		'vote.cast': handleVoteCast,
		'proposal.closed': handleProposalClosed
	}
};
