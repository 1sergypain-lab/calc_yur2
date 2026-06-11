// ============================================================
// ui.js — Работа с пользовательским интерфейсом
// ============================================================

/**
 * Заполнение всех селекторов и элементов формы
 */
function populateSelectors() {
  const regionSelect = getElement(CONFIG.DOM_IDS.REGION);
  const regionOneoff = getElement(CONFIG.DOM_IDS.REGION_ONEOFF);
  
  // Регионы
  Object.entries(REGIONS).forEach(([key, region]) => {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = region.name;
    if (regionSelect) regionSelect.appendChild(option);
    
    const optionClone = option.cloneNode(true);
    if (regionOneoff) regionOneoff.appendChild(optionClone);
  });
  
  if (regionSelect) regionSelect.value = CONFIG.DEFAULT_REGION;
  if (regionOneoff) regionOneoff.value = CONFIG.DEFAULT_REGION;

  // Пакеты
  const packagesDiv = getElement(CONFIG.DOM_IDS.PACKAGES);
  if (packagesDiv) {
    Object.entries(PACKAGES).forEach(([key, pkg], index) => {
      const wrapper = document.createElement('label');
      wrapper.className = 'package';
      wrapper.innerHTML = `
        <input type="radio" name="package" value="${escapeHtml(key)}" ${index === 0 ? 'checked' : ''}>
        <strong>${escapeHtml(pkg.title)}</strong> — ${formatPrice(pkg.price)}
        <div class="muted">${escapeHtml(pkg.desc)}</div>
      `;
      packagesDiv.appendChild(wrapper);
    });
  }

  // Доп. опции
  const extrasDiv = getElement(CONFIG.DOM_IDS.EXTRAS);
  if (extrasDiv) {
    Object.entries(EXTRAS).forEach(([key, extra]) => {
      const wrapper = document.createElement('label');
      wrapper.className = 'extra';
      wrapper.innerHTML = `
        <input type="checkbox" name="extra" value="${escapeHtml(key)}">
        ${escapeHtml(extra.name)} — ${formatPrice(extra.price)}
      `;
      extrasDiv.appendChild(wrapper);
    });
  }

  // Срочность (только для разовых услуг)
  const urgencyOneoff = getElement(CONFIG.DOM_IDS.URGENCY_ONEOFF);
  if (urgencyOneoff) {
    Object.entries(URGENCY).forEach(([key, urg], index) => {
      const label = document.createElement('label');
      label.className = 'radio';
      label.innerHTML = `
        <input type="radio" name="urgency-oneoff" value="${escapeHtml(key)}" ${index === 0 ? 'checked' : ''}>
        ${escapeHtml(urg.name)}
      `;
      urgencyOneoff.appendChild(label);
    });
  }

  // НДС (абонентское)
  const vatDiv = getElement(CONFIG.DOM_IDS.VAT);
  if (vatDiv) {
    ['no', 'inc', 'sep'].forEach((val, index) => {
      const label = document.createElement('label');
      label.className = 'radio';
      label.innerHTML = `
        <input type="radio" name="vat" value="${escapeHtml(val)}" ${index === 0 ? 'checked' : ''}>
        ${escapeHtml(CONFIG.VAT_MODES[val])}
      `;
      vatDiv.appendChild(label);
    });
  }

  // НДС (разовые)
  const vatOneoff = getElement(CONFIG.DOM_IDS.VAT_ONEOFF);
  if (vatOneoff) {
    ['no', 'inc', 'sep'].forEach((val, index) => {
      const label = document.createElement('label');
      label.className = 'radio';
      label.innerHTML = `
        <input type="radio" name="vat-oneoff" value="${escapeHtml(val)}" ${index === 0 ? 'checked' : ''}>
        ${escapeHtml(CONFIG.VAT_MODES[val])}
      `;
      vatOneoff.appendChild(label);
    });
  }

  // Разовые услуги (аккордеон)
  const oneoffDiv = getElement(CONFIG.DOM_IDS.ONEOFF_SERVICES);
  if (oneoffDiv) {
    Object.entries(ONEOFF_CATEGORIES).forEach(([catKey, category]) => {
      const accDiv = document.createElement('div');
      accDiv.className = 'accordion';
      
      const accBtn = document.createElement('button');
      accBtn.type = 'button';
      accBtn.className = 'accordion-btn';
      accBtn.textContent = `▼ ${category.title}`;
      
      const accContent = document.createElement('div');
      accContent.className = 'accordion-content';
      accContent.style.display = 'none';
      
      accBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const isHidden = accContent.style.display === 'none';
        accContent.style.display = isHidden ? 'block' : 'none';
        accBtn.textContent = isHidden ? `▲ ${category.title}` : `▼ ${category.title}`;
      });
      
      Object.entries(category.services).forEach(([key, service]) => {
        const wrapper = document.createElement('label');
        wrapper.className = 'extra';
        const feeText = service.fee ? ` (госпошлина ${formatPrice(service.fee)})` : '';
        wrapper.innerHTML = `
          <input type="checkbox" name="oneoff" value="${escapeHtml(key)}">
          ${escapeHtml(service.name)} — ${formatPrice(service.price)}${feeText}
        `;
        accContent.appendChild(wrapper);
      });
      
      accDiv.appendChild(accBtn);
      accDiv.appendChild(accContent);
      oneoffDiv.appendChild(accDiv);
    });
  }
}

/**
 * Отображение детализации расчёта для абонентского
 */
function renderSubscriptionDetails(result) {
  if (result.error) {
    const el = getElement(CONFIG.DOM_IDS.DETAILS_LINES);
    if (el) el.textContent = result.error;
    return;
  }

  const lines = [];
  
  // Услуги
  lines.push(`${result.pkg.title.padEnd(30)} ${formatPrice(result.pkg.price)}/мес`);
  result.extras.forEach(extra => {
    lines.push(`${extra.name.padEnd(30)} +${formatPrice(extra.price)}/мес`);
  });
  lines.push('─'.repeat(45));
  
  // Базовая стоимость
  lines.push(`Базовая стоимость/мес ${formatPrice(result.base).padStart(15)}`);
  lines.push(`Регион: ${result.region.name} (×${result.region.coefficient}) ${(result.afterRegion - result.base > 0 ? '+' : '')}${formatPrice(result.afterRegion - result.base).padStart(10)}`);
  lines.push('─'.repeat(45));
  
  // Итог за месяц
  lines.push(`Стоимость/мес ${formatPrice(result.monthlyCost).padStart(22)}`);
  lines.push(`Период: ${result.periodMonths} мес. ×${result.periodMonths}`);
  lines.push(`За весь период: ${formatPrice(result.totalForPeriod).padStart(21)}`);
  
  // Скидка
  if (result.discount > 0) {
    lines.push(`Скидка ${result.periodMonths} мес. (-${Math.round(result.discountRate * 100)}%) -${formatPrice(result.discount).padStart(26)}`);
  }
  
  // Госпошлины
  if (result.fees > 0) {
    lines.push(`Госпошлины и расходы +${formatPrice(result.fees).padStart(18)}`);
  }
  
  lines.push('─'.repeat(45));
  lines.push(`Итого без НДС ${formatPrice(result.beforeVat).padStart(22)}`);
  
  // НДС — показываем только для режима 'sep' (подробно)
  if (result.vatMode === 'sep') {
    lines.push(`НДС 22%: +${formatPrice(result.vatAmount).padStart(25)}`);
  }
  
  lines.push('═'.repeat(45));
  lines.push(`ИТОГО за ${result.periodMonths} мес. ${formatPrice(result.total).padStart(20)}`);
  lines.push(`(${formatPrice(result.total / result.periodMonths)}/мес)`);

  const detailsEl = getElement(CONFIG.DOM_IDS.DETAILS_LINES);
  if (detailsEl) detailsEl.textContent = lines.join('\n');
  
  const summaryPrice = getElement(CONFIG.DOM_IDS.SUMMARY_PRICE);
  const summaryPeriod = getElement(CONFIG.DOM_IDS.SUMMARY_PERIOD);
  if (summaryPrice) summaryPrice.textContent = formatPrice(result.total);
  if (summaryPeriod) summaryPeriod.textContent = `/за ${result.periodMonths} мес.`;
}

/**
 * Отображение детализации расчёта для разовых услуг
 */
function renderOneoffDetails(result) {
  if (result.error) {
    const el = getElement(CONFIG.DOM_IDS.DETAILS_LINES);
    if (el) el.textContent = result.error;
    return;
  }

  const lines = [];
  
  // Услуги
  result.services.forEach(service => {
    const feeAmount = service.fee || (STATE_FEES[service.key] ? STATE_FEES[service.key].amount : 0);
    const feeText = feeAmount ? ` (госпошлина ${formatPrice(feeAmount)})` : '';
    lines.push(`${service.name.padEnd(35)} ${formatPrice(service.price).padStart(10)}${feeText}`);
  });
  lines.push('─'.repeat(45));
  
  lines.push(`Базовая стоимость ${formatPrice(result.base).padStart(20)}`);
  lines.push(`Регион: ${result.region.name} (×${result.region.coefficient}) +${formatPrice(Math.round(result.afterRegion - result.base)).padStart(15)}`);
  lines.push(`Срочность: ${result.urgency.coefficient > 1 ? '×' + result.urgency.coefficient : 'стандартная'}`);
  lines.push('─'.repeat(45));
  
  if (result.fees > 0) {
    lines.push(`Госпошлины и расходы +${formatPrice(result.fees).padStart(18)}`);
  }
  if (result.discount > 0) {
    lines.push(`Скидка (≥ ${formatPrice(CONFIG.DISCOUNT_THRESHOLD)}) -${formatPrice(result.discount).padStart(20)}`);
  }
  
  lines.push('─'.repeat(45));
  lines.push(`Итого без НДС ${formatPrice(result.afterDiscount).padStart(22)}`);
  
  // НДС — показываем только для режима 'sep' (подробно)
  if (result.vatMode === 'sep') {
    lines.push(`НДС 22%: +${formatPrice(result.vatAmount).padStart(25)}`);
  }
  
  lines.push('═'.repeat(45));
  lines.push(`ИТОГО ${formatPrice(result.total).padStart(31)}`);

  const detailsEl = getElement(CONFIG.DOM_IDS.DETAILS_LINES);
  if (detailsEl) detailsEl.textContent = lines.join('\n');
  
  const summaryPrice = getElement(CONFIG.DOM_IDS.SUMMARY_PRICE);
  const summaryPeriod = getElement(CONFIG.DOM_IDS.SUMMARY_PERIOD);
  if (summaryPrice) summaryPrice.textContent = formatPrice(result.total);
  if (summaryPeriod) summaryPeriod.textContent = 'единоразово';
}

/**
 * Обработчик нажатия "Рассчитать"
 */
function handleCalculate() {
  const type = FormReader.getServiceType();
  
  let result;
  if (type === 'subscription') {
    result = calcSubscription();
    if (result.error) {
      showToast(result.error);
      return;
    }
    
    const oldPrice = extractPriceFromString(
      getElement(CONFIG.DOM_IDS.SUMMARY_PRICE)?.textContent || '0'
    );
    renderSubscriptionDetails(result);
    
    const summaryEl = getElement(CONFIG.DOM_IDS.SUMMARY_PRICE);
    if (summaryEl) {
      animateCounter(summaryEl, oldPrice || Math.round(result.total * 0.5), result.total);
    }
  } else {
    result = calcOneoff();
    if (result.error) {
      showToast(result.error);
      return;
    }
    
    const oldPrice = extractPriceFromString(
      getElement(CONFIG.DOM_IDS.SUMMARY_PRICE)?.textContent || '0'
    );
    renderOneoffDetails(result);
    
    const summaryEl = getElement(CONFIG.DOM_IDS.SUMMARY_PRICE);
    if (summaryEl) {
      animateCounter(summaryEl, oldPrice || Math.round(result.total * 0.5), result.total);
    }
  }
}

/**
 * Восстановление параметров из URL
 */
function restoreFromParams() {
  const params = new URLSearchParams(window.location.search);
  
  // Тип услуги
  const type = params.get('type') || 'subscription';
  const typeRadio = document.querySelector(`input[name=serviceType][value="${escapeHtml(type)}"]`);
  if (typeRadio) {
    typeRadio.checked = true;
    document.querySelectorAll('.radio-card').forEach(card => {
      card.classList.toggle('selected', card.querySelector('input')?.value === type);
    });
  }
  
  // Блоки
  const subBlock = getElement(CONFIG.DOM_IDS.SUBSCRIPTION_BLOCK);
  const oneoffBlock = getElement(CONFIG.DOM_IDS.ONEOFF_BLOCK);
  if (subBlock) subBlock.style.display = type === 'subscription' ? 'block' : 'none';
  if (oneoffBlock) oneoffBlock.style.display = type === 'oneoff' ? 'block' : 'none';
  
  if (type === 'subscription') {
    const pkg = params.get('package');
    if (pkg) {
      const pkgRadio = document.querySelector(`input[name=package][value="${escapeHtml(pkg)}"]`);
      if (pkgRadio) pkgRadio.checked = true;
    }
    
    const region = params.get('region');
    const regionEl = getElement(CONFIG.DOM_IDS.REGION);
    if (region && regionEl && REGIONS[region]) regionEl.value = region;
    
    const period = params.get('period');
    const periodEl = getElement(CONFIG.DOM_IDS.PERIOD);
    if (period && periodEl && CONFIG.PERIODS[period]) periodEl.value = period;
    
    const extras = params.get('extras');
    if (extras) {
      extras.split(',').forEach(key => {
        const cb = document.querySelector(`input[name=extra][value="${escapeHtml(key)}"]`);
        if (cb) cb.checked = true;
      });
    }
    
    const vat = params.get('vat');
    if (vat) {
      const vatRadio = document.querySelector(`input[name=vat][value="${escapeHtml(vat)}"]`);
      if (vatRadio) vatRadio.checked = true;
    }
  } else {
    const services = params.get('services');
    if (services) {
      services.split(',').forEach(key => {
        const cb = document.querySelector(`input[name=oneoff][value="${escapeHtml(key)}"]`);
        if (cb) cb.checked = true;
      });
    }
    
    const region = params.get('region');
    const regionEl = getElement(CONFIG.DOM_IDS.REGION_ONEOFF);
    if (region && regionEl && REGIONS[region]) regionEl.value = region;
    
    const urgency = params.get('urgency');
    if (urgency) {
      const urgRadio = document.querySelector(`input[name=urgency-oneoff][value="${escapeHtml(urgency)}"]`);
      if (urgRadio) urgRadio.checked = true;
    }
    
    const vat = params.get('vat');
    if (vat) {
      const vatRadio = document.querySelector(`input[name=vat-oneoff][value="${escapeHtml(vat)}"]`);
      if (vatRadio) vatRadio.checked = true;
    }
  }
}

/**
 * Генерация ссылки с параметрами
 */
function generateShareLink() {
  const params = new URLSearchParams();
  const type = FormReader.getServiceType();
  params.set('type', type);
  
  if (type === 'subscription') {
    const pkg = document.querySelector('input[name=package]:checked');
    if (pkg) params.set('package', pkg.value);
    
    const region = getElement(CONFIG.DOM_IDS.REGION);
    if (region) params.set('region', region.value);
    
    const period = getElement(CONFIG.DOM_IDS.PERIOD);
    if (period) params.set('period', period.value);
    
    const extras = Array.from(document.querySelectorAll('input[name=extra]:checked')).map(i => i.value);
    if (extras.length) params.set('extras', extras.join(','));
    
    const vat = document.querySelector('input[name=vat]:checked');
    if (vat) params.set('vat', vat.value);
  } else {
    const services = Array.from(document.querySelectorAll('input[name=oneoff]:checked')).map(i => i.value);
    if (services.length) params.set('services', services.join(','));
    
    const region = getElement(CONFIG.DOM_IDS.REGION_ONEOFF);
    if (region) params.set('region', region.value);
    
    const urgency = document.querySelector('input[name=urgency-oneoff]:checked');
    if (urgency) params.set('urgency', urgency.value);
    
    const vat = document.querySelector('input[name=vat-oneoff]:checked');
    if (vat) params.set('vat', vat.value);
  }
  
  return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
}

/**
 * Привязка событий к DOM-элементам
 */
function attachEvents() {
  // Переключение типа услуги
  document.querySelectorAll('.radio-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.radio-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      const input = card.querySelector('input');
      if (input) input.checked = true;
      
      const value = input ? input.value : 'subscription';
      const subBlock = getElement(CONFIG.DOM_IDS.SUBSCRIPTION_BLOCK);
      const oneoffBlock = getElement(CONFIG.DOM_IDS.ONEOFF_BLOCK);
      if (subBlock) subBlock.style.display = value === 'subscription' ? 'block' : 'none';
      if (oneoffBlock) oneoffBlock.style.display = value === 'oneoff' ? 'block' : 'none';
    });
  });

  // Кнопка "Рассчитать"
  const calcBtn = getElement(CONFIG.DOM_IDS.CALC_BTN);
  if (calcBtn) {
    calcBtn.addEventListener('click', handleCalculate);
  }

  // Кнопка "Получить предложение"
  const proposalBtn = getElement(CONFIG.DOM_IDS.PROPOSAL_BTN);
  if (proposalBtn) {
    proposalBtn.addEventListener('click', generateAndOpenPDF);
  }

  // Кнопка WhatsApp
  const whatsappBtn = getElement(CONFIG.DOM_IDS.WHATSAPP_BTN);
  if (whatsappBtn) {
    whatsappBtn.addEventListener('click', () => {
      const type = FormReader.getServiceType();
      const typeLabel = type === 'subscription' ? 'Абонентское' : 'Разовое';
      const msg = `Здравствуйте! Я рассчитал стоимость юридических услуг:\nТип: ${typeLabel}\nСсылка: ${generateShareLink()}`;
      const url = `https://wa.me/?text=${encodeURIComponent(msg)}`;
      window.open(url, '_blank');
    });
  }

  // Кнопка Telegram
  const telegramBtn = getElement(CONFIG.DOM_IDS.TELEGRAM_BTN);
  if (telegramBtn) {
    telegramBtn.addEventListener('click', () => {
      const type = FormReader.getServiceType();
      const typeLabel = type === 'subscription' ? 'Абонентское' : 'Разовое';
      const msg = `Здравствуйте! Я рассчитал стоимость юридических услуг:\nТип: ${typeLabel}`;
      const url = `https://t.me/share/url?url=${encodeURIComponent(generateShareLink())}&text=${encodeURIComponent(msg)}`;
      window.open(url, '_blank');
    });
  }
}
