
# Community Governance Platform — UI / UX Design Specification

## 1. Purpose

This document defines the **user interface and user experience design** for the Community Governance Platform.

The goals are:

- extremely simple governance interface
- clarity for non-technical community members
- minimal visual noise
- fast interaction for proposal voting
- mobile-friendly experience

The UI should feel approachable for:

- intentional communities
- DAOs
- cooperatives
- local groups
- small organizations

The design philosophy prioritizes **clarity over complexity**.

---

# 2. Design Principles

The interface should follow these core principles.

## 2.1 Simplicity

Avoid complex governance dashboards.

Users should immediately understand:

- what proposals exist
- which ones need their vote
- the current outcome


## 2.2 Community Focus

The system is designed for **human communities**, not purely crypto-native users.

Avoid:

- blockchain jargon
- token-heavy UI

Prefer:

- plain language
- simple explanations


## 2.3 Low Cognitive Load

Voting should require minimal thinking about the interface.

Users should:

```
open proposal
read
vote
```

in under 30 seconds.


## 2.4 Minimal Visual Design

Use:

- neutral colors
- generous spacing
- readable typography

Avoid:

- dense data tables
- overly complex graphs

---

# 3. Layout Structure

The platform uses a **simple two-level navigation model**.

Level 1: Community

Level 2: Proposals

Basic layout:

```
Header

Sidebar (communities)

Main content area
```

Mobile layout:

```
Header

Dropdown community selector

Content
```

---

# 4. Main Navigation

Top navigation should contain:

```
logo
community selector
create proposal (if admin)
user avatar
```

User avatar menu:

```
profile
settings
logout
```

---

# 5. Sidebar

Sidebar displays communities the user belongs to.

Structure:

```
Communities

• Community A
• Community B
• Community C
```

Selecting a community loads its proposals.

---

# 6. Core Pages

The MVP includes the following pages.

```
Landing page
Community proposals page
Proposal detail page
Create proposal page
Community settings page
Profile page
```

---

# 7. Landing Page

Purpose:

Introduce the platform and allow login.

Sections:

```
headline
short description
connect wallet button
```

Optional:

```
list of public communities
```

---

# 8. Community Proposals Page

This is the **main user interface**.

It lists all proposals for a community.

Proposal list layout:

```
Title
Status
Vote count
End date
```

Status badges:

```
active
closed
upcoming
```

Example layout:

```
[Proposal Title]
Active • ends in 2 days

[Proposal Title]
Closed • results available
```

---

# 9. Proposal Detail Page

This page contains:

```
proposal title
proposal description
voting options
current results
vote button
```

Structure:

```
Title
Metadata
Description
Voting Section
Results Section
```

Metadata includes:

```
author
start time
end time
```

---

# 10. Voting Interface

Voting must be extremely simple.

Voting options appear as selectable buttons.

Example:

```
( ) Yes
( ) No
( ) Abstain
```

User selects option and clicks:

```
Submit Vote
```

After voting:

- vote is locked
- confirmation message appears

---

# 11. Results Visualization

Results should be displayed clearly.

Example visualization:

```
Yes      ███████████ 65%
No       █████       30%
Abstain  █           5%
```

Use simple bar visualization.

Avoid complex charts.

---

# 12. Create Proposal Page

Admins can create proposals.

Form fields:

```
title
description
voting options
start date
end date
visibility
execution hook (optional)
```

Description field supports:

```
markdown
```

---

# 13. Community Settings Page

Admins manage community configuration.

Settings include:

```
community name
visibility settings
webhooks
invite links
SSO configuration
```

Future additions:

```
voting strategies
plugins
```

---

# 14. Profile Page

Users can view their participation.

Display:

```
wallet address
username
joined communities
recent votes
```

Future features:

```
reputation score
participation history
achievements
```

---

# 15. Color System

Use a **neutral and calm color palette**.

Example palette:

```
Background: #F8F9FA
Primary: #3B82F6
Text: #111827
Muted: #6B7280
Border: #E5E7EB
```

Status colors:

```
Active: blue
Closed: gray
Success: green
Warning: yellow
```

Avoid bright or aggressive colors.

---

# 16. Typography

Recommended font:

```
Inter
```

Text hierarchy:

```
H1 – page titles
H2 – section titles
Body – descriptions
Small – metadata
```

Text must remain readable on mobile.

---

# 17. Component System

Reusable components should include:

```
Button
Card
Badge
Modal
Form Field
Proposal Card
Vote Option
Progress Bar
```

Components must be implemented using **Svelte components**.

---

# 18. Responsive Design

The platform must support:

```
desktop
mobile
```

Mobile adjustments:

- sidebar collapses
- community selector becomes dropdown
- voting buttons become full width

---

# 19. Accessibility

Basic accessibility requirements:

```
keyboard navigation
sufficient contrast
large clickable areas
```

Buttons must be easy to tap on mobile.

---

# 20. Future UI Features

The UI architecture should allow future additions.

Examples:

```
proposal comments
proposal discussion
voting analytics
community dashboards
subgroup views
```

The UI component system must be flexible enough to support these.

---

End of document.