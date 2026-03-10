# Community Governance Platform — REST API Specification

## 1. Purpose of This Document

This document defines the **REST API for the Community Governance Platform MVP**.

It specifies:

- API endpoints
- request formats
- response formats
- authentication rules
- error handling
- pagination conventions
- event/webhook interactions

This specification is intended for **developers and AI coding agents** implementing the backend and frontend.

The API is designed to follow these principles:

- **RESTful structure**
- **predictable response schemas**
- **clear authentication requirements**
- **simple integration with frontend and external systems**

---

# 2. Base API Configuration

### Base URL

Example:
https://your-domain.com/api

---

### Content Type

All requests and responses must use:
Content-Type: application/json

---

### Response Structure

All responses must follow this structure.

### Success

{
“success”: true,
“data”: { … }
}

---

### Error

{
“success”: false,
“error”: {
“code”: “ERROR_CODE”,
“message”: “Human readable description”
}
}

---

# 3. Authentication

Authentication uses **wallet-based login**.

Authentication flow:

1. client requests nonce
2. wallet signs message
3. signature verified
4. session created

Authenticated endpoints require a **session cookie**.

Header example:

Cookie: session_id=…

Authentication specification is detailed in **06_auth_identity.md**.

---

# 4. Pagination

Endpoints returning lists must support pagination.

### Query Parameters

?limit=20
?cursor=abcdef

---

### Response Example

{
“success”: true,
“data”: {
“items”: […],
“next_cursor”: “abcdef”
}
}

---

# 5. Users

## GET /api/me

Returns current authenticated user.

### Authentication

Required.

### Response

{
“success”: true,
“data”: {
“id”: “uuid”,
“wallet_address”: “0x123…”
}
}

---

# 6. Communities

## POST /api/communities

Creates a new community.

### Authentication

Required.

### Request

{
“name”: “Eco Village Governance”,
“slug”: “eco-village”,
“description”: “Governance for our community”,
“visibility”: “community”
}

### Response

{
“success”: true,
“data”: {
“id”: “uuid”,
“name”: “Eco Village Governance”,
“slug”: “eco-village”
}
}

---

## GET /api/communities

Returns list of communities.

### Response

{
“success”: true,
“data”: {
“items”: [
{
“id”: “uuid”,
“name”: “Eco Village Governance”,
“slug”: “eco-village”
}
]
}
}

---

## GET /api/communities/:slug

Returns community details.

### Response

{
“success”: true,
“data”: {
“id”: “uuid”,
“name”: “Eco Village Governance”,
“slug”: “eco-village”,
“description”: “…”,
“visibility”: “community”
}
}

---

# 7. Community Membership

## GET /api/communities/:id/members

Returns community members.

### Authentication

Required for community visibility.

### Response

{
“success”: true,
“data”: {
“items”: [
{
“user_id”: “uuid”,
“role”: “member”
}
]
}
}

---

## POST /api/communities/:id/members

Adds a member.

Used by:

- API integration
- community admins

### Authentication

Admin required.

### Request

{
“user_id”: “uuid”,
“role”: “member”
}

### Response

{
“success”: true
}

---

# 8. Invite Links

## POST /api/communities/:id/invites

Creates invite link.

### Authentication

Admin required.

### Response

{
“success”: true,
“data”: {
“invite_url”: “https://app/join/abcdef”
}
}

---

## POST /api/join/:token

Join community using invite.

### Authentication

Required.

### Response

{
“success”: true
}

---

# 9. Proposals

## POST /api/proposals

Create a proposal.

### Authentication

Community member required.

### Request

{
“community_id”: “uuid”,
“title”: “Install Solar Panels”,
“body”: “Proposal to install solar panels”,
“choices”: [
“Yes”,
“No”
],
“start_time”: “2026-03-01T00:00:00Z”,
“end_time”: “2026-03-07T00:00:00Z”,
“visibility”: “community”,
“strategy_id”: “onePersonOneVote”
}

### Response

{
“success”: true,
“data”: {
“proposal_id”: “uuid”
}
}

---

## GET /api/communities/:id/proposals

Returns proposals for community.

### Query Parameters

status=active|closed

### Response

{
“success”: true,
“data”: {
“items”: [
{
“id”: “uuid”,
“title”: “Install Solar Panels”,
“status”: “active”,
“start_time”: “…”,
“end_time”: “…”
}
]
}
}

---

## GET /api/proposals/:id

Returns full proposal details.

### Response

{
“success”: true,
“data”: {
“id”: “uuid”,
“title”: “Install Solar Panels”,
“body”: “…”,
“status”: “active”,
“choices”: [
{
“id”: “uuid”,
“label”: “Yes”
},
{
“id”: “uuid”,
“label”: “No”
}
]
}
}

---

# 10. Voting

## POST /api/votes

Cast vote.

### Authentication

Required.

### Request

{
“proposal_id”: “uuid”,
“choice_id”: “uuid”,
“signature”: “wallet_signature”
}

### Behavior

Server must:

1. verify proposal is active
2. verify membership
3. verify signature
4. ensure user has not already voted

---

### Response

{
“success”: true
}

---

# 11. Proposal Results

## GET /api/proposals/:id/results

Returns voting results.

### Response

{
“success”: true,
“data”: {
“proposal_id”: “uuid”,
“total_votes”: 42,
“results”: [
{
“choice_id”: “uuid”,
“label”: “Yes”,
“votes”: 30
},
{
“choice_id”: “uuid”,
“label”: “No”,
“votes”: 12
}
]
}
}

---

# 12. Webhooks

## POST /api/communities/:id/webhooks

Register webhook.

### Authentication

Admin required.

### Request

{
“url”: “https://example.com/webhook”,
“events”: [
“proposal.created”,
“vote.cast”,
“proposal.closed”
]
}

### Response

{
“success”: true
}

---

## GET /api/communities/:id/webhooks

List community webhooks.

### Response

{
“success”: true,
“data”: {
“items”: [
{
“id”: “uuid”,
“url”: “https://example.com/webhook”
}
]
}
}

---

# 13. Event Streaming (Future)

Future versions may include:

GET /api/events

This endpoint would allow:

- real-time governance monitoring
- dashboards
- analytics

Not required for MVP.

---

# 14. Error Codes

Common error codes:

- UNAUTHORIZED
- FORBIDDEN
- NOT_FOUND
- INVALID_REQUEST
- ALREADY_VOTED
- PROPOSAL_NOT_ACTIVE
- MEMBERSHIP_REQUIRED

Example:

{
“success”: false,
“error”: {
“code”: “ALREADY_VOTED”,
“message”: “User has already voted on this proposal”
}
}

---

# 15. Rate Limiting

Basic rate limiting should apply.

Suggested limits:

60 requests per minute per IP

Stricter limits for:

- vote casting
- proposal creation

---

# 16. Future API Extensions

Future endpoints may include:

/groups
/delegations
/comments
/analytics

The current API design leaves room for these features without breaking existing endpoints.

---

End of document.