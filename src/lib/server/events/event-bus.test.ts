// Mock the DB module to prevent opening local.db during import resolution
vi.mock('$lib/server/db', () => ({ db: null }));

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { emit, subscribe, clearSubscribers } from './event-bus';
import type { GovernanceEvent } from './types';

describe('event-bus', () => {
	beforeEach(() => {
		clearSubscribers();
	});

	it('calls subscribed handler with correct envelope', async () => {
		expect.assertions(4);

		const handler = vi.fn();
		subscribe('community.created', handler);

		emit('community.created', { communityId: 'c1', createdBy: 'u1' });

		// Give the Promise.allSettled a tick to complete
		await vi.waitFor(() => expect(handler).toHaveBeenCalledTimes(1));

		const envelope = handler.mock.calls[0][0] as GovernanceEvent;
		expect(envelope.event).toBe('community.created');
		expect(envelope.data).toEqual({ communityId: 'c1', createdBy: 'u1' });
		expect(typeof envelope.timestamp).toBe('string');
	});

	it('calls multiple handlers for the same event', async () => {
		expect.assertions(2);

		const handler1 = vi.fn();
		const handler2 = vi.fn();

		subscribe('member.joined', handler1);
		subscribe('member.joined', handler2);

		emit('member.joined', { communityId: 'c1', userId: 'u1' });

		await vi.waitFor(() => expect(handler1).toHaveBeenCalledTimes(1));
		expect(handler2).toHaveBeenCalledTimes(1);
	});

	it('does not call handlers for different event types', async () => {
		expect.assertions(2);

		const communityHandler = vi.fn();
		const memberHandler = vi.fn();

		subscribe('community.created', communityHandler);
		subscribe('member.joined', memberHandler);

		emit('community.created', { communityId: 'c1', createdBy: 'u1' });

		await vi.waitFor(() => expect(communityHandler).toHaveBeenCalledTimes(1));
		expect(memberHandler).not.toHaveBeenCalled();
	});

	it('catches synchronous handler errors without throwing', async () => {
		expect.assertions(2);

		const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

		const badHandler = () => {
			throw new Error('handler boom');
		};
		const goodHandler = vi.fn();

		subscribe('vote.cast', badHandler);
		subscribe('vote.cast', goodHandler);

		// Should not throw
		emit('vote.cast', {
			voteId: 'v1',
			proposalId: 'p1',
			userId: 'u1',
			choiceId: 'ch1'
		});

		await vi.waitFor(() => expect(goodHandler).toHaveBeenCalledTimes(1));
		expect(errorSpy).toHaveBeenCalled();

		errorSpy.mockRestore();
	});

	it('catches async handler rejections without throwing', async () => {
		expect.hasAssertions();

		const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

		const badHandler = async () => {
			throw new Error('async handler boom');
		};
		const goodHandler = vi.fn();

		subscribe('proposal.created', badHandler);
		subscribe('proposal.created', goodHandler);

		emit('proposal.created', {
			proposalId: 'p1',
			communityId: 'c1',
			createdBy: 'u1'
		});

		await vi.waitFor(() => expect(goodHandler).toHaveBeenCalledTimes(1));
		// The async rejection is logged
		await vi.waitFor(() => expect(errorSpy).toHaveBeenCalled());

		errorSpy.mockRestore();
	});

	it('unsubscribe function removes the handler', async () => {
		expect.assertions(1);

		const handler = vi.fn();
		const unsub = subscribe('community.created', handler);

		unsub();

		emit('community.created', { communityId: 'c1', createdBy: 'u1' });

		// Allow any pending promises to resolve
		await new Promise((resolve) => setTimeout(resolve, 10));
		expect(handler).not.toHaveBeenCalled();
	});

	it('clearSubscribers removes all handlers', async () => {
		expect.assertions(2);

		const handler1 = vi.fn();
		const handler2 = vi.fn();

		subscribe('community.created', handler1);
		subscribe('member.joined', handler2);

		clearSubscribers();

		emit('community.created', { communityId: 'c1', createdBy: 'u1' });
		emit('member.joined', { communityId: 'c1', userId: 'u1' });

		// Allow any pending promises to resolve
		await new Promise((resolve) => setTimeout(resolve, 10));
		expect(handler1).not.toHaveBeenCalled();
		expect(handler2).not.toHaveBeenCalled();
	});

	it('emit with no subscribers does nothing (no error)', () => {
		expect.assertions(1);

		// Should not throw
		emit('proposal.started', { proposalId: 'p1', communityId: 'c1' });
		expect(true).toBe(true);
	});

	it('proposal.closed event includes results in data', async () => {
		expect.assertions(3);

		const handler = vi.fn();
		subscribe('proposal.closed', handler);

		const results = {
			proposalId: 'p1',
			totalVotes: 5,
			results: [
				{ choiceId: 'ch1', label: 'Yes', votes: 3, votingPower: 3 },
				{ choiceId: 'ch2', label: 'No', votes: 2, votingPower: 2 }
			]
		};

		emit('proposal.closed', {
			proposalId: 'p1',
			communityId: 'c1',
			results
		});

		await vi.waitFor(() => expect(handler).toHaveBeenCalledTimes(1));

		const envelope = handler.mock.calls[0][0];
		expect(envelope.data.results.totalVotes).toBe(5);
		expect(envelope.data.results.results).toHaveLength(2);
	});
});
