// ============================================================
// data.js — Все данные и константы предметной области
// ============================================================

// Регионы с коэффициентами
const REGIONS = Object.freeze({
  moscow: { name: 'Москва', coefficient: 1.3 },
  spb: { name: 'Санкт-Петербург', coefficient: 1.2 },
  million: { name: 'Города-миллионники', coefficient: 1.1 },
  regional: { name: 'Областные центры', coefficient: 1.0 },
  small: { name: 'Малые города', coefficient: 0.85 }
});

// Уровни срочности
const URGENCY = Object.freeze({
  standard: { name: 'Стандартный срок', coefficient: 1.0 },
  accelerated: { name: 'Ускоренный (3-5 дней) (+20%)', coefficient: 1.2 },
  urgent: { name: 'Срочно (завтра) (+30%)', coefficient: 1.3 },
  emergency: { name: 'Экстренно (сегодня) (+40%)', coefficient: 1.4 }
});

// Пакеты абонентского обслуживания
const PACKAGES = Object.freeze({
  start: { title: 'ПАКЕТ "СТАРТ"', price: 22000, desc: 'До 12 часов консультаций' },
  business: { title: 'ПАКЕТ "БИЗНЕС"', price: 45000, desc: 'До 30 часов консультаций' },
  premium: { title: 'ПАКЕТ "ПРЕМИУМ"', price: 80000, desc: 'Безлимит консультаций' },
  corporate: { title: 'ПАКЕТ "КОРПОРАТИВ"', price: 120000, desc: 'Полный безлимит' }
});

// Дополнительные опции для абонентского
const EXTRAS = Object.freeze({
  tax: { name: 'Налоговый консалтинг', price: 25000 },
  litigation: { name: 'Судебное представительство', price: 35000 },
  corporate: { name: 'Корпоративное право', price: 20000 },
  ip: { name: 'Интеллектуальная собственность', price: 15000 },
  international: { name: 'Международное право и ВЭД', price: 30000 }
});

// Связанные госпошлины для доп. опций
const EXTRA_FEE_MAP = Object.freeze({
  ip: ['trademark']
  // можно добавить: tax: ['fns_response']
});

// Госпошлины
const STATE_FEES = Object.freeze({
  registration_ip: { name: 'Регистрация ИП', amount: 800 },
  registration_ooo: { name: 'Регистрация ООО', amount: 4000 },
  changes_egryul: { name: 'Внесение изменений', amount: 800 },
  liquidation_ip: { name: 'Ликвидация ИП', amount: 160 },
  liquidation_ooo: { name: 'Ликвидация ООО', amount: 800 },
  reorganization: { name: 'Реорганизация', amount: 4000 },
  trademark: { name: 'Товарный знак', amount: 11500 }
});

// Категории разовых услуг
const ONEOFF_CATEGORIES = Object.freeze({
  registration: { title: 'Регистрация и ликвидация', services: {} },
  tax: { title: 'Документы для налоговой', services: {} },
  contracts: { title: 'Договорная работа', services: {} },
  litigation: { title: 'Судебные услуги', services: {} },
  corporate: { title: 'Корпоративное право', services: {} },
  ip: { title: 'Интеллектуальная собственность', services: {} },
  labor: { title: 'Трудовое право', services: {} },
  consulting: { title: 'Консультации', services: {} }
});

// Разовые услуги (полный перечень)
const ONEOFF_SERVICES = Object.freeze({
  'reg_ip': { name: 'Регистрация ИП', price: 3500, category: 'registration', fee: 800 },
  'reg_ooo': { name: 'Регистрация ООО', price: 9900, category: 'registration', fee: 4000 },
  'changes_egryul': { name: 'Внесение изменений в ЕГРЮЛ/ЕГРИП', price: 4900, category: 'registration', fee: 800 },
  'liquidation_ip': { name: 'Ликвидация ИП', price: 7900, category: 'registration', fee: 160 },
  'liquidation_ooo': { name: 'Ликвидация ООО', price: 29900, category: 'registration', fee: 800 },
  'reorganization': { name: 'Реорганизация компании', price: 49900, category: 'registration', fee: 4000 },
  'decl_usn_income': { name: 'Декларация УСН (Доходы)', price: 2500, category: 'tax' },
  'decl_usn_profit': { name: 'Декларация УСН (Доходы-Расходы)', price: 3500, category: 'tax' },
  'decl_osn': { name: 'Декларация ОСН (НДС + Прибыль)', price: 7900, category: 'tax' },
  'decl_patent': { name: 'Декларация по патенту', price: 1500, category: 'tax' },
  'fns_response': { name: 'Ответ на требование ФНС', price: 3900, category: 'tax' },
  'audit_act': { name: 'Возражения на акт налоговой проверки', price: 9900, category: 'tax' },
  'fns_appeal': { name: 'Жалоба в ФНС', price: 5900, category: 'tax' },
  'restore_accounting_1yr': { name: 'Восстановление учета (до 1 года)', price: 15000, category: 'tax' },
  'restore_accounting_3yr': { name: 'Восстановление учета (1-3 года)', price: 35000, category: 'tax' },
  'restore_accounting_3plus': { name: 'Восстановление учета (более 3 лет)', price: 60000, category: 'tax' },
  'zero_report': { name: 'Нулевая отчетность', price: 1500, category: 'tax' },
  'contract_rent': { name: 'Договор аренды', price: 3500, category: 'contracts' },
  'contract_sale': { name: 'Договор купли-продажи', price: 3500, category: 'contracts' },
  'contract_service': { name: 'Договор оказания услуг', price: 3500, category: 'contracts' },
  'contract_work': { name: 'Договор подряда', price: 4500, category: 'contracts' },
  'contract_employment': { name: 'Трудовой договор', price: 2500, category: 'contracts' },
  'contract_complex': { name: 'Сложный договор', price: 7900, category: 'contracts' },
  'contract_check': { name: 'Правовая экспертиза договора', price: 2500, category: 'contracts' },
  'additional_agreement': { name: 'Допсоглашение', price: 2000, category: 'contracts' },
  'protocol_disputes': { name: 'Протокол разногласий', price: 2500, category: 'contracts' },
  'claim_work': { name: 'Претензионная работа', price: 4900, category: 'contracts' },
  'claim_prep': { name: 'Подготовка искового заявления', price: 9900, category: 'litigation' },
  'response_prep': { name: 'Подготовка отзыва на иск', price: 7900, category: 'litigation' },
  'court_simple': { name: 'Представительство в суде (простые)', price: 35000, category: 'litigation' },
  'court_medium': { name: 'Представительство в суде (средняя сложность)', price: 60000, category: 'litigation' },
  'court_complex': { name: 'Представительство в суде (сложные)', price: 100000, category: 'litigation' },
  'appeal': { name: 'Апелляционное обжалование', price: 25000, category: 'litigation' },
  'cassation': { name: 'Кассационное обжалование', price: 30000, category: 'litigation' },
  'execution': { name: 'Исполнительное производство', price: 15000, category: 'litigation' },
  'charter': { name: 'Разработка устава ООО', price: 9900, category: 'corporate' },
  'corp_agreement': { name: 'Корпоративный договор', price: 14900, category: 'corporate' },
  'meeting_protocol': { name: 'Протокол общего собрания', price: 4500, category: 'corporate' },
  'single_decision': { name: 'Решение участника', price: 2500, category: 'corporate' },
  'due_diligence_quick': { name: 'Due Diligence (экспресс)', price: 25000, category: 'corporate' },
  'due_diligence_full': { name: 'Due Diligence (полная)', price: 60000, category: 'corporate' },
  'ma_support': { name: 'Сопровождение M&A', price: 99900, category: 'corporate' },
  'trademark': { name: 'Регистрация товарного знака', price: 29900, category: 'ip', fee: 11500 },
  'license_agreement': { name: 'Лицензионный договор', price: 9900, category: 'ip' },
  'franchise': { name: 'Франшиза (договор)', price: 19900, category: 'ip' },
  'copyright_protection': { name: 'Защита авторских прав', price: 19900, category: 'ip' },
  'labor_contract': { name: 'Трудовой договор', price: 2500, category: 'labor' },
  'internal_regs': { name: 'Правила внутреннего распорядка', price: 7900, category: 'labor' },
  'secrecy_policy': { name: 'Политика коммерческой тайны', price: 5900, category: 'labor' },
  'job_description': { name: 'Должностная инструкция', price: 1500, category: 'labor' },
  'order': { name: 'Приказ', price: 1000, category: 'labor' },
  'dismissal_support': { name: 'Увольнение (сопровождение)', price: 4900, category: 'labor' },
  'labor_inspection': { name: 'Защита при трудовой проверке', price: 15000, category: 'labor' },
  'consultation_hour': { name: 'Консультация (1 час)', price: 3900, category: 'consulting' },
  'consultation_written': { name: 'Письменная консультация', price: 5900, category: 'consulting' },
  'legal_analysis': { name: 'Правовой анализ документов', price: 4900, category: 'consulting' },
  'audit_express': { name: 'Экспресс-аудит компании', price: 15000, category: 'consulting' }
});

// ============================================================
// Инициализация: привязываем услуги к категориям
// ============================================================
(function initCategories() {
  for (const [key, service] of Object.entries(ONEOFF_SERVICES)) {
    const category = ONEOFF_CATEGORIES[service.category];
    if (category) {
      category.services[key] = service;
    }
  }
})();
