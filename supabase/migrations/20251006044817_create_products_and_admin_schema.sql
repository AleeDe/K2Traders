/*
  # E-commerce Database Schema with Admin Authentication

  ## Overview
  This migration creates a complete e-commerce database schema with:
  - Categories and products management
  - Admin authentication system
  - Secure Row Level Security policies

  ## New Tables

  ### `categories`
  - `id` (uuid, primary key) - Unique category identifier
  - `name` (text) - Category name
  - `description` (text) - Category description
  - `image` (text) - Category image URL
  - `icon` (text) - Category icon/emoji
  - `slug` (text, unique) - URL-friendly category identifier
  - `created_at` (timestamptz) - Record creation timestamp

  ### `products`
  - `id` (uuid, primary key) - Unique product identifier
  - `name` (text) - Product name
  - `category_id` (uuid, foreign key) - Reference to categories table
  - `price` (numeric) - Current selling price
  - `original_price` (numeric) - Original price before discount
  - `image` (text) - Product image URL (stored in Cloudinary)
  - `rating` (numeric) - Average product rating (0-5)
  - `reviews` (integer) - Number of reviews
  - `description` (text) - Detailed product description
  - `features` (text[]) - Array of product features
  - `in_stock` (boolean) - Stock availability
  - `featured` (boolean) - Whether product is featured
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Record update timestamp

  ### `admin_users`
  - `id` (uuid, primary key) - Admin user ID (no FK to auth.users)
  - `email` (text, unique) - Admin email
  - `created_at` (timestamptz) - Record creation timestamp

  ## Security

  ### Categories Table
  - RLS enabled
  - Public read access (anyone can view categories)
  - Only authenticated admins can insert, update, or delete

  ### Products Table
  - RLS enabled
  - Public read access (anyone can view products)
  - Only authenticated admins can insert, update, or delete

  ### Admin Users Table
  - RLS enabled
  - Only authenticated admins can view their own record
  - No public access

  ## Important Notes
  - All tables have RLS enabled for security
  - Admin operations require authentication
  - Public users can only read data
  - Image URLs point to Cloudinary CDN
*/

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  image text DEFAULT '',
  icon text DEFAULT '',
  slug text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  price numeric NOT NULL DEFAULT 0,
  original_price numeric NOT NULL DEFAULT 0,
  image text DEFAULT '',
  rating numeric DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  reviews integer DEFAULT 0,
  description text DEFAULT '',
  features text[] DEFAULT '{}',
  in_stock boolean DEFAULT true,
  featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create admin_users table (no foreign key to auth.users)
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY,
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Categories policies: Public read, admin write
CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  USING (true);

CREATE POLICY "Authenticated admins can insert categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Authenticated admins can update categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Authenticated admins can delete categories"
  ON categories FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Products policies: Public read, admin write
CREATE POLICY "Anyone can view products"
  ON products FOR SELECT
  USING (true);

CREATE POLICY "Authenticated admins can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Authenticated admins can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

CREATE POLICY "Authenticated admins can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Admin users policies: Admins can only view their own record
CREATE POLICY "Admins can view own record"
  ON admin_users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for products table
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Note: No seeding from auth.users to avoid any relationship with Auth