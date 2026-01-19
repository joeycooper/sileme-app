-- Step 2: friend_settings table

CREATE TABLE IF NOT EXISTS friend_settings (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  friend_id INTEGER NOT NULL,
  can_view_detail BOOLEAN NOT NULL DEFAULT 0,
  can_remind BOOLEAN NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id),
  FOREIGN KEY(friend_id) REFERENCES users(id),
  UNIQUE(user_id, friend_id)
);

CREATE INDEX IF NOT EXISTS idx_friend_settings_user_id ON friend_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_friend_settings_friend_id ON friend_settings(friend_id);
