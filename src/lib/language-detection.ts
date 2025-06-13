// Language detection utility
export type SupportedLanguage = 'pt-BR' | 'en-US' | 'es-ES' | 'fr' | 'de' | 'it' | 'ja' | 'ko' | 'zh' | 'ru' | 'hi' | 'ar';

// Common words and patterns for each language
const languagePatterns = {
  'pt-BR': {
    keywords: [
      'sobre', 'para', 'como', 'uma', 'apresentação', 'criar', 'fazer', 'desenvolvimento',
      'tecnologia', 'empresa', 'projeto', 'sistema', 'processo', 'gestão', 'análise',
      'estratégia', 'mercado', 'vendas', 'marketing', 'educação', 'treinamento',
      'inovação', 'sustentabilidade', 'digital', 'transformação', 'futuro',
      'história', 'cultura', 'sociedade', 'economia', 'política', 'ciência',
      'saúde', 'medicina', 'pesquisa', 'estudo', 'universidade', 'escola'
    ],
    commonWords: ['o', 'a', 'de', 'do', 'da', 'em', 'no', 'na', 'com', 'por', 'para', 'que', 'se', 'é', 'um', 'uma'],
    patterns: [/ção$/, /mente$/, /ão$/, /ões$/, /ncia$/, /dade$/, /ismo$/]
  },
  'en-US': {
    keywords: [
      'about', 'for', 'how', 'presentation', 'create', 'make', 'development',
      'technology', 'company', 'project', 'system', 'process', 'management', 'analysis',
      'strategy', 'market', 'sales', 'marketing', 'education', 'training',
      'innovation', 'sustainability', 'digital', 'transformation', 'future',
      'history', 'culture', 'society', 'economy', 'politics', 'science',
      'health', 'medicine', 'research', 'study', 'university', 'school'
    ],
    commonWords: ['the', 'of', 'and', 'to', 'in', 'is', 'it', 'you', 'that', 'he', 'was', 'for', 'on', 'are', 'as', 'with'],
    patterns: [/ing$/, /tion$/, /ness$/, /ment$/, /able$/, /ful$/]
  },
  'es-ES': {
    keywords: [
      'sobre', 'para', 'cómo', 'una', 'presentación', 'crear', 'hacer', 'desarrollo',
      'tecnología', 'empresa', 'proyecto', 'sistema', 'proceso', 'gestión', 'análisis',
      'estrategia', 'mercado', 'ventas', 'marketing', 'educación', 'entrenamiento',
      'innovación', 'sostenibilidad', 'digital', 'transformación', 'futuro',
      'historia', 'cultura', 'sociedad', 'economía', 'política', 'ciencia',
      'salud', 'medicina', 'investigación', 'estudio', 'universidad', 'escuela'
    ],
    commonWords: ['el', 'la', 'de', 'que', 'y', 'a', 'en', 'un', 'es', 'se', 'no', 'te', 'lo', 'le', 'da', 'su'],
    patterns: [/ción$/, /mente$/, /dad$/, /ismo$/, /anza$/, /ería$/]
  },
  'fr': {
    keywords: [
      'sur', 'pour', 'comment', 'une', 'présentation', 'créer', 'faire', 'développement',
      'technologie', 'entreprise', 'projet', 'système', 'processus', 'gestion', 'analyse',
      'stratégie', 'marché', 'ventes', 'marketing', 'éducation', 'formation',
      'innovation', 'durabilité', 'numérique', 'transformation', 'avenir',
      'histoire', 'culture', 'société', 'économie', 'politique', 'science',
      'santé', 'médecine', 'recherche', 'étude', 'université', 'école'
    ],
    commonWords: ['le', 'de', 'et', 'à', 'un', 'il', 'être', 'et', 'en', 'avoir', 'que', 'pour', 'dans', 'ce', 'son', 'une'],
    patterns: [/tion$/, /ment$/, /ique$/, /eur$/, /ance$/, /ence$/]
  },
  'de': {
    keywords: [
      'über', 'für', 'wie', 'eine', 'präsentation', 'erstellen', 'machen', 'entwicklung',
      'technologie', 'unternehmen', 'projekt', 'system', 'prozess', 'management', 'analyse',
      'strategie', 'markt', 'verkauf', 'marketing', 'bildung', 'ausbildung',
      'innovation', 'nachhaltigkeit', 'digital', 'transformation', 'zukunft',
      'geschichte', 'kultur', 'gesellschaft', 'wirtschaft', 'politik', 'wissenschaft',
      'gesundheit', 'medizin', 'forschung', 'studie', 'universität', 'schule'
    ],
    commonWords: ['der', 'die', 'und', 'in', 'den', 'von', 'zu', 'das', 'mit', 'sich', 'des', 'auf', 'für', 'ist', 'im', 'dem'],
    patterns: [/ung$/, /keit$/, /heit$/, /lich$/, /isch$/, /bar$/]
  },
  'it': {
    keywords: [
      'su', 'per', 'come', 'una', 'presentazione', 'creare', 'fare', 'sviluppo',
      'tecnologia', 'azienda', 'progetto', 'sistema', 'processo', 'gestione', 'analisi',
      'strategia', 'mercato', 'vendite', 'marketing', 'educazione', 'formazione',
      'innovazione', 'sostenibilità', 'digitale', 'trasformazione', 'futuro',
      'storia', 'cultura', 'società', 'economia', 'politica', 'scienza',
      'salute', 'medicina', 'ricerca', 'studio', 'università', 'scuola'
    ],
    commonWords: ['il', 'di', 'che', 'e', 'la', 'per', 'un', 'in', 'con', 'del', 'da', 'a', 'al', 'le', 'si', 'dei'],
    patterns: [/zione$/, /mente$/, /ità$/, /ismo$/, /anza$/, /enza$/]
  },
  'ja': {
    keywords: [
      'について', 'のための', 'どのように', 'プレゼンテーション', '作成', '作る', '開発',
      '技術', '会社', 'プロジェクト', 'システム', 'プロセス', '管理', '分析',
      '戦略', '市場', '販売', 'マーケティング', '教育', 'トレーニング',
      'イノベーション', '持続可能性', 'デジタル', '変革', '未来',
      '歴史', '文化', '社会', '経済', '政治', '科学',
      '健康', '医学', '研究', '勉強', '大学', '学校'
    ],
    commonWords: ['の', 'に', 'は', 'を', 'が', 'で', 'と', 'から', 'まで', 'より', 'として', 'について', 'による', 'において'],
    patterns: [/です$/, /ます$/, /tion$/, /する$/, /である$/]
  },
  'ko': {
    keywords: [
      '에 대한', '을 위한', '어떻게', '프레젠테이션', '만들기', '만드는', '개발',
      '기술', '회사', '프로젝트', '시스템', '프로세스', '관리', '분석',
      '전략', '시장', '판매', '마케팅', '교육', '훈련',
      '혁신', '지속가능성', '디지털', '변화', '미래',
      '역사', '문화', '사회', '경제', '정치', '과학',
      '건강', '의학', '연구', '공부', '대학교', '학교'
    ],
    commonWords: ['의', '에', '는', '을', '가', '에서', '와', '로', '부터', '까지', '로서', '에 대해', '에 의해', '에서'],
    patterns: [/입니다$/, /습니다$/, /하다$/, /되다$/, /이다$/]
  },
  'zh': {
    keywords: [
      '关于', '为了', '如何', '演示', '创建', '制作', '发展',
      '技术', '公司', '项目', '系统', '过程', '管理', '分析',
      '策略', '市场', '销售', '营销', '教育', '培训',
      '创新', '可持续性', '数字', '转型', '未来',
      '历史', '文化', '社会', '经济', '政治', '科学',
      '健康', '医学', '研究', '学习', '大学', '学校'
    ],
    commonWords: ['的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '一个', '上', '也', '很'],
    patterns: [/的$/, /了$/, /性$/, /化$/, /主义$/]
  },
  'ru': {
    keywords: [
      'о', 'для', 'как', 'презентация', 'создать', 'сделать', 'развитие',
      'технология', 'компания', 'проект', 'система', 'процесс', 'управление', 'анализ',
      'стратегия', 'рынок', 'продажи', 'маркетинг', 'образование', 'обучение',
      'инновации', 'устойчивость', 'цифровой', 'трансформация', 'будущее',
      'история', 'культура', 'общество', 'экономика', 'политика', 'наука',
      'здоровье', 'медицина', 'исследование', 'изучение', 'университет', 'школа'
    ],
    commonWords: ['в', 'и', 'не', 'на', 'я', 'быть', 'он', 'с', 'что', 'а', 'по', 'это', 'она', 'к', 'но', 'они'],
    patterns: [/ция$/, /ность$/, /ство$/, /ение$/, /ание$/]
  },
  'hi': {
    keywords: [
      'के बारे में', 'के लिए', 'कैसे', 'प्रस्तुति', 'बनाना', 'करना', 'विकास',
      'तकनीक', 'कंपनी', 'परियोजना', 'सिस्टम', 'प्रक्रिया', 'प्रबंधन', 'विश्लेषण',
      'रणनीति', 'बाजार', 'बिक्री', 'मार्केटिंग', 'शिक्षा', 'प्रशिक्षण',
      'नवाचार', 'स्थिरता', 'डिजिटल', 'परिवर्तन', 'भविष्य',
      'इतिहास', 'संस्कृति', 'समाज', 'अर्थव्यवस्था', 'राजनीति', 'विज्ञान',
      'स्वास्थ्य', 'चिकित्सा', 'अनुसंधान', 'अध्ययन', 'विश्वविद्यालय', 'स्कूल'
    ],
    commonWords: ['का', 'के', 'की', 'में', 'से', 'को', 'है', 'और', 'एक', 'यह', 'वह', 'पर', 'ने', 'तो', 'भी', 'कि'],
    patterns: [/ता$/, /ना$/, /ित$/, /ीय$/]
  },
  'ar': {
    keywords: [
      'حول', 'من أجل', 'كيف', 'عرض', 'إنشاء', 'صنع', 'تطوير',
      'تكنولوجيا', 'شركة', 'مشروع', 'نظام', 'عملية', 'إدارة', 'تحليل',
      'استراتيجية', 'سوق', 'مبيعات', 'تسويق', 'تعليم', 'تدريب',
      'ابتكار', 'استدامة', 'رقمي', 'تحول', 'مستقبل',
      'تاريخ', 'ثقافة', 'مجتمع', 'اقتصاد', 'سياسة', 'علم',
      'صحة', 'طب', 'بحث', 'دراسة', 'جامعة', 'مدرسة'
    ],
    commonWords: ['في', 'من', 'إلى', 'على', 'أن', 'هذا', 'هذه', 'التي', 'الذي', 'كان', 'كانت', 'يكون', 'تكون', 'مع', 'عن', 'بعد'],
    patterns: [/ية$/, /ات$/, /ين$/, /ون$/]
  }
};

/**
 * Detect the language of a given text
 */
export function detectLanguage(text: string): SupportedLanguage {
  if (!text || text.trim().length === 0) {
    return 'en-US'; // Default fallback
  }

  const normalizedText = text.toLowerCase().trim();
  const words = normalizedText.split(/\s+/);
  
  const scores: Record<SupportedLanguage, number> = {
    'pt-BR': 0,
    'en-US': 0,
    'es-ES': 0,
    'fr': 0,
    'de': 0,
    'it': 0,
    'ja': 0,
    'ko': 0,
    'zh': 0,
    'ru': 0,
    'hi': 0,
    'ar': 0
  };

  // Score based on keyword matches
  for (const [lang, patterns] of Object.entries(languagePatterns)) {
    const language = lang as SupportedLanguage;
    
    // Check keywords
    for (const keyword of patterns.keywords) {
      if (normalizedText.includes(keyword.toLowerCase())) {
        scores[language] += 3; // High weight for keywords
      }
    }
    
    // Check common words
    for (const word of words) {
      if (patterns.commonWords.includes(word)) {
        scores[language] += 2; // Medium weight for common words
      }
    }
    
    // Check patterns (word endings, etc.)
    for (const word of words) {
      for (const pattern of patterns.patterns) {
        if (pattern.test(word)) {
          scores[language] += 1; // Low weight for patterns
        }
      }
    }
  }

  // Special handling for character-based languages
  const hasLatinChars = /[a-zA-Z]/.test(normalizedText);
  const hasCyrillicChars = /[а-яё]/i.test(normalizedText);
  const hasArabicChars = /[\u0600-\u06FF]/.test(normalizedText);
  const hasChineseChars = /[\u4e00-\u9fff]/.test(normalizedText);
  const hasJapaneseChars = /[\u3040-\u309f\u30a0-\u30ff]/.test(normalizedText);
  const hasKoreanChars = /[\uac00-\ud7af]/.test(normalizedText);
  const hasDevanagariChars = /[\u0900-\u097F]/.test(normalizedText);

  // Boost scores based on character sets
  if (hasCyrillicChars) scores.ru += 10;
  if (hasArabicChars) scores.ar += 10;
  if (hasChineseChars) scores.zh += 10;
  if (hasJapaneseChars) scores.ja += 10;
  if (hasKoreanChars) scores.ko += 10;
  if (hasDevanagariChars) scores.hi += 10;

  // If no non-Latin characters, boost Latin-based languages
  if (hasLatinChars && !hasCyrillicChars && !hasArabicChars && !hasChineseChars && !hasJapaneseChars && !hasKoreanChars && !hasDevanagariChars) {
    // Additional scoring for Latin-based languages
    const latinLanguages: SupportedLanguage[] = ['pt-BR', 'en-US', 'es-ES', 'fr', 'de', 'it'];
    
    // Check for specific language indicators
    if (/\b(the|and|of|to|in|is|it|you|that|he|was|for|on|are|as|with)\b/.test(normalizedText)) {
      scores['en-US'] += 5;
    }
    if (/\b(de|da|do|em|no|na|com|por|para|que|se|é|um|uma)\b/.test(normalizedText)) {
      scores['pt-BR'] += 5;
    }
    if (/\b(el|la|de|que|y|a|en|un|es|se|no|te|lo|le|da|su)\b/.test(normalizedText)) {
      scores['es-ES'] += 5;
    }
    if (/\b(le|de|et|à|un|il|être|en|avoir|que|pour|dans|ce|son|une)\b/.test(normalizedText)) {
      scores.fr += 5;
    }
    if (/\b(der|die|und|in|den|von|zu|das|mit|sich|des|auf|für|ist|im|dem)\b/.test(normalizedText)) {
      scores.de += 5;
    }
    if (/\b(il|di|che|e|la|per|un|in|con|del|da|a|al|le|si|dei)\b/.test(normalizedText)) {
      scores.it += 5;
    }
  }

  // Find the language with the highest score
  let maxScore = 0;
  let detectedLanguage: SupportedLanguage = 'en-US';
  
  for (const [lang, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      detectedLanguage = lang as SupportedLanguage;
    }
  }

  // If no clear winner, use some heuristics
  if (maxScore === 0) {
    // Check for Portuguese-specific patterns
    if (/ção|mente|ão|ões|ncia|dade|ismo/.test(normalizedText)) {
      return 'pt-BR';
    }
    // Check for English-specific patterns
    if (/ing|tion|ness|ment|able|ful/.test(normalizedText)) {
      return 'en-US';
    }
    // Check for Spanish-specific patterns
    if (/ción|mente|dad|ismo|anza|ería/.test(normalizedText)) {
      return 'es-ES';
    }
    
    // Default to English if no patterns match
    return 'en-US';
  }

  return detectedLanguage;
}

/**
 * Map detected language to presentation system language codes
 */
export function mapToSystemLanguage(detectedLang: SupportedLanguage): string {
  const languageMap: Record<SupportedLanguage, string> = {
    'pt-BR': 'pt',
    'en-US': 'en-US',
    'es-ES': 'es',
    'fr': 'fr',
    'de': 'de',
    'it': 'it',
    'ja': 'ja',
    'ko': 'ko',
    'zh': 'zh',
    'ru': 'ru',
    'hi': 'hi',
    'ar': 'ar'
  };

  return languageMap[detectedLang] || 'en-US';
}

/**
 * Get language display name
 */
export function getLanguageDisplayName(langCode: string): string {
  const displayNames: Record<string, string> = {
    'pt': 'Portuguese',
    'en-US': 'English (US)',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'it': 'Italian',
    'ja': 'Japanese',
    'ko': 'Korean',
    'zh': 'Chinese',
    'ru': 'Russian',
    'hi': 'Hindi',
    'ar': 'Arabic'
  };

  return displayNames[langCode] || 'English (US)';
} 