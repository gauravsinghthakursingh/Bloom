import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { Product } from '../types';
import { Button } from './ui/Button';
import { Card, CardContent } from './ui/Card';
import { Badge } from './ui/Badge';
import { useCart } from '../contexts/CartContext';
import { cn } from '../lib/utils';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export const ProductCard = ({ product, className }: ProductCardProps) => {
  const { addToCart } = useCart();

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={cn("group h-full", className)}
    >
      <Card className="overflow-hidden p-0 h-full flex flex-col">
        <Link to={`/product/${product.id}`} className="relative aspect-square overflow-hidden">
          <img 
            src={product.imageUrl} 
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-3 left-3">
            <Badge variant="success" className="bg-white/90 backdrop-blur-sm">
              {product.category}
            </Badge>
          </div>
          <button className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm text-gray-400 hover:text-rose-500 transition-colors shadow-sm">
            <Heart className="w-5 h-5" />
          </button>
        </Link>
        
        <CardContent className="p-4 flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center text-amber-500">
              <Star className="w-3 h-3 fill-current" />
              <span className="ml-1 text-xs font-bold text-gray-700 dark:text-gray-300">
                {product.rating ? Number(product.rating).toFixed(1) : 'New'}
              </span>
            </div>
            <span className="text-[10px] text-gray-400 dark:text-gray-500">{product.reviewsCount || 0} reviews</span>
          </div>
          
          <Link to={`/product/${product.id}`}>
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1 line-clamp-1 group-hover:text-green-600 transition-colors">
              {product.name}
            </h3>
          </Link>
          
          <div className="mt-auto pt-3 flex items-center justify-between">
            <span className="text-lg font-bold text-green-700 dark:text-green-400">₹{product.price}</span>
            <Button 
              size="sm" 
              className="rounded-full h-8 w-8 p-0"
              onClick={() => addToCart(product)}
            >
              <ShoppingCart className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
