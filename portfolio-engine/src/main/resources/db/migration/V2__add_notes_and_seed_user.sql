-- WealthEngine Schema V2: Add notes column for additional metadata
-- Needed for: NPS PRAN number, EPF UAN/account, property address, crypto wallet, etc.

ALTER TABLE holdings ADD COLUMN IF NOT EXISTS notes VARCHAR(500);

-- Seed a default 'current-user' for MVP development
INSERT INTO users (id, email, name, password, role)
VALUES ('current-user', 'admin@wealthengine.com', 'Portfolio Admin',
        '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LpMblYiDbsm', 'ADMIN')
ON CONFLICT (id) DO NOTHING;
