import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD1cdDBZW_sjI1ljtTnzbPqTPHGmyEbCQ0",
  authDomain: "healthmonitor-b37dd.firebaseapp.com",
  projectId: "healthmonitor-b37dd",
  storageBucket: "healthmonitor-b37dd.firebasestorage.app",
  messagingSenderId: "909671908473",
  appId: "1:909671908473:web:a85d9562420d9b82e800a8",
  measurementId: "G-2G0G3642V5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

export default app;
