import { useState } from 'react';
import { CreditCard, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

export default function StripeCheckout({ cart, shipping }) {
  const [loading, setLoading] = useState(false);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    setLoading(true);

    try {
      // Call Edge Function directly to avoid Authorization header on preflight
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const resp = await fetch(`${supabaseUrl}/functions/v1/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart, shipping }),
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(data?.error || 'Failed to create checkout session');
      if (!data?.url) throw new Error('Missing checkout session URL');

  // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (error) {
      toast.error('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
      <div className="flex items-center gap-2 mb-6">
        <CreditCard className="text-blue-600" size={24} />
        <h3 className="text-xl font-bold text-slate-900">Secure Checkout</h3>
      </div>

      <div className="space-y-4 mb-6">
        <div className="flex justify-between text-slate-600">
          <span>Subtotal</span>
          <span className="font-semibold">Rs. {total.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>Shipping</span>
          <span className="font-semibold">Free</span>
        </div>
        <div className="border-t border-slate-200 pt-4 flex justify-between text-lg font-bold text-slate-900">
          <span>Total</span>
          <span>Rs. {total.toFixed(2)}</span>
        </div>
      </div>

      <button
        onClick={handleCheckout}
        disabled={loading || cart.length === 0}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            Processing...
          </>
        ) : (
          <>
            <Lock size={18} />
            Pay Rs. {total.toFixed(2)}
          </>
        )}
      </button>

      <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
        <Lock size={14} />
        <span>Secured by Stripe</span>
      </div>
    </div>
  );
}
