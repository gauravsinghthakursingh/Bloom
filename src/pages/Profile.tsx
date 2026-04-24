import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Package, LogOut, Settings, ChevronRight, Star, Clock, CheckCircle, Truck, XCircle, ShieldCheck, MapPin, CreditCard, Mail, Phone, MessageSquare, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { orderService } from '../services/orderService';
import { Order } from '../types';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { cn } from '../lib/utils';
import { PhoneLogin } from '../components/PhoneLogin';
import { generateOrderSummary, shareViaWhatsApp, shareViaEmail, shareViaSMS } from '../lib/billUtils';

export const Profile = () => {
  const { user, profile, logout, signInWithGoogle, signUpWithEmail, signInWithEmail, sendVerification, loading, isAdmin } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'google' | 'phone' | 'email'>('google');
  const [emailData, setEmailData] = useState({ email: '', password: '', name: '' });
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.uid) {
      const unsubscribe = orderService.subscribeToOrders(user.uid, (data) => {
        setOrders(data);
      });
      return () => unsubscribe();
    }
  }, [user]);

  const handleGoogleLogin = async () => {
    setError(null);
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      if (err.code === 'auth/user-cancelled' || err.code === 'auth/popup-closed-by-user') {
        setError('The sign-in popup was closed. Please allow popups and try again.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('Google sign-in is not enabled. Please check your Firebase console.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setError('This domain is not authorized for sign-in. Please add it to your Firebase authorized domains.');
      } else {
        setError('An unexpected error occurred during sign-in. Please try again.');
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
    const [emailData, setEmailData] = useState({ email: '', password: '', name: '', phone: '' });

    const handleEmailAuth = async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setIsSigningIn(true);
      try {
        if (authMode === 'signup') {
          if (!emailData.name) throw new Error('Please enter your name');
          // We'll store the name in the profile as well
          await signUpWithEmail(emailData.email, emailData.password, emailData.name);
        } else {
          await signInWithEmail(emailData.email, emailData.password);
        }
      } catch (err: any) {
        if (err.code === 'auth/email-already-in-use') {
          setError('This email is already in use.');
        } else if (err.code === 'auth/invalid-email') {
          setError('Invalid email address.');
        } else if (err.code === 'auth/weak-password') {
          setError('Password should be at least 6 characters.');
        } else if (err.code === 'auth/user-not-found') {
          setError('No user found with this email.');
        } else if (err.code === 'auth/wrong-password') {
          setError('Incorrect password.');
        } else {
          setError(err.message || 'An error occurred. Please try again.');
        }
      } finally {
        setIsSigningIn(false);
      }
    };

    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 min-h-[80vh]">
        <motion.div 
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="max-w-md w-full bg-white dark:bg-gray-900 rounded-[3rem] p-8 md:p-12 shadow-[0_32px_64px_-12px_rgba(5,150,105,0.15)] dark:shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] border border-green-50/50 dark:border-gray-800 transition-all relative overflow-hidden"
        >
          {/* Background Decorative Blobs */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-green-100/50 dark:bg-green-900/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-100/30 dark:bg-emerald-900/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center space-y-8">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="w-24 h-24 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/20 rounded-3xl flex items-center justify-center text-5xl shadow-inner"
            >
              🌱
            </motion.div>
            
            <div className="text-center space-y-3">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 italic font-serif">
                {authMode === 'login' ? 'Welcome Back' : 'Get Started'}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm max-w-[280px] mx-auto leading-relaxed">
                {authMode === 'login' 
                  ? 'Sign in to access your doorstep nursery and track your plants.' 
                  : 'Create an account to join our doorstep nursery community.'}
              </p>
            </div>

            {/* Auth Mode Toggle */}
            <div className="flex p-1.5 bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl w-full">
              <button
                onClick={() => {
                  setAuthMode('login');
                  setLoginMethod('email');
                }}
                className={cn(
                  "flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300",
                  authMode === 'login' 
                    ? "bg-white dark:bg-gray-700 text-green-600 dark:text-green-400 shadow-md scale-[1.02]" 
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                )}
              >
                Login
              </button>
              <button
                onClick={() => {
                  setAuthMode('signup');
                  setLoginMethod('email');
                }}
                className={cn(
                  "flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300",
                  authMode === 'signup' 
                    ? "bg-white dark:bg-gray-700 text-green-600 dark:text-green-400 shadow-md scale-[1.02]" 
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                )}
              >
                Sign Up
              </button>
            </div>
            
            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="w-full bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 px-5 py-4 rounded-2xl text-xs font-medium text-center shadow-sm"
              >
                {error}
              </motion.div>
            )}

            <div className="w-full space-y-6">
              {/* Method Switcher - Simplistic */}
              {authMode === 'login' && (
                <div className="flex p-1 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <button
                    onClick={() => setLoginMethod('email')}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl transition-all",
                      loginMethod === 'email' 
                        ? "bg-white dark:bg-gray-600 text-green-600 dark:text-green-300 shadow-sm" 
                        : "text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                    )}
                  >
                    EMAIL
                  </button>
                  <button
                    onClick={() => setLoginMethod('phone')}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl transition-all",
                      loginMethod === 'phone' 
                        ? "bg-white dark:bg-gray-600 text-green-600 dark:text-green-300 shadow-sm" 
                        : "text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                    )}
                  >
                    PHONE
                  </button>
                </div>
              )}

              <div className="pt-2">
                <AnimatePresence mode="wait">
                  {loginMethod === 'phone' && authMode === 'login' ? (
                    <motion.div
                      key="phone"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <PhoneLogin onComplete={() => navigate('/profile')} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="email-form"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <form onSubmit={handleEmailAuth} className="space-y-4">
                        {authMode === 'signup' && (
                          <>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase ml-1">Full Name</label>
                              <input 
                                type="text"
                                required
                                placeholder="Gaurav Singh"
                                className="w-full h-12 rounded-xl bg-gray-50 dark:bg-gray-800 border-none px-4 text-sm focus:ring-2 focus:ring-green-500 dark:text-gray-100"
                                value={emailData.name}
                                onChange={(e) => setEmailData({ ...emailData, name: e.target.value })}
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase ml-1">Phone Number</label>
                              <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">+91</span>
                                <input 
                                  type="tel"
                                  pattern="[0-9]{10}"
                                  placeholder="9876543210"
                                  className="w-full h-12 rounded-xl bg-gray-50 dark:bg-gray-800 border-none pl-12 pr-4 text-sm focus:ring-2 focus:ring-green-500 dark:text-gray-100"
                                  value={emailData.phone}
                                  onChange={(e) => setEmailData({ ...emailData, phone: e.target.value })}
                                />
                              </div>
                            </div>
                          </>
                        )}
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase ml-1">Email Address</label>
                          <input 
                            type="email"
                            required
                            placeholder="example@gmail.com"
                            className="w-full h-12 rounded-xl bg-gray-50 dark:bg-gray-800 border-none px-4 text-sm focus:ring-2 focus:ring-green-500 dark:text-gray-100"
                            value={emailData.email}
                            onChange={(e) => setEmailData({ ...emailData, email: e.target.value })}
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase ml-1">Password</label>
                          <input 
                            type="password"
                            required
                            placeholder="••••••••"
                            className="w-full h-12 rounded-xl bg-gray-50 dark:bg-gray-800 border-none px-4 text-sm focus:ring-2 focus:ring-green-500 dark:text-gray-100"
                            value={emailData.password}
                            onChange={(e) => setEmailData({ ...emailData, password: e.target.value })}
                          />
                        </div>
                        <Button 
                          type="submit"
                          size="lg"
                          isLoading={isSigningIn}
                          className="w-full rounded-2xl h-14 bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg shadow-green-200 dark:shadow-none transition-all hover:scale-[1.02] active:scale-95"
                        >
                          {authMode === 'login' ? 'Login' : 'Create Account'}
                        </Button>
                      </form>

                      {/* Google Login Option */}
                      <div className="pt-6">
                        <div className="flex items-center gap-3 w-full pb-4">
                          <div className="h-[1px] flex-1 bg-gray-100 dark:bg-gray-800" />
                          <span className="text-[10px] font-bold text-gray-300 dark:text-gray-600 tracking-widest uppercase items-center flex gap-2">
                             <ShieldCheck className="w-3 h-3" /> Secure Google Sign In
                          </span>
                          <div className="h-[1px] flex-1 bg-gray-100 dark:bg-gray-800" />
                        </div>
                        <Button 
                          variant="outline"
                          size="lg" 
                          className="w-full rounded-2xl h-14 text-sm bg-white dark:bg-gray-900 border-2 border-gray-100 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center gap-3 transition-all hover:border-green-200 shadow-sm" 
                          onClick={handleGoogleLogin}
                          isLoading={isSigningIn}
                        >
                          <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#EA4335" d="M12 5.04c1.64 0 3.12.56 4.28 1.67l3.21-3.21C17.52 1.64 14.96 1 12 1 7.24 1 3.19 3.73 1.25 7.72l3.91 3.03C6.1 7.7 8.84 5.04 12 5.04z" />
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31l3.45 2.67c2.02-1.86 3.4-4.6 3.4-7.99z" />
                            <path fill="#34A853" d="M5.16 14.75c-.26-.78-.41-1.61-.41-2.5s.15-1.72.41-2.5L1.25 6.72C.46 8.35 0 10.13 0 12s.46 3.65 1.25 5.28l3.91-3.53z" />
                            <path fill="#FBBC05" d="M12 23c2.97 0 5.48-1 7.31-2.73l-3.45-2.67c-1.02.69-2.33 1.1-3.86 1.1-3.16 0-5.9-2.66-6.84-5.71l-3.91 3.03C3.19 20.27 7.24 23 12 23z" />
                          </svg>
                          <span className="font-bold tracking-tight">CONTINUE WITH GOOGLE</span>
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            
            <p className="text-[11px] text-gray-400 dark:text-gray-500 text-center max-w-[240px] leading-relaxed">
              By continuing, you agree to GreenBloom's <span className="text-green-600 dark:text-green-500 font-bold hover:underline cursor-pointer">Terms & Conditions</span> and <span className="text-green-600 dark:text-green-500 font-bold hover:underline cursor-pointer">Privacy Policy</span>.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Email Verification Banner */}
      {user.email && !user.emailVerified && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="overflow-hidden"
        >
          <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900 shadow-sm p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Mail className="w-6 h-6" />
              </div>
              <div className="text-center md:text-left">
                <h3 className="font-bold text-amber-900 dark:text-amber-300">Verify your email</h3>
                <p className="text-sm text-amber-700 dark:text-amber-500">We've sent a verification link to <span className="font-bold">{user.email}</span>. Please check your inbox.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                className="bg-white dark:bg-gray-900 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400"
                onClick={async () => {
                  try {
                    await sendVerification();
                    alert('Verification email sent!');
                  } catch (err) {
                    alert('Failed to send email. Please try again later.');
                  }
                }}
              >
                Resend Email
              </Button>
              <Button 
                size="sm"
                className="bg-amber-600 hover:bg-amber-700 text-white border-none"
                onClick={() => window.location.reload()}
              >
                I've Verified
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Profile Header */}
      <section className="relative overflow-hidden rounded-3xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-8 shadow-sm transition-colors">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-green-50 dark:border-green-900/50 ring-4 ring-white dark:ring-gray-950 transition-colors">
              <img 
                src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}&background=059669&color=fff`} 
                alt={user.displayName || 'User'}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            {isAdmin && (
              <div className="absolute -bottom-1 -right-1 bg-amber-400 text-white p-1.5 rounded-full shadow-lg">
                <ShieldCheck className="w-4 h-4" />
              </div>
            )}
          </div>
          
          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-col md:flex-row md:items-center gap-2">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{user.displayName}</h1>
              {isAdmin && (
                <Badge variant="warning" className="w-fit mx-auto md:mx-0">Admin</Badge>
              )}
            </div>
            <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2">
              <div className="flex items-center space-x-1 text-sm font-medium text-gray-600 dark:text-gray-400">
                <Package className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span>{orders.length} Orders</span>
              </div>
              <div className="flex items-center space-x-1 text-sm font-medium text-gray-600 dark:text-gray-400">
                <Star className="w-4 h-4 text-amber-500" />
                <span>4.8 Rating</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 w-full md:w-auto">
            {isAdmin && (
              <Button variant="outline" onClick={() => navigate('/admin')}>
                <Settings className="w-4 h-4 mr-2" />
                Admin Panel
              </Button>
            )}
            <Button variant="ghost" className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Abstract background */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-green-50/50 dark:bg-green-900/10 -skew-x-12 translate-x-1/2 pointer-events-none" />
      </section>

      {/* Order History */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
          <Clock className="w-6 h-6 mr-2 text-green-600" />
          Order History
        </h2>

        {orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="p-0 overflow-hidden dark:bg-gray-900 dark:border-gray-800 transition-colors">
                <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-50 dark:border-gray-800">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-gray-900 dark:text-gray-100">Order #{order.id.slice(-6).toUpperCase()}</span>
                      <Badge 
                        variant={
                          order.status === 'delivered' ? 'success' : 
                          order.status === 'cancelled' ? 'danger' : 
                          order.status === 'shipped' ? 'primary' : 'warning'
                        }
                        className="text-[10px] uppercase tracking-wider"
                      >
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}</p>
                    
                    {/* Order Status Progress */}
                    {order.status !== 'cancelled' && (
                      <div className="pt-4 flex items-center gap-2 max-w-[200px]">
                        <div className="flex-1 h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ 
                              width: order.status === 'delivered' ? '100%' : 
                                     order.status === 'shipped' ? '66%' : '33%' 
                            }}
                            className={cn(
                              "h-full rounded-full transition-all duration-1000",
                              order.status === 'delivered' ? "bg-green-500" : "bg-green-400"
                            )}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-green-600 dark:text-green-400 whitespace-nowrap">
                          {order.status === 'delivered' ? 'Completed' : 'On its way'}
                        </span>
                      </div>
                    )}
                  </div>
                    <div className="flex items-center justify-between md:justify-end gap-3 flex-wrap">
                      <div className="text-right mr-4">
                        <p className="text-xs text-gray-400">Total Amount</p>
                        <p className="font-bold text-green-700 dark:text-green-400 text-lg">₹{order.totalAmount}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/30"
                          title="Share on WhatsApp"
                          onClick={() => shareViaWhatsApp(generateOrderSummary(order))}
                        >
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                          title="Share via Email"
                          onClick={() => shareViaEmail(order, generateOrderSummary(order))}
                        >
                          <Mail className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                          title="Share via SMS"
                          onClick={() => shareViaSMS(generateOrderSummary(order))}
                        >
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <Button variant="outline" size="sm">
                        Details
                        <ChevronRight className="ml-1 w-4 h-4" />
                      </Button>
                    </div>
                </div>
                
                <div className="p-5 bg-gray-50/50 dark:bg-gray-800/30 flex items-center space-x-4 overflow-x-auto no-scrollbar transition-colors">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex-shrink-0 relative">
                      <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                        <img 
                          src={item.product?.imageUrl} 
                          alt={item.product?.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <span className="absolute -top-2 -right-2 bg-green-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-white dark:border-gray-900">
                        {item.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-dashed border-gray-200 dark:border-gray-800 transition-colors">
            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
              📦
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">No orders yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Start your gardening journey today!</p>
            <Button onClick={() => navigate('/explore')}>Shop Now</Button>
          </div>
        )}
      </section>

      {/* Account Settings */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Account Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { icon: User, label: 'Personal Information', desc: 'Manage your name, email, and phone' },
            { icon: MapPin, label: 'Shipping Addresses', desc: 'Add or remove delivery addresses' },
            { icon: CreditCard, label: 'Payment Methods', desc: 'Manage your cards and UPI IDs' },
            { icon: ShieldCheck, label: 'Security & Privacy', desc: 'Password and account security' }
          ].map((item, i) => (
            <Card key={i} className="p-5 flex items-center space-x-4 cursor-pointer hover:bg-green-50 dark:hover:bg-green-900/10 dark:bg-gray-900 dark:border-gray-800 transition-colors group">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl group-hover:bg-green-600 dark:group-hover:bg-green-500 group-hover:text-white transition-colors">
                <item.icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 dark:text-gray-100">{item.label}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-green-600 dark:group-hover:text-green-400" />
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};
