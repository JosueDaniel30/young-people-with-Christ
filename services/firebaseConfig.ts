
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

/**
 * Configuración oficial del proyecto "Ignite Youth" vinculada a Firebase Console.
 */
const firebaseConfig = {
  apiKey: "AIzaSyDQmNMSbts42YaM7QkDPbhkc9alHzMMYSM",
  authDomain: "ignite-youth-2a14a.firebaseapp.com",
  projectId: "ignite-youth-2a14a",
  storageBucket: "ignite-youth-2a14a.firebasestorage.app",
  messagingSenderId: "902887114505",
  appId: "1:902887114505:web:855eb36314fcb7b1a2f5d8",
  measurementId: "G-5EWF99NBW3"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
