-- Tech Salary Transparency Platform — Database Initialisation
-- PostgreSQL 16 | Three logical schemas: identity, salary, community

-- ── Schemas ────────────────────────────────────────────────────────────────
CREATE SCHEMA IF NOT EXISTS identity;
CREATE SCHEMA IF NOT EXISTS salary;
CREATE SCHEMA IF NOT EXISTS community;

-- ── ENUM types ─────────────────────────────────────────────────────────────
CREATE TYPE salary.experience_level AS ENUM ('junior', 'mid', 'senior', 'lead', 'principal');
CREATE TYPE salary.employment_type  AS ENUM ('full-time', 'part-time', 'contract', 'freelance');
CREATE TYPE salary.submission_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
CREATE TYPE community.vote_type AS ENUM ('UP', 'DOWN');

-- ── identity.users ──────────────────────────────────────────────────────────
-- Stores user accounts for community actions (voting/reporting).
-- This table is NEVER referenced by salary.submissions (privacy by design).
CREATE TABLE identity.users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  display_name  TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── salary.submissions ──────────────────────────────────────────────────────
-- Anonymous salary records. Zero columns linking to identity.users.
CREATE TABLE salary.submissions (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company            TEXT NOT NULL,
  role               TEXT NOT NULL,
  country            TEXT NOT NULL DEFAULT 'Sri Lanka',
  city               TEXT,
  experience_years   NUMERIC(4,1) NOT NULL,
  experience_level   salary.experience_level NOT NULL,
  base_salary        NUMERIC(15,2) NOT NULL,
  total_compensation NUMERIC(15,2),
  currency           TEXT NOT NULL DEFAULT 'LKR',
  employment_type    salary.employment_type NOT NULL DEFAULT 'full-time',
  anonymize          BOOLEAN NOT NULL DEFAULT FALSE,
  status             salary.submission_status NOT NULL DEFAULT 'PENDING',
  upvote_count       INTEGER NOT NULL DEFAULT 0,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── community.votes ─────────────────────────────────────────────────────────
-- Tracks which user voted on which submission.
-- user_id references identity.users but is NOT stored in salary.submissions.
CREATE TABLE community.votes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL,
  user_id       UUID NOT NULL,
  vote_type     community.vote_type NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (submission_id, user_id)
);

-- ── community.reports ───────────────────────────────────────────────────────
CREATE TABLE community.reports (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL,
  user_id       UUID NOT NULL,
  reason        TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Indexes ─────────────────────────────────────────────────────────────────
CREATE INDEX ON salary.submissions (status);
CREATE INDEX ON salary.submissions (company);
CREATE INDEX ON salary.submissions (role);
CREATE INDEX ON salary.submissions (experience_level);
CREATE INDEX ON community.votes (submission_id);
