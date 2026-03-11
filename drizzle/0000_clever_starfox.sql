CREATE TABLE `account` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`password` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `account_userId_idx` ON `account` (`user_id`);--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL,
	`token` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE INDEX `session_userId_idx` ON `session` (`user_id`);--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`image` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`wallet_address` text,
	`display_name` text,
	`avatar_url` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_wallet_address_unique` ON `user` (`wallet_address`);--> statement-breakpoint
CREATE TABLE `verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `verification_identifier_idx` ON `verification` (`identifier`);--> statement-breakpoint
CREATE TABLE `communities` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`visibility` text DEFAULT 'public' NOT NULL,
	`verified` integer DEFAULT false NOT NULL,
	`created_by` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `communities_slug_unique` ON `communities` (`slug`);--> statement-breakpoint
CREATE INDEX `community_created_by_idx` ON `communities` (`created_by`);--> statement-breakpoint
CREATE TABLE `community_members` (
	`id` text PRIMARY KEY NOT NULL,
	`community_id` text NOT NULL,
	`user_id` text NOT NULL,
	`role` text DEFAULT 'member' NOT NULL,
	`joined_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`community_id`) REFERENCES `communities`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `community_member_unique_idx` ON `community_members` (`community_id`,`user_id`);--> statement-breakpoint
CREATE INDEX `community_member_user_idx` ON `community_members` (`user_id`);--> statement-breakpoint
CREATE INDEX `community_member_community_idx` ON `community_members` (`community_id`);--> statement-breakpoint
CREATE TABLE `execution_handlers` (
	`id` text PRIMARY KEY NOT NULL,
	`proposal_id` text NOT NULL,
	`type` text NOT NULL,
	`config_json` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`proposal_id`) REFERENCES `proposals`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `execution_handler_proposal_idx` ON `execution_handlers` (`proposal_id`);--> statement-breakpoint
CREATE TABLE `invites` (
	`id` text PRIMARY KEY NOT NULL,
	`community_id` text NOT NULL,
	`created_by` text NOT NULL,
	`token` text NOT NULL,
	`max_uses` integer,
	`uses` integer DEFAULT 0 NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`community_id`) REFERENCES `communities`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `invites_token_unique` ON `invites` (`token`);--> statement-breakpoint
CREATE INDEX `invite_community_idx` ON `invites` (`community_id`);--> statement-breakpoint
CREATE TABLE `proposals` (
	`id` text PRIMARY KEY NOT NULL,
	`community_id` text NOT NULL,
	`title` text NOT NULL,
	`body` text NOT NULL,
	`created_by` text NOT NULL,
	`strategy_id` text DEFAULT 'onePersonOneVote' NOT NULL,
	`visibility` text DEFAULT 'community' NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`start_time` integer NOT NULL,
	`end_time` integer NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`community_id`) REFERENCES `communities`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `proposal_community_idx` ON `proposals` (`community_id`);--> statement-breakpoint
CREATE INDEX `proposal_status_idx` ON `proposals` (`status`);--> statement-breakpoint
CREATE INDEX `proposal_start_time_idx` ON `proposals` (`start_time`);--> statement-breakpoint
CREATE INDEX `proposal_end_time_idx` ON `proposals` (`end_time`);--> statement-breakpoint
CREATE TABLE `proposal_choices` (
	`id` text PRIMARY KEY NOT NULL,
	`proposal_id` text NOT NULL,
	`label` text NOT NULL,
	`position` integer NOT NULL,
	FOREIGN KEY (`proposal_id`) REFERENCES `proposals`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `proposal_choice_proposal_idx` ON `proposal_choices` (`proposal_id`);--> statement-breakpoint
CREATE TABLE `votes` (
	`id` text PRIMARY KEY NOT NULL,
	`proposal_id` text NOT NULL,
	`user_id` text NOT NULL,
	`choice_id` text NOT NULL,
	`voting_power` integer DEFAULT 1 NOT NULL,
	`metadata_json` text,
	`signature` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`proposal_id`) REFERENCES `proposals`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`choice_id`) REFERENCES `proposal_choices`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `vote_unique_idx` ON `votes` (`proposal_id`,`user_id`);--> statement-breakpoint
CREATE INDEX `vote_proposal_idx` ON `votes` (`proposal_id`);--> statement-breakpoint
CREATE INDEX `vote_user_idx` ON `votes` (`user_id`);--> statement-breakpoint
CREATE TABLE `webhooks` (
	`id` text PRIMARY KEY NOT NULL,
	`community_id` text NOT NULL,
	`url` text NOT NULL,
	`secret` text NOT NULL,
	`events` text NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`community_id`) REFERENCES `communities`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `webhook_community_idx` ON `webhooks` (`community_id`);