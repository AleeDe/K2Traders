-- Create a singleton admin table where only one record can exist
CREATE TABLE IF NOT EXISTS admin (
  id uuid PRIMARY KEY,
  email text UNIQUE NOT NULL,
  one boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT one_admin_only UNIQUE(one)
);

ALTER TABLE admin ENABLE ROW LEVEL SECURITY;

-- Policies for admin table
DROP POLICY IF EXISTS "Admin can view own" ON admin;
CREATE POLICY "Admin can view own"
  ON admin FOR SELECT TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "First user can become singleton admin" ON admin;
CREATE POLICY "First user can become singleton admin"
  ON admin FOR INSERT TO authenticated
  WITH CHECK (
    (SELECT COUNT(1) = 0 FROM admin)
    AND auth.uid() = id
  );

DROP POLICY IF EXISTS "Admin can update own" ON admin;
CREATE POLICY "Admin can update own"
  ON admin FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Admin can delete own" ON admin;
CREATE POLICY "Admin can delete own"
  ON admin FOR DELETE TO authenticated
  USING (auth.uid() = id);

-- Migrate an existing admin from admin_users into admin (take the earliest one) if admin is empty
INSERT INTO admin (id, email)
SELECT au.id, au.email
FROM admin_users au
WHERE (SELECT COUNT(1) FROM admin) = 0
ORDER BY au.created_at ASC
LIMIT 1
ON CONFLICT DO NOTHING;

-- Note: Do not seed from auth.users to avoid any coupling with Auth

-- Update categories/products policies to reference the new 'admin' table for admin checks
-- Drop old policies that referenced admin_users
DO $$
BEGIN
  BEGIN EXECUTE 'DROP POLICY "Authenticated admins can insert categories" ON categories'; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN EXECUTE 'DROP POLICY "Authenticated admins can update categories" ON categories'; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN EXECUTE 'DROP POLICY "Authenticated admins can delete categories" ON categories'; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN EXECUTE 'DROP POLICY "Authenticated admins can insert products" ON products'; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN EXECUTE 'DROP POLICY "Authenticated admins can update products" ON products'; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN EXECUTE 'DROP POLICY "Authenticated admins can delete products" ON products'; EXCEPTION WHEN OTHERS THEN NULL; END;
END $$;

-- Recreate policies using the 'admin' table
CREATE POLICY "Authenticated admin can insert categories"
  ON categories FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin WHERE admin.id = auth.uid())
  );

CREATE POLICY "Authenticated admin can update categories"
  ON categories FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin WHERE admin.id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin WHERE admin.id = auth.uid())
  );

CREATE POLICY "Authenticated admin can delete categories"
  ON categories FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin WHERE admin.id = auth.uid())
  );

CREATE POLICY "Authenticated admin can insert products"
  ON products FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin WHERE admin.id = auth.uid())
  );

CREATE POLICY "Authenticated admin can update products"
  ON products FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin WHERE admin.id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin WHERE admin.id = auth.uid())
  );

CREATE POLICY "Authenticated admin can delete products"
  ON products FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin WHERE admin.id = auth.uid())
  );

-- Swap orders and order_items policies to use 'admin'
DO $$
BEGIN
  BEGIN EXECUTE 'DROP POLICY "Admins can manage orders" ON orders'; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN EXECUTE 'DROP POLICY "Admins can update orders" ON orders'; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN EXECUTE 'DROP POLICY "Admins can delete orders" ON orders'; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN EXECUTE 'DROP POLICY "Admins can view order items" ON order_items'; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN EXECUTE 'DROP POLICY "Admins can update order items" ON order_items'; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN EXECUTE 'DROP POLICY "Admins can delete order items" ON order_items'; EXCEPTION WHEN OTHERS THEN NULL; END;
END $$;

DROP POLICY IF EXISTS "Admins can manage orders" ON orders;
CREATE POLICY "Admins can manage orders"
  ON orders FOR SELECT USING (
    EXISTS (SELECT 1 FROM admin WHERE admin.id = auth.uid())
  );

DROP POLICY IF EXISTS "Admins can update orders" ON orders;
CREATE POLICY "Admins can update orders"
  ON orders FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin WHERE admin.id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin WHERE admin.id = auth.uid())
  );

DROP POLICY IF EXISTS "Admins can delete orders" ON orders;
CREATE POLICY "Admins can delete orders"
  ON orders FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin WHERE admin.id = auth.uid())
  );

DROP POLICY IF EXISTS "Admins can view order items" ON order_items;
CREATE POLICY "Admins can view order items"
  ON order_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM admin WHERE admin.id = auth.uid())
  );

DROP POLICY IF EXISTS "Admins can update order items" ON order_items;
CREATE POLICY "Admins can update order items"
  ON order_items FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin WHERE admin.id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin WHERE admin.id = auth.uid())
  );

DROP POLICY IF EXISTS "Admins can delete order items" ON order_items;
CREATE POLICY "Admins can delete order items"
  ON order_items FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin WHERE admin.id = auth.uid())
  );

-- Swap blog_posts policies to use 'admin'
DO $$
BEGIN
  BEGIN EXECUTE 'DROP POLICY "Admins can insert blog posts" ON blog_posts'; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN EXECUTE 'DROP POLICY "Admins can update blog posts" ON blog_posts'; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN EXECUTE 'DROP POLICY "Admins can delete blog posts" ON blog_posts'; EXCEPTION WHEN OTHERS THEN NULL; END;
END $$;

DROP POLICY IF EXISTS "Admins can insert blog posts" ON blog_posts;
CREATE POLICY "Admins can insert blog posts"
  ON blog_posts FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin WHERE admin.id = auth.uid())
  );

DROP POLICY IF EXISTS "Admins can update blog posts" ON blog_posts;
CREATE POLICY "Admins can update blog posts"
  ON blog_posts FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin WHERE admin.id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin WHERE admin.id = auth.uid())
  );

DROP POLICY IF EXISTS "Admins can delete blog posts" ON blog_posts;
CREATE POLICY "Admins can delete blog posts"
  ON blog_posts FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin WHERE admin.id = auth.uid())
  );

-- Also swap site_settings policies to use 'admin' instead of 'admin_users'
DO $$
BEGIN
  BEGIN EXECUTE 'DROP POLICY "Admins can manage site settings" ON site_settings'; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN EXECUTE 'DROP POLICY "Admins can update site settings" ON site_settings'; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN EXECUTE 'DROP POLICY "Admins can delete site settings" ON site_settings'; EXCEPTION WHEN OTHERS THEN NULL; END;
END $$;

DROP POLICY IF EXISTS "Admins can manage site settings" ON site_settings;
CREATE POLICY "Admins can manage site settings"
  ON site_settings FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin WHERE admin.id = auth.uid())
  );

DROP POLICY IF EXISTS "Admins can update site settings" ON site_settings;
CREATE POLICY "Admins can update site settings"
  ON site_settings FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin WHERE admin.id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin WHERE admin.id = auth.uid())
  );

DROP POLICY IF EXISTS "Admins can delete site settings" ON site_settings;
CREATE POLICY "Admins can delete site settings"
  ON site_settings FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin WHERE admin.id = auth.uid())
  );
