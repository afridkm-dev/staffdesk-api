/*
# Create employees table (single-tenant, no auth)

1. New Tables
- `employees`
  - `id` (uuid, primary key, auto-generated)
  - `name` (text, not null)
  - `role` (text, defaults to empty string)
  - `department` (text, defaults to empty string)
  - `email` (text, defaults to empty string)
  - `phone` (text, defaults to empty string)
  - `avatar_color` (text, defaults to '#2F4858')
  - `created_at` (timestamp, defaults to now)
  - `updated_at` (timestamp, defaults to now)

2. Security
- Enable RLS on `employees`.
- Grant CRUD to `anon` + `authenticated` so the Data API can reach the table.
- Allow anon + authenticated CRUD because the data is intentionally shared/public (no sign-in).

3. Notes
- This replaces the previous MongoDB-based employee storage.
- Column names use snake_case (PostgreSQL convention); the Node API maps them to camelCase for the JSON response.
*/

CREATE TABLE IF NOT EXISTS employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL DEFAULT '',
  department text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  avatar_color text NOT NULL DEFAULT '#2F4858',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON employees TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_employees" ON employees;
CREATE POLICY "anon_select_employees" ON employees FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_employees" ON employees;
CREATE POLICY "anon_insert_employees" ON employees FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_employees" ON employees;
CREATE POLICY "anon_update_employees" ON employees FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_employees" ON employees;
CREATE POLICY "anon_delete_employees" ON employees FOR DELETE
  TO anon, authenticated USING (true);
