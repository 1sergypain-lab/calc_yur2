// ============================================================
// config.js — Конфигурация и магические числа
// ============================================================

const CONFIG = Object.freeze({
  // Налоги
  VAT_RATE: 0.20,
  VAT_MODES: {
    no: 'Без НДС',
    inc: 'С НДС 20% (включен)',
    sep: 'С НДС 20% (выделяется)'
  },

  // Скидки
  DISCOUNT_THRESHOLD: 50000,  // порог для скидки разовых услуг
  DISCOUNT_RATE: 0.10,        // скидка при превышении порога

  // Анимация
  ANIMATION_DURATION: 500,    // мс
  ANIMATION_INTERVAL: 16,     // мс

  // Тост-уведомления
  TOAST_TIMEOUT: 3000,        // мс

  // Дефолтные значения
  DEFAULT_REGION: 'regional',
  DEFAULT_PACKAGE: 'start',
  DEFAULT_URGENCY: 'standard',
  DEFAULT_VAT: 'no',
  DEFAULT_PERIOD: '1',

  // Периоды со скидками
  PERIODS: {
    '1': { months: 1, discount: 0, label: '1 месяц (без скидки)' },
    '3': { months: 3, discount: 0.10, label: '3 месяца (-10% скидка)' },
    '6': { months: 6, discount: 0.15, label: '6 месяцев (-15% скидка)' },
    '12': { months: 12, discount: 0.25, label: '12 месяцев (-25% скидка)' }
  },

  // Ошибки
  ERROR_MESSAGES: {
    NO_PACKAGE: '⚠️ Выберите пакет обслуживания',
    NO_SERVICES: '⚠️ Выберите хотя бы одну разовую услугу',
    POPUP_BLOCKED: '⚠️ Разрешите всплывающие окна',
    PDF_ERROR: '❌ Ошибка при создании документа',
    CALC_ERROR: '❌ Ошибка при расчёте'
  },

  // ID элементов DOM
  DOM_IDS: {
    REGION: 'region',
    REGION_ONEOFF: 'region-oneoff',
    PACKAGES: 'packages',
    EXTRAS: 'extras',
    URGENCY: 'urgency',
    URGENCY_ONEOFF: 'urgency-oneoff',
    VAT: 'vat',
    VAT_ONEOFF: 'vat-oneoff',
    PERIOD: 'period',
    INCLUDE_FEES: 'include-fees',
    INCLUDE_FEES_ONEOFF: 'include-fees-oneoff',
    ONEOFF_SERVICES: 'oneoff-services',
    SUBSCRIPTION_BLOCK: 'subscription-block',
    ONEOFF_BLOCK: 'oneoff-block',
    SUMMARY_PRICE: 'summary-price',
    SUMMARY_PERIOD: 'summary-period',
    DETAILS_LINES: 'details-lines',
    CALC_BTN: 'calcBtn',
    PROPOSAL_BTN: 'proposalBtn',
    WHATSAPP_BTN: 'whatsappBtn',
    TELEGRAM_BTN: 'telegramBtn'
  }
});

// Заморозка — защита от случайных изменений
Object.freeze(CONFIG.VAT_MODES);
Object.freeze(CONFIG.PERIODS);
Object.freeze(CONFIG.ERROR_MESSAGES);
Object.freeze(CONFIG.DOM_IDS);
