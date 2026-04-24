import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Heart, ArrowLeft, Leaf, Sun, Thermometer, Calendar, Check, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, Review } from '../types';
import { productService } from '../services/productService';
import { reviewService } from '../services/reviewService';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';

export const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const { addToCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    if (id) {
      setLoading(true);
      productService.getProduct(id).then((data) => {
        setProduct(data);
        if (data?.imageUrl) setActiveImage(data.imageUrl);
        setLoading(false);
      });

      const unsubscribe = reviewService.subscribeToReviews(id, (data) => {
        setReviews(data);
      });
      return () => unsubscribe();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <h3 className="text-2xl font-bold text-gray-900">Plant not found</h3>
        <Button onClick={() => navigate('/explore')}>Back to Explore</Button>
      </div>
    );
  }

  const galleryImages = product.images && product.images.length > 0 
    ? product.images 
    : [product.imageUrl];

  return (
    <div className="space-y-8">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-500 dark:text-gray-400 hover:text-green-600 transition-colors"
      >
        <ArrowLeft className="w-5 h-5 mr-1" />
        Back
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Product Image Gallery */}
        <div className="space-y-4">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative aspect-square rounded-3xl overflow-hidden bg-gray-100 dark:bg-gray-800 transition-colors shadow-sm"
          >
            <AnimatePresence mode="wait">
              <motion.img 
                key={activeImage}
                src={activeImage || product.imageUrl} 
                alt={product.name}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </AnimatePresence>
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <button className="p-3 rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-gray-400 hover:text-rose-500 transition-colors shadow-sm">
                <Heart className="w-6 h-6" />
              </button>
              <button className="p-3 rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-gray-400 hover:text-blue-500 transition-colors shadow-sm">
                <Share2 className="w-6 h-6" />
              </button>
            </div>
          </motion.div>

          {/* Thumbnails */}
          {galleryImages.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={cn(
                    "relative w-24 h-24 flex-shrink-0 rounded-2xl overflow-hidden border-2 transition-all",
                    activeImage === img ? "border-green-600 scale-105 shadow-md z-10" : "border-transparent opacity-70 hover:opacity-100"
                  )}
                >
                  <img 
                    src={img} 
                    alt={`${product.name} thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="space-y-2">
            <Badge variant="success" className="text-sm px-3 py-1">
              {product.category}
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">{product.name}</h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={cn("w-4 h-4 fill-current", i >= Math.floor(product.rating || 0) && "text-gray-200 dark:text-gray-800")} />
                ))}
                <span className="ml-2 text-sm font-bold text-gray-700 dark:text-gray-300">
                  {product.rating ? Number(product.rating).toFixed(1) : 'New'}
                </span>
              </div>
              <span className="text-sm text-gray-400">({product.reviewsCount} reviews)</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold text-green-700 dark:text-green-400">₹{product.price}</span>
            <div className="flex items-center space-x-1 text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-900 transition-colors">
              <Check className="w-4 h-4" />
              <span>In Stock ({product.stock})</span>
            </div>
          </div>

          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            {product.description}
          </p>

          {/* Plant Care Quick Info */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900 p-4 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-lg">
                  <Sun className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-blue-700 dark:text-blue-400 font-medium">Sunlight</p>
                  <p className="text-sm font-bold text-blue-900 dark:text-blue-200">{product.sunlight || 'Medium'}</p>
                </div>
              </div>
            </Card>
            <Card className="bg-amber-50 dark:bg-amber-950/30 border-amber-100 dark:border-amber-900 p-4 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 rounded-lg">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">Season</p>
                  <p className="text-sm font-bold text-amber-900 dark:text-amber-200">{product.season || 'All Year'}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Add to Cart Section */}
          <div className="flex items-center space-x-4 pt-4">
            <div className="flex items-center border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden bg-white dark:bg-gray-900 transition-colors">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 font-bold"
              >
                -
              </button>
              <span className="px-4 py-2 font-bold text-gray-900 dark:text-gray-100">{quantity}</span>
              <button 
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                className="px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 font-bold"
              >
                +
              </button>
            </div>
            <Button 
              className="flex-1 h-12 text-lg"
              onClick={() => addToCart(product, quantity)}
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Add to Cart
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Tabs / Detailed Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 pt-10">
        <div className="lg:col-span-2 space-y-8">
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
              <Leaf className="w-6 h-6 mr-2 text-green-600" />
              Plant Care Instructions
            </h2>
            <Card className="p-6 bg-white dark:bg-gray-900 dark:border-gray-800 transition-colors">
              <div className="prose prose-green dark:prose-invert max-w-none text-gray-600 dark:text-gray-400">
                {product.careInstructions || "No specific care instructions provided for this plant. Generally, ensure regular watering and appropriate sunlight."}
              </div>
            </Card>
          </section>

          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Customer Reviews</h2>
              <Button variant="outline" size="sm">Write a Review</Button>
            </div>
            
            <div className="space-y-4">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <Card key={review.id} className="p-5 dark:bg-gray-900 dark:border-gray-800 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-700 dark:text-green-400 font-bold">
                          {review.userName?.[0] || 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-gray-100">{review.userName || 'Anonymous'}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center text-amber-500">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={cn("w-3 h-3 fill-current", i >= review.rating && "text-gray-200 dark:text-gray-800")} />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                      {review.comment}
                    </p>
                  </Card>
                ))
              ) : (
                <div className="text-center py-10 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 transition-colors">
                  <p className="text-gray-400 dark:text-gray-500">No reviews yet. Be the first to review!</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar / Related Info */}
        <div className="space-y-6">
          <Card className="p-6 bg-green-900 dark:bg-green-950 text-white border-green-800 transition-colors">
            <h3 className="text-xl font-bold mb-4">Why GreenBloom?</h3>
            <ul className="space-y-4">
              {[
                { icon: Check, text: "100% Healthy Plants" },
                { icon: Check, text: "Eco-friendly Packaging" },
                { icon: Check, text: "Expert Gardening Support" },
                { icon: Check, text: "Fast & Secure Delivery" }
              ].map((item, i) => (
                <li key={i} className="flex items-center space-x-3 text-sm text-green-100">
                  <div className="p-1 bg-green-800 dark:bg-green-900 rounded-full transition-colors">
                    <item.icon className="w-3 h-3" />
                  </div>
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-6 dark:bg-gray-900 dark:border-gray-800 transition-colors">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Need Help?</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Our gardening experts are available to help you with any questions about this plant.
            </p>
            <Button variant="outline" className="w-full">Chat with Expert</Button>
          </Card>
        </div>
      </div>
    </div>
  );
};
