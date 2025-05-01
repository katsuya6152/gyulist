PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userName` text DEFAULT '仮登録ユーザー',
	`email` text NOT NULL,
	`passwordHash` text NOT NULL,
	`is_verified` integer DEFAULT false,
	`verification_token` text,
	`createdAt` text DEFAULT (CURRENT_TIMESTAMP),
	`updatedAt` text DEFAULT (CURRENT_TIMESTAMP)
);
--> statement-breakpoint
INSERT INTO `__new_users`("id", "userName", "email", "passwordHash", "is_verified", "verification_token", "createdAt", "updatedAt") SELECT "id", "userName", "email", "passwordHash", "is_verified", "verification_token", "createdAt", "updatedAt" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);