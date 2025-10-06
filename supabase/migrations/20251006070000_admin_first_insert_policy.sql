-- Allow only the very first authenticated user to insert into admin_users (one-time setup)
-- Requires RLS enabled on admin_users (already enabled in earlier migration)

DROP POLICY IF EXISTS "First user can become admin" ON admin_users;
CREATE POLICY "First user can become admin"
  ON admin_users FOR INSERT TO authenticated
  WITH CHECK (
    -- only allow insert when there are no rows in admin_users
    (SELECT COUNT(1) = 0 FROM admin_users)
    AND auth.uid() = id
  );
