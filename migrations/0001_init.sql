-- Backups: one row per restore code, holding a snapshot of that device's players and progress.
CREATE TABLE backups (
  code TEXT PRIMARY KEY,
  data TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Anonymous play records, pooled across everyone for the stats page. No names and no restore
-- code: `fam` is a one-way hash of the code, only so distinct families can be counted.
CREATE TABLE plays (
  id TEXT PRIMARY KEY,
  fam TEXT NOT NULL,
  game TEXT NOT NULL,
  at INTEGER NOT NULL,
  ms INTEGER NOT NULL,
  done INTEGER NOT NULL,
  first_try INTEGER NOT NULL,
  answers INTEGER NOT NULL,
  stars INTEGER,
  lesson INTEGER
);
CREATE INDEX plays_at ON plays (at);
CREATE INDEX plays_game_at ON plays (game, at);
