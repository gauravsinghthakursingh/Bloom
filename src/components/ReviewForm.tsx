import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { reviewService } from '../services/reviewService';
import { Button } from './ui/Button';
import { cn } from '../lib/utils';

interface ReviewFormProps {
  productId: string;
  onSuccess?: () => void;
}

export const ReviewForm = ({ productId, onSuccess }: ReviewFormProps) => {
  const { user, profile } = useAuth();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      await reviewService.addReview({
        productId,
        userId: user.uid,
        userName: profile?.displayName || user.displayName || 'Anonymous',
        rating,
        comment
      });
      setComment('');
      setRating(5);
      onSuccess?.();
    } catch (error) {
      console.error('Review Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="p-6 bg-gray-50 rounded-2xl text-center">
        <p className="text-gray-500 mb-4">Please sign in to write a review.</p>
        <Button variant="outline" size="sm">Sign In</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-green-50/50 rounded-2xl border border-green-100">
      <h3 className="font-bold text-green-900">Write a Review</h3>
      
      <div className="flex items-center space-x-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => setRating(star)}
            className="p-1 transition-transform hover:scale-110"
          >
            <Star 
              className={cn(
                "w-8 h-8 transition-colors",
                (hoverRating || rating) >= star ? "fill-amber-400 text-amber-400" : "text-gray-300"
              )} 
            />
          </button>
        ))}
      </div>

      <textarea
        className="w-full h-24 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        placeholder="Share your experience with this plant..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        required
      />

      <Button type="submit" className="w-full" isLoading={loading}>
        Submit Review
      </Button>
    </form>
  );
};
