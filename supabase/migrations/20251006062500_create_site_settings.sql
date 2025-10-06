/*
  # Site Settings and Company Info

  Stores site-wide configuration and branding content.
*/

CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text DEFAULT 'K2 Traders',
  tagline text DEFAULT 'Nature from the Peaks of Baltistan',
  description text DEFAULT '',
  contact_phone text DEFAULT '',
  contact_email text DEFAULT '',
  contact_address text DEFAULT '',
  social_facebook text DEFAULT '',
  social_instagram text DEFAULT '',
  social_whatsapp text DEFAULT '',
  hero_images text[] DEFAULT ARRAY[]::text[],
  brand_title text DEFAULT '',
  brand_content text DEFAULT '',
  brand_image text DEFAULT '',
  features jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Public can read settings
CREATE POLICY "Public can read site settings"
  ON site_settings FOR SELECT USING (true);

-- Only admins can insert/update/delete
CREATE POLICY "Admins can manage site settings"
  ON site_settings FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid())
  );

CREATE POLICY "Admins can update site settings"
  ON site_settings FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid())
  );

CREATE POLICY "Admins can delete site settings"
  ON site_settings FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid())
  );

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION site_settings_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_site_settings_updated ON site_settings;
CREATE TRIGGER trg_site_settings_updated
BEFORE UPDATE ON site_settings
FOR EACH ROW EXECUTE FUNCTION site_settings_set_updated_at();

-- Seed a default row if table is empty
INSERT INTO site_settings (
  name, tagline, description,
  contact_phone, contact_email, contact_address,
  social_facebook, social_instagram, social_whatsapp,
  hero_images, brand_title, brand_content, brand_image,
  features
) SELECT
  'K2 Traders',
  'Nature from the Peaks of Baltistan',
  'We bring you the purest treasures from the majestic valleys of Gilgit-Baltistan.',
  '+92 311 8634673', 'info@k2traders.com', 'Skardu, Gilgit-Baltistan, Pakistan',
  'https://facebook.com/k2traders', 'https://instagram.com/k2traders', 'https://wa.me/923118634673',
  ARRAY[
    'https://images.pexels.com/photos/1562/italian-landscape-mountains-nature.jpg',
    'https://images.pexels.com/photos/1915182/pexels-photo-1915182.jpeg',
    'https://images.pexels.com/photos/2387877/pexels-photo-2387877.jpeg'
  ],
  'From the Heart of the Himalayas',
  'Nestled in the breathtaking valleys of Gilgit-Baltistan... (editable in DB)',
  'https://images.pexels.com/photos/1562/italian-landscape-mountains-nature.jpg',
  '[{"title":"100% Natural & Organic","description":"All products are sourced from organic farms and wild harvesting","icon":"Leaf"},{"title":"Direct from Source","description":"We work directly with local farmers and artisans","icon":"Mountain"},{"title":"Sustainable Packaging","description":"Eco-friendly packaging that protects both product and planet","icon":"Package"},{"title":"Quality Guaranteed","description":"Every product undergoes strict quality checks","icon":"Shield"}]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM site_settings);
