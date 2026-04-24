import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus, ShoppingCart as CartIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../contexts/CartContext';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { cn } from '../lib/utils';

export const Cart = () => {
  const { 
    items, 
    removeFromCart, 
    updateQuantity, 
    totalPrice, 
    totalItems,
    discount,
    appliedCoupon,
    applyCoupon,
    removeCoupon
  } = useCart();
  const navigate = useNavigate();
  const [couponInput, setCouponInput] = React.useState('');
  const [couponError, setCouponError] = React.useState(false);

  const handleApplyCoupon = () => {
    if (applyCoupon(couponInput)) {
      setCouponInput('');
      setCouponError(false);
    } else {
      setCouponError(true);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-6">
        <div className="w-24 h-24 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center text-5xl">
          🛒
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Your cart is empty</h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
            Looks like you haven't added any plants to your cart yet.
          </p>
        </div>
        <Link to="/explore">
          <Button size="lg" className="rounded-full px-8">
            Start Shopping
          </Button>
        </Link>
      </div>
    );
  }

  const subtotal = totalPrice + discount;
  const tax = Math.round(totalPrice * 0.05);
  const finalTotal = totalPrice + tax;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Shopping Cart</h1>
        <Badge variant="success" className="text-sm px-3 py-1">
          {totalItems} Items
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={item.productId}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <Card className="p-4 overflow-hidden dark:bg-gray-900 dark:border-gray-800 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800 transition-colors">
                      <img 
                        src={item.product?.imageUrl} 
                        alt={item.product?.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <Link to={`/product/${item.productId}`}>
                            <h3 className="font-bold text-gray-900 dark:text-gray-100 hover:text-green-600 dark:hover:text-green-400 transition-colors truncate">
                              {item.product?.name}
                            </h3>
                          </Link>
                          <p className="text-xs text-gray-400 dark:text-gray-500">{item.product?.category}</p>
                        </div>
                        <button 
                          onClick={() => removeFromCart(item.productId)}
                          className="text-gray-400 dark:text-gray-500 hover:text-rose-500 transition-colors p-1"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between pt-2">
                        <span className="font-bold text-green-700 dark:text-green-400">₹{item.product?.price}</span>
                        <div className="flex items-center border border-gray-100 dark:border-gray-800 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800 transition-colors">
                          <button 
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-3 py-1 text-sm font-bold text-gray-900 dark:text-gray-100">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <Card className="p-6 space-y-6 sticky top-24 dark:bg-gray-900 dark:border-gray-800 transition-colors">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Order Summary</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal</span>
                <span className="dark:text-gray-200">₹{subtotal}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-rose-600 dark:text-rose-400 font-medium animate-in slide-in-from-top-1">
                  <div className="flex items-center gap-1">
                    <span>Coupon Discount</span>
                    <Badge variant="outline" className="text-[10px] py-0 border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 uppercase">
                      {appliedCoupon}
                    </Badge>
                  </div>
                  <span>-₹{discount}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Shipping</span>
                <span className="text-green-600 dark:text-green-400 font-medium">FREE</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Tax (GST 5%)</span>
                <span className="dark:text-gray-200">₹{tax}</span>
              </div>
              <div className="border-t border-gray-100 dark:border-gray-800 pt-3 flex justify-between text-lg font-bold text-gray-900 dark:text-gray-100">
                <span>Total</span>
                <span className="text-green-700 dark:text-green-400">₹{finalTotal}</span>
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                className="w-full h-12 text-lg rounded-xl"
                onClick={() => navigate('/checkout')}
              >
                Checkout
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Link to="/explore">
                <Button variant="ghost" className="w-full text-gray-500">
                  Continue Shopping
                </Button>
              </Link>
            </div>

            {/* Promo Code */}
            <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Promo Code</p>
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/30 rounded-xl border border-green-100 dark:border-green-900">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-600 dark:bg-green-500 text-white border-none">{appliedCoupon}</Badge>
                    <span className="text-xs text-green-700 dark:text-green-400 font-medium">Applied!</span>
                  </div>
                  <button 
                    onClick={removeCoupon}
                    className="text-gray-400 dark:text-gray-500 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <input 
                      type="text" 
                      placeholder="Try BLOOM20" 
                      value={couponInput}
                      onChange={(e) => {
                        setCouponInput(e.target.value);
                        setCouponError(false);
                      }}
                      className={cn(
                        "flex-1 px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 transition-all bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100",
                        couponError 
                          ? "border-rose-300 dark:border-rose-900 focus:ring-rose-500 bg-rose-50 dark:bg-rose-950/20" 
                          : "border-gray-200 dark:border-gray-800 focus:ring-green-500"
                      )}
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleApplyCoupon}
                      disabled={!couponInput.trim()}
                    >
                      Apply
                    </Button>
                  </div>
                  {couponError && (
                    <p className="text-[10px] text-rose-500 font-bold ml-1">Invalid coupon code</p>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* Secure Payment Badge */}
          <div className="flex items-center justify-center space-x-4 text-gray-400 dark:text-gray-500">
            <div className="flex flex-col items-center">
              <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full mb-1 transition-colors">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-medium">Secure Payment</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full mb-1 transition-colors">
                <CartIcon className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-medium">Easy Returns</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
