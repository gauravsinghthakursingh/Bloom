import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Truck, ShieldCheck, MapPin, Phone, User, CheckCircle2, ArrowRight, ArrowLeft, Share2, Mail, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { orderService } from '../services/orderService';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { cn } from '../lib/utils';
import { generateOrderSummary, shareViaWhatsApp, shareViaEmail, shareViaSMS } from '../lib/billUtils';
import { Order } from '../types';
import { trackPurchase } from '../lib/analytics';

type Step = 'shipping' | 'payment' | 'confirmation';

export const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('shipping');
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<{ items: any[], total: number } | null>(null);

  const [shippingData, setShippingData] = useState({
    name: user?.displayName || '',
    address: '',
    city: '',
    zipCode: '',
    phone: ''
  });

  const [pincodeError, setPincodeError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card' | 'COD'>('UPI');

  const checkPincode = (zip: string) => {
    // Simulated delivery check logic
    // In a real app, this would hit a Firestore collection of serviceable pincodes
    if (!zip) return;
    
    // For demo: Serviceable if pincode is between 110000 and 899999
    const zipNum = parseInt(zip);
    if (isNaN(zipNum)) {
      setPincodeError("Invalid pincode format");
    } else if (zipNum < 110000 || zipNum > 899999) {
      setPincodeError("Sorry, we don't deliver to this area yet! 🌿");
    } else {
      setPincodeError(null);
    }
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pincodeError) return;
    setStep('payment');
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      alert('Please login to place order');
      return;
    }

    setLoading(true);
    try {
      const id = await orderService.createOrder({
        userId: user.uid,
        items,
        totalAmount: totalPrice + Math.round(totalPrice * 0.05),
        status: 'pending',
        shippingAddress: shippingData,
        paymentMethod
      });
      
      if (id) {
        setOrderId(id);
        const finalTotal = totalPrice + Math.round(totalPrice * 0.05);
        setCompletedOrder({ items: [...items], total: finalTotal });
        trackPurchase(id, finalTotal, items.length);
        setStep('confirmation');
        clearCart();
      }
    } catch (error) {
      console.error('Order Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0 && step !== 'confirmation') {
    navigate('/cart');
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Checkout Progress */}
      <div className="flex items-center justify-between px-4">
        {[
          { id: 'shipping', label: 'Shipping', icon: Truck },
          { id: 'payment', label: 'Payment', icon: CreditCard },
          { id: 'confirmation', label: 'Done', icon: ShieldCheck }
        ].map((s, i) => (
          <React.Fragment key={s.id}>
            <div className="flex flex-col items-center space-y-2">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                step === s.id ? "bg-green-600 text-white scale-110 shadow-lg" : 
                (i < ['shipping', 'payment', 'confirmation'].indexOf(step) ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600")
              )}>
                <s.icon className="w-5 h-5" />
              </div>
              <span className={cn(
                "text-xs font-bold",
                step === s.id ? "text-green-700 dark:text-green-400" : "text-gray-400 dark:text-gray-600"
              )}>{s.label}</span>
            </div>
            {i < 2 && (
              <div className={cn(
                "flex-1 h-0.5 mx-4 rounded-full",
                i < ['shipping', 'payment', 'confirmation'].indexOf(step) ? "bg-green-600 dark:bg-green-500" : "bg-gray-100 dark:bg-gray-800"
              )} />
            )}
          </React.Fragment>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 'shipping' && (
          <motion.div
            key="shipping"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <Card className="p-8 dark:bg-gray-900 dark:border-gray-800 transition-colors">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
                <MapPin className="w-6 h-6 mr-2 text-green-600 dark:text-green-400" />
                Shipping Details
              </h2>
              <form onSubmit={handleShippingSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input 
                    label="Full Name" 
                    placeholder="John Doe" 
                    required
                    value={shippingData.name}
                    onChange={(e) => setShippingData({ ...shippingData, name: e.target.value })}
                    icon={<User className="w-4 h-4" />}
                  />
                  <Input 
                    label="Phone Number" 
                    placeholder="+91 98765 43210" 
                    required
                    value={shippingData.phone}
                    onChange={(e) => setShippingData({ ...shippingData, phone: e.target.value })}
                    icon={<Phone className="w-4 h-4" />}
                  />
                </div>
                <Input 
                  label="Address" 
                  placeholder="Street address, apartment, suite, etc." 
                  required
                  value={shippingData.address}
                  onChange={(e) => setShippingData({ ...shippingData, address: e.target.value })}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input 
                    label="City" 
                    placeholder="Mumbai" 
                    required
                    value={shippingData.city}
                    onChange={(e) => setShippingData({ ...shippingData, city: e.target.value })}
                  />
                  <div className="space-y-1">
                    <Input 
                      label="Zip Code" 
                      placeholder="400001" 
                      required
                      value={shippingData.zipCode}
                      onChange={(e) => {
                        const val = e.target.value;
                        setShippingData({ ...shippingData, zipCode: val });
                        if (val.length >= 6) checkPincode(val);
                      }}
                      onBlur={() => checkPincode(shippingData.zipCode)}
                      error={pincodeError || undefined}
                    />
                    {pincodeError && (
                      <p className="text-[10px] font-bold text-rose-500 pl-1">{pincodeError}</p>
                    )}
                  </div>
                </div>
                <div className="pt-6 flex justify-end">
                  <Button type="submit" size="lg" className="w-full md:w-auto px-10 rounded-xl">
                    Continue to Payment
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}

        {step === 'payment' && (
          <motion.div
            key="payment"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <Card className="p-8 dark:bg-gray-900 dark:border-gray-800 transition-colors">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
                <CreditCard className="w-6 h-6 mr-2 text-green-600 dark:text-green-400" />
                Payment Method
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {[
                  { id: 'UPI', label: 'UPI (Paytm/GPay)', icon: '📱' },
                  { id: 'Card', label: 'Credit/Debit Card', icon: '💳' },
                  { id: 'COD', label: 'Cash on Delivery', icon: '💵' }
                ].map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id as any)}
                    className={cn(
                      "p-6 rounded-2xl border-2 transition-all flex flex-col items-center space-y-3",
                      paymentMethod === method.id 
                        ? "border-green-600 bg-green-50 dark:bg-green-950/20 shadow-md" 
                        : "border-gray-100 dark:border-gray-800 hover:border-green-200 dark:hover:border-green-800 bg-white dark:bg-gray-900"
                    )}
                  >
                    <span className="text-3xl">{method.icon}</span>
                    <span className="font-bold text-gray-900 dark:text-gray-100">{method.label}</span>
                    {paymentMethod === method.id && (
                      <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                    )}
                  </button>
                ))}
              </div>

              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 space-y-4 mb-8 transition-colors">
                <div className="flex justify-between font-medium text-gray-600 dark:text-gray-400">
                  <span>Order Total</span>
                  <span className="dark:text-gray-200">₹{totalPrice + Math.round(totalPrice * 0.05)}</span>
                </div>
                <div className="flex justify-between font-medium text-gray-600 dark:text-gray-400">
                  <span>Shipping</span>
                  <span className="text-green-600 dark:text-green-400">FREE</span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 flex justify-between text-xl font-bold text-gray-900 dark:text-gray-100">
                  <span>Amount to Pay</span>
                  <span className="text-green-700 dark:text-green-400">₹{totalPrice + Math.round(totalPrice * 0.05)}</span>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4 justify-between">
                <Button 
                  variant="ghost" 
                  onClick={() => setStep('shipping')}
                  className="text-gray-500"
                >
                  <ArrowLeft className="mr-2 w-5 h-5" />
                  Back to Shipping
                </Button>
                <Button 
                  size="lg" 
                  className="px-12 rounded-xl"
                  onClick={handlePlaceOrder}
                  isLoading={loading}
                >
                  Place Order
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {step === 'confirmation' && (
          <motion.div
            key="confirmation"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-8 py-10"
          >
            <div className="relative inline-block">
              <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto transition-colors">
                <CheckCircle2 className="w-16 h-16 text-green-600 dark:text-green-400" />
              </div>
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 }}
                className="absolute -top-2 -right-2 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center text-white shadow-lg"
              >
                ✨
              </motion.div>
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">Order Placed!</h1>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                Your order <span className="font-bold text-green-600 dark:text-green-400">#{orderId?.slice(-6).toUpperCase()}</span> has been placed successfully. We'll notify you once it's shipped.
              </p>
            </div>

            <div className="space-y-6">
              <Card className="max-w-md mx-auto p-6 bg-white dark:bg-gray-900 shadow-xl border-green-100 dark:border-green-900 transition-colors">
                <div className="space-y-4 text-left">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400 dark:text-gray-500">Estimated Delivery</span>
                    <span className="font-bold text-gray-900 dark:text-gray-100">3-5 Business Days</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400 dark:text-gray-500">Payment Method</span>
                    <span className="font-bold text-gray-900 dark:text-gray-100">{paymentMethod}</span>
                  </div>
                  <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                    <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase mb-2">Shipping To</p>
                    <p className="font-bold text-gray-900 dark:text-gray-100">{shippingData.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{shippingData.address}, {shippingData.city}</p>
                  </div>
                </div>
              </Card>

              {/* Bill Generation & Sharing */}
              <div className="max-w-md mx-auto space-y-6 pt-4">
                <div className="bg-green-50 dark:bg-green-950/20 p-6 rounded-3xl border border-green-100 dark:border-green-900 shadow-sm transition-colors">
                  <h3 className="text-lg font-bold text-green-900 dark:text-green-400 mb-2">Send your invoice?</h3>
                  <p className="text-sm text-green-700 dark:text-green-500 mb-6">Would you like us to send a copy of your receipt to WhatsApp or as a text message?</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Button 
                      variant="outline" 
                      className="flex-col h-24 rounded-2xl gap-2 border-white dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 hover:bg-white dark:hover:bg-gray-900 hover:text-green-600 dark:hover:text-green-400 transition-all shadow-sm"
                      onClick={() => {
                        if (!completedOrder) return;
                        const mockOrder: Order = {
                          id: orderId || 'temp',
                          userId: user?.uid || '',
                          items: completedOrder.items,
                          totalAmount: completedOrder.total,
                          status: 'pending',
                          shippingAddress: shippingData,
                          paymentMethod,
                          createdAt: Date.now()
                        };
                        const summary = generateOrderSummary(mockOrder);
                        shareViaWhatsApp(summary);
                      }}
                    >
                      <MessageSquare className="w-8 h-8 text-green-500 dark:text-green-400" />
                      <span className="text-xs uppercase font-bold tracking-wider">WhatsApp</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-col h-24 rounded-2xl gap-2 border-white dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 hover:bg-white dark:hover:bg-gray-900 hover:text-green-600 dark:hover:text-green-400 transition-all shadow-sm"
                      onClick={() => {
                        if (!completedOrder) return;
                        const mockOrder: Order = {
                          id: orderId || 'temp',
                          userId: user?.uid || '',
                          items: completedOrder.items,
                          totalAmount: completedOrder.total,
                          status: 'pending',
                          shippingAddress: shippingData,
                          paymentMethod,
                          createdAt: Date.now()
                        };
                        const summary = generateOrderSummary(mockOrder);
                        shareViaSMS(summary);
                      }}
                    >
                      <Share2 className="w-8 h-8 text-blue-500 dark:text-blue-400" />
                      <span className="text-xs uppercase font-bold tracking-wider">SMS / Text</span>
                    </Button>
                  </div>

                  <div className="mt-4 pt-4 border-t border-green-100 dark:border-green-900 flex justify-center">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 text-xs font-bold gap-1"
                      onClick={() => {
                        if (!completedOrder) return;
                        const mockOrder: Order = {
                          id: orderId || 'temp',
                          userId: user?.uid || '',
                          items: completedOrder.items,
                          totalAmount: completedOrder.total,
                          status: 'pending',
                          shippingAddress: shippingData,
                          paymentMethod,
                          createdAt: Date.now()
                        };
                        const summary = generateOrderSummary(mockOrder);
                        shareViaEmail(mockOrder, summary);
                      }}
                    >
                      <Mail className="w-4 h-4" />
                      Send via Email instead
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Button onClick={() => navigate('/profile')} variant="outline" className="px-8">
                Track Order
              </Button>
              <Button onClick={() => navigate('/explore')} className="px-8">
                Continue Shopping
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
