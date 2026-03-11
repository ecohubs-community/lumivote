import { eq, and } from 'drizzle-orm';
import { db as defaultDb } from '$lib/server/db';
import { proposal, proposalChoice, vote } from '$lib/server/db/schema';
import { ServiceError, ErrorCode } from './errors';
import { emit } from '../events';
import { requireMember } from './membership-service';
import { transitionProposalStatus } from './proposal-service';
import type { Database } from './types';

// ─── Input types ─────────────────────────────────────────────────────────────

export interface CastVoteInput {
	proposalId: string;
	choiceId: string;
	signature?: string;
}

// ─── Service functions ───────────────────────────────────────────────────────

/**
 * Cast a vote on an active proposal.
 *
 * Validates:
 * - proposal exists and is active
 * - user is a member of the proposal's community
 * - choiceId belongs to this proposal
 * - user has not already voted
 */
export async function castVote(
	userId: string,
	input: CastVoteInput,
	db: Database = defaultDb
) {
	// Fetch proposal
	const [found] = await db
		.select()
		.from(proposal)
		.where(eq(proposal.id, input.proposalId))
		.limit(1);

	if (!found) {
		throw new ServiceError(ErrorCode.NOT_FOUND, 'Proposal not found');
	}

	// Transition status to ensure it's current
	const current = await transitionProposalStatus(found, db);

	if (current.status !== 'active') {
		throw new ServiceError(
			ErrorCode.PROPOSAL_NOT_ACTIVE,
			current.status === 'draft'
				? 'Voting has not started yet'
				: 'Voting has ended'
		);
	}

	// Verify user is a community member
	await requireMember(current.communityId, userId, db);

	// Verify choice belongs to this proposal
	const [choice] = await db
		.select({ id: proposalChoice.id })
		.from(proposalChoice)
		.where(
			and(
				eq(proposalChoice.id, input.choiceId),
				eq(proposalChoice.proposalId, input.proposalId)
			)
		)
		.limit(1);

	if (!choice) {
		throw new ServiceError(
			ErrorCode.INVALID_REQUEST,
			'Choice does not belong to this proposal'
		);
	}

	// Check user hasn't already voted
	const [existingVote] = await db
		.select({ id: vote.id })
		.from(vote)
		.where(
			and(eq(vote.proposalId, input.proposalId), eq(vote.userId, userId))
		)
		.limit(1);

	if (existingVote) {
		throw new ServiceError(
			ErrorCode.ALREADY_VOTED,
			'You have already voted on this proposal'
		);
	}

	// Determine voting power (1 for onePersonOneVote)
	const votingPower = 1;

	const [created] = await db
		.insert(vote)
		.values({
			proposalId: input.proposalId,
			userId,
			choiceId: input.choiceId,
			votingPower,
			signature: input.signature ?? null
		})
		.returning();

	emit('vote.cast', {
		voteId: created.id,
		proposalId: input.proposalId,
		userId,
		choiceId: input.choiceId
	});

	return created;
}
