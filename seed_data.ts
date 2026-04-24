import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, deleteDoc } from 'firebase/firestore';
import firebaseConfig from './firebase-applet-config.json';
import { SEED_PRODUCTS } from './src/lib/data/seedProducts';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function seed() {
  const querySnapshot = await getDocs(collection(db, 'products'));
  const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
  await Promise.all(deletePromises);
  console.log('Cleared existing products.');

  const addPromises = SEED_PRODUCTS.map(product => 
    addDoc(collection(db, 'products'), {
      ...product,
      rating: 4 + Math.random(),
      reviewsCount: Math.floor(Math.random() * 200) + 10,
      createdAt: Date.now()
    })
  );
  await Promise.all(addPromises);
  console.log(`Seeded ${SEED_PRODUCTS.length} new products successfully!`);
}

seed().catch(console.error);
