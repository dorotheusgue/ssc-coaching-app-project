CREATE TABLE `block_templates` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`coach_id` integer NOT NULL REFERENCES users(id),
	`name` text NOT NULL,
	`block_type` text NOT NULL,
	`label` text,
	`payload` text NOT NULL,
	`created_at` integer
);
