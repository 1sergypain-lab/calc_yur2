// ============================================================
// pdf.js — Генерация коммерческого предложения (PDF/печать)
// ============================================================

/**
 * Генерация HTML для коммерческого предложения
 * @returns {string} HTML-код документа
 */
function generateInvoiceHTML() {
  const type = FormReader.getServiceType();
  const proposalId = generateProposalId();
  const date = getCurrentDate();
  
  let servicesRows = '';
  let calculationDetails = '';
  
  if (type === 'subscription') {
    const calc = calcSubscription();
    if (calc.success) {
      // Таблица услуг
      servicesRows += `<tr><td>${escapeHtml(calc.pkg.title)} (в месяц)</td><td style="text-align:right;">${formatPrice(calc.pkg.price)}</td></tr>`;
      calc.extras.forEach(extra => {
        servicesRows += `<tr><td>${escapeHtml(extra.name)} (в месяц)</td><td style="text-align:right;">${formatPrice(extra.price)}</td></tr>`;
      });
      
      // Детализация
      calculationDetails = `
        <h3>Детализация расчёта:</h3>
        <table>
          <tr><td>Базовая стоимость пакета и опций (в месяц)</td><td style="text-align:right;font-weight:bold;">${formatPrice(calc.base)}</td></tr>
          <tr><td>Региональный коэффициент: ${escapeHtml(calc.region.name)} (×${calc.region.coefficient})</td><td style="text-align:right;">+${formatPrice(Math.round(calc.afterRegion - calc.base))}</td></tr>
          <tr><td>Коэффициент срочности: ${escapeHtml(calc.urgency.name)} (×${calc.urgency.coefficient})</td><td style="text-align:right;">×${calc.urgency.coefficient}</td></tr>
          <tr style="background:#f9f9f9;"><td style="font-weight:bold;">Стоимость в месяц</td><td style="text-align:right;font-weight:bold;">${formatPrice(calc.monthlyCost)}</td></tr>
          <tr><td>Период договора: ${calc.periodMonths} мес.</td><td style="text-align:right;">×${calc.periodMonths}</td></tr>
          <tr style="background:#f9f9f9;"><td style="font-weight:bold;">За весь период (${calc.periodMonths} мес.)</td><td style="text-align:right;font-weight:bold;">${formatPrice(calc.totalForPeriod)}</td></tr>
          ${calc.discount > 0 ? `<tr><td>Скидка за ${calc.periodMonths} мес. (-${Math.round(calc.discountRate * 100)}%)</td><td style="text-align:right;">-${formatPrice(calc.discount)}</td></tr>` : ''}
          ${calc.fees > 0 ? `<tr><td>Госпошлины и расходы</td><td style="text-align:right;">+${formatPrice(calc.fees)}</td></tr>` : ''}
          <tr style="background:#f0f0f0;"><td style="font-weight:bold;">Итого без НДС</td><td style="text-align:right;font-weight:bold;">${formatPrice(calc.beforeVat)}</td></tr>
          ${calc.vatAmount > 0 
            ? `<tr><td>НДС 20% (выделяется отдельно)</td><td style="text-align:right;">+${formatPrice(calc.vatAmount)}</td></tr>` 
            : '<tr><td>НДС</td><td style="text-align:right;">не облагается</td></tr>'
          }
          <tr style="background:#3D7A5F;color:white;"><td style="font-weight:bold;font-size:14px;">ИТОГО за ${calc.periodMonths} мес.</td><td style="text-align:right;font-weight:bold;font-size:14px;">${formatPrice(calc.total)}</td></tr>
          <tr style="background:#f0f0f0;"><td style="font-size:11px;">Средняя стоимость в месяц</td><td style="text-align:right;font-size:11px;">${formatPrice(Math.round(calc.total / calc.periodMonths))}</td></tr>
        </table>
      `;
    }
  } else {
    const calc = calcOneoff();
    if (calc.success) {
      calc.services.forEach(service => {
        const feeAmount = service.fee || (STATE_FEES[service.key] ? STATE_FEES[service.key].amount : 0);
        servicesRows += `<tr><td>${escapeHtml(service.name)}</td><td style="text-align:right;">${formatPrice(service.price)}</td></tr>`;
        if (feeAmount) {
          servicesRows += `<tr style="background:#f9f9f9;"><td style="font-size:12px;color:#666;padding-left:20px;">  - Госпошлина</td><td style="text-align:right;font-size:12px;color:#666;">${formatPrice(feeAmount)}</td></tr>`;
        }
      });
      
      calculationDetails = `
        <h3>Детализация расчёта:</h3>
        <table>
          <tr><td>Базовая стоимость услуг</td><td style="text-align:right;font-weight:bold;">${formatPrice(calc.base)}</td></tr>
          <tr><td>Региональный коэффициент: ${escapeHtml(calc.region.name)} (×${calc.region.coefficient})</td><td style="text-align:right;">+${formatPrice(Math.round(calc.afterRegion - calc.base))}</td></tr>
          <tr><td>Коэффициент срочности: ${escapeHtml(calc.urgency.name)} (×${calc.urgency.coefficient})</td><td style="text-align:right;">×${calc.urgency.coefficient}</td></tr>
          <tr style="background:#f9f9f9;"><td style="font-weight:bold;">С учётом коэффициентов</td><td style="text-align:right;font-weight:bold;">${formatPrice(calc.afterUrgency)}</td></tr>
          ${calc.fees > 0 ? `<tr><td>Госпошлины и расходы</td><td style="text-align:right;">+${formatPrice(calc.fees)}</td></tr>` : ''}
          ${calc.discount > 0 ? `<tr><td>Скидка (сумма ≥ ${formatPrice(CONFIG.DISCOUNT_THRESHOLD)})</td><td style="text-align:right;">-${formatPrice(calc.discount)}</td></tr>` : ''}
          <tr style="background:#f0f0f0;"><td style="font-weight:bold;">Итого без НДС</td><td style="text-align:right;font-weight:bold;">${formatPrice(calc.afterDiscount)}</td></tr>
          ${calc.vatAmount > 0 
            ? `<tr><td>НДС 20% (выделяется отдельно)</td><td style="text-align:right;">+${formatPrice(calc.vatAmount)}</td></tr>` 
            : '<tr><td>НДС</td><td style="text-align:right;">не облагается</td></tr>'
          }
          <tr style="background:#3D7A5F;color:white;"><td style="font-weight:bold;font-size:14px;">ИТОГО (разовое)</td><td style="text-align:right;font-weight:bold;font-size:14px;">${formatPrice(calc.total)}</td></tr>
        </table>
      `;
    }
  }

  // Итоговая цена
  const summaryEl = getElement(CONFIG.DOM_IDS.SUMMARY_PRICE);
  const totalPrice = summaryEl ? summaryEl.textContent : '0 ₽';
  
  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>Коммерческое предложение ${escapeHtml(proposalId)}</title>
  <style>
    @media print {
      body { margin: 0; padding: 15mm; }
      .no-print { display: none !important; }
    }
    body { 
      font-family: 'Times New Roman', Times, serif; 
      margin: 25px; 
      color: #1a1a1a; 
      line-height: 1.5;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 { 
      font-size: 18px; 
      text-align: center; 
      margin: 5px 0;
      color: #3D7A5F;
    }
    h3 { 
      font-size: 13px; 
      margin: 20px 0 10px 0;
      color: #3D7A5F;
      border-bottom: 2px solid #3D7A5F;
      padding-bottom: 5px;
    }
    table { 
      width: 100%; 
      border-collapse: collapse; 
      margin: 15px 0;
    }
    th, td { 
      padding: 8px 10px; 
      text-align: left; 
      border: 1px solid #999;
    }
    th { 
      background: #3D7A5F; 
      color: white; 
      font-weight: bold;
    }
    td { 
      font-size: 12px;
    }
    .header { 
      text-align: center; 
      margin-bottom: 25px; 
      border-bottom: 2px solid #3D7A5F; 
      padding-bottom: 15px;
    }
    .company-info { 
      margin: 20px 0; 
      font-size: 12px; 
      line-height: 1.6;
      background: #f9f9f9;
      padding: 15px;
      border-left: 3px solid #3D7A5F;
    }
    .sig { 
      margin-top: 50px; 
      display: flex; 
      justify-content: space-between;
      gap: 20px;
    }
    .sig .box { 
      width: 48%; 
      font-size: 11px;
      border: 1px solid #ddd;
      padding: 15px;
    }
    .requisites { 
      font-size: 11px; 
      margin-top: 20px; 
      border: 1px solid #ddd; 
      padding: 12px; 
      line-height: 1.5;
      background: #f9f9f9;
    }
    .terms { 
      font-size: 11px; 
      margin-top: 20px; 
      color: #555;
      line-height: 1.6;
    }
    .footer { 
      font-size: 10px; 
      margin-top: 20px; 
      text-align: center; 
      color: #999;
      border-top: 1px solid #ddd;
      padding-top: 10px;
    }
    .print-btn {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 30px;
      background: #3D7A5F;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 16px;
      font-weight: bold;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 9999;
    }
    .print-btn:hover {
      background: #2D6A4F;
    }
    .info-box {
      position: fixed;
      top: 80px;
      right: 20px;
      background: #fff3cd;
      border: 1px solid #ffc107;
      border-radius: 8px;
      padding: 15px;
      font-size: 13px;
      max-width: 250px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
  </style>
</head>
<body>
  <button class="print-btn no-print" onclick="window.print()">🖨️ СОХРАНИТЬ КАК PDF</button>
  <div class="info-box no-print">
    <strong>💡 Как сохранить PDF:</strong><br>
    Нажмите кнопку выше или Ctrl+P, затем выберите "Сохранить как PDF"
  </div>
  
  <div class="header">
    <h1>КОММЕРЧЕСКОЕ ПРЕДЛОЖЕНИЕ</h1>
    <p style="margin:5px 0;">№ ${escapeHtml(proposalId)} от ${escapeHtml(date)}</p>
  </div>
  
  <div class="company-info">
    <strong>ИСПОЛНИТЕЛЬ:</strong><br>
    ООО "Юридическое Бюро"<br>
    ИНН: 7700000000 | КПП: 770000000 | ОГРН: 1127700000000<br>
    Банк: ПАО "Сбербанк" БИК: 044525000<br>
    р/с: 40702810900000000000<br>
    Адрес: 119991, г. Москва, ул. Ленина, д. 1<br>
    Телефон: +7 (495) 123-45-67<br>
    Email: info@company.ru
  </div>
  
  <h3>1. СОСТАВ ПРЕДЛОЖЕНИЯ:</h3>
  <table>
    <thead>
      <tr>
        <th style="width:70%;">Наименование услуги</th>
        <th style="width:30%;text-align:right;">Стоимость</th>
      </tr>
    </thead>
    <tbody>
      ${servicesRows}
      <tr style="font-weight:bold;background:#e8e8e8;">
        <td>ИТОГО за услуги</td>
        <td style="text-align:right;">${escapeHtml(totalPrice)}</td>
      </tr>
    </tbody>
  </table>
  
  ${calculationDetails}
  
  <h3>2. УСЛОВИЯ ПРЕДЛОЖЕНИЯ:</h3>
  <p class="terms">
    • Предложение действительно 30 календарных дней с даты формирования.<br>
    • Сроки выполнения согласовываются дополнительно.<br>
    • Окончательная стоимость будет зафиксирована в договоре.<br>
    • Оплата: по счёту-фактуре в течение 7 дней с момента подписания договора.<br>
    • Гарантии: фиксированная цена, возврат 100% при неудовлетворенности.
  </p>
  
  <h3>3. РЕКВИЗИТЫ ДЛЯ ОПЛАТЫ:</h3>
  <div class="requisites">
    <strong>ООО "Юридическое Бюро"</strong><br>
    ИНН: 7700000000, КПП: 770000000, ОГРН: 1127700000000<br>
    Банк: ПАО "Сбербанк"<br>
    БИК: 044525000 | Кор. счёт: 30101810900000000000<br>
    Расчетный счёт: 40702810900000000000<br>
    Назначение платежа: Оплата по счёту-фактуре ${escapeHtml(proposalId)}
  </div>
  
  <h3>4. ПОДПИСИ СТОРОН:</h3>
  <div class="sig">
    <div class="box">
      <p><strong>От исполнителя:</strong></p>
      <p style="margin-top:30px;">___________________________</p>
      <p style="font-size:10px;">(Подпись руководителя)</p>
      <p style="margin-top:20px;">___________________________</p>
      <p style="font-size:10px;">(М.П. печать)</p>
      <p style="margin-top:15px;">"___" ____________ 2026 г.</p>
    </div>
    <div class="box">
      <p><strong>От заказчика:</strong></p>
      <p style="margin-top:30px;">___________________________</p>
      <p style="font-size:10px;">(Подпись и расшифровка)</p>
      <p style="margin-top:20px;">___________________________</p>
      <p style="font-size:10px;">(М.П. печать)</p>
      <p style="margin-top:15px;">"___" ____________ 2026 г.</p>
    </div>
  </div>
  
  <div class="footer">
    <p>Документ сформирован автоматически ${escapeHtml(getCurrentDateTime())}</p>
    <p>Для сохранения в PDF нажмите Ctrl+P или кнопку выше</p>
  </div>
</body>
</html>`;
}

/**
 * Открытие коммерческого предложения в новом окне для печати/сохранения PDF
 */
function generateAndOpenPDF() {
  try {
    const html = generateInvoiceHTML();
    
    const printWindow = window.open('', '_blank');
    if (!printWindow || printWindow.closed || typeof printWindow.closed === 'undefined') {
      showToast(CONFIG.ERROR_MESSAGES.POPUP_BLOCKED);
      return;
    }
    
    printWindow.document.write(html);
    printWindow.document.close();
    
    showToast('✅ Документ открыт. Нажмите Ctrl+P для сохранения PDF');
    
    setTimeout(() => {
      try {
        printWindow.focus();
      } catch (e) {
        // Игнорируем, если не удалось сфокусироваться
      }
    }, 500);
    
  } catch (err) {
    console.error('[PDF] Error:', err);
    showToast(CONFIG.ERROR_MESSAGES.PDF_ERROR);
  }
}
