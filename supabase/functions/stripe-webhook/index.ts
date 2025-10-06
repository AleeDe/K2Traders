// Supabase Edge Function: stripe-webhook
// Verifies webhooks and writes orders and order_items when payment succeeds

import { serve } from "https://deno.land/std@0.192.0/http/server.ts";

serve(async (req: Request) => {
  try {
    if (req.method === 'GET') {
      return new Response(JSON.stringify({ status: 'ok', message: 'Stripe webhook live' }), { headers: { 'Content-Type': 'application/json' } });
    }
    if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');
  const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  // Avoid reserved prefix names in Supabase dashboard: prefer PROJECT_URL and SERVICE_ROLE_KEY
  const SUPABASE_URL = Deno.env.get('PROJECT_URL') || Deno.env.get('SUPABASE_URL');
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const WEBHOOK_TEST_MODE = Deno.env.get('WEBHOOK_TEST_MODE') || '';
    const WEBHOOK_TEST_TOKEN = Deno.env.get('WEBHOOK_TEST_TOKEN') || '';

    if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ error: 'Missing server configuration' }), { status: 400 });
    }

    const stripe = new (await import('https://esm.sh/stripe@16?target=deno&dts')).default(STRIPE_SECRET_KEY, {
      apiVersion: '2024-06-20',
    });

    const sig = req.headers.get('stripe-signature') || '';
    const rawBody = await req.text();

    // Insecure test mode (for local/manual testing only):
    // Enable by setting WEBHOOK_TEST_MODE=insecure and WEBHOOK_TEST_TOKEN to a secret value,
    // then send header x-test-secret=<same token>. This bypasses Stripe signature validation.
    if (WEBHOOK_TEST_MODE === 'insecure' && WEBHOOK_TEST_TOKEN && req.headers.get('x-test-secret') === WEBHOOK_TEST_TOKEN) {
      try {
        const testBody = JSON.parse(rawBody || '{}');
        const type = (req.headers.get('x-test-event-type') || testBody?.type || 'checkout.session.completed') as string;
        console.log('[webhook][insecure-test] type', type);

        const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.45.4');
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

        if (type === 'checkout.session.completed') {
          const session: any = testBody;
          const orderIdFromMeta = session?.metadata?.order_id || session?.client_reference_id || null;
          const subtotal = (session?.amount_total ?? 0) / 100;
          const customerName = session?.customer_details?.name || session?.metadata?.customer_name || 'Customer';
          const customerEmail = session?.customer_details?.email || session?.metadata?.email || null;
          const stripeSessionId = session?.id || null;
          const paymentIntentId = typeof session?.payment_intent === 'string' ? session.payment_intent : (session?.payment_intent?.id || null);
          const lineItems = Array.isArray(session?.line_items) ? session.line_items : [];

          const { data: existing } = await supabase
            .from('orders')
            .select('id')
            .eq('id', orderIdFromMeta)
            .maybeSingle();

          let orderId: string | null = null;
          if (existing?.id) {
            const { data: updated } = await supabase
              .from('orders')
              .update({
                customer_name: session?.metadata?.customer_name ?? customerName,
                email: session?.metadata?.email ?? customerEmail,
                phone: session?.metadata?.phone ?? null,
                address: session?.metadata?.address ?? null,
                subtotal,
                status: 'paid',
                stripe_session_id: stripeSessionId,
                stripe_payment_intent: paymentIntentId,
              })
              .eq('id', existing.id)
              .select('id')
              .single();
            orderId = updated?.id ?? existing.id;
          } else {
            const { data: inserted } = await supabase
              .from('orders')
              .insert({
                id: orderIdFromMeta || undefined,
                customer_name: session?.metadata?.customer_name ?? customerName,
                email: session?.metadata?.email ?? customerEmail,
                phone: session?.metadata?.phone ?? null,
                address: session?.metadata?.address ?? null,
                subtotal,
                status: 'paid',
                stripe_session_id: stripeSessionId,
                stripe_payment_intent: paymentIntentId,
              })
              .select('id')
              .single();
            orderId = inserted?.id ?? null;
          }

          if (orderId && lineItems.length) {
            await supabase.from('order_items').delete().eq('order_id', orderId);
            const items = lineItems.map((li: any) => ({
              order_id: orderId,
              product_id: null,
              name: li.description || li.name || 'Item',
              price: ((li.price?.unit_amount ?? li.unit_amount ?? 0) / 100),
              quantity: li.quantity ?? 1,
              total: ((li.amount_total ?? (li.quantity ?? 1) * (li.price?.unit_amount ?? li.unit_amount ?? 0)) / 100),
            }));
            await supabase.from('order_items').insert(items);
          }
        } else if (type === 'payment_intent.succeeded') {
          const pi: any = testBody;
          const orderIdFromMeta = pi?.metadata?.order_id || null;
          if (orderIdFromMeta) {
            await supabase
              .from('orders')
              .update({ status: 'paid', stripe_payment_intent: typeof pi?.id === 'string' ? pi.id : null })
              .eq('id', orderIdFromMeta);
          }
        }
        return new Response(JSON.stringify({ received: true, mode: 'insecure-test' }), { headers: { 'Content-Type': 'application/json' } });
      } catch (err) {
        console.error('[webhook][insecure-test] error', err);
        return new Response(JSON.stringify({ error: 'Insecure test failed' }), { status: 400 });
      }
    }

    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(rawBody, sig, STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      console.error('Webhook signature verification failed', err);
      return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 400 });
    }
    console.log('[webhook] event', { type: event.type });

  if (event.type === 'checkout.session.completed') {
  const session = event.data.object as any;
  const orderIdFromMeta = session?.metadata?.order_id || session?.client_reference_id || null;
  console.log('[webhook] checkout.session.completed', { sessionId: session.id, orderIdFromMeta, meta: session?.metadata, clientRef: session?.client_reference_id });

      // Retrieve full session to ensure we have payment_intent/customer details populated
      const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ['payment_intent'] as any,
      });

      // Optional: retrieve line items for details
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
  console.log('[webhook] line items', lineItems?.data?.length ?? 0);

      // Insert into Supabase using service role
      const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.45.4');
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

      const subtotal = (fullSession.amount_total ?? session.amount_total ?? 0) / 100;
      const customerName = fullSession.customer_details?.name ?? session.customer_details?.name ?? 'Customer';
      const customerEmail = fullSession.customer_details?.email ?? session.customer_details?.email ?? null;
      const stripeSessionId = fullSession.id ?? session.id;
      const paymentIntentId = typeof fullSession.payment_intent === 'string'
        ? fullSession.payment_intent
        : fullSession.payment_intent?.id ?? (typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id ?? null);
      // Try to get Stripe hosted receipt URL from the latest charge of the PaymentIntent
      let receiptUrl: string | null = null;
      try {
        if (paymentIntentId) {
          const piFull = await stripe.paymentIntents.retrieve(paymentIntentId as string, {
            expand: ['latest_charge'] as any,
          });
          const latestCharge: any = (piFull as any)?.latest_charge;
          receiptUrl = latestCharge?.receipt_url ?? null;
        }
      } catch (e) {
        console.warn('[webhook] could not fetch receipt_url', e);
      }
      console.log('[webhook] session details', { stripeSessionId, paymentIntentId, subtotal, receiptUrl });

      // Try to find by explicit order id from metadata/client_reference
      const { data: existing, error: findErr } = await supabase
        .from('orders')
        .select('id')
        .eq('id', orderIdFromMeta)
        .maybeSingle();
  if (findErr) console.error('Find existing order error', findErr);

      let orderId: string | null = null;
      if (existing?.id) {
        const { data: updated, error: updateErr } = await supabase
          .from('orders')
          .update({
            customer_name: fullSession.metadata?.customer_name ?? customerName,
            email: fullSession.metadata?.email ?? customerEmail,
            subtotal,
            status: 'paid',
            stripe_session_id: stripeSessionId,
            stripe_payment_intent: paymentIntentId,
            stripe_receipt_url: receiptUrl,
          })
          .eq('id', existing.id)
          .select('id')
          .single();
        if (updateErr) console.error('Update existing order error', updateErr);
        orderId = updated?.id ?? existing.id;
      } else {
        // Insert order using metadata + calculated fields
        const { data: inserted, error: insertErr } = await supabase
          .from('orders')
          .insert({
            id: orderIdFromMeta || undefined,
            customer_name: fullSession.metadata?.customer_name ?? customerName,
            email: fullSession.metadata?.email ?? customerEmail,
            phone: fullSession.metadata?.phone ?? null,
            address: fullSession.metadata?.address ?? null,
            subtotal,
            status: 'paid',
            stripe_session_id: stripeSessionId,
            stripe_payment_intent: paymentIntentId,
            stripe_receipt_url: receiptUrl,
          })
          .select('id')
          .single();
        if (insertErr) console.error('Insert new order error', insertErr);
        orderId = inserted?.id ?? null;
      }

      if (orderId && lineItems?.data?.length) {
        // Replace any existing order_items for idempotency
        const { error: delErr } = await supabase.from('order_items').delete().eq('order_id', orderId);
  if (delErr) console.error('Delete existing order_items error', delErr);

        const items = lineItems.data.map((li: any) => ({
          order_id: orderId,
          product_id: null,
          name: li.description,
          price: (li.price?.unit_amount ?? 0) / 100,
          quantity: li.quantity ?? 1,
          total: (li.amount_total ?? 0) / 100,
        }));
        const { error: itemsErr } = await supabase.from('order_items').insert(items);
        if (itemsErr) console.error('Insert order_items error', itemsErr);
      }
    }

    // Fallback: handle payment_intent.succeeded as well in case checkout event is missed or missing metadata
    if (event.type === 'payment_intent.succeeded') {
      const pi = event.data.object as any;
      const orderIdFromMeta = pi?.metadata?.order_id || null;
      console.log('[webhook] payment_intent.succeeded', { paymentIntentId: pi?.id, orderIdFromMeta, metadata: pi?.metadata });

      const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.45.4');
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

      if (orderIdFromMeta) {
        const { error: updateErr } = await supabase
          .from('orders')
          .update({
            status: 'paid',
            stripe_payment_intent: typeof pi.id === 'string' ? pi.id : null,
          })
          .eq('id', orderIdFromMeta);
        if (updateErr) console.error('Update order from payment_intent.succeeded error', updateErr);
      }
    }

    return new Response(JSON.stringify({ received: true }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('stripe-webhook error', err);
    return new Response(JSON.stringify({ error: 'Webhook processing failed' }), { status: 500 });
  }
});
