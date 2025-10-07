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

-- Public can read orders that came from Stripe and are beyond 'new' (for tracking)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'orders' AND policyname = 'Public can read Stripe orders for tracking'
  ) THEN
    CREATE POLICY "Public can read Stripe orders for tracking"
      ON orders FOR SELECT
      USING (
        stripe_payment_intent IS NOT NULL AND status IN ('paid','processing','shipped','cancelled','refunded')
      );
  END IF;
END $$;

-- Items for those same trackable orders
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'order_items' AND policyname = 'Public can read items for trackable orders'
  ) THEN
    CREATE POLICY "Public can read items for trackable orders"
      ON order_items FOR SELECT
      USING (EXISTS (
        SELECT 1 FROM orders o WHERE o.id = order_items.order_id AND o.stripe_payment_intent IS NOT NULL AND o.status IN ('paid','processing','shipped','cancelled','refunded')
      ));
  END IF;
END $$;
