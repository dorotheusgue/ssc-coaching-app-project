CREATE TABLE `assigned_sessions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`assignment_id` integer NOT NULL,
	`athlete_id` integer NOT NULL,
	`session_template_id` integer,
	`date` text NOT NULL,
	`label` text NOT NULL,
	`status` text DEFAULT 'scheduled' NOT NULL,
	`notes` text,
	`completed_at` integer,
	FOREIGN KEY (`assignment_id`) REFERENCES `program_assignments`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`athlete_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`session_template_id`) REFERENCES `session_templates`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `athlete_profiles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`coach_id` integer NOT NULL,
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
CREATE UNIQUE INDEX `athlete_profiles_user_id_unique` ON `athlete_profiles` (`user_id`);--> statement-breakpoint
CREATE TABLE `block_exercises` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`block_id` integer NOT NULL,
	`exercise_id` integer,
	`sets` integer,
	`reps` text,
	`load` text,
	`percent_1rm` real,
	`distance` real,
	`time` real,
	`rest_seconds` integer,
	`notes` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`block_id`) REFERENCES `session_blocks`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `coach_profiles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`organization` text,
	`specialty` text,
	`bio` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `coach_profiles_user_id_unique` ON `coach_profiles` (`user_id`);--> statement-breakpoint
CREATE TABLE `conversations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`coach_id` integer NOT NULL,
	`athlete_id` integer NOT NULL,
	`last_message_at` integer,
	`created_at` integer,
	FOREIGN KEY (`coach_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`athlete_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `exercises` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`tags` text,
	`description` text,
	`video_url` text,
	`tracking_type` text DEFAULT 'reps' NOT NULL,
	`coach_id` integer,
	`is_default` integer DEFAULT false,
	`created_at` integer,
	FOREIGN KEY (`coach_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `group_members` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`group_id` integer NOT NULL,
	`athlete_id` integer NOT NULL,
	`added_at` integer,
	FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`athlete_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `groups` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`coach_id` integer NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`coach_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `media` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`athlete_id` integer NOT NULL,
	`coach_id` integer,
	`assigned_session_id` integer,
	`file_url` text NOT NULL,
	`file_name` text NOT NULL,
	`file_type` text NOT NULL,
	`file_size` integer,
	`type` text NOT NULL,
	`caption` text,
	`created_at` integer,
	FOREIGN KEY (`athlete_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`coach_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`assigned_session_id`) REFERENCES `assigned_sessions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`conversation_id` integer NOT NULL,
	`sender_id` integer NOT NULL,
	`text` text NOT NULL,
	`media_url` text,
	`media_type` text,
	`read_at` integer,
	`created_at` integer,
	FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `phases` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`program_id` integer NOT NULL,
	`name` text NOT NULL,
	`goal` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`start_week` integer DEFAULT 1 NOT NULL,
	`end_week` integer DEFAULT 4 NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`program_id`) REFERENCES `programs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `program_assignments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`program_id` integer NOT NULL,
	`athlete_id` integer NOT NULL,
	`coach_id` integer NOT NULL,
	`start_date` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`program_id`) REFERENCES `programs`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`athlete_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`coach_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `programs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`coach_id` integer NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`notes` text,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`coach_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `readiness_entries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`athlete_id` integer NOT NULL,
	`assigned_session_id` integer,
	`date` text NOT NULL,
	`sleep_quality` integer NOT NULL,
	`fatigue` integer NOT NULL,
	`soreness` integer NOT NULL,
	`stress` integer NOT NULL,
	`mood` integer NOT NULL,
	`note` text,
	`created_at` integer,
	FOREIGN KEY (`athlete_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`assigned_session_id`) REFERENCES `assigned_sessions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `session_blocks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`session_template_id` integer NOT NULL,
	`block_type` text NOT NULL,
	`label` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`rest_seconds` integer,
	FOREIGN KEY (`session_template_id`) REFERENCES `session_templates`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `session_templates` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`phase_id` integer NOT NULL,
	`day_of_week` integer NOT NULL,
	`label` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`notes` text,
	FOREIGN KEY (`phase_id`) REFERENCES `phases`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `set_entries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`assigned_session_id` integer NOT NULL,
	`block_exercise_id` integer,
	`exercise_id` integer,
	`set_number` integer NOT NULL,
	`reps` integer,
	`load` real,
	`distance` real,
	`time` real,
	`rpe` real,
	`notes` text,
	`completed` integer DEFAULT false,
	`logged_at` integer,
	FOREIGN KEY (`assigned_session_id`) REFERENCES `assigned_sessions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`block_exercise_id`) REFERENCES `block_exercises`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `sprint_entries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`assigned_session_id` integer NOT NULL,
	`block_exercise_id` integer,
	`rep_number` integer NOT NULL,
	`distance` real,
	`time` real,
	`rpe` real,
	`notes` text,
	`completed` integer DEFAULT false,
	`logged_at` integer,
	FOREIGN KEY (`assigned_session_id`) REFERENCES `assigned_sessions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`block_exercise_id`) REFERENCES `block_exercises`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`role` text DEFAULT 'athlete' NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);