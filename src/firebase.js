// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBNeZImMt4Tt64Q6GUlVQB1slOefSEDq-E",
  authDomain: "coolauth-477d1.firebaseapp.com",
  projectId: "coolauth-477d1",
  storageBucket: "coolauth-477d1.appspot.com",
  messagingSenderId: "599423263769",
  appId: "1:599423263769:web:9cf6adce2aa4cd10427688",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };
