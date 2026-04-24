import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  orderBy,
  limit
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Product, Category } from '../types';

const COLLECTION = 'products';

export const productService = {
  subscribeToProducts: (callback: (products: Product[]) => void, category?: Category) => {
    let q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
    
    if (category) {
      q = query(q, where('category', '==', category));
    }

    return onSnapshot(q, (snapshot) => {
      const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      callback(products);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, COLLECTION);
    });
  },

  getProduct: async (id: string): Promise<Product | null> => {
    try {
      const docRef = doc(db, COLLECTION, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Product;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `${COLLECTION}/${id}`);
      return null;
    }
  },

  addProduct: async (product: Omit<Product, 'id' | 'createdAt' | 'rating' | 'reviewsCount'>) => {
    try {
      const docRef = await addDoc(collection(db, COLLECTION), {
        ...product,
        createdAt: Date.now(),
        rating: 0,
        reviewsCount: 0
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, COLLECTION);
    }
  },

  updateProduct: async (id: string, product: Partial<Product>) => {
    try {
      const docRef = doc(db, COLLECTION, id);
      await updateDoc(docRef, product);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION}/${id}`);
    }
  },

  deleteProduct: async (id: string) => {
    try {
      const docRef = doc(db, COLLECTION, id);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${COLLECTION}/${id}`);
    }
  }
};
