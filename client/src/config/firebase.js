import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAq9Ms9CiZPtT6SYaASsamURwv2BnmoyTI",
  authDomain: "codearena-ca8e1.firebaseapp.com",
  projectId: "codearena-ca8e1",
  storageBucket: "codearena-ca8e1.firebasestorage.app",
  messagingSenderId: "460169937977",
  appId: "1:460169937977:web:4eb3fc42c20d75290cf9e8",
  measurementId: "G-11PLPTC9JS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();
