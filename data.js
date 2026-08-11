import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA6gSnuDVHlP0OnnCdACckeJTME07vDT2E",
  authDomain: "ugta-moderation.firebaseapp.com",
  projectId: "ugta-moderation",
  storageBucket: "ugta-moderation.appfirebasestorage.app",
  messagingSenderId: "1078625762746",
  appId: "1:1078625762746:web:42567076931380acd87183",
  measurementId: "G-MCN6F3N2KB"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const COLLECTION_NAME = "ugta_shifts";

export async function getAllShifts() {
  try {
    const q = query(collection(db, COLLECTION_NAME));
    const querySnapshot = await getDocs(q);
    const shifts = [];
    querySnapshot.forEach((doc) => {
      shifts.push(doc.data());
    });
    return shifts;
  } catch (e) {
    console.error("Помилка завантаження даних: ", e);
    return [];
  }
}

export async function saveShift(shiftData) {
  try {
    await addDoc(collection(db, COLLECTION_NAME), shiftData);
  } catch (e) {
    console.error("Помилка збереження даних: ", e);
  }
}

export function getRoleColor(r) {
  if (!r) return '#f0883e';
  const lower = r.toLowerCase();
  if (lower.includes('ктп')) return '#f85149';   // Червоний
  if (lower.includes('зктп')) return '#3fb950';  // Зелений
  if (lower.includes('s.m') || lower.includes('sm')) return '#bc8cff'; // Фіолетовий
  return '#f0883e'; // Оранжевий (Модератор)
}
