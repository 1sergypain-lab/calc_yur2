// ============================================================
// calculations.js — Бизнес-логика расчётов
// ============================================================

/**
 * Получение значений из формы
 */
const FormReader = {
  /** Выбранный тип услуги */
  getServiceType() {
    const el = document.querySelector('input[name=serviceType]:checked');
    return el ? el.value : 'subscription';
  },

  /** Регион */
  getRegion(type) {
    const id = type === 'subscription' ? CONFIG.DOM_IDS.REGION : CONFIG.DOM_IDS.REGION_ONEOFF;
    const select = getElement(id);
    if (!select) return REGIONS[CONFIG.DEFAULT_REGION];
    return REGIONS[select.value] || REGIONS[CONFIG.DEFAULT_REGION];
  },

  /** Пакет */
  getPackage() {
    const selected = document.querySelector('input[name=package]:checked');
    if (!selected) return null;
    return PACKAGES[selected.value] || null;
  },

  /** Выбранные доп. опции */
  getExtras() {
    return Array.from(document.querySelectorAll('input[name=extra]:checked'))
      .map(i => ({ key: i.value, ...EXTRAS[i.value] }))
      .filter(e => e.price !== undefined);
  },

  /** Срочность */
  getUrgency(type) {
    const name = type === 'subscription' ? 'urgency' : 'urgency-oneoff';
    const selected = document.querySelector(`input[name=${name}]:checked`);
    if (!selected) return URGENCY[CONFIG.DEFAULT_URGENCY];
    return URGENCY[selected.value] || URGENCY[CONFIG.DEFAULT_URGENCY];
  },

  /** НДС */
  getVat(type) {
    const name = type === 'subscription' ? 'vat' : 'vat-oneoff';
    const selected = document.querySelector(`input[name=${name}]:checked`);
    if (!selected) return CONFIG.DEFAULT_VAT;
    return selected.value;
  },

  /** Период */
  getPeriod() {
    const sel = getElement(CONFIG.DOM_IDS.PERIOD);
    if (!sel) return CONFIG.DEFAULT_PERIOD;
    const periodConfig = CONFIG.PERIODS[sel.value];
    return periodConfig || CONFIG.PERIODS[CONFIG.DEFAULT_PERIOD];
  },

  /** Включены ли госпошлины */
  getIncludeFees(type) {
    const id = type === 'subscription' 
      ? CONFIG.DOM_IDS.INCLUDE_FEES 
      : CONFIG.DOM_IDS.INCLUDE_FEES_ONEOFF;
    const checkbox = getElement(id);
    return checkbox ? checkbox.checked : false;
  },

  /** Выбранные разовые услуги */
  getOneoffServices() {
    return Array.from(document.querySelectorAll('input[name=oneoff]:checked'))
      .map(i => ({ key: i.value, ...ONEOFF_SERVICES[i.value] }))
      .filter(s => s.price !== undefined);
  }
};

/**
 * Расчёт абонентского обслуживания
 * @returns {Object} Результат расчёта с детализацией
 */
function calcSubscription() {
  try {
    const pkg = FormReader.getPackage();
    if (!pkg) {
      return { error: CONFIG.ERROR_MESSAGES.NO_PACKAGE };
    }

    const extras = FormReader.getExtras();
    const region = FormReader.getRegion('subscription');
    const periodConfig = FormReader.getPeriod();
    const includeFees = FormReader.getIncludeFees('subscription');
    const vatMode = FormReader.getVat('subscription');

    // Базовая стоимость пакета + опции
    const base = pkg.price + extras.reduce((sum, e) => sum + e.price, 0);
    
    // Применение регионального коэффициента (срочность для абонентского не применяется — всегда стандартная)
    const afterRegion = Math.round(base * region.coefficient);
    
    // Стоимость за месяц
    const monthlyCost = afterRegion;
    
    // Расчёт за период со скидкой
    const { months: periodMonths, discount: discountRate } = periodConfig;
    const totalForPeriod = monthlyCost * periodMonths;
    const discount = Math.round(totalForPeriod * discountRate);
    const afterDiscount = totalForPeriod - discount;
    
    // Госпошлины
    let fees = 0;
    if (includeFees) {
      fees = extras.reduce((sum, extra) => {
        const feeKeys = EXTRA_FEE_MAP[extra.key] || [];
        return sum + feeKeys.reduce((feeSum, fk) => {
          return feeSum + (STATE_FEES[fk] ? STATE_FEES[fk].amount : 0);
        }, 0);
      }, 0);
    }
    
    // НДС
    const beforeVat = afterDiscount + fees;
    let vatAmount = 0;
    if (vatMode === 'sep') {
      vatAmount = Math.round(beforeVat * CONFIG.VAT_RATE);
    }
    
    const total = vatMode === 'inc'
      ? Math.round(beforeVat * (1 + CONFIG.VAT_RATE))
      : (beforeVat + vatAmount);

    return {
      type: 'subscription',
      pkg,
      extras,
      region,
      periodConfig,
      base,
      afterRegion,
      monthlyCost,
      totalForPeriod,
      discount,
      discountRate,
      afterDiscount,
      fees,
      vatMode,
      vatAmount,
      beforeVat,
      total,
      periodMonths,
      success: true
    };
  } catch (err) {
    console.error('[calcSubscription] Error:', err);
    return { error: CONFIG.ERROR_MESSAGES.CALC_ERROR };
  }
}

/**
 * Расчёт разовых услуг
 * @returns {Object} Результат расчёта с детализацией
 */
function calcOneoff() {
  try {
    const services = FormReader.getOneoffServices();
    if (services.length === 0) {
      return { error: CONFIG.ERROR_MESSAGES.NO_SERVICES };
    }

    const region = FormReader.getRegion('oneoff');
    const urgency = FormReader.getUrgency('oneoff');
    const includeFees = FormReader.getIncludeFees('oneoff');
    const vatMode = FormReader.getVat('oneoff');

    // Базовая стоимость выбранных услуг
    const base = services.reduce((sum, s) => sum + s.price, 0);
    
    // Применение коэффициентов
    const afterRegion = Math.round(base * region.coefficient);
    const afterUrgency = Math.round(afterRegion * urgency.coefficient);

    // Госпошлины
    let fees = 0;
    if (includeFees) {
      fees = services.reduce((sum, s) => {
        const feeAmount = s.fee || (STATE_FEES[s.key] ? STATE_FEES[s.key].amount : 0);
        return sum + feeAmount;
      }, 0);
    }
    
    // Скидка при сумме >= порога
    let discount = 0;
    const beforeDiscount = afterUrgency + fees;
    if (beforeDiscount >= CONFIG.DISCOUNT_THRESHOLD) {
      discount = Math.round(beforeDiscount * CONFIG.DISCOUNT_RATE);
    }
    
    const afterDiscount = beforeDiscount - discount;
    
    // НДС
    let vatAmount = 0;
    if (vatMode === 'sep') {
      vatAmount = Math.round(afterDiscount * CONFIG.VAT_RATE);
    }
    
    const total = vatMode === 'inc'
      ? Math.round(afterDiscount * (1 + CONFIG.VAT_RATE))
      : (afterDiscount + vatAmount);

    return {
      type: 'oneoff',
      services,
      region,
      urgency,
      base,
      afterRegion,
      afterUrgency,
      fees,
      discount,
      discountRate: discount > 0 ? CONFIG.DISCOUNT_RATE : 0,
      afterDiscount,
      vatMode,
      vatAmount,
      beforeDiscount,
      total,
      success: true
    };
  } catch (err) {
    console.error('[calcOneoff] Error:', err);
    return { error: CONFIG.ERROR_MESSAGES.CALC_ERROR };
  }
}
