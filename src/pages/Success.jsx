import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

function formatCurrencyPKR(n) {
  const num = Number(n || 0);
  return new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(num);
}

export default function Success() {
  const [params] = useSearchParams();
  const orderId = params.get('order_id');
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        if (!orderId) {
          setError('Missing order id in URL.');
          setLoading(false);
          return;
        }
        const { data: orderData, error: oErr } = await supabase
          .from('orders')
          .select('id, customer_name, email, subtotal, status, created_at, stripe_receipt_url')
          .eq('id', orderId)
          .maybeSingle();
        if (oErr) throw oErr;
        setOrder(orderData);

        const { data: itemsData, error: iErr } = await supabase
          .from('order_items')
          .select('name, price, quantity, total')
          .eq('order_id', orderId)
          .order('name');
        if (iErr) throw iErr;
        setItems(itemsData || []);
      } catch (e) {
        setError(e.message || 'Failed to load order.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [orderId]);

  const itemTotal = useMemo(() => items.reduce((sum, it) => sum + Number(it.total || 0), 0), [items]);
  const createdAt = useMemo(() => (order?.created_at ? new Date(order.created_at) : null), [order]);

  const copyOrderId = async () => {
    try { await navigator.clipboard.writeText(order?.id || ''); } catch {}
  };
  const printInvoice = () => window.print();

  if (loading) {
    return (
      <div className="container mx-auto p-6 animate-pulse">
        <div className="h-10 w-64 bg-gray-200 rounded mb-4" />
        <div className="h-64 w-full bg-gray-100 rounded" />
      </div>
    );
  }
  if (error) return <div className="container mx-auto p-6 text-red-600">{error}</div>;
  if (!order) return <div className="container mx-auto p-6">Order not found.</div>;

  return (
    <div className="min-h-[70vh] bg-gradient-to-b from-emerald-50 to-white">
      {/* Print-only styles to isolate invoice */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #invoice, #invoice * { visibility: visible; }
          #invoice { position: absolute; inset: 0; padding: 0 !important; }
          a[href]:after { content: "" !important; }
        }
      `}</style>

      <div className="container mx-auto px-4 py-10">
        {/* Header */}
        <div className="mx-auto max-w-4xl">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 p-[1px] shadow-lg">
            <div className="rounded-2xl bg-white">
              <div className="flex items-center gap-4 p-6">
                {/* Animated check */}
                <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                  <svg className="h-7 w-7 text-emerald-600 animate-[pop_300ms_ease-out]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                </span>
                <div>
                  <h1 className="text-xl sm:text-2xl font-semibold">Payment successful</h1>
                  <p className="text-sm text-gray-500">Thanks {order.customer_name || 'there'}! Your order is confirmed.</p>
                </div>
                <div className="ml-auto">
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700 border border-emerald-200">
                    {order.status || 'paid'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice */}
        <section id="invoice" className="mx-auto mt-6 max-w-4xl rounded-2xl bg-white shadow-lg ring-1 ring-black/5">
          <header className="flex flex-wrap items-start gap-4 border-b px-6 py-5">
            <div>
              <h2 className="text-lg font-semibold">Invoice</h2>
              <p className="text-sm text-gray-500">Order #{order.id?.slice(0, 8)} • {createdAt ? createdAt.toLocaleString() : ''}</p>
            </div>
            <div className="ml-auto text-right">
              <div className="text-sm text-gray-500">Billed to</div>
              <div className="font-medium">{order.customer_name || 'Customer'}</div>
              <div className="text-sm text-gray-500">{order.email || '-'}</div>
            </div>
          </header>

          <div className="px-6 py-5">
            <div className="overflow-hidden rounded-xl border">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Item</th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Price</th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Qty</th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-gray-500">No items found for this order.</td>
                    </tr>
                  )}
                  {items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-3 text-sm">{it.name}</td>
                      <td className="px-4 py-3 text-right text-sm text-gray-600">{formatCurrencyPKR(it.price)}</td>
                      <td className="px-4 py-3 text-right text-sm text-gray-600">{it.quantity}</td>
                      <td className="px-4 py-3 text-right text-sm font-medium">{formatCurrencyPKR(it.total)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan={3} className="px-4 py-3 text-right text-sm font-medium">Subtotal</td>
                    <td className="px-4 py-3 text-right text-sm font-semibold">{formatCurrencyPKR(itemTotal || order.subtotal)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              {order.stripe_receipt_url && (
                <a
                  href={order.stripe_receipt_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16l4-2 4 2 4-2 4 2V8z"/></svg>
                  Download Stripe Receipt
                </a>
              )}
              <button onClick={printInvoice} className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 hover:bg-gray-50">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v8H6z"/></svg>
                Print invoice
              </button>
              <button onClick={copyOrderId} className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 hover:bg-gray-50">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                Copy order ID
              </button>
              <Link to="/shop" className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 hover:bg-gray-50">Continue shopping</Link>
            </div>
          </div>
        </section>

        <p className="mx-auto mt-6 max-w-4xl text-center text-sm text-gray-500">
          Keep this page for your records. You can revisit it later using this link.
        </p>
      </div>
    </div>
  );
}
