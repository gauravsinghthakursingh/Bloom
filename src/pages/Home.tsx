import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowRight, Star, ShoppingCart, Heart, Leaf, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Product, Category } from '../types';
import { productService } from '../services/productService';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useCart } from '../contexts/CartContext';

import { ProductCard } from '../components/ProductCard';

const categories: { name: Category; icon: string; color: string }[] = [
  { name: 'Flower Seeds', icon: '🌱', color: 'bg-emerald-100 text-emerald-700' },
  { name: 'Indoor Plants', icon: '🏠', color: 'bg-blue-100 text-blue-700' },
  { name: 'Outdoor Plants', icon: '🌳', color: 'bg-amber-100 text-amber-700' },
  { name: 'Flowering Plants', icon: '🌸', color: 'bg-rose-100 text-rose-700' },
];

export const Home = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = productService.subscribeToProducts((data) => {
      setProducts(data.slice(0, 6));
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-green-900 text-white p-8 md:p-12">
        <div className="relative z-10 max-w-2xl space-y-6">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl md:text-6xl font-bold leading-tight"
          >
            Bring Nature <br />
            <span className="text-green-400">Into Your Home</span>
          </motion.h1>
          <p className="text-green-100 text-lg md:text-xl max-w-md">
            Discover a wide variety of seeds, plants, and gardening essentials for your green space.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button 
              size="lg" 
              className="bg-white text-green-900 hover:bg-green-50"
              onClick={() => {
                document.getElementById('categories-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Shop Now
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white/10"
              onClick={() => {
                document.getElementById('learn-more-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Learn More
            </Button>
          </div>
        </div>
        
        {/* Abstract shapes */}
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none">
          <div className="absolute top-10 right-10 w-64 h-64 bg-green-400 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-48 h-48 bg-emerald-400 rounded-full blur-3xl" />
        </div>
      </section>

      {/* Categories */}
      <section id="categories-section" className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Categories</h2>
          <Link to="/explore" className="text-green-600 font-medium flex items-center hover:underline">
            View All <ArrowRight className="ml-1 w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link key={cat.name} to={`/explore?category=${cat.name}`}>
              <Card className="flex flex-col items-center justify-center p-6 space-y-3 hover:scale-105 transition-transform cursor-pointer dark:bg-gray-900 dark:border-gray-800">
                <span className="text-4xl">{cat.icon}</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200 text-center">{cat.name}</span>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* AI Plant Matcher Promo */}
      <section className="px-0 sm:px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          onClick={() => navigate('/find-match')}
          className="relative overflow-hidden rounded-3xl bg-green-900 p-8 text-white shadow-xl cursor-pointer group transition-all"
        >
          <div className="relative z-10 space-y-4 max-w-sm">
             <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-bold uppercase tracking-wider">
               <Sparkles className="w-3 h-3 text-amber-300" />
               <span>AI Powered Recommendation</span>
             </div>
             <h2 className="text-2xl md:text-3xl font-bold leading-tight">Find Your Perfect <br/>Plant Match</h2>
             <p className="text-green-100 text-sm md:text-base">Take a 30-second quiz and let our AI "Bloom" find the best plants for your specific environment.</p>
             <div className="pt-2">
              <Button className="bg-white text-green-900 hover:bg-green-100 px-8 h-12 rounded-2xl group-hover:shadow-lg transition-all font-bold">
                Start AI Quiz
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
             </div>
          </div>
          <div className="absolute top-0 right-0 h-full w-2/3 opacity-40 group-hover:opacity-60 transition-opacity">
            <img 
              src="https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&q=80&w=600"
              alt="Plant Background"
              className="w-full h-full object-cover transform rotate-6 -translate-y-4 translate-x-12 scale-110"
              referrerPolicy="no-referrer"
            />
          </div>
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ 
              duration: 8, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute -bottom-10 -right-10 w-48 h-48 bg-green-400/30 rounded-full blur-3xl p-4" 
          />
        </motion.div>
      </section>

      {/* Learn More Section */}
      <section id="learn-more-section" className="py-16 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-8 md:p-12 space-y-12 transition-colors">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <Badge variant="secondary" className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400">Our Expertise</Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">Why Choose GreenBloom?</h2>
          <p className="text-gray-500 dark:text-gray-400">We don't just sell plants; we nurture your green journey with expert care and high-quality selections.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4 text-center p-6 rounded-2xl bg-green-50/50 dark:bg-emerald-900/10">
            <div className="w-12 h-12 bg-green-600 text-white rounded-xl flex items-center justify-center mx-auto shadow-lg">
              <Star className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">Premium Quality</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">Every plant and seed is hand-selected and tested for optimal growth in Indian climates.</p>
          </div>
          
          <div className="space-y-4 text-center p-6 rounded-2xl bg-blue-50/50 dark:bg-blue-900/10">
            <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center mx-auto shadow-lg">
              <Leaf className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">Expert Care</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">Our AI-powered Bloom Assistant provides personalized care instructions for every plant.</p>
          </div>

          <div className="space-y-4 text-center p-6 rounded-2xl bg-amber-50/50 dark:bg-amber-900/10">
            <div className="w-12 h-12 bg-amber-600 text-white rounded-xl flex items-center justify-center mx-auto shadow-lg">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">Safe Delivery</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">Custom-designed packaging ensures your plants arrive fresh and healthy at your doorstep.</p>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Featured Plants</h2>
          <Link to="/explore" className="text-green-600 font-medium flex items-center hover:underline">
            See More <ArrowRight className="ml-1 w-4 h-4" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Newsletter / Promo */}
      <section className="bg-emerald-50 dark:bg-emerald-950/30 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 transition-colors">
        <div className="space-y-4 text-center md:text-left">
          <h2 className="text-3xl font-bold text-emerald-900 dark:text-emerald-400">Get 20% Off Your First Order</h2>
          <p className="text-emerald-700 dark:text-emerald-500 max-w-md">
            Join our community of plant lovers and get exclusive tips, offers, and early access to new arrivals.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto md:mx-0">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="flex-1 px-4 py-3 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <Button>Subscribe</Button>
          </div>
        </div>
        <div className="hidden lg:block">
          <span className="text-9xl">🌿</span>
        </div>
      </section>
    </div>
  );
};
