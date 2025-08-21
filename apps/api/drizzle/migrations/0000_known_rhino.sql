CREATE TABLE `bloodline` (
	`bloodlineId` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`cattleId` integer NOT NULL,
	`fatherCattleName` text,
	`motherFatherCattleName` text,
	`motherGrandFatherCattleName` text,
	`motherGreatGrandFatherCattleName` text,
	FOREIGN KEY (`cattleId`) REFERENCES `cattle`(`cattleId`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `breeding_status` (
	`breedingStatusId` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`cattleId` integer NOT NULL,
	`parity` integer,
	`expectedCalvingDate` text,
	`scheduledPregnancyCheckDate` text,
	`daysAfterCalving` integer,
	`daysOpen` integer,
	`pregnancyDays` integer,
	`daysAfterInsemination` integer,
	`inseminationCount` integer,
	`breedingMemo` text,
	`isDifficultBirth` integer,
	`createdAt` text DEFAULT (datetime('now', 'utc')),
	`updatedAt` text DEFAULT (datetime('now', 'utc')),
	FOREIGN KEY (`cattleId`) REFERENCES `cattle`(`cattleId`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `breeding_summary` (
	`breedingSummaryId` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`cattleId` integer NOT NULL,
	`totalInseminationCount` integer,
	`averageDaysOpen` integer,
	`averagePregnancyPeriod` integer,
	`averageCalvingInterval` integer,
	`difficultBirthCount` integer,
	`pregnancyHeadCount` integer,
	`pregnancySuccessRate` integer,
	`createdAt` text DEFAULT (datetime('now', 'utc')),
	`updatedAt` text DEFAULT (datetime('now', 'utc')),
	FOREIGN KEY (`cattleId`) REFERENCES `cattle`(`cattleId`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `cattle` (
	`cattleId` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`ownerUserId` integer NOT NULL,
	`identificationNumber` integer NOT NULL,
	`earTagNumber` integer,
	`name` text,
	`growthStage` text,
	`birthday` text,
	`age` integer,
	`monthsOld` integer,
	`daysOld` integer,
	`gender` text,
	`weight` integer,
	`score` integer,
	`breed` text,
	`status` text DEFAULT 'HEALTHY',
	`producerName` text,
	`barn` text,
	`breedingValue` text,
	`notes` text,
	`createdAt` text DEFAULT (datetime('now', 'utc')),
	`updatedAt` text DEFAULT (datetime('now', 'utc')),
	FOREIGN KEY (`ownerUserId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `mother_info` (
	`motherInfoId` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`cattleId` integer NOT NULL,
	`motherCattleId` integer NOT NULL,
	`motherName` text,
	`motherIdentificationNumber` text,
	`motherScore` integer,
	FOREIGN KEY (`cattleId`) REFERENCES `cattle`(`cattleId`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `cattle_status_history` (
	`historyId` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`cattleId` integer NOT NULL,
	`oldStatus` text,
	`newStatus` text NOT NULL,
	`changedAt` text DEFAULT (datetime('now', 'utc')),
	`changedBy` integer NOT NULL,
	`reason` text,
	FOREIGN KEY (`cattleId`) REFERENCES `cattle`(`cattleId`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`changedBy`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `events` (
	`eventId` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`cattleId` integer NOT NULL,
	`eventType` text NOT NULL,
	`eventDatetime` text NOT NULL,
	`notes` text,
	`createdAt` text DEFAULT (datetime('now', 'utc')),
	`updatedAt` text DEFAULT (datetime('now', 'utc')),
	FOREIGN KEY (`cattleId`) REFERENCES `cattle`(`cattleId`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userName` text DEFAULT '仮登録ユーザー',
	`email` text NOT NULL,
	`passwordHash` text NOT NULL,
	`is_verified` integer DEFAULT false,
	`verification_token` text,
	`last_login_at` text,
	`theme` text DEFAULT 'light',
	`google_id` text,
	`line_id` text,
	`oauth_provider` text,
	`avatar_url` text,
	`createdAt` text DEFAULT (CURRENT_TIMESTAMP),
	`updatedAt` text DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` integer NOT NULL,
	`expires_at` integer NOT NULL,
	`createdAt` text DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `registrations` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`referral_source` text,
	`status` text NOT NULL,
	`locale` text DEFAULT 'ja' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `registrations_email_unique` ON `registrations` (`email`);--> statement-breakpoint
CREATE TABLE `email_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`type` text NOT NULL,
	`http_status` integer,
	`resend_id` text,
	`error` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `alerts` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`severity` text NOT NULL,
	`status` text NOT NULL,
	`cattle_id` integer NOT NULL,
	`cattle_name` text,
	`cattle_ear_tag_number` text,
	`due_at` text,
	`message` text NOT NULL,
	`memo` text,
	`owner_user_id` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`acknowledged_at` integer,
	`resolved_at` integer,
	FOREIGN KEY (`cattle_id`) REFERENCES `cattle`(`cattleId`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`owner_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `alert_history` (
	`id` text PRIMARY KEY NOT NULL,
	`alert_id` text NOT NULL,
	`action` text NOT NULL,
	`previous_status` text,
	`new_status` text NOT NULL,
	`changed_by` integer NOT NULL,
	`reason` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`alert_id`) REFERENCES `alerts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`changed_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
