// ============================================================
// utils.js — Утилитарные функции
// ============================================================

// Безопасное получение элемента DOM с проверкой
function getElement(id) {
  const element = document.getElementById(id);
  if (!element) {
    console.warn(`[WARN] Element with id "${id}" not found`);
  }
  return element;
}

// Форматирование числа в рубли
function formatPrice(value) {
  if (typeof value !== 'number' || isNaN(value)) {
    return '0 ₽';
  }
  return Math.round(value).toLocaleString('ru-RU') + ' ₽';
}

// Экранирование HTML для защиты от XSS
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Анимация счётчика цены
function animateCounter(element, start, end, duration = CONFIG.ANIMATION_DURATION) {
  if (!element) return;
  
  // Если значения совпадают или duration = 0 — показываем сразу
  if (start === end || duration <= 0) {
    element.textContent = formatPrice(end);
    return;
  }

  const step = (end - start) / (duration / CONFIG.ANIMATION_INTERVAL);
  let current = start;
  
  // Очищаем предыдущую анимацию, если была
  if (element._animationTimer) {
    clearInterval(element._animationTimer);
  }

  element._animationTimer = setInterval(() => {
    current += step;
    
    // Проверка перехода через конечное значение
    if ((step > 0 && current >= end) || (step < 0 && current <= end)) {
      current = end;
      clearInterval(element._animationTimer);
      element._animationTimer = null;
    }
    element.textContent = formatPrice(current);
  }, CONFIG.ANIMATION_INTERVAL);
}

// Показ уведомления (тост)
function showToast(message, timeout = CONFIG.TOAST_TIMEOUT) {
  const existingToast = document.querySelector('.toast');
  if (existingToast) existingToast.remove();

  const toast = document.createElement('div');
  toast.className = 'toast no-print';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    right: 20px;
    top: 20px;
    background: var(--green, #3D7A5F);
    color: #fff;
    padding: 12px 16px;
    border-radius: 8px;
    font-size: 14px;
    z-index: 9999;
    animation: slideUp 0.3s ease-out;
    box-shadow: 0 4px 12px rgba(61,122,95,0.3);
    max-width: 350px;
  `;
  document.body.appendChild(toast);
  
  setTimeout(() => toast.remove(), timeout);
}

// Валидация числа
function isValidNumber(value) {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

// Безопасное извлечение числового значения из строки
function extractPriceFromString(str) {
  if (!str) return 0;
  const cleaned = str.replace(/[^0-9]/g, '');
  const num = parseInt(cleaned, 10);
  return isNaN(num) ? 0 : num;
}

// Генерация ID для коммерческого предложения
function generateProposalId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'КП-';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  result += '-2026';
  return result;
}

// Получение текущей даты в формате ru-RU
function getCurrentDate() {
  return new Date().toLocaleDateString('ru-RU');
}

// Получение текущего времени
function getCurrentDateTime() {
  return new Date().toLocaleString('ru-RU');
}
