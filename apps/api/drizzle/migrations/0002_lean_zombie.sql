CREATE TABLE `shipment_plans` (
	`planId` text PRIMARY KEY NOT NULL,
	`cattleId` integer NOT NULL,
	`plannedShipmentMonth` text NOT NULL,
	`createdAt` text DEFAULT (datetime('now', 'utc')) NOT NULL,
	`updatedAt` text DEFAULT (datetime('now', 'utc')) NOT NULL,
	FOREIGN KEY (`cattleId`) REFERENCES `cattle`(`cattleId`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `shipments` (
	`shipmentId` text PRIMARY KEY NOT NULL,
	`cattleId` integer NOT NULL,
	`shipmentDate` text NOT NULL,
	`price` integer NOT NULL,
	`weight` real,
	`ageAtShipment` integer,
	`buyer` text,
	`notes` text,
	`createdAt` text DEFAULT (datetime('now', 'utc')) NOT NULL,
	`updatedAt` text DEFAULT (datetime('now', 'utc')) NOT NULL,
	FOREIGN KEY (`cattleId`) REFERENCES `cattle`(`cattleId`) ON UPDATE no action ON DELETE no action
);
