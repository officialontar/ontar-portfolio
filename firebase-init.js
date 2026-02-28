// firebase-init.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyCmXHlfU_nlendBG72pFxSpa1fQtxn2nmU",
  authDomain: "ontar-portfolio.firebaseapp.com",
  projectId: "ontar-portfolio",
  storageBucket: "ontar-portfolio.firebasestorage.app",
  messagingSenderId: "377626395117",
  appId: "1:377626395117:web:eaa2fc5d435f244e51a7e4"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);