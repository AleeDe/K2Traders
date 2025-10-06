-- Add Stripe fields to orders to store mapping
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS stripe_session_id text,
  ADD COLUMN IF NOT EXISTS stripe_payment_intent text;

-- Index for quick lookup if needed
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session ON orders(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_orders_bill_id ON orders(bill_id);
