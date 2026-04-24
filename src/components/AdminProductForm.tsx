import React, { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { Product, Category } from '../types';
import { productService } from '../services/productService';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface AdminProductFormProps {
  product?: Product | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export const AdminProductForm = ({ product, onSuccess, onCancel }: AdminProductFormProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Omit<Product, 'id' | 'createdAt' | 'rating' | 'reviewsCount'>>({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || 0,
    category: product?.category || 'Indoor Plants',
    imageUrl: product?.imageUrl || '',
    images: product?.images || [],
    stock: product?.stock || 0,
    careInstructions: product?.careInstructions || '',
    sunlight: product?.sunlight || 'Medium',
    season: product?.season || 'All Year'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (product) {
        await productService.updateProduct(product.id, formData);
      } else {
        await productService.addProduct(formData as any);
      }
      onSuccess();
    } catch (error) {
      console.error('Admin Action Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto no-scrollbar">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input 
          label="Product Name" 
          required 
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 ml-1">Category</label>
          <select 
            className="w-full h-11 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
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
        label="Image URL (Main)" 
        required 
        placeholder="https://images.unsplash.com/..." 
        value={formData.imageUrl}
        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
        icon={<ImageIcon className="w-4 h-4" />}
      />

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700 ml-1">Gallery Images (Optional, one URL per line)</label>
        <textarea 
          className="w-full h-24 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          placeholder="https://images.unsplash.com/gallery1&#10;https://images.unsplash.com/gallery2"
          value={formData.images?.join('\n')}
          onChange={(e) => setFormData({ ...formData, images: e.target.value.split('\n').filter(url => url.trim() !== '') })}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700 ml-1">Description</label>
        <textarea 
          className="w-full h-24 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 ml-1">Sunlight</label>
          <select 
            className="w-full h-11 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            value={formData.sunlight}
            onChange={(e) => setFormData({ ...formData, sunlight: e.target.value as any })}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 ml-1">Season</label>
          <select 
            className="w-full h-11 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
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
        <label className="text-sm font-medium text-gray-700 ml-1">Care Instructions</label>
        <textarea 
          className="w-full h-24 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          value={formData.careInstructions}
          onChange={(e) => setFormData({ ...formData, careInstructions: e.target.value })}
        />
      </div>

      <div className="pt-4 flex space-x-3">
        <Button 
          type="button" 
          variant="ghost" 
          className="flex-1"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          className="flex-1"
          isLoading={loading}
        >
          {product ? 'Save Changes' : 'Add Product'}
        </Button>
      </div>
    </form>
  );
};
