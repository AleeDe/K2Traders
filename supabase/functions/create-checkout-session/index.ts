// Supabase Edge Function: create-checkout-session
// Creates a Stripe Checkout Session and returns the session URL for redirect

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

function buildCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('origin') || '*';
  return {
    'Access-Control-Allow-Origin': origin,
    'Vary': 'Origin',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
  };
}

interface CartItem {
  id: string;
  name: string;
  price: number; // assuming PKR; Stripe expects amounts in the smallest unit
  quantity: number;
  image?: string;
}

serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { ...corsHeaders } });
  }
  try {
    if (req.method === 'GET') {
      return new Response(
        JSON.stringify({ status: 'ok', message: 'Use POST to create a Stripe Checkout Session.' }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders } },
      );
    }
    if (req.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
    }

  const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');
  const PUBLIC_URL = Deno.env.get('PUBLIC_SITE_URL');

    if (!STRIPE_SECRET_KEY || !PUBLIC_URL) {
      return new Response(JSON.stringify({ error: 'Missing Stripe configuration' }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }

  const body = await req.json();
  const cart: CartItem[] = body?.cart || [];
  const shipping = body?.shipping || null;
  const orderId: string = crypto.randomUUID();
    const BASE_URL = (PUBLIC_URL || '').replace(/\/+$/, '');
    // safe URL builders to avoid accidental double slashes
    const buildUrl = (base: string, path: string, params: Record<string, string>) => {
      const url = new URL(path, base.endsWith('/') ? base : base + '/');
      for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
      return url.toString();
    };

    console.log('[create-checkout-session] incoming', {
      items: Array.isArray(cart) ? cart.length : 'n/a',
      orderId,
      PUBLIC_URL,
      BASE_URL,
    });

    if (!Array.isArray(cart) || cart.length === 0) {
      return new Response(JSON.stringify({ error: 'Cart is empty' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Build line items
    const line_items = cart.map((item) => ({
      price_data: {
        currency: 'pkr',
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : [],
        },
        unit_amount: Math.round((item.price || 0) * 100),
      },
      quantity: Math.max(1, item.quantity || 1),
    }));

    const stripe = new (await import('https://esm.sh/stripe@16?target=deno&dts')).default(STRIPE_SECRET_KEY, {
      apiVersion: '2024-06-20',
    });

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items,
      client_reference_id: orderId,
      payment_intent_data: {
        metadata: { order_id: orderId },
      },
  // Use root with query param to avoid server-side SPA rewrite requirements
  success_url: buildUrl(BASE_URL, '/', { order_id: orderId }),
  cancel_url: buildUrl(BASE_URL, '/shop', {}),
      metadata: {
        order_id: orderId,
        customer_name: shipping?.name ?? '',
        email: shipping?.email ?? '',
        phone: shipping?.phone ?? '',
        address: shipping?.address ?? '',
      },
    });

    console.log('[create-checkout-session] created', {
      sessionId: session.id,
      url: session.url,
      client_reference_id: (session as any).client_reference_id,
      metadata: (session as any).metadata,
      success_url: (session as any).success_url,
      cancel_url: (session as any).cancel_url,
    });

    return new Response(JSON.stringify({ url: session.url, id: session.id, order_id: orderId }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (err) {
    console.error('create-checkout-session error', err);
    return new Response(JSON.stringify({ error: 'Failed to create checkout session' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});
