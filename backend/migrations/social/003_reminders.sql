-- Step 3: reminders table

CREATE TABLE IF NOT EXISTS reminders (
  id INTEGER PRIMARY KEY,
  from_user_id INTEGER NOT NULL,
  to_user_id INTEGER NOT NULL,
  date DATE NOT NULL,
  created_at DATETIME NOT NULL,
  FOREIGN KEY(from_user_id) REFERENCES users(id),
  FOREIGN KEY(to_user_id) REFERENCES users(id),
  UNIQUE(from_user_id, to_user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_reminders_from_user_id ON reminders(from_user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_to_user_id ON reminders(to_user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_date ON reminders(date);
