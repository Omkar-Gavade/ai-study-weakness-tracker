/**
 * quizData.js — Central data source for Maharashtra Exam Quiz System
 *
 * Navigation model:
 *   /quizzes                        → exam list
 *   /quizzes/:examId                → groups (MPSC) OR subjects (others)
 *   /quizzes/:examId/:groupId       → subjects (MPSC) OR topics (others)
 *   /quizzes/:examId/:groupId/:subjectId   → topics / tests
 */

// ─── Subjects ───────────────────────────────────────────────────────────────

export const MPSC_SUBJECTS = [
  { id: 'history',      name: 'इतिहास',          desc: 'प्राचीन, मध्ययुगीन व आधुनिक भारतीय इतिहास', color: '#f59e0b', emoji: '🏛️' },
  { id: 'geography',    name: 'भूगोल',           desc: 'भारत व महाराष्ट्राचा भूगोल',               color: '#10b981', emoji: '🗺️' },
  { id: 'polity',       name: 'राज्यशास्त्र',     desc: 'भारतीय राज्यघटना व शासन व्यवस्था',          color: '#6366f1', emoji: '⚖️' },
  { id: 'economy',      name: 'अर्थव्यवस्था',     desc: 'भारतीय आर्थिक व्यवस्था व योजना',           color: '#22d3ee', emoji: '📈' },
  { id: 'environment',  name: 'पर्यावरण',         desc: 'पर्यावरण शास्त्र व जैवविविधता',             color: '#84cc16', emoji: '🌿' },
  { id: 'science',      name: 'सामान्य विज्ञान',  desc: 'भौतिकशास्त्र, रसायनशास्त्र, जीवशास्त्र',   color: '#8b5cf6', emoji: '🔬' },
  { id: 'current',      name: 'चालू घडामोडी',    desc: 'राष्ट्रीय व आंतरराष्ट्रीय महत्त्वाच्या घटना', color: '#ec4899', emoji: '📰' },
  { id: 'csat',         name: 'CSAT',            desc: 'आकलन, तर्कशक्ती, गणित व निर्णय क्षमता',    color: '#f97316', emoji: '🧠' },
];

export const POLICE_SUBJECTS = [
  { id: 'gk',       name: 'सामान्य ज्ञान',    desc: 'भारत व महाराष्ट्र सामान्य ज्ञान',    color: '#10b981', emoji: '📚' },
  { id: 'math',     name: 'गणित',           desc: 'अंकगणित व मूलभूत गणित',             color: '#6366f1', emoji: '🔢' },
  { id: 'reasoning',name: 'बुद्धिमत्ता',    desc: 'तार्किक व विश्लेषणात्मक क्षमता',     color: '#f59e0b', emoji: '🧩' },
  { id: 'current',  name: 'चालू घडामोडी',  desc: 'राज्य व राष्ट्रीय क्षेत्रातील बातम्या', color: '#ec4899', emoji: '📰' },
];

export const TALATHI_SUBJECTS = [
  { id: 'marathi',   name: 'मराठी व्याकरण', desc: 'भाषा ज्ञान व व्याकरण',               color: '#f97316', emoji: '📝' },
  { id: 'english',   name: 'इंग्रजी',       desc: 'English Grammar & Vocabulary',        color: '#6366f1', emoji: '🔤' },
  { id: 'gk',        name: 'सामान्य ज्ञान', desc: 'राज्यघटना, इतिहास, भूगोल',          color: '#10b981', emoji: '📚' },
  { id: 'math',      name: 'गणित',         desc: 'अंकगणित आणि तर्कशक्ती',              color: '#22d3ee', emoji: '🔢' },
  { id: 'reasoning', name: 'बुद्धिमत्ता',   desc: 'विश्लेषण व सांख्यिकी',               color: '#8b5cf6', emoji: '🧩' },
];

export const ZP_SUBJECTS = [
  { id: 'gk',          name: 'सामान्य ज्ञान',    desc: 'सामान्य ज्ञान व चालू घडामोडी',        color: '#10b981', emoji: '📚' },
  { id: 'math',        name: 'गणित',           desc: 'अंकगणित आणि तर्कशक्ती',              color: '#6366f1', emoji: '🔢' },
  { id: 'reasoning',   name: 'बुद्धिमत्ता',    desc: 'तार्किक क्षमता',                       color: '#f59e0b', emoji: '🧩' },
  { id: 'current',     name: 'चालू घडामोडी',  desc: 'राज्य व देश पातळीवरील बातम्या',        color: '#ec4899', emoji: '📰' },
  { id: 'rural',       name: 'ग्रामीण विकास',  desc: 'ग्रामीण प्रशासन व विकास योजना',       color: '#84cc16', emoji: '🌾' },
];

export const MHADA_SUBJECTS = [
  { id: 'gk',        name: 'सामान्य ज्ञान',  desc: 'सामान्य ज्ञान',           color: '#10b981', emoji: '📚' },
  { id: 'math',      name: 'गणित',         desc: 'अंकगणित आणि तर्कशक्ती',   color: '#6366f1', emoji: '🔢' },
  { id: 'reasoning', name: 'बुद्धिमत्ता',   desc: 'विश्लेषण क्षमता',          color: '#f59e0b', emoji: '🧩' },
  { id: 'current',   name: 'चालू घडामोडी', desc: 'महत्त्वाच्या घटना',        color: '#ec4899', emoji: '📰' },
];

// ─── Topics per Subject ──────────────────────────────────────────────────────

export const TOPICS = {
  history: [
    { id: 'ancient',      name: 'प्राचीन भारत',     desc: 'सिंधू संस्कृती ते गुप्त साम्राज्य' },
    { id: 'medieval',     name: 'मध्ययुगीन भारत',   desc: 'सल्तनत ते मुघल साम्राज्य' },
    { id: 'modern',       name: 'आधुनिक भारत',      desc: 'ब्रिटिश राज ते स्वातंत्र्य' },
    { id: 'maharashtra',  name: 'महाराष्ट्र इतिहास', desc: 'मराठा साम्राज्य व महाराष्ट्राचा इतिहास' },
  ],
  geography: [
    { id: 'physical',    name: 'भौतिक भूगोल',         desc: 'भारतीय उपखंड, पर्वत, नद्या' },
    { id: 'economic',    name: 'आर्थिक भूगोल',        desc: 'कृषी, उद्योग, खनिज संपत्ती' },
    { id: 'maharashtra', name: 'महाराष्ट्र भूगोल',    desc: 'महाराष्ट्राचे भूगोल व जिल्हे' },
    { id: 'world',       name: 'जागतिक भूगोल',        desc: 'जगातील देश, खंड, महासागर' },
  ],
  polity: [
    { id: 'constitution', name: 'राज्यघटना',         desc: 'मूलभूत हक्क, कर्तव्ये, निर्देशक तत्त्वे' },
    { id: 'parliament',   name: 'संसद व विधिमंडळ',   desc: 'लोकसभा, राज्यसभा, विधानसभा' },
    { id: 'judiciary',    name: 'न्यायव्यवस्था',      desc: 'सर्वोच्च न्यायालय, उच्च न्यायालय' },
    { id: 'local',        name: 'स्थानिक स्वराज्य',  desc: 'ग्रामपंचायत, नगरपालिका, महानगरपालिका' },
  ],
  economy: [
    { id: 'planning',   name: 'आर्थिक नियोजन',   desc: 'पंचवार्षिक योजना, नीती आयोग' },
    { id: 'banking',    name: 'बँकिंग व वित्त',    desc: 'RBI, बँकिंग प्रणाली, आर्थिक धोरण' },
    { id: 'budget',     name: 'अर्थसंकल्प',       desc: 'केंद्र व राज्य अर्थसंकल्प' },
    { id: 'schemes',    name: 'शासकीय योजना',    desc: 'केंद्र व महाराष्ट्र शासनाच्या योजना' },
  ],
  environment: [
    { id: 'ecology',    name: 'पर्यावरण शास्त्र',     desc: 'परिसंस्था, अन्नसाखळी' },
    { id: 'pollution',  name: 'प्रदूषण',              desc: 'वायू, जल, माती प्रदूषण' },
    { id: 'climate',    name: 'हवामान बदल',           desc: 'जागतिक तापमान वाढ व परिणाम' },
    { id: 'biodiversity', name: 'जैवविविधता',        desc: 'वनस्पती, प्राणी, संरक्षण' },
  ],
  science: [
    { id: 'physics',   name: 'भौतिकशास्त्र',    desc: 'गती, ऊर्जा, प्रकाश, विद्युत' },
    { id: 'chemistry', name: 'रसायनशास्त्र',    desc: 'मूलद्रव्ये, संयुगे, रासायनिक अभिक्रिया' },
    { id: 'biology',   name: 'जीवशास्त्र',      desc: 'पेशी, अवयव, रोग, आनुवंशिकता' },
    { id: 'tech',      name: 'विज्ञान व तंत्रज्ञान', desc: 'अंतराळ, संगणक, नवतंत्रज्ञान' },
  ],
  current: [
    { id: 'national',  name: 'राष्ट्रीय घटना',       desc: 'भारतीय राजकारण व धोरणे' },
    { id: 'state',     name: 'राज्य घडामोडी',         desc: 'महाराष्ट्र सरकारी निर्णय व योजना' },
    { id: 'international', name: 'आंतरराष्ट्रीय',    desc: 'जागतिक घटना व करार' },
    { id: 'awards',    name: 'पुरस्कार व नियुक्त्या', desc: 'राष्ट्रीय पुरस्कार, महत्त्वाच्या नियुक्त्या' },
  ],
  csat: [
    { id: 'comprehension', name: 'आकलन (Comprehension)', desc: 'उतारा वाचन व प्रश्नोत्तर' },
    { id: 'reasoning',    name: 'तार्किक विचार',         desc: 'Logical & Analytical Reasoning' },
    { id: 'math',         name: 'गणित',                 desc: 'मूलभूत अंकगणित (इयत्ता १०वी स्तर)' },
    { id: 'decision',     name: 'निर्णय क्षमता',         desc: 'Decision Making & Problem Solving' },
  ],
  // Police / Talathi / ZP / Mhada subjects
  gk: [
    { id: 'india',       name: 'भारत सामान्य ज्ञान', desc: 'भारताची राजकीय व भौगोलिक माहिती' },
    { id: 'maharashtra', name: 'महाराष्ट्र',          desc: 'महाराष्ट्र राज्याची माहिती' },
    { id: 'constitution',name: 'राज्यघटना',           desc: 'मूलभूत हक्क व कर्तव्ये' },
  ],
  math: [
    { id: 'arithmetic', name: 'अंकगणित',           desc: 'बेरीज, वजाबाकी, गुणाकार, भागाकार' },
    { id: 'algebra',    name: 'बीजगणित',           desc: 'समीकरणे व चल' },
    { id: 'geometry',   name: 'भूमिती',             desc: 'क्षेत्रफळ, परिमिती, त्रिकोण' },
    { id: 'percentage', name: 'टक्केवारी व गुणोत्तर', desc: 'शेकडेवारी, वेळ-काम, गती' },
  ],
  reasoning: [
    { id: 'verbal',     name: 'शाब्दिक तर्क',      desc: 'सादृश्य, वर्गीकरण, मालिका' },
    { id: 'nonverbal',  name: 'अशाब्दिक तर्क',     desc: 'आकृत्यांवर आधारित प्रश्न' },
    { id: 'puzzle',     name: 'कोडी व पॅटर्न',     desc: 'कोडे सोडवणे, पॅटर्न शोधणे' },
  ],
  marathi: [
    { id: 'grammar',  name: 'मराठी व्याकरण',    desc: 'भाषा, संधी, समास, अलंकार' },
    { id: 'reading',  name: 'उतारा वाचन',       desc: 'गद्य व पद्य उतारे' },
    { id: 'writing',  name: 'शब्दसंपदा',        desc: 'म्हणी, वाक्प्रचार, विरुद्धार्थी शब्द' },
  ],
  english: [
    { id: 'grammar',   name: 'English Grammar',   desc: 'Tenses, Articles, Prepositions' },
    { id: 'vocabulary', name: 'Vocabulary',        desc: 'Synonyms, Antonyms, Idioms' },
  ],
  rural: [
    { id: 'panchayat', name: 'ग्रामपंचायत',      desc: 'ग्रामीण प्रशासन व स्वराज्य संस्था' },
    { id: 'schemes',   name: 'ग्रामीण योजना',    desc: 'केंद्र व राज्याच्या ग्रामीण योजना' },
  ],
};

// ─── Exam Config ──────────────────────────────────────────────────────────────

export const EXAMS = [
  {
    id: 'mpsc',
    name: 'MPSC (राज्य सेवा)',
    desc: 'महाराष्ट्र लोकसेवा आयोग — वर्ग १ व २ पदे.',
    color: '#6366f1',
    gradient: 'linear-gradient(135deg, #4f46e5, #818cf8)',
    emoji: '🏛️',
    hasGroups: true,
    groups: [
      { id: 'group-a', name: 'गट अ (Group A)', desc: 'Deputy Collector, DSP, उच्च दर्जाची पदे', color: '#fbbf24', emoji: '👑' },
      { id: 'group-b', name: 'गट ब (Group B)', desc: 'PSI, STI, ASO — मध्यम स्तरीय पदे',      color: '#6366f1', emoji: '🎖️' },
      { id: 'group-c', name: 'गट क (Group C)', desc: 'Clerk, Tax Asst — कनिष्ठ पदे',           color: '#10b981', emoji: '📋' },
    ],
    subjects: {
      'group-a': MPSC_SUBJECTS,
      'group-b': MPSC_SUBJECTS,
      'group-c': MPSC_SUBJECTS,
    },
    sectionId: 'MPSC Pattern',
  },
  {
    id: 'police',
    name: 'पोलीस भरती',
    desc: 'महाराष्ट्र पोलीस — कॉन्स्टेबल व SI पदे.',
    color: '#10b981',
    gradient: 'linear-gradient(135deg, #059669, #34d399)',
    emoji: '🚔',
    hasGroups: false,
    subjects: POLICE_SUBJECTS,
    sectionId: 'Police Bharti',
  },
  {
    id: 'talathi',
    name: 'तलाठी भरती',
    desc: 'महसूल विभाग — तलाठी जागा.',
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #d97706, #fcd34d)',
    emoji: '📜',
    hasGroups: false,
    subjects: TALATHI_SUBJECTS,
    sectionId: 'Talathi Pattern',
  },
  {
    id: 'zp',
    name: 'ZP भरती',
    desc: 'जिल्हा परिषद — विविध पदभरती.',
    color: '#ec4899',
    gradient: 'linear-gradient(135deg, #db2777, #f472b6)',
    emoji: '🏢',
    hasGroups: false,
    subjects: ZP_SUBJECTS,
    sectionId: 'ZP भरती',
  },
  {
    id: 'mhada',
    name: 'Mhada / इतर',
    desc: 'गृहनिर्माण व इतर राज्यस्तरीय परीक्षा.',
    color: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
    emoji: '🏗️',
    hasGroups: false,
    subjects: MHADA_SUBJECTS,
    sectionId: 'Mhada / इतर',
  },
];

// Helper: find exam by id
export const getExam = (examId) => EXAMS.find(e => e.id === examId);

// Helper: get subjects for a given exam (and optional group)
export const getSubjects = (examId, groupId) => {
  const exam = getExam(examId);
  if (!exam) return [];
  if (exam.hasGroups && groupId) return exam.subjects[groupId] || [];
  if (!exam.hasGroups) return exam.subjects || [];
  return [];
};

// Helper: get topics for a subject
export const getTopics = (subjectId) => TOPICS[subjectId] || [];

// Tests per topic (fixed 2 tests each)
export const TESTS = [
  { id: 'test-1', name: 'चाचणी १', desc: 'प्रश्न: ३० | वेळ: ३० मिनिटे', questions: 30 },
  { id: 'test-2', name: 'चाचणी २', desc: 'प्रश्न: ३० | वेळ: ३० मिनिटे', questions: 30 },
];
