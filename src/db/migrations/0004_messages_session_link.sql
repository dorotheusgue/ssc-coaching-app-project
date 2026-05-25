ALTER TABLE `messages` ADD `assigned_session_id` integer REFERENCES assigned_sessions(id);
