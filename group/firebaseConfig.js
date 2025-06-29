import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCtn4CkWkSceqfTSTdWhmy0GXbibGIxkRE",
  authDomain: "meetpoint-app-20250610.firebaseapp.com",
  projectId: "meetpoint-app-20250610",
  storageBucket: "meetpoint-app-20250610.appspot.com",
  messagingSenderId: "998409866183",
  appId: "1:998409866183:android:c05dfa9d17abf03733e7e2"
};

// Firebaseアプリの初期化
const app = initializeApp(firebaseConfig);

// Firebase Authインスタンスの作成
export const auth = getAuth(app);

// Firebase Firestoreインスタンスの作成
export const db = getFirestore(app);

// ログイン処理のための関数（ログイン用）
export const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('ログイン成功:', userCredential);
    return userCredential;
  } catch (error) {
    console.error('ログイン失敗:', error);
    throw error;
  }
};

// サインアップ処理のための関数（新規登録用）
export const signUp = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log('サインアップ成功:', userCredential);
    return userCredential;
  } catch (error) {
    console.error('サインアップ失敗:', error);
    throw error;
  }
};
