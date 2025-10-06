-- Add receipt URL to orders to link Stripe hosted receipt
alter table public.orders
add column if not exists stripe_receipt_url text;

-- Optional: index for quick lookup by payment intent
create index if not exists idx_orders_stripe_payment_intent on public.orders(stripe_payment_intent);
