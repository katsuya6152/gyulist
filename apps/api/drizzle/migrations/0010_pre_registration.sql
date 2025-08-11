CREATE TABLE IF NOT EXISTS registrations (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  referral_source TEXT,
  status TEXT NOT NULL,
  locale TEXT NOT NULL DEFAULT 'ja',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS email_logs (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  type TEXT NOT NULL,
  http_status INTEGER,
  resend_id TEXT,
  error TEXT,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_reg_created_at ON registrations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reg_referral_source ON registrations(referral_source);
