import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAPGyZ40O6ognJfpfVvROD18UknXA7UF-0",
  authDomain: "dc-scf.firebaseapp.com",
  projectId: "dc-scf",
  storageBucket: "dc-scf.firebasestorage.app",
  messagingSenderId: "130539249459",
  appId: "1:130539249459:web:fce533689c7d506d332846",
  measurementId: "G-15G8YBEXX6"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
