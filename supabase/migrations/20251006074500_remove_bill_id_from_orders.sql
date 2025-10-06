-- Remove bill_id from orders and related index
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_orders_bill_id'
  ) THEN
    DROP INDEX public.idx_orders_bill_id;
  END IF;
EXCEPTION WHEN others THEN
  -- ignore
END $$;

ALTER TABLE public.orders
  DROP COLUMN IF EXISTS bill_id;
