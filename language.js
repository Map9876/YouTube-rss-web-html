/*
 * 语言切换功能
 * 默认加载中文，支持多语言切换
 */

// 语言配置
const languageConfig = {
  defaultLang: 'zh',
  langFiles: {
    'zh': 'lang/zh.json',
    'en': 'lang/en.json' // 英文版本可以后续添加
  }
};

// 初始化语言
let currentLanguage = localStorage.getItem('language') || languageConfig.defaultLang;

// 加载语言文件
function loadLanguage(lang) {
  if (!languageConfig.langFiles[lang]) return;
  
  fetch(languageConfig.langFiles[lang])
    .then(response => response.json())
    .then(data => {
      applyTranslations(data);
      currentLanguage = lang;
      localStorage.setItem('language', lang);
    })
    .catch(error => {
      console.error('加载语言文件失败:', error);
    });
}

// 应用翻译
function applyTranslations(langData) {
  // 元数据翻译
  document.title = langData.meta.title;
  document.querySelector('meta[name="description"]').content = langData.meta.description;
  document.querySelector('meta[property="og:title"]').content = langData.meta.title;
  document.querySelector('meta[property="og:description"]').content = langData.meta.description;

  // UI元素翻译
  const elements = {
    '.website-name': 'ui.feedReader',
    '.subtitle': 'ui.subtitle',
    '#configure-btn': 'ui.configureFeeds',
    '.add-button': 'ui.tryAppMode',
    '.footnote:nth-of-type(1)': 'ui.refreshHint',
    '.footnote:nth-of-type(2)': 'ui.disclaimer',
    '.footnote:nth-of-type(3)': 'ui.terms',
    '#openFaqModal': 'ui.faq',
    '#loading': 'ui.loading',
    '#no-feed-message h6': 'ui.noFeeds',
    '#no-feed-message p': 'ui.noFeedsHint',
    '.subtle-heading:first-of-type': 'ui.discoverFeeds',
    '#search-input': 'ui.searchFeeds',
    '#additional-feeds option:first-child': 'ui.exploreMore',
    '#no-matches-message p:first-child': 'ui.noMatches',
    '#no-matches-message p.footnote': 'ui.noMatchesHint',
    '.modal-title': 'ui.configureTitle',
    '#feed-url': 'ui.addFeedPlaceholder',
    '.urls-button:nth-of-type(1)': 'ui.addFeed',
    '#csv-url': 'ui.csvPlaceholder',
    '.urls-button:nth-of-type(2)': 'ui.loadCSV',
    '.up-down:nth-of-type(1)': 'ui.uploadCSV',
    '#downloadCSV': 'ui.downloadCSV',
    '.urls .footnote': 'ui.csvInstructions',
    '.column1': 'ui.urlColumn',
    '.column2': 'ui.actionsColumn',
    '.delete-btn': 'ui.delete'
  };

  for (const [selector, key] of Object.entries(elements)) {
    const element = document.querySelector(selector);
    if (element) {
      const keys = key.split('.');
      let value = langData;
      for (const k of keys) {
        value = value[k];
      }
      if (selector.startsWith('input') || selector.startsWith('textarea')) {
        element.placeholder = value;
      } else if (selector.endsWith('option:first-child')) {
        element.textContent = value;
      } else {
        element.textContent = value;
      }
    }
  }
}

// 创建语言切换按钮
function createLanguageSwitcher() {
  const langSwitcher = document.createElement('div');
  langSwitcher.className = 'language-switcher';
  langSwitcher.innerHTML = `
    <select id="language-selector">
      <option value="zh">中文</option>
      <option value="en">English</option>
    </select>
  `;
  
  document.querySelector('.top-level').appendChild(langSwitcher);
  
  const selector = document.getElementById('language-selector');
  selector.value = currentLanguage;
  selector.addEventListener('change', (e) => {
    loadLanguage(e.target.value);
  });
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  createLanguageSwitcher();
  loadLanguage(currentLanguage);
});