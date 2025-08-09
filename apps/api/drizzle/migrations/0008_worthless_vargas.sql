ALTER TABLE `cattle` RENAME COLUMN "healthStatus" TO "status";--> statement-breakpoint
UPDATE `cattle`
SET `status` = CASE `status`
        WHEN '健康' THEN 'HEALTHY'
        WHEN '妊娠中' THEN 'PREGNANT'
        WHEN '休息中' THEN 'RESTING'
        WHEN '治療中' THEN 'TREATING'
        WHEN '出荷済' THEN 'SHIPPED'
        WHEN '死亡' THEN 'DEAD'
        ELSE `status`
END;--> statement-breakpoint
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
