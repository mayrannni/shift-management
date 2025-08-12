// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCnpMAt-bvmlfC1_uaXjUFwOI6nYdCOTOQ",
  authDomain: "control-turnos-afebb.firebaseapp.com",
  projectId: "control-turnos-afebb",
  storageBucket: "control-turnos-afebb.firebasestorage.app",
  messagingSenderId: "711802695886",
  appId: "1:711802695886:web:b70b2bb3d8a3006a2be09f",
  measurementId: "G-0KTVQ216XG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const db = getFirestore(app);