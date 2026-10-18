CREATE TABLE IF NOT EXISTS kajon_buffer_personal_accounts(owner_id TEXT PRIMARY KEY NOT NULL,cipher TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS kajon_buffer_usage(day TEXT PRIMARY KEY NOT NULL,count INTEGER NOT NULL CHECK(count>=0));
CREATE TABLE IF NOT EXISTS kajon_buffer_exports(id TEXT PRIMARY KEY NOT NULL,owner_id TEXT NOT NULL,status TEXT NOT NULL,post_id TEXT);
CREATE INDEX IF NOT EXISTS kajon_buffer_exports_owner ON kajon_buffer_exports(owner_id);
