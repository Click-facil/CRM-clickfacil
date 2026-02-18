// src/lib/firebase.ts - Configuração do Firebase (CORRIGIDO)

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Configuração do Firebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Firestore (banco de dados)
export const db = getFirestore(app);

export default app;

console.log('✅ Firebase inicializado');