export type Category = 'Flower Seeds' | 'Indoor Plants' | 'Outdoor Plants' | 'Flowering Plants';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  imageUrl: string;
  images?: string[];
  stock: number;
  careInstructions: string;
  sunlight: 'Low' | 'Medium' | 'High';
  season: 'Spring' | 'Summer' | 'Autumn' | 'Winter' | 'All Year';
  rating: number;
  reviewsCount: number;
  createdAt: number;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'user' | 'admin';
  createdAt: number;
}

export interface CartItem {
  productId: string;
  quantity: number;
  product?: Product;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    zipCode: string;
    phone: string;
  };
  paymentMethod: 'UPI' | 'Card' | 'COD';
  createdAt: number;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: number;
}

export interface WishlistItem {
  productId: string;
  userId: string;
  createdAt: number;
}
