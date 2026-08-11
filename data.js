// Централізоване сховище даних для всіх модераторів
const DB_KEY = 'ugta_all_shifts_data_v2';

function getAllShifts() {
  try {
    return JSON.parse(localStorage.getItem(DB_KEY) || '[]');
  } catch (e) {
    return [];
  }
}

function saveShift(shiftData) {
  const allShifts = getAllShifts();
  allShifts.unshift(shiftData);
  localStorage.setItem(DB_KEY, JSON.stringify(allShifts));
}

function getRoleColor(r) {
  if (!r) return '#f0883e';
  const lower = r.toLowerCase();
  if (lower.includes('ктп')) return '#f85149';   // Червоний
  if (lower.includes('зктп')) return '#3fb950';  // Зелений
  if (lower.includes('s.m') || lower.includes('sm')) return '#bc8cff'; // Фіолетовий
  return '#f0883e'; // Оранжевий (Модератор)
}
