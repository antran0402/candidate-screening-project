import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  // Dán cấu hình bạn đã copy ở Bước 1 vào đây
  apiKey: "AIzaSyCBG0u-mEh3QUGhx3eqPbMd7yxDKprIvlY",
  authDomain: "react-todo-app-f3488.firebaseapp.com",
  projectId: "react-todo-app-f3488",
  storageBucket: "react-todo-app-f3488.firebasestorage.app",
  messagingSenderId: "708753365373",
  appId: "1:708753365373:web:ba6310d9e19a73a17c9414",
  measurementId: "G-0RLKWKR56T"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);