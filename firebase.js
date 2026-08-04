import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc,
    serverTimestamp,
    onSnapshot,
    query,       // NEW: Needed for dashboard sorting
    orderBy,     // NEW: Needed for dashboard sorting
    limit,       // NEW: Needed for dashboard sorting
    doc,         // NEW: Needed for finding a specific user
    setDoc,      // NEW: Needed for saving a new signup
    getDoc       // NEW: Needed for checking login passwords
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAVotA6Q5lb3L6Td5By4zqJk00dzdVMkDA",
    authDomain: "smartwomensafety-62a20.firebaseapp.com",
    projectId: "smartwomensafety-62a20",
    storageBucket: "smartwomensafety-62a20.firebasestorage.app",
    messagingSenderId: "926548169367",
    appId: "1:926548169367:web:fa07f7f05ca1daa10acfd2",
    measurementId: "G-GM1287SRSR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Connect to Firestore
const db = getFirestore(app);

// Export Firebase functions
export {
    db,
    collection,
    addDoc,
    serverTimestamp,
    onSnapshot,
    query,       // Exported for dashboard
    orderBy,     // Exported for dashboard
    limit,       // Exported for dashboard
    doc,         // Exported for Signup/Login
    setDoc,      // Exported for Signup
    getDoc       // Exported for Login
};
