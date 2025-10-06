import React, { useState } from 'react';
import { X, Trash2, CheckCircle, ShoppingCart, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import toast from 'react-hot-toast';
import html2canvas from 'html2canvas';
import StripeCheckout from './StripeCheckout.jsx';

const formatPrice = (v) => `Rs ${(Number(v) || 0).toFixed(2)}`;

const CartDrawer = ({ open, onClose }) => {
  const { items, removeItem, updateItem, subtotal, clearCart } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleCheckout = (e) => {
    e.preventDefault();
    // We now create the order after successful payment via webhook.
  };

  const handleDownloadBill = async () => {
    const bill = document.getElementById('order-bill');
    if (!bill) return;
    const canvas = await html2canvas(bill);
    const link = document.createElement('a');
    link.download = 'order-bill.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className={`fixed inset-0 z-[100] ${open ? '' : 'pointer-events-none'}`}>
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-gradient-to-br from-green-100/60 via-white/80 to-emerald-100/60 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Panel */}
      <aside
        className={`
          fixed right-0 top-0 h-[100dvh] w-full sm:w-[420px] max-w-full bg-white/80 backdrop-blur-2xl shadow-2xl rounded-l-3xl
          transition-transform duration-500
          ${open ? 'translate-x-0' : 'translate-x-full'}
          flex flex-col
        `}
        style={{ boxShadow: '0 8px 32px 0 rgba(34,197,94,0.18)' }}
        aria-modal="true"
        role="dialog"
        tabIndex={-1}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5 bg-white rounded-tl-3xl">
          <div className="flex items-center gap-2">
            {showCheckout ? (
              <button
                
                className="rounded-full p-2 hover:bg-green-100 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
                aria-label="Back to cart"
              >
                <div onClick={() => {
                  setShowCheckout(false);
                  setSubmitted(false);
                  clearCart();
                }}>
                  <ArrowLeft className="h-5 w-5 text-green-600" />
                </div>
                
              </button>
            ) : (
              <div
                onClick={() => {
                  setShowCheckout(false);
                  setSubmitted(false);
                  
                }}
              >
                <ShoppingCart className="h-6 w-6 text-green-600" />
              </div>
            )}
            <h3 className="text-lg font-extrabold text-gray-900 tracking-tight drop-shadow-sm">
              {showCheckout ? 'Checkout' : 'Your Cart'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-rose-100 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
            aria-label="Close cart"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5 bg-white">
          {!showCheckout ? (
            items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <svg width="72" height="72" fill="none" className="mb-3">
                  <circle cx="36" cy="36" r="32" stroke="#bbf7d0" strokeWidth="6" />
                  <path d="M24 36h24M24 44h12" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" />
                </svg>
                <p className="text-xl font-semibold">Your cart is empty.</p>
              </div>
            ) : (
              <ul className="space-y-5">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="flex gap-4 rounded-2xl border border-gray-100 bg-white/95 p-4 shadow-lg hover:shadow-2xl transition-all group"
                  >
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center border border-green-100 shadow">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <ShoppingCart className="h-8 w-8 text-green-400" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-base font-bold text-gray-900">{item.name}</p>
                      <p className="mt-0.5 text-sm text-gray-500">{formatPrice(item.price)}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, e.target.value)}
                          className="w-20 rounded-lg border border-gray-300 px-2 py-1 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-500 transition"
                          aria-label="Quantity"
                        />
                        <button
                          onClick={() => removeItem(item.id)}
                          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 shadow-sm transition group-hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
                          title="Remove"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="text-right flex flex-col justify-between">
                      <p className="text-base font-bold text-gray-900">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )
          ) : (
            <div className="flex items-center justify-center min-h-full">
              <div className="w-full max-w-md mx-auto">
                {!submitted ? (
                  <form
                    className="space-y-5 bg-white/95 rounded-2xl shadow-lg p-6 border border-gray-100 animate-fade-in"
                    onSubmit={handleCheckout}

                  >
                    <h4 className="text-2xl font-extrabold text-gray-900 mb-2 text-center tracking-tight">
                      Shipping Details
                    </h4>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="Full Name"
                      value={form.name}
                      onChange={handleFormChange}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-500 transition"
                    />
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="Email"
                      value={form.email}
                      onChange={handleFormChange}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-500 transition"
                    />
                    <input
                      type="number"
                      name="phone"
                      required
                      placeholder="Phone"
                      value={form.phone}
                      onChange={handleFormChange}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-500 transition"
                    />
                    <textarea
                      name="address"
                      required
                      placeholder="Address"
                      value={form.address}
                      onChange={handleFormChange}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:ring-2 focus:ring-green-500 transition"
                    />
                    <div className="rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 p-3 text-sm text-gray-700 border border-gray-100">
                      <div className="mb-2 font-semibold">Order Summary</div>
                      {items.map((item) => (
                        <div key={item.id} className="flex justify-between">
                          <span>
                            {item.name} × {item.quantity}
                          </span>
                          <span>{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      ))}
                      <div className="mt-2 flex justify-between font-bold">
                        <span>Total</span>
                        <span>{formatPrice(subtotal)}</span>
                      </div>
                    </div>

                    <StripeCheckout
                      cart={items}
                      shipping={form}
                    />
                  </form>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full py-12 animate-fade-in" aria-live="polite">
                    {/* Bill UI */}
                    <div
                      id="order-bill"
                      className="relative w-full max-w-md mx-auto mb-6 rounded-2xl shadow-lg border border-green-200 bg-white/95 p-6 overflow-hidden"
                      style={{ fontFamily: 'monospace' }}
                    >
                      {/* Watermark */}
                      <div
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          fontSize: '3rem',
                          color: '#22c55e22',
                          fontWeight: 'bold',
                          pointerEvents: 'none',
                          userSelect: 'none',
                          zIndex: 0,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        K2Trader
                      </div>
                      <div className="relative z-10">
                        <h4 className="text-2xl font-extrabold text-green-700 mb-4 text-center tracking-wide border-b pb-2">Order Bill</h4>
                        <div className="mb-2 text-center text-xs text-gray-500">Bill ID: <span className="font-bold">{billId}</span></div>
                        <div className="mb-4">
                          <div className="font-bold text-gray-800 mb-1">Shipping Details:</div>
                          <div className="pl-2 text-gray-700 text-sm">
                            <div><span className="font-semibold">Name:</span> {form.name}</div>
                            <div><span className="font-semibold">Email:</span> {form.email}</div>
                            <div><span className="font-semibold">Phone:</span> {form.phone}</div>
                            <div><span className="font-semibold">Address:</span> {form.address}</div>
                          </div>
                        </div>
                        <div className="mb-4">
                          <div className="font-bold text-gray-800 mb-1">Cart Items:</div>
                          <table className="w-full text-sm border-collapse">
                            <thead>
                              <tr className="bg-green-50">
                                <th className="text-left py-1 px-2 font-semibold">Item</th>
                                <th className="text-center py-1 px-2 font-semibold">Qty</th>
                                <th className="text-right py-1 px-2 font-semibold">Price</th>
                                <th className="text-right py-1 px-2 font-semibold">Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {items.map((item) => (
                                <tr key={item.id} className="border-b last:border-none">
                                  <td className="py-1 px-2">{item.name}</td>
                                  <td className="py-1 px-2 text-center">{item.quantity}</td>
                                  <td className="py-1 px-2 text-right">{formatPrice(item.price)}</td>
                                  <td className="py-1 px-2 text-right font-semibold">{formatPrice(item.price * item.quantity)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div className="mt-2 flex justify-between font-bold text-lg border-t pt-2">
                          <span>Subtotal</span>
                          <span>{formatPrice(subtotal)}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleDownloadBill}
                      className="mb-4 rounded-xl bg-green-600 px-4 py-2 font-bold text-white shadow hover:bg-green-700 transition active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
                    >
                      Download Bill
                    </button>
                    <CheckCircle className="h-16 w-16 text-green-600 mb-4 animate-bounce" />
                    <div className="text-3xl font-extrabold text-green-700 mb-2">Order Placed!</div>
                    <div className="text-gray-600 text-center mb-4 text-lg">
                      Thank you for your order.<br />We’ll contact you soon.
                    </div>
                    <button
                      onClick={() => {
                        setShowCheckout(false);
                        setSubmitted(false);
                        clearCart();
                      }}
                      className="rounded-xl bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 px-6 py-3 font-bold text-white shadow hover:from-green-600 hover:to-emerald-600 transition active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
                    >
                      Back to Shop
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {!showCheckout && (
          <div className="border-t border-gray-100 px-6 py-5 bg-white/80 rounded-bl-3xl">
            <div className="flex items-center justify-between">
              <span className="text-base text-gray-600 font-semibold">Subtotal</span>
              <span className="text-xl font-extrabold text-gray-900">{formatPrice(subtotal)}</span>
            </div>
            <div className="mt-4 flex gap-3">
              <button
                onClick={clearCart}
                disabled={items.length === 0}
                className="w-1/2 rounded-xl border border-gray-200 px-4 py-2 font-bold text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
              >
                Clear
              </button>
              <button
                onClick={() => setShowCheckout(true)}
                disabled={items.length === 0}
                className="w-1/2 rounded-xl bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 px-4 py-2 font-bold text-white shadow hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 transition active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
              >
                Checkout
              </button>
            </div>
          </div>
        )}
      </aside>
      {/* Fade-in animation */}
      <style>{`
        .animate-fade-in {
          animation: fadeIn 0.5s cubic-bezier(.4,0,.2,1);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(16px);}
          to { opacity: 1; transform: none;}
        }
      `}</style>
    </div>
  );
};

export default CartDrawer;