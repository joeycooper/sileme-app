-- Step 4: encouragements table

CREATE TABLE IF NOT EXISTS encouragements (
  id INTEGER PRIMARY KEY,
  from_user_id INTEGER NOT NULL,
  to_user_id INTEGER NOT NULL,
  checkin_date DATE NOT NULL,
  emoji TEXT NOT NULL,
  message TEXT,
  created_at DATETIME NOT NULL,
  FOREIGN KEY(from_user_id) REFERENCES users(id),
  FOREIGN KEY(to_user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_encouragements_from_user_id ON encouragements(from_user_id);
CREATE INDEX IF NOT EXISTS idx_encouragements_to_user_id ON encouragements(to_user_id);
CREATE INDEX IF NOT EXISTS idx_encouragements_checkin_date ON encouragements(checkin_date);
