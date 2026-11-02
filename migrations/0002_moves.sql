-- Anonymous lesson changes, for the stats page: how players were placed, and how long each lesson
-- took before they moved on. `why` is start (the start question), grownup, up (mastered) or skip.
CREATE TABLE moves (
  id TEXT PRIMARY KEY,
  fam TEXT NOT NULL,
  at INTEGER NOT NULL,
  from_lesson INTEGER NOT NULL,
  to_lesson INTEGER NOT NULL,
  why TEXT NOT NULL
);
CREATE INDEX moves_at ON moves (at);
