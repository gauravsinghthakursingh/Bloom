import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc, 
  getDocs 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { WishlistItem } from '../types';

const COLLECTION = 'wishlist';

export const wishlistService = {
  subscribeToWishlist: (userId: string, callback: (items: WishlistItem[]) => void) => {
    const q = query(collection(db, COLLECTION), where('userId', '==', userId));
    
    return onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any as WishlistItem));
      callback(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, COLLECTION);
    });
  },

  addToWishlist: async (userId: string, productId: string) => {
    try {
      // Check if already in wishlist
      const q = query(
        collection(db, COLLECTION), 
        where('userId', '==', userId), 
        where('productId', '==', productId)
      );
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        await addDoc(collection(db, COLLECTION), {
          userId,
          productId,
          createdAt: Date.now()
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, COLLECTION);
    }
  },

  removeFromWishlist: async (userId: string, productId: string) => {
    try {
      const q = query(
        collection(db, COLLECTION), 
        where('userId', '==', userId), 
        where('productId', '==', productId)
      );
      const snapshot = await getDocs(q);
      
      const deletePromises = snapshot.docs.map(docSnap => deleteDoc(doc(db, COLLECTION, docSnap.id)));
      await Promise.all(deletePromises);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, COLLECTION);
    }
  }
};
