-- Update existing OAuth users to have dummy password hashes
UPDATE users 
SET passwordHash = 'oauth_dummy_' || hex(randomblob(32))
WHERE passwordHash IS NULL 
  AND (google_id IS NOT NULL OR line_id IS NOT NULL OR oauth_provider IS NOT NULL);