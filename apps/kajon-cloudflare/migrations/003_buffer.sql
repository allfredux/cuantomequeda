-- Isolated per-user OAuth storage. No public database endpoint.
CREATE TABLE IF NOT EXISTS kajon_buffer_pending (
 state_hash TEXT PRIMARY KEY, owner_id TEXT NOT NULL, session_hash TEXT NOT NULL,
 cipher TEXT NOT NULL, expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS kajon_buffer_pending_expiry ON kajon_buffer_pending(expires_at);
CREATE TABLE IF NOT EXISTS kajon_buffer_accounts (
 owner_id TEXT PRIMARY KEY NOT NULL, cipher TEXT NOT NULL,
 revision INTEGER NOT NULL DEFAULT 0
);
