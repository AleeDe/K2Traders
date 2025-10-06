import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useCallback,
  useRef
} from 'react';

const STORAGE_KEY = 'cart_v1';
const initialState = [];

/* Reducer: hydrate, add, remove, update, clear */
const reducer = (state, action) => {
  switch (action.type) {
    case 'hydrate':
      return Array.isArray(action.payload) ? action.payload : state;
    case 'add': {
      const { product, qty = 1 } = action.payload || {};
      if (!product) return state;
      const id = product.id ?? Date.now();
      const idx = state.findIndex((x) => String(x.id) === String(id));
      if (idx >= 0) {
        const next = [...state];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + Math.max(1, Number(qty) || 1) };
        return next;
      }
      const image =
        product.image || product.imageUrl || (Array.isArray(product.images) ? product.images[0] : null) || null;
      const name = product.name || product.title || 'Product';
      const price = Number(product.price) || 0;
      return [...state, { id, name, price, image, quantity: Math.max(1, Number(qty) || 1) }];
    }
    case 'remove': {
      const id = action.payload;
      return state.filter((x) => String(x.id) !== String(id));
    }
    case 'update': {
      const { id, qty } = action.payload || {};
      return state.map((x) =>
        String(x.id) === String(id) ? { ...x, quantity: Math.max(1, Number(qty) || 1) } : x
      );
    }
    case 'clear':
      return [];
    default:
      return state;
  }
};

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const saveTimer = useRef(null);

  // Hydrate from localStorage (once)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) dispatch({ type: 'hydrate', payload: parsed });
      }
    } catch {
      // ignore parse/storage errors
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced persist to localStorage
  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {
        // ignore quota errors
      }
    }, 250);
    return () => clearTimeout(saveTimer.current);
  }, [state]);

  // Stable callbacks
  const addItem = useCallback((product, qty = 1) => {
    if (!product) return;
    dispatch({ type: 'add', payload: { product, qty: Math.max(1, Number(qty) || 1) } });
  }, []);

  const removeItem = useCallback((id) => {
    dispatch({ type: 'remove', payload: id });
  }, []);

  const updateItem = useCallback((id, qty) => {
    dispatch({ type: 'update', payload: { id, qty: Math.max(1, Number(qty) || 1) } });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: 'clear' });
  }, []);

  const items = state;

  const count = useMemo(() => items.reduce((s, x) => s + (Number(x.quantity) || 0), 0), [items]);
  const subtotal = useMemo(
    () => items.reduce((s, x) => s + (Number(x.price) || 0) * (Number(x.quantity) || 0), 0),
    [items]
  );

  const value = useMemo(
    () => ({ items, addItem, removeItem, updateItem, clearCart, count, subtotal }),
    [items, addItem, removeItem, updateItem, clearCart, count, subtotal]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return ctx;
};