/*
  # Seed Initial Categories and Products

  This migration seeds the database with initial categories and products from the existing static data.

  ## Categories Seeded
  - Dried Fruits & Nuts
  - Natural Oils & Honey
  - Fresh Fruits
  - Nuts & Seeds
  - Snacks & Sweets
  - Jams & Juices
  - Nut Butters & Kernels
  - Mountain Specialties

  ## Products Seeded
  - 35 products across all categories with complete information
*/

-- Insert categories (only if they don't exist)
INSERT INTO categories (name, description, image, icon, slug)
VALUES
  ('Dried Fruits & Nuts', 'Sun-dried fruits and wild mountain nuts', 'https://images.pexels.com/photos/1295572/pexels-photo-1295572.jpeg', '🍇', 'dry-fruits'),
  ('Natural Oils & Honey', 'Wild honey and mountain herb teas', 'https://images.pexels.com/photos/1638240/pexels-photo-1638240.jpeg', '🍯', 'natural-oils-honey'),
  ('Fresh Fruits', 'Seasonal fruits from high‑altitude orchards', 'https://images.pexels.com/photos/102104/pexels-photo-102104.jpeg', '🍒', 'fresh-fruits'),
  ('Nuts & Seeds', 'Crunchy, nutrient-dense nuts and seeds', 'https://images.pexels.com/photos/14146/pexels-photo-14146.jpeg', '🥜', 'nuts-seeds'),
  ('Snacks & Sweets', 'Natural energy bars, candies, and regional treats', 'https://images.pexels.com/photos/461430/pexels-photo-461430.jpeg', '🍬', 'snacks-sweets'),
  ('Jams & Juices', 'Small-batch fruit jams and cold-pressed juices', 'https://images.pexels.com/photos/302680/pexels-photo-302680.jpeg', '🧃', 'jams-juices'),
  ('Nut Butters & Kernels', 'Creamy spreads and raw edible kernels', 'https://images.pexels.com/photos/1352278/pexels-photo-1352278.jpeg', '🥜', 'nut-butters-seeds'),
  ('Mountain Specialties', 'Rare regional wellness resins and superfoods', 'https://images.pexels.com/photos/753873/pexels-photo-753873.jpeg', '✨', 'specialties')
ON CONFLICT (slug) DO NOTHING;

-- Insert products (sample - you can add more)
INSERT INTO products (name, category_id, price, original_price, image, rating, reviews, description, features, in_stock, featured)
SELECT
  'Kilao Special (Walnuts)',
  (SELECT id FROM categories WHERE slug = 'dry-fruits'),
  1450,
  2050,
  'https://cdn.shopify.com/s/files/1/0949/2876/5206/files/Kilao_Walnut.png?v=1756592477',
  4.9,
  112,
  'A cherished Baltistan delicacy featuring hand-cracked walnuts slowly dipped in sun-cooked mulberry syrup for a deep, caramel-like sweetness. Each bite balances natural nuttiness with a glossy, fruity glaze, made without chemicals or artificial additives. Perfect with tea, as a dessert topper, or as a festive gift.',
  ARRAY['Handmade', 'No Chemicals', 'Rich in Antioxidants', 'Energy Boost'],
  true,
  true
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Kilao Special (Walnuts)');

INSERT INTO products (name, category_id, price, original_price, image, rating, reviews, description, features, in_stock, featured)
SELECT
  'Baltistan Dry Fruit Mix',
  (SELECT id FROM categories WHERE slug = 'dry-fruits'),
  1500,
  2150,
  'https://cdn.shopify.com/s/files/1/0949/2876/5206/files/BALTISTAN_MIX_DRY_FRUITS.png?v=1756592600',
  4.8,
  98,
  'A balanced, premium mix of almonds, walnuts, raisins, figs, and pistachios curated for daily energy and clean nutrition. Sourced from Baltistan high-altitude orchards and handled hygienically to preserve natural oils, crunch, and sweetness. Ideal for snacking, breakfast bowls, and on-the-go fuel.',
  ARRAY['Locally Grown', 'Hygienic', 'Protein Rich', 'Supports Immunity'],
  true,
  false
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Baltistan Dry Fruit Mix');