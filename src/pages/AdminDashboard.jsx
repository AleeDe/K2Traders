import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { LogOut, Plus, CreditCard as Edit2, Trash2, Package, BarChart3, Search, RefreshCw, ExternalLink, CheckCircle, Calendar, DollarSign, ClipboardList, FileText, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import ProductForm from '../components/admin/ProductForm';

export default function AdminDashboard() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [activeTab, setActiveTab] = useState('products'); // products | orders | analytics

  // Blog state
  const [blogPosts, setBlogPosts] = useState([]);
  const [blogLoading, setBlogLoading] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [blogForm, setBlogForm] = useState({
    title: '',
    excerpt: '',
    content: '',
    image: '',
    category: '',
    author: 'K2 Traders Team',
    published_at: new Date().toISOString().slice(0,10),
  });

  // Category create form
  const [catForm, setCatForm] = useState({ name: '', slug: '', description: '', image: '', icon: '' });
  const [editingCategory, setEditingCategory] = useState(null);

  // Orders state
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderQuery, setOrderQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  // Analytics state
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analytics, setAnalytics] = useState({
    today: { revenue: 0, orders: 0 },
    month: { revenue: 0, orders: 0 },
    year: { revenue: 0, orders: 0 },
    last7days: [], // [{date, revenue}]
    topItems: [], // [{name, revenue, qty}]
  });

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate('/admin/login');
    }
  }, [user, isAdmin, loading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
      fetchOrders();
      fetchAnalytics();
      fetchBlogPosts();
    }
  }, [isAdmin]);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        supabase.from('products').select('*, categories(name)').order('created_at', { ascending: false }),
        supabase.from('categories').select('*').order('name'),
      ]);

      if (productsRes.error) throw productsRes.error;
      if (categoriesRes.error) throw categoriesRes.error;

      setProducts(productsRes.data || []);
      setCategories(categoriesRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoadingData(false);
    }
  };

  const fetchBlogPosts = async () => {
    try {
      setBlogLoading(true);
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('published_at', { ascending: false })
        .limit(200);
      if (error) throw error;
      setBlogPosts(data || []);
    } catch (e) {
      console.error('Error loading blog posts', e);
      toast.error('Failed to load blog posts');
    } finally {
      setBlogLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('id, customer_name, email, subtotal, status, created_at, stripe_receipt_url')
        .order('created_at', { ascending: false })
        .limit(300);
      if (error) throw error;
      setOrders(data || []);
    } catch (e) {
      console.error('Error loading orders', e);
      toast.error('Failed to load orders');
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      // Pull paid orders since start of year, compute client-side
      const startOfYear = new Date(new Date().getFullYear(), 0, 1).toISOString();
      const { data: paidOrders, error } = await supabase
        .from('orders')
        .select('id, subtotal, created_at')
        .gte('created_at', startOfYear)
        .eq('status', 'paid')
        .order('created_at', { ascending: true });
      if (error) throw error;
      const ordersData = paidOrders || [];

      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfLast7 = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);

      const sum = (arr) => arr.reduce((s, x) => s + Number(x.subtotal || 0), 0);
      const count = (arr) => arr.length;

      const todayOrders = ordersData.filter(o => new Date(o.created_at) >= startOfToday);
      const monthOrders = ordersData.filter(o => new Date(o.created_at) >= startOfMonth);
      const yearOrders = ordersData; // already start of year

      // Last 7 days revenue series
      const series = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(startOfLast7.getTime());
        d.setDate(startOfLast7.getDate() + i);
        const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        const nextDay = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
        const dayOrders = ordersData.filter(o => {
          const t = new Date(o.created_at);
          return t >= dayStart && t < nextDay;
        });
        return { date: d, revenue: sum(dayOrders) };
      });

      // Top items by revenue for year: need order_items for these orders
      let topItems = [];
      const orderIds = yearOrders.map(o => o.id);
      if (orderIds.length) {
        const chunk = (arr, size) => arr.reduce((acc, _, i) => (i % size ? acc : [...acc, arr.slice(i, i + size)]), []);
        const chunks = chunk(orderIds, 200);
        const results = [];
        for (const ch of chunks) {
          const { data: itemsData, error: itemsErr } = await supabase
            .from('order_items')
            .select('name, quantity, total, order_id')
            .in('order_id', ch);
          if (itemsErr) throw itemsErr;
          results.push(...(itemsData || []));
        }
        const map = new Map();
        for (const it of results) {
          const key = it.name || 'Item';
          const prev = map.get(key) || { name: key, revenue: 0, qty: 0 };
          prev.revenue += Number(it.total || 0);
          prev.qty += Number(it.quantity || 0);
          map.set(key, prev);
        }
        topItems = Array.from(map.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
      }

      setAnalytics({
        today: { revenue: sum(todayOrders), orders: count(todayOrders) },
        month: { revenue: sum(monthOrders), orders: count(monthOrders) },
        year: { revenue: sum(yearOrders), orders: count(yearOrders) },
        last7days: series,
        topItems,
      });
    } catch (e) {
      console.error('Error loading analytics', e);
      toast.error('Failed to load analytics');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const filteredOrders = orders.filter(o => {
    const q = orderQuery.trim().toLowerCase();
    const matchQuery = !q || o.id.toLowerCase().includes(q) || (o.email || '').toLowerCase().includes(q) || (o.customer_name || '').toLowerCase().includes(q);
    const matchStatus = orderStatusFilter === 'all' || (o.status || '').toLowerCase() === orderStatusFilter;
    return matchQuery && matchStatus;
  });

  const updateOrderStatus = async (orderId, status) => {
    try {
      const prev = orders.slice();
      setOrders(orders.map(o => (o.id === orderId ? { ...o, status } : o)));
      const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
      if (error) throw error;
      toast.success('Order updated');
    } catch (e) {
      console.error('Status update failed', e);
      toast.error('Failed to update status');
      await fetchOrders();
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase.from('products').delete().eq('id', id);

      if (error) throw error;

      toast.success('Product deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowProductForm(true);
  };

  const handleFormClose = () => {
    setShowProductForm(false);
    setEditingProduct(null);
    fetchData();
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
              <p className="text-sm text-slate-600 mt-1">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </header>
  <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Tabs */}
  <div className="mb-6 flex flex-wrap items-center gap-2">
          {[
            { key: 'products', label: 'Products', icon: <Package size={16} /> },
            { key: 'orders', label: 'Orders', icon: <ClipboardList size={16} /> },
            { key: 'blog', label: 'Blog', icon: <FileText size={16} /> },
            { key: 'categories', label: 'Categories', icon: <Tag size={16} /> },
            { key: 'analytics', label: 'Analytics', icon: <BarChart3 size={16} /> },
          ].map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm border ${activeTab === t.key ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}>
              {t.icon}
              {t.label}
            </button>
          ))}
          <div className="ml-auto flex flex-wrap items-center gap-2">
            {activeTab === 'products' && (
              <button onClick={handleAddProduct} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow">
                <Plus size={16} /> Add Product
              </button>
            )}
            {activeTab === 'orders' && (
              <button onClick={fetchOrders} className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">
                <RefreshCw size={16} /> Refresh
              </button>
            )}
            {activeTab === 'analytics' && (
              <button onClick={fetchAnalytics} className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">
                <RefreshCw size={16} /> Refresh
              </button>
            )}
          </div>
        </div>

        {activeTab === 'products' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Product</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Category</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Price</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Stock</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Featured</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center gap-3">
                          <img src={product.image} alt={product.name} className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-lg" />
                          <div>
                            <div className="font-medium text-slate-900">{product.name}</div>
                            <div className="text-sm text-slate-500">ID: {product.id.slice(0, 8)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm text-slate-600">{product.categories?.name || 'N/A'}</td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <div className="text-sm">
                          <div className="font-semibold text-slate-900">Rs. {product.price}</div>
                          {product.original_price > product.price && (
                            <div className="text-slate-400 line-through text-xs">Rs. {product.original_price}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${product.in_stock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{product.in_stock ? 'In Stock' : 'Out of Stock'}</span>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${product.featured ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'}`}>{product.featured ? 'Yes' : 'No'}</span>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleEditProduct(product)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit"><Edit2 size={18} /></button>
                          <button onClick={() => handleDeleteProduct(product.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete"><Trash2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {products.length === 0 && (
              <div className="text-center py-12">
                <Package size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="text-slate-500 text-lg">No products found</p>
                <p className="text-slate-400 text-sm mt-2">Add your first product to get started</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={orderQuery} onChange={(e) => setOrderQuery(e.target.value)} placeholder="Search by order ID, name or email" className="pl-9 pr-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-300 bg-white" />
              </div>
              <select value={orderStatusFilter} onChange={(e) => setOrderStatusFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-200 bg-white">
                <option value="all">All statuses</option>
                <option value="paid">Paid</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="cancelled">Cancelled</option>
                <option value="refunded">Refunded</option>
              </select>
              <button onClick={fetchOrders} className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50"><RefreshCw size={16} /> Refresh</button>
              <span className="text-sm text-slate-500">{filteredOrders.length} of {orders.length} orders</span>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Order</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Customer</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Date</th>
                      <th className="px-4 sm:px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Total</th>
                      <th className="px-4 sm:px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                      <th className="px-4 sm:px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {ordersLoading && (
                      <tr><td colSpan={6} className="px-4 sm:px-6 py-6 text-center text-slate-500">Loading...</td></tr>
                    )}
                    {!ordersLoading && filteredOrders.map((o) => (
                      <tr key={o.id} className="hover:bg-slate-50">
                        <td className="px-4 sm:px-6 py-3 font-mono text-sm">{o.id.slice(0,8)}...</td>
                        <td className="px-4 sm:px-6 py-3 text-sm">
                          <div className="font-medium">{o.customer_name || 'Customer'}</div>
                          <div className="text-slate-500">{o.email || '-'}</div>
                        </td>
                        <td className="px-4 sm:px-6 py-3 text-sm text-slate-600">{new Date(o.created_at).toLocaleString()}</td>
                        <td className="px-4 sm:px-6 py-3 text-right text-sm font-semibold">Rs. {Number(o.subtotal || 0).toFixed(0)}</td>
                        <td className="px-4 sm:px-6 py-3 text-right">
                          <select value={o.status || ''} onChange={(e) => updateOrderStatus(o.id, e.target.value)} className="px-2 py-1 text-sm rounded border border-slate-200 bg-white">
                            {['paid','processing','shipped','cancelled','refunded'].map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                        <td className="px-4 sm:px-6 py-3">
                          <div className="flex justify-end gap-2">
                            {o.stripe_receipt_url && (
                              <a href={o.stripe_receipt_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline">
                                Receipt <ExternalLink size={14} />
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!ordersLoading && filteredOrders.length === 0 && (
                      <tr><td colSpan={6} className="px-4 sm:px-6 py-10 text-center text-slate-500">No orders found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'blog' && (
          <div className="space-y-6">
            {/* Create blog post */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Add Blog Post</h3>
                <button onClick={fetchBlogPosts} className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">
                  <RefreshCw size={16} /> Refresh
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-600">Title</label>
                  <input value={blogForm.title} onChange={(e)=>setBlogForm(f=>({...f,title:e.target.value}))} className="mt-1 w-full px-3 py-2 rounded border border-slate-200" placeholder="Post title" />
                </div>
                <div>
                  <label className="text-sm text-slate-600">Category</label>
                  <input value={blogForm.category} onChange={(e)=>setBlogForm(f=>({...f,category:e.target.value}))} className="mt-1 w-full px-3 py-2 rounded border border-slate-200" placeholder="e.g. news" />
                </div>
                <div>
                  <label className="text-sm text-slate-600">Image URL</label>
                  <input value={blogForm.image} onChange={(e)=>setBlogForm(f=>({...f,image:e.target.value}))} className="mt-1 w-full px-3 py-2 rounded border border-slate-200" placeholder="https://..." />
                </div>
                <div>
                  <label className="text-sm text-slate-600">Published date</label>
                  <input type="date" value={blogForm.published_at} onChange={(e)=>setBlogForm(f=>({...f,published_at:e.target.value}))} className="mt-1 w-full px-3 py-2 rounded border border-slate-200" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm text-slate-600">Excerpt</label>
                  <textarea value={blogForm.excerpt} onChange={(e)=>setBlogForm(f=>({...f,excerpt:e.target.value}))} rows={2} className="mt-1 w-full px-3 py-2 rounded border border-slate-200" placeholder="Short summary" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm text-slate-600">Content</label>
                  <textarea value={blogForm.content} onChange={(e)=>setBlogForm(f=>({...f,content:e.target.value}))} rows={6} className="mt-1 w-full px-3 py-2 rounded border border-slate-200" placeholder="Full content (markdown or text)" />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={async()=>{
                    try{
                      if(!blogForm.title.trim()) { toast.error('Title is required'); return; }
                      const payload = { ...blogForm, author: blogForm.author || 'K2 Traders Team' };
                      const { error } = await supabase.from('blog_posts').insert(payload);
                      if (error) throw error;
                      toast.success('Blog post added');
                      setBlogForm({ title:'', excerpt:'', content:'', image:'', category:'', author:'K2 Traders Team', published_at: new Date().toISOString().slice(0,10) });
                      fetchBlogPosts();
                    }catch(e){
                      console.error(e);
                      toast.error('Failed to add post');
                    }
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800"
                >
                  <Plus size={16}/> Add Post
                </button>
              </div>
            </div>

            {/* Posts list */}
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Title</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Category</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Published</th>
                      <th className="px-4 sm:px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {blogLoading && (
                      <tr><td colSpan={4} className="px-4 sm:px-6 py-6 text-center text-slate-500">Loading...</td></tr>
                    )}
                    {!blogLoading && blogPosts.map(bp => (
                      <tr key={bp.id} className="hover:bg-slate-50">
                        <td className="px-4 sm:px-6 py-3">
                          {editingPost?.id === bp.id ? (
                            <input value={editingPost.title} onChange={(e)=>setEditingPost(p=>({...p,title:e.target.value}))} className="w-full px-2 py-1 rounded border border-slate-200" />
                          ) : (
                            bp.title
                          )}
                        </td>
                        <td className="px-4 sm:px-6 py-3 text-sm text-slate-600">
                          {editingPost?.id === bp.id ? (
                            <input value={editingPost.category || ''} onChange={(e)=>setEditingPost(p=>({...p,category:e.target.value}))} className="w-full px-2 py-1 rounded border border-slate-200" />
                          ) : (
                            bp.category || '-'
                          )}
                        </td>
                        <td className="px-4 sm:px-6 py-3 text-sm text-slate-600">
                          {editingPost?.id === bp.id ? (
                            <input type="date" value={editingPost.published_at?.slice(0,10) || ''} onChange={(e)=>setEditingPost(p=>({...p,published_at:e.target.value}))} className="w-full px-2 py-1 rounded border border-slate-200" />
                          ) : (
                            bp.published_at
                          )}
                        </td>
                        <td className="px-4 sm:px-6 py-3">
                          <div className="flex justify-end gap-2">
                            {editingPost?.id === bp.id ? (
                              <>
                                <button onClick={async()=>{
                                  try{
                                    const payload = { ...editingPost };
                                    delete payload.id;
                                    const { error } = await supabase.from('blog_posts').update(payload).eq('id', bp.id);
                                    if (error) throw error;
                                    toast.success('Post updated');
                                    setEditingPost(null);
                                    fetchBlogPosts();
                                  } catch(e){ toast.error('Failed to update'); }
                                }} className="px-3 py-1 text-sm rounded bg-emerald-600 text-white">Save</button>
                                <button onClick={()=>setEditingPost(null)} className="px-3 py-1 text-sm rounded border">Cancel</button>
                              </>
                            ) : (
                              <>
                                <button onClick={()=>setEditingPost({ id: bp.id, title: bp.title || '', category: bp.category || '', published_at: bp.published_at || '' })} className="px-3 py-1 text-sm rounded border">Edit</button>
                                <button onClick={async()=>{
                                  if(!confirm('Delete this post?')) return;
                                  try{
                                    const { error } = await supabase.from('blog_posts').delete().eq('id', bp.id);
                                    if (error) throw error;
                                    toast.success('Post deleted');
                                    fetchBlogPosts();
                                  }catch(e){ toast.error('Failed to delete'); }
                                }} className="px-3 py-1 text-sm rounded bg-red-600 text-white">Delete</button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!blogLoading && blogPosts.length === 0 && (
                      <tr><td colSpan={4} className="px-4 sm:px-6 py-8 text-center text-slate-500">No blog posts yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="space-y-6">
            {/* Create category */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-6">
              <h3 className="font-semibold mb-4">Add Category</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-600">Name</label>
                  <input value={catForm.name} onChange={(e)=>{
                    const name = e.target.value;
                    const slug = name
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g,'-')
                      .replace(/(^-|-$)/g,'');
                    setCatForm(f=>({...f,name, slug}));
                  }} className="mt-1 w-full px-3 py-2 rounded border border-slate-200" placeholder="e.g. dry fruits" />
                </div>
                <div>
                  <label className="text-sm text-slate-600">Slug</label>
                  <input value={catForm.slug} onChange={(e)=>setCatForm(f=>({...f,slug:e.target.value}))} className="mt-1 w-full px-3 py-2 rounded border border-slate-200" placeholder="dry-fruits" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm text-slate-600">Description</label>
                  <textarea value={catForm.description} onChange={(e)=>setCatForm(f=>({...f,description:e.target.value}))} rows={3} className="mt-1 w-full px-3 py-2 rounded border border-slate-200" placeholder="Optional description" />
                </div>
                <div>
                  <label className="text-sm text-slate-600">Image URL</label>
                  <input value={catForm.image} onChange={(e)=>setCatForm(f=>({...f,image:e.target.value}))} className="mt-1 w-full px-3 py-2 rounded border border-slate-200" placeholder="https://..." />
                </div>
                <div>
                  <label className="text-sm text-slate-600">Icon (emoji)</label>
                  <input value={catForm.icon} onChange={(e)=>setCatForm(f=>({...f,icon:e.target.value}))} className="mt-1 w-full px-3 py-2 rounded border border-slate-200" placeholder="🍯" />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={async()=>{
                    try{
                      if(!catForm.name.trim() || !catForm.slug.trim()) { toast.error('Name and slug are required'); return; }
                      const payload = { name: catForm.name.trim(), slug: catForm.slug.trim(), description: catForm.description || '', image: catForm.image || '', icon: catForm.icon || '' };
                      const { error } = await supabase.from('categories').insert(payload);
                      if (error) throw error;
                      toast.success('Category added');
                      setCatForm({ name:'', slug:'', description:'', image:'', icon:'' });
                      fetchData();
                    }catch(e){
                      console.error(e);
                      toast.error('Failed to add category');
                    }
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800"
                >
                  <Plus size={16}/> Add Category
                </button>
              </div>
            </div>

            {/* Categories list */}
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Name</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Slug</th>
                      <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Products</th>
                      <th className="px-4 sm:px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {categories.map(c => (
                      <tr key={c.id} className="hover:bg-slate-50">
                        <td className="px-4 sm:px-6 py-3">
                          {editingCategory?.id === c.id ? (
                            <input value={editingCategory.name} onChange={(e)=>setEditingCategory(v=>({...v,name:e.target.value}))} className="w-full px-2 py-1 rounded border border-slate-200" />
                          ) : (
                            c.name
                          )}
                        </td>
                        <td className="px-4 sm:px-6 py-3 text-sm text-slate-600">
                          {editingCategory?.id === c.id ? (
                            <input value={editingCategory.slug} onChange={(e)=>setEditingCategory(v=>({...v,slug:e.target.value}))} className="w-full px-2 py-1 rounded border border-slate-200" />
                          ) : (
                            c.slug
                          )}
                        </td>
                        <td className="px-4 sm:px-6 py-3 text-sm text-slate-600">{/* Could compute count via join if needed */}-</td>
                        <td className="px-4 sm:px-6 py-3">
                          <div className="flex justify-end gap-2">
                            {editingCategory?.id === c.id ? (
                              <>
                                <button onClick={async()=>{
                                  try{
                                    const payload = { name: editingCategory.name?.trim() || '', slug: editingCategory.slug?.trim() || '' };
                                    if(!payload.name || !payload.slug){ toast.error('Name and slug are required'); return; }
                                    const { error } = await supabase.from('categories').update(payload).eq('id', c.id);
                                    if (error) throw error;
                                    toast.success('Category updated');
                                    setEditingCategory(null);
                                    fetchData();
                                  }catch(e){ toast.error('Failed to update'); }
                                }} className="px-3 py-1 text-sm rounded bg-emerald-600 text-white">Save</button>
                                <button onClick={()=>setEditingCategory(null)} className="px-3 py-1 text-sm rounded border">Cancel</button>
                              </>
                            ) : (
                              <>
                                <button onClick={()=>setEditingCategory({ id: c.id, name: c.name || '', slug: c.slug || '' })} className="px-3 py-1 text-sm rounded border">Edit</button>
                                <button onClick={async()=>{
                                  if(!confirm('Delete this category? Products may reference this category.')) return;
                                  try{
                                    const { error } = await supabase.from('categories').delete().eq('id', c.id);
                                    if (error) throw error;
                                    toast.success('Category deleted');
                                    fetchData();
                                  }catch(e){ toast.error('Failed to delete'); }
                                }} className="px-3 py-1 text-sm rounded bg-red-600 text-white">Delete</button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {categories.length === 0 && (
                      <tr><td colSpan={4} className="px-4 sm:px-6 py-8 text-center text-slate-500">No categories yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between">
                  <div className="text-slate-500 text-sm">Today revenue</div>
                  <DollarSign size={16} className="text-emerald-600" />
                </div>
                <div className="mt-2 text-2xl font-semibold">Rs. {Number(analytics.today.revenue).toFixed(0)}</div>
                <div className="text-slate-500 text-sm">{analytics.today.orders} orders</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between">
                  <div className="text-slate-500 text-sm">This month</div>
                  <Calendar size={16} className="text-blue-600" />
                </div>
                <div className="mt-2 text-2xl font-semibold">Rs. {Number(analytics.month.revenue).toFixed(0)}</div>
                <div className="text-slate-500 text-sm">{analytics.month.orders} orders</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between">
                  <div className="text-slate-500 text-sm">This year</div>
                  <BarChart3 size={16} className="text-purple-600" />
                </div>
                <div className="mt-2 text-2xl font-semibold">Rs. {Number(analytics.year.revenue).toFixed(0)}</div>
                <div className="text-slate-500 text-sm">{analytics.year.orders} orders</div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="text-slate-500 text-sm">Last 7 days</div>
                <div className="mt-2 flex items-end gap-1 h-16">
                  {analytics.last7days.map((d, i) => {
                    const max = Math.max(1, ...analytics.last7days.map(x => x.revenue));
                    const h = Math.max(2, Math.round((d.revenue / max) * 56));
                    return <div key={i} className="w-6 bg-emerald-200 rounded-t" style={{ height: h }} title={`${d.date.toLocaleDateString()} • Rs. ${Number(d.revenue).toFixed(0)}`} />
                  })}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-xl border border-slate-200 bg-white">
                <div className="px-4 py-3 border-b flex items-center justify-between">
                  <div className="font-semibold">Top products (revenue)</div>
                </div>
                <ul className="divide-y">
                  {analytics.topItems.length === 0 && (
                    <li className="p-4 text-slate-500">No data</li>
                  )}
                  {analytics.topItems.map((it, idx) => (
                    <li key={idx} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-600 text-xs">{idx+1}</span>
                        <div>
                          <div className="font-medium">{it.name}</div>
                          <div className="text-xs text-slate-500">{it.qty} sold</div>
                        </div>
                      </div>
                      <div className="font-semibold">Rs. {Number(it.revenue).toFixed(0)}</div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="text-emerald-600" />
                  <div className="font-semibold">Tips</div>
                </div>
                <ul className="mt-3 list-disc pl-5 text-sm text-slate-600 space-y-1">
                  <li>Statuses other than "paid" won’t appear in revenue.</li>
                  <li>Use the Orders tab to update fulfillment statuses.</li>
                  <li>Click Refresh to recalculate analytics.</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>

      {showProductForm && (
        <ProductForm
          product={editingProduct}
          categories={categories}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
}
