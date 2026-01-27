
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager 
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyBO-TJJYDpnxcP8UOl_XN77g6deesZPono",
  authDomain: "ignite-1847e.firebaseapp.com",
  projectId: "ignite-1847e",
  storageBucket: "ignite-1847e.firebasestorage.app",
  messagingSenderId: "657018339884",
  appId: "1:657018339884:web:995062ee6f3850e7ed0789",
  measurementId: "G-GNXX121Y5J"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Inicializar Firestore con la nueva API de cache persistente (reemplaza enableIndexedDbPersistence)
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager() // Permite sincronización entre múltiples pestañas
  })
});
