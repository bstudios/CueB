CREATE TABLE `channels` (
	`channels.id` integer DEFAULT 0 NOT NULL,
	`channels.name` text
);
--> statement-breakpoint
CREATE TABLE `devices` (
	`devices.id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`devices.ip` text,
	`devices.name` text,
	`devices.location` text,
	`devices.hidden` integer DEFAULT false NOT NULL,
	`channels.id` integer DEFAULT NULL,
	FOREIGN KEY (`channels.id`) REFERENCES `channels`(`channels.id`) ON UPDATE cascade ON DELETE set null
);
