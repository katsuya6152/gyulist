PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_cattle` (
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
INSERT INTO `__new_cattle`("cattleId", "ownerUserId", "identificationNumber", "earTagNumber", "name", "growthStage", "birthday", "age", "monthsOld", "daysOld", "gender", "weight", "score", "breed", "status", "producerName", "barn", "breedingValue", "notes", "createdAt", "updatedAt") SELECT "cattleId", "ownerUserId", "identificationNumber", "earTagNumber", "name", "growthStage", "birthday", "age", "monthsOld", "daysOld", "gender", "weight", "score", "breed", "status", "producerName", "barn", "breedingValue", "notes", "createdAt", "updatedAt" FROM `cattle`;--> statement-breakpoint
DROP TABLE `cattle`;--> statement-breakpoint
ALTER TABLE `__new_cattle` RENAME TO `cattle`;--> statement-breakpoint
PRAGMA foreign_keys=ON;