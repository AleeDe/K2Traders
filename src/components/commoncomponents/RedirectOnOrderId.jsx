import { useEffect } from 'react';

export default function RedirectOnOrderId() {
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const orderId = url.searchParams.get('order_id');
      if (orderId) {
        const dest = new URL('/success', window.location.origin);
        dest.searchParams.set('order_id', orderId);
        // Replace so back button doesn’t go to the transitional URL
        window.location.replace(dest.toString());
      }
    } catch {}
  }, []);
  return null;
}
