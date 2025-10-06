import { supabase } from '../lib/supabase';

// placeOrder inserts an order and its items into Supabase
// input: { billId, customer, items, subtotal }
// - customer: { name, email, phone, address }
// - items: [{ id (product_id), name, price, quantity }]
export async function placeOrder({ customer, items, subtotal }) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Cart is empty');
  }

  // Insert order
  const { data: orderRows, error: orderError } = await supabase
    .from('orders')
    .insert({
      customer_name: customer?.name || '',
      email: customer?.email || '',
      phone: customer?.phone || '',
      address: customer?.address || '',
      subtotal: Number(subtotal || 0) || 0,
      status: 'pending',
    })
    .select('id')
    .limit(1);

  if (orderError) throw orderError;
  const orderId = orderRows?.[0]?.id;
  if (!orderId) throw new Error('Failed to create order');

  // Insert order items
  const orderItems = items.map((it) => ({
    order_id: orderId,
    product_id: it.id ?? null,
    name: it.name,
    price: Number(it.price || 0) || 0,
    quantity: Number(it.quantity || 1) || 1,
    total: Number((it.price || 0) * (it.quantity || 1)) || 0,
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);

  if (itemsError) throw itemsError;

  return { orderId };
}
