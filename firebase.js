// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDgbFAr2MbjpUmjLUg_BrpzfS3tiCPazjE",
  authDomain: "consultorio-c1aaa.firebaseapp.com",
  projectId: "consultorio-c1aaa",
  storageBucket: "consultorio-c1aaa.firebasestorage.app",
  messagingSenderId: "546933864327",
  appId: "1:546933864327:web:27c287d607ada836310522"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar y exportar el servicio de autenticación
export const auth = getAuth(app);
