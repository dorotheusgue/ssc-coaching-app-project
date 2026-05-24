PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_athlete_profiles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`coach_id` integer,
	`sport` text,
	`event` text,
	`date_of_birth` text,
	`height` real,
	`weight` real,
	`personal_bests` text,
	`notes` text,
	`invited_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`coach_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_athlete_profiles`("id", "user_id", "coach_id", "sport", "event", "date_of_birth", "height", "weight", "personal_bests", "notes", "invited_at") SELECT "id", "user_id", "coach_id", "sport", "event", "date_of_birth", "height", "weight", "personal_bests", "notes", "invited_at" FROM `athlete_profiles`;--> statement-breakpoint
DROP TABLE `athlete_profiles`;--> statement-breakpoint
ALTER TABLE `__new_athlete_profiles` RENAME TO `athlete_profiles`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `athlete_profiles_user_id_unique` ON `athlete_profiles` (`user_id`);