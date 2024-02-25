CREATE TABLE `channels` (
	`channels.id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`channels.number` integer DEFAULT 0 NOT NULL,
	`channels.name` text
);
--> statement-breakpoint
CREATE TABLE `devices` (
	`devices.id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`devices.ip` text NOT NULL,
	`devices.port` integer NOT NULL,
	`devices.name` text,
	`devices.location` text,
	`devices.hidden` integer DEFAULT false NOT NULL,
	`channels.id` integer DEFAULT NULL,
	FOREIGN KEY (`channels.id`) REFERENCES `channels`(`channels.id`) ON UPDATE cascade ON DELETE set null
);
