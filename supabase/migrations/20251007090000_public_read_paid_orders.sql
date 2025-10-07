-- Public read for paid orders and their items so the Success page can render without auth

-- Orders: allow SELECT when status is 'paid'
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'orders' AND policyname = 'Public can read paid orders'
  ) THEN
    CREATE POLICY "Public can read paid orders"
      ON orders FOR SELECT
      USING (status = 'paid');
  END IF;
END $$;

-- Order items: allow SELECT when parent order is 'paid'
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'order_items' AND policyname = 'Public can read items for paid orders'
  ) THEN
    CREATE POLICY "Public can read items for paid orders"
      ON order_items FOR SELECT
      USING (EXISTS (
        SELECT 1 FROM orders o WHERE o.id = order_items.order_id AND o.status = 'paid'
      ));
  END IF;
END $$;
