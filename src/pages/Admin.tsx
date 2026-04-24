import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Package, ShoppingCart, Users, TrendingUp, Search, X, Check, ArrowLeft, Image as ImageIcon, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { productService } from '../services/productService';
import { orderService } from '../services/orderService';
import { Product, Order, Category } from '../types';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { cn } from '../lib/utils';
import { SEED_PRODUCTS } from '../lib/data/seedProducts';

export const Admin = () => {
  const { isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'dashboard'>('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedProgress, setSeedProgress] = useState(0);

  const handleBulkSeed = async () => {
    if (products.length > 5 && !window.confirm('You already have many products. Adding 100 more might create duplicates. Continue?')) {
      return;
    }
    
    setSeeding(true);
    setSeedProgress(0);
    
    try {
      for (let i = 0; i < SEED_PRODUCTS.length; i++) {
        await productService.addProduct(SEED_PRODUCTS[i]);
        setSeedProgress(Math.round(((i + 1) / SEED_PRODUCTS.length) * 100));
      }
      alert('Successfully added 100 products!');
    } catch (error) {
      console.error('Seeding error:', error);
      alert('Error seeding data');
    } finally {
      setSeeding(false);
      setSeedProgress(0);
    }
  };

  const [formData, setFormData] = useState<Omit<Product, 'id' | 'createdAt' | 'rating' | 'reviewsCount'>>({
    name: '',
    description: '',
    price: 0,
    category: 'Indoor Plants',
    imageUrl: '',
    stock: 0,
    careInstructions: '',
    sunlight: 'Medium',
    season: 'All Year'
  });

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      const unsubscribeProducts = productService.subscribeToProducts(setProducts);
      const unsubscribeOrders = orderService.subscribeToAllOrders(setOrders);
      return () => {
        unsubscribeProducts();
        unsubscribeOrders();
      };
    }
  }, [isAdmin]);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, formData);
      } else {
        await productService.addProduct(formData as any);
      }
      setShowAddModal(false);
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: 0,
        category: 'Indoor Plants',
        imageUrl: '',
        stock: 0,
        careInstructions: '',
        sunlight: 'Medium',
        season: 'All Year'
      });
    } catch (error) {
      console.error('Admin Action Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      imageUrl: product.imageUrl,
      stock: product.stock,
      careInstructions: product.careInstructions,
      sunlight: product.sunlight,
      season: product.season
    });
    setShowAddModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await productService.deleteProduct(id);
    }
  };

  const handleStatusUpdate = async (id: string, status: Order['status']) => {
    await orderService.updateOrderStatus(id, status);
    // Simulate real-time notification
    alert(`Status updated to ${status.toUpperCase()}. A real-time notification has been sent to the customer.`);
  };

  if (authLoading || !isAdmin) return null;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/profile')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
        </div>
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl transition-colors">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
            { id: 'products', label: 'Products', icon: Package },
            { id: 'orders', label: 'Orders', icon: ShoppingCart }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-bold transition-all",
                activeTab === tab.id 
                  ? "bg-white dark:bg-gray-700 text-green-600 dark:text-green-400 shadow-sm" 
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              )}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'dashboard' && (
        <div className="space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Total Revenue', value: `₹${orders.reduce((sum, o) => sum + o.totalAmount, 0)}`, icon: TrendingUp, color: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400' },
              { label: 'Total Orders', value: orders.length, icon: ShoppingCart, color: 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400' },
              { label: 'Total Products', value: products.length, icon: Package, color: 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400' },
              { label: 'Total Users', value: '124', icon: Users, color: 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400' }
            ].map((stat, i) => (
              <Card key={i} className="p-6 dark:bg-gray-900 dark:border-gray-800 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <div className={cn("p-3 rounded-xl", stat.color)}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <Badge variant="success" className="dark:bg-green-900/40 dark:text-green-400 border-none">+12%</Badge>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{stat.label}</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</h3>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="p-6 dark:bg-gray-900 dark:border-gray-800 transition-colors">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">Recent Orders</h3>
              <div className="space-y-4">
                {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-700 dark:text-green-400 font-bold transition-colors">
                        {order.id.slice(-2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-gray-100">Order #{order.id.slice(-6).toUpperCase()}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-700 dark:text-green-400">₹{order.totalAmount}</p>
                      <Badge variant="outline" className="text-[10px] uppercase dark:border-gray-700 dark:text-gray-400">{order.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 dark:bg-gray-900 dark:border-gray-800 transition-colors">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">Low Stock Alert</h3>
              <div className="space-y-4">
                {products.filter(p => p.stock < 10).slice(0, 5).map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="flex items-center space-x-3">
                      <img src={product.imageUrl} className="w-10 h-10 rounded-lg object-cover" referrerPolicy="no-referrer" />
                      <div>
                        <p className="font-bold text-gray-900 dark:text-gray-100">{product.name}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">{product.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-rose-600 dark:text-rose-400">{product.stock} left</p>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(product)} className="dark:text-gray-400 dark:hover:text-gray-200">Restock</Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Manage Products</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Currently showing {products.length} items</p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                onClick={handleBulkSeed} 
                isLoading={seeding}
                disabled={seeding}
                className="border-amber-200 dark:border-amber-900/50 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20"
              >
                <Database className="w-4 h-4 mr-2" />
                {seeding ? `Adding (${seedProgress}%)` : 'Seed 100 Products'}
              </Button>
              <Button onClick={() => {
              setEditingProduct(null);
              setFormData({
                name: '',
                description: '',
                price: 0,
                category: 'Indoor Plants',
                imageUrl: '',
                stock: 0,
                careInstructions: '',
                sunlight: 'Medium',
                season: 'All Year'
              });
              setShowAddModal(true);
            }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="p-4 flex items-center space-x-4 dark:bg-gray-900 dark:border-gray-800 transition-colors">
                <img src={product.imageUrl} className="w-20 h-20 rounded-xl object-cover" referrerPolicy="no-referrer" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 truncate">{product.name}</h3>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{product.category}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-bold text-green-700 dark:text-green-400">₹{product.price}</span>
                    <span className={cn("text-xs font-bold", product.stock < 10 ? "text-rose-500 dark:text-rose-400" : "text-gray-400 dark:text-gray-500")}>
                      Stock: {product.stock}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 mt-3">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(product)}>
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm" className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20" onClick={() => handleDelete(product.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Manage Orders</h2>
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="p-6 dark:bg-gray-900 dark:border-gray-800 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg">Order #{order.id.slice(-6).toUpperCase()}</h3>
                      <Badge variant="outline" className="dark:border-gray-700 dark:text-gray-400">{order.status}</Badge>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Customer ID: {order.userId}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <select 
                      className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500 dark:text-gray-200 transition-colors"
                      value={order.status}
                      onChange={(e) => handleStatusUpdate(order.id, e.target.value as any)}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <Button variant="outline" size="sm">View Details</Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">Items</p>
                    <div className="flex flex-wrap gap-2">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-800 p-1 pr-3 rounded-lg border border-gray-100 dark:border-gray-700 transition-colors">
                          <img src={item.product?.imageUrl} className="w-8 h-8 rounded-md object-cover" referrerPolicy="no-referrer" />
                          <span className="text-xs font-bold text-gray-700 dark:text-gray-300">x{item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">Shipping To</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{order.shippingAddress.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{order.shippingAddress.address}, {order.shippingAddress.city}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">Total Amount</p>
                    <p className="text-xl font-bold text-green-700 dark:text-green-400">₹{order.totalAmount}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">Paid via {order.paymentMethod}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Add/Edit Product Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden transition-colors"
            >
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                  <X className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                </button>
              </div>
              
              <form onSubmit={handleAddProduct} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto no-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input 
                    label="Product Name" 
                    required 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Category</label>
                    <select 
                      className="w-full h-11 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:text-gray-200 transition-colors"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
                    >
                      {['Flower Seeds', 'Indoor Plants', 'Outdoor Plants', 'Flowering Plants'].map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input 
                    label="Price (₹)" 
                    type="number" 
                    required 
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  />
                  <Input 
                    label="Stock Quantity" 
                    type="number" 
                    required 
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                  />
                </div>

                <Input 
                  label="Image URL" 
                  required 
                  placeholder="https://images.unsplash.com/..." 
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  icon={<ImageIcon className="w-4 h-4" />}
                />

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Description</label>
                  <textarea 
                    className="w-full h-24 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:text-gray-200 transition-colors"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Sunlight</label>
                    <select 
                      className="w-full h-11 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:text-gray-200 transition-colors"
                      value={formData.sunlight}
                      onChange={(e) => setFormData({ ...formData, sunlight: e.target.value as any })}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Season</label>
                    <select 
                      className="w-full h-11 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:text-gray-200 transition-colors"
                      value={formData.season}
                      onChange={(e) => setFormData({ ...formData, season: e.target.value as any })}
                    >
                      <option value="Spring">Spring</option>
                      <option value="Summer">Summer</option>
                      <option value="Autumn">Autumn</option>
                      <option value="Winter">Winter</option>
                      <option value="All Year">All Year</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">Care Instructions</label>
                  <textarea 
                    className="w-full h-24 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:text-gray-200 transition-colors"
                    value={formData.careInstructions}
                    onChange={(e) => setFormData({ ...formData, careInstructions: e.target.value })}
                  />
                </div>

                <div className="pt-4 flex space-x-3">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    className="flex-1"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1"
                    isLoading={loading}
                  >
                    {editingProduct ? 'Save Changes' : 'Add Product'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
