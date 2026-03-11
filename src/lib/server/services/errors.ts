/**
 * Service layer error codes.
 * Maps to the error codes defined in specs/04_api_spec.md.
 */
export const ErrorCode = {
	UNAUTHORIZED: 'UNAUTHORIZED',
	FORBIDDEN: 'FORBIDDEN',
	NOT_FOUND: 'NOT_FOUND',
	INVALID_REQUEST: 'INVALID_REQUEST',
	ALREADY_VOTED: 'ALREADY_VOTED',
	PROPOSAL_NOT_ACTIVE: 'PROPOSAL_NOT_ACTIVE',
	PROPOSAL_NOT_EDITABLE: 'PROPOSAL_NOT_EDITABLE',
	MEMBERSHIP_REQUIRED: 'MEMBERSHIP_REQUIRED',
	COMMUNITY_LIMIT_REACHED: 'COMMUNITY_LIMIT_REACHED',
	INVALID_CHOICES: 'INVALID_CHOICES',
	ALREADY_MEMBER: 'ALREADY_MEMBER',
	INVITE_EXPIRED: 'INVITE_EXPIRED',
	INVITE_EXHAUSTED: 'INVITE_EXHAUSTED',
	SOLE_ADMIN: 'SOLE_ADMIN'
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

/** Map error codes to their default HTTP status codes. */
const STATUS_MAP: Partial<Record<ErrorCode, number>> = {
	[ErrorCode.UNAUTHORIZED]: 401,
	[ErrorCode.FORBIDDEN]: 403,
	[ErrorCode.NOT_FOUND]: 404,
	[ErrorCode.SOLE_ADMIN]: 409
};

/**
 * Typed error thrown by service layer functions.
 *
 * API routes catch these and convert to the standard
 * `{ success: false, error: { code, message } }` response format.
 */
export class ServiceError extends Error {
	public readonly code: ErrorCode;
	public readonly statusCode: number;

	constructor(code: ErrorCode, message: string, statusCode?: number) {
		super(message);
		this.name = 'ServiceError';
		this.code = code;
		this.statusCode = statusCode ?? STATUS_MAP[code] ?? 400;
	}
}
