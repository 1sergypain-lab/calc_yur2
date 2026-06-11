// ============================================================
// app.js — Точка входа приложения
// ============================================================

/**
 * Главная функция инициализации
 */
function init() {
  try {
    // Заполняем все селекторы и элементы формы
    populateSelectors();
    
    // Привязываем события
    attachEvents();
    
    // Восстанавливаем параметры из URL (если есть)
    restoreFromParams();
    
    console.log('[APP] ✅ Калькулятор v2 успешно инициализирован');
  } catch (err) {
    console.error('[APP] ❌ Ошибка инициализации:', err);
    showToast('❌ Произошла ошибка при загрузке калькулятора');
  }
}

// Запуск после загрузки DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  // DOM уже загружен
  init();
}
