import React, { useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Search, Package, CheckCircle2, Truck, Loader2, XCircle, RefreshCw, ClipboardCopy } from 'lucide-react';

function StatusBadge({ status }) {
  const map = {
    paid: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    processing: 'bg-blue-100 text-blue-700 border-blue-200',
    shipped: 'bg-purple-100 text-purple-700 border-purple-200',
    cancelled: 'bg-red-100 text-red-700 border-red-200',
    refunded: 'bg-amber-100 text-amber-700 border-amber-200',
  };
  return <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border ${map[status] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>{status || 'unknown'}</span>;
}

export default function TrackOrder() {
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');

  const canSearch = useMemo(() => orderId.trim().length >= 6, [orderId]);

  const onSearch = async () => {
    setError('');
    setOrder(null);
    setItems([]);
    if (!canSearch) return;
    try {
      setLoading(true);
      const { data: o, error: oe } = await supabase
        .from('orders')
        .select('id, customer_name, email, subtotal, status, created_at, stripe_receipt_url')
        .eq('id', orderId.trim())
        .maybeSingle();
      if (oe) throw oe;
      if (!o) {
        setError('No order found with this ID.');
        return;
      }
      setOrder(o);
      const { data: its, error: ie } = await supabase
        .from('order_items')
        .select('name, price, quantity, total')
        .eq('order_id', o.id)
        .order('name');
      if (ie) throw ie;
      setItems(its || []);
    } catch (e) {
      setError(e.message || 'Failed to fetch order.');
    } finally {
      setLoading(false);
    }
  };

  const copyId = async () => {
    try { await navigator.clipboard.writeText(orderId.trim()); } catch {}
  };

  return (
    <div className="min-h-[70vh] bg-gradient-to-b from-emerald-50 to-white">
      <div className="container mx-auto px-4 pt-28 md:pt-32 pb-16">
        <div className="mx-auto max-w-3xl">
          {/* Title Card */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-accent)] to-[var(--color-primary-dark)] p-[1px] shadow-glow">
            <div className="rounded-2xl bg-white/90 backdrop-blur-md p-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-slate-900">Track your order</h1>
                  <p className="text-sm text-slate-600">Enter your Order ID to see its current status</p>
                </div>
              </div>

              {/* Search */}
              <div className="mt-5 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="e.g. 231fa5d3-06e5-477a-b76c-55c18f3d4a59"
                    className="w-full pl-9 pr-12 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
                  />
                  {orderId && (
                    <button onClick={() => setOrderId('')} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-600">
                      <XCircle className="h-5 w-5" />
                    </button>
                  )}
                </div>
                <button
                  onClick={onSearch}
                  disabled={!canSearch || loading}
                  className={`btn-gradient px-6 py-3 rounded-xl ${(!canSearch || loading) ? 'opacity-60 cursor-not-allowed' : 'hover:scale-[1.01] active:scale-95 transition-transform'} w-full sm:w-auto`}
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Track Order'}
                </button>
                <button onClick={copyId} className="inline-flex sm:inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-3 hover:bg-slate-50 w-full sm:w-auto">
                  <ClipboardCopy className="h-5 w-5" /> Copy ID
                </button>
              </div>
              {!!error && <p className="mt-3 text-sm text-red-600">{error}</p>}
            </div>
          </div>

          {/* Result */}
          {order && (
            <div className="mt-6 rounded-2xl bg-white shadow-lg ring-1 ring-black/5 p-6">
              <div className="flex flex-wrap items-start gap-4">
                <div className="flex-1">
                  <div className="text-sm text-slate-500">Order</div>
                  <div className="font-mono text-sm">{order.id}</div>
                  <div className="text-sm text-slate-500">Placed {new Date(order.created_at).toLocaleString()}</div>
                </div>
                <StatusBadge status={order.status} />
              </div>

              {/* Timeline */}
              <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`rounded-xl border p-4 ${['paid','processing','shipped','refunded','cancelled'].includes(order.status) ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-white'}`}>
                  <div className="flex items-center gap-2 font-semibold"><CheckCircle2 className="text-emerald-600" /> Paid</div>
                  <p className="text-sm text-slate-600 mt-1">Payment received</p>
                </div>
                <div className={`rounded-xl border p-4 ${['processing','shipped'].includes(order.status) ? 'border-blue-200 bg-blue-50' : 'border-slate-200 bg-white'}`}>
                  <div className="flex items-center gap-2 font-semibold text-blue-700"><RefreshCw className="text-blue-600" /> Processing</div>
                  <p className="text-sm text-slate-600 mt-1">Preparing your order</p>
                </div>
                <div className={`rounded-xl border p-4 ${order.status === 'shipped' ? 'border-purple-200 bg-purple-50' : 'border-slate-200 bg-white'}`}>
                  <div className="flex items-center gap-2 font-semibold text-purple-700"><Truck className="text-purple-600" /> Shipped</div>
                  <p className="text-sm text-slate-600 mt-1">On the way</p>
                </div>
              </div>

              {/* Items */}
              <div className="mt-6 overflow-hidden rounded-xl border">
                {/* Desktop table */}
                <table className="hidden sm:table min-w-full divide-y divide-gray-200">
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
                      <tr><td className="px-4 py-6 text-center text-gray-500" colSpan={4}>No items found</td></tr>
                    )}
                    {items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-3 text-sm">{it.name}</td>
                        <td className="px-4 py-3 text-right text-sm text-gray-600">Rs. {Number(it.price || 0).toFixed(0)}</td>
                        <td className="px-4 py-3 text-right text-sm text-gray-600">{it.quantity}</td>
                        <td className="px-4 py-3 text-right text-sm font-medium">Rs. {Number(it.total || 0).toFixed(0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {/* Mobile list */}
                <div className="sm:hidden bg-white">
                  {items.length === 0 ? (
                    <div className="px-4 py-6 text-center text-gray-500">No items found</div>
                  ) : (
                    <ul className="divide-y">
                      {items.map((it, idx) => (
                        <li key={idx} className="p-4">
                          <div className="font-medium">{it.name}</div>
                          <div className="mt-1 flex justify-between text-sm text-gray-600"><span>Price</span><span>Rs. {Number(it.price || 0).toFixed(0)}</span></div>
                          <div className="mt-1 flex justify-between text-sm text-gray-600"><span>Qty</span><span>{it.quantity}</span></div>
                          <div className="mt-2 flex justify-between text-sm font-semibold"><span>Total</span><span>Rs. {Number(it.total || 0).toFixed(0)}</span></div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
