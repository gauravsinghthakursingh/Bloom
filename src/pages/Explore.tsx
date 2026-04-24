import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, Star, ShoppingCart, Heart, X, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, Category } from '../types';
import { productService } from '../services/productService';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { useCart } from '../contexts/CartContext';
import { cn } from '../lib/utils';

import { ProductCard } from '../components/ProductCard';

const categories: Category[] = ['Flower Seeds', 'Indoor Plants', 'Outdoor Plants', 'Flowering Plants'];

export const Explore = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>(
    (searchParams.get('category') as Category) || 'All'
  );
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high' | 'rating'>('newest');
  
  const { addToCart } = useCart();

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (priceRange[0] > 0 || priceRange[1] < 10000) count++;
    if (sortBy !== 'newest') count++;
    return count;
  }, [priceRange, sortBy]);

  useEffect(() => {
    const unsubscribe = productService.subscribeToProducts((data) => {
      setProducts(data);
    });
    return () => unsubscribe();
  }, []);

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             p.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
        const matchesPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
        return matchesSearch && matchesCategory && matchesPrice;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return (b.createdAt || 0) - (a.createdAt || 0);
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        return 0;
      });
  }, [products, searchQuery, selectedCategory, priceRange, sortBy]);

  const handleCategoryChange = (cat: Category | 'All') => {
    setSelectedCategory(cat);
    if (cat === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', cat);
    }
    setSearchParams(searchParams);
  };

  const quickPriceFilters = [
    { label: 'All', range: [0, 10000] as [number, number] },
    { label: 'Under ₹500', range: [0, 500] as [number, number] },
    { label: '₹500 - ₹1500', range: [500, 1500] as [number, number] },
    { label: 'Over ₹1500', range: [1500, 10000] as [number, number] },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
            Explore Plants
            {activeFiltersCount > 0 && (
              <Badge variant="primary" className="h-5 px-1.5 min-w-[20px] justify-center">
                {activeFiltersCount}
              </Badge>
            )}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Discover the perfect greenery for your home</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-80">
            <Input 
              placeholder="Search seeds, plants..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="w-4 h-4" />}
              className="rounded-2xl border-gray-100 dark:border-gray-800 shadow-sm"
            />
          </div>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "rounded-2xl transition-all duration-300",
              showFilters ? "bg-green-600 text-white border-green-600" : "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800"
            )}
          >
            <SlidersHorizontal className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Categories Scrollable */}
      <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4">
        <Button 
          variant={selectedCategory === 'All' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => handleCategoryChange('All')}
          className="whitespace-nowrap rounded-full px-5 font-bold"
        >
          All Plants
        </Button>
        {categories.map((cat) => (
          <Button 
            key={cat}
            variant={selectedCategory === cat ? 'primary' : 'outline'}
            size="sm"
            onClick={() => handleCategoryChange(cat)}
            className="whitespace-nowrap rounded-full px-5 font-bold"
          >
            {cat}
          </Button>
        ))}
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0, y: -10 }}
            animate={{ height: 'auto', opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -10 }}
            className="overflow-hidden"
          >
            <Card className="bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 p-6 md:p-8 rounded-[2rem] shadow-xl shadow-green-900/5 dark:shadow-green-900/20 transition-colors">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="space-y-4">
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm flex items-center gap-2">
                    <Filter className="w-4 h-4 text-green-600" />
                    Sort By
                  </h3>
                  <div className="flex flex-col gap-2">
                    {[
                      { id: 'newest', label: 'Newest Arrived' },
                      { id: 'price-low', label: 'Price: Low to High' },
                      { id: 'price-high', label: 'Price: High to Low' },
                      { id: 'rating', label: 'Top Rated' }
                    ].map((sort) => (
                      <button
                        key={sort.id}
                        onClick={() => setSortBy(sort.id as any)}
                        className={cn(
                          "px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-left flex items-center justify-between border",
                          sortBy === sort.id 
                            ? "bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800" 
                            : "bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 border-transparent hover:bg-gray-100 dark:hover:bg-gray-800"
                        )}
                      >
                        {sort.label}
                        {sortBy === sort.id && <CheckCircle className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 col-span-1 lg:col-span-2">
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-500" />
                    Price Quick Range
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {quickPriceFilters.map((f) => (
                      <button
                        key={f.label}
                        onClick={() => setPriceRange(f.range)}
                        className={cn(
                          "px-4 py-3 rounded-xl text-xs font-bold transition-all border",
                          priceRange[0] === f.range[0] && priceRange[1] === f.range[1]
                            ? "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800" 
                            : "bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 border-transparent hover:bg-gray-100 dark:hover:bg-gray-800"
                        )}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                  <div className="pt-2">
                    <div className="flex items-center justify-between text-xs text-gray-400 font-bold mb-3">
                      <span>Custom Range (₹)</span>
                      <span>₹{priceRange[0]} - ₹{priceRange[1]}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Input 
                        type="number" 
                        value={priceRange[0]} 
                        onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                        className="h-10 text-xs rounded-xl"
                        placeholder="Min"
                      />
                      <span className="text-gray-300 dark:text-gray-600">to</span>
                      <Input 
                        type="number" 
                        value={priceRange[1]} 
                        onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                        className="h-10 text-xs rounded-xl"
                        placeholder="Max"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end justify-center gap-3">
                  <Button 
                    variant="ghost" 
                    onClick={() => {
                      setPriceRange([0, 10000]);
                      setSortBy('newest');
                      setSearchQuery('');
                      setSelectedCategory('All');
                    }}
                    className="text-gray-400 dark:text-gray-500 font-bold text-sm w-full"
                  >
                    Reset All
                  </Button>
                  <Button 
                    variant="primary" 
                    onClick={() => setShowFilters(false)}
                    className="w-full rounded-2xl h-12 shadow-lg shadow-green-600/20 dark:shadow-green-900/40"
                  >
                    Apply Filters
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Showing <span className="font-bold text-gray-900 dark:text-gray-100">{filteredProducts.length}</span> products
        </p>
      </div>

      {/* Product Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-4xl">
            🌵
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">No plants found</h3>
          <p className="text-gray-500 dark:text-gray-400 text-center max-w-xs">
            Try adjusting your search or filters to find what you're looking for.
          </p>
          <Button variant="outline" onClick={() => {
            setSearchQuery('');
            setSelectedCategory('All');
            setPriceRange([0, 5000]);
          }}>
            Clear All Filters
          </Button>
        </div>
      )}
    </div>
  );
};
