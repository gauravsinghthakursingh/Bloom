import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  orderBy 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Review } from '../types';

const COLLECTION = 'reviews';

export const reviewService = {
  subscribeToReviews: (productId: string, callback: (reviews: Review[]) => void) => {
    const q = query(
      collection(db, COLLECTION), 
      where('productId', '==', productId),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const reviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
      callback(reviews);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, COLLECTION);
    });
  },

  addReview: async (review: Omit<Review, 'id' | 'createdAt'>) => {
    try {
      const docRef = await addDoc(collection(db, COLLECTION), {
        ...review,
        createdAt: Date.now()
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, COLLECTION);
    }
  }
};
