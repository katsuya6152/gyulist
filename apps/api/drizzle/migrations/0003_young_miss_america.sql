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
	`healthStatus` text,
	`producerName` text,
	`barn` text,
	`breedingValue` text,
	`notes` text,
	`createdAt` text DEFAULT (datetime('now', 'utc')),
	`updatedAt` text DEFAULT (datetime('now', 'utc')),
	FOREIGN KEY (`ownerUserId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
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
CREATE TABLE `mother_info` (
	`motherInfoId` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`cattleId` integer NOT NULL,
	`motherCattleId` integer NOT NULL,
	`motherName` text,
	`motherIdentificationNumber` text,
	`motherScore` integer,
	FOREIGN KEY (`cattleId`) REFERENCES `cattle`(`cattleId`) ON UPDATE no action ON DELETE no action
);
