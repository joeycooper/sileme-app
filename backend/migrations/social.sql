-- Social features migration (SQLite) - full

CREATE TABLE IF NOT EXISTS friendships (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  friend_id INTEGER NOT NULL,
  status TEXT NOT NULL,
  blocked_by INTEGER,
  message TEXT,
  created_at DATETIME NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id),
  FOREIGN KEY(friend_id) REFERENCES users(id),
  UNIQUE(user_id, friend_id)
);

CREATE INDEX IF NOT EXISTS idx_friendships_user_id ON friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend_id ON friendships(friend_id);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON friendships(status);

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

CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  from_user_id INTEGER,
  related_group_id INTEGER,
  related_user_id INTEGER,
  kind TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at DATETIME NOT NULL,
  read_at DATETIME,
  FOREIGN KEY(user_id) REFERENCES users(id),
  FOREIGN KEY(from_user_id) REFERENCES users(id),
  FOREIGN KEY(related_group_id) REFERENCES groups(id),
  FOREIGN KEY(related_user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

CREATE TABLE IF NOT EXISTS groups (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  privacy TEXT NOT NULL,
  requires_approval BOOLEAN NOT NULL DEFAULT 1,
  join_code TEXT NOT NULL UNIQUE,
  owner_id INTEGER NOT NULL,
  announcement TEXT,
  created_at DATETIME NOT NULL,
  FOREIGN KEY(owner_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS group_members (
  id INTEGER PRIMARY KEY,
  group_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  role TEXT NOT NULL,
  status TEXT NOT NULL,
  requested_at DATETIME NOT NULL,
  approved_at DATETIME,
  FOREIGN KEY(group_id) REFERENCES groups(id),
  FOREIGN KEY(user_id) REFERENCES users(id),
  UNIQUE(group_id, user_id)
);

CREATE TABLE IF NOT EXISTS group_encouragements (
  id INTEGER PRIMARY KEY,
  group_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  emoji TEXT NOT NULL,
  message TEXT,
  created_at DATETIME NOT NULL,
  FOREIGN KEY(group_id) REFERENCES groups(id),
  FOREIGN KEY(user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS group_reminders (
  id INTEGER PRIMARY KEY,
  group_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  created_at DATETIME NOT NULL,
  FOREIGN KEY(group_id) REFERENCES groups(id),
  FOREIGN KEY(user_id) REFERENCES users(id)
);
