/*
  # Orders and Blog Tables

  This migration adds tables for storing customer orders and blog posts.
  It also configures Row Level Security (RLS) policies suitable for a public shop
  where orders are created by anonymous users and content is managed by admins.
*/

-- Orders table (anonymous users can insert; only admins can read/manage)
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id text UNIQUE NOT NULL,
  customer_name text NOT NULL,
  email text,
  phone text,
  address text,
  subtotal numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  name text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  quantity integer NOT NULL DEFAULT 1,
  total numeric NOT NULL DEFAULT 0
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Allow anyone to create an order (insert) but not read
CREATE POLICY "Anyone can create orders"
  ON orders FOR INSERT
  WITH CHECK (true);

-- Only authenticated admins can select/update/delete orders
CREATE POLICY "Admins can manage orders"
  ON orders FOR SELECT USING (
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid())
  );

CREATE POLICY "Admins can update orders"
  ON orders FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid())
  );

CREATE POLICY "Admins can delete orders"
  ON orders FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid())
  );

-- Order items: anyone can insert when creating an order; admins can read/manage
CREATE POLICY "Anyone can add order items"
  ON order_items FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view order items"
  ON order_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid())
  );

CREATE POLICY "Admins can update order items"
  ON order_items FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid())
  );

CREATE POLICY "Admins can delete order items"
  ON order_items FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid())
  );

-- Blog posts table (public read; admin write)
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  excerpt text DEFAULT '',
  content text DEFAULT '',
  image text DEFAULT '',
  category text DEFAULT '',
  author text DEFAULT 'K2 Traders Team',
  published_at date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view blog posts"
  ON blog_posts FOR SELECT USING (true);

CREATE POLICY "Admins can insert blog posts"
  ON blog_posts FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid())
  );

CREATE POLICY "Admins can update blog posts"
  ON blog_posts FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid())
  );

CREATE POLICY "Admins can delete blog posts"
  ON blog_posts FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid())
  );
