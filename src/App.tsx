import { CSSProperties, FormEvent, useEffect, useState } from 'react';
import type { User as SupabaseAuthUser } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  feedback: string;
}

interface Stats {
  testsCompleted: number;
  averageScore: number;
  totalScore: number;
}

interface User {
  username: string;
  email: string;
  avatarUrl?: string;
}

interface AuthForm {
  username: string;
  email: string;
  password: string;
}

type Language = 'ru' | 'en';
type TabType = 'generator' | 'explain' | 'stats';
type DifficultyType = 'easy' | 'medium' | 'hardcore';
type AuthMode = 'login' | 'register';

interface Translation {
  welcomeTitle: string;
  welcomeSubtitle: string;
  navGenerator: string;
  navExplain: string;
  navStats: string;
  navGames: string;
  generatorTitle: string;
  generatorSubtitle: string;
  topicLabel: string;
  topicPlaceholder: string;
  difficultyLabel: string;
  easy: string;
  medium: string;
  hardcore: string;
  generateButton: string;
  loading: string;
  submitButton: string;
  resultsTitle: string;
  reviewTitle: string;
  breakdownTitle: string;
  questionLabel: string;
  yourAnswer: string;
  correctAnswer: string;
  explanationLabel: string;
  newTest: string;
  explainTitle: string;
  explainSubtitle: string;
  explainPlaceholder: string;
  statsTitle: string;
  statsSubtitle: string;
  testsCompleted: string;
  averageScore: string;
  yourStatus: string;
  advancedStatus: string;
  beginnerStatus: string;
  missingTopicAlert: string;
  perfectReview: (topic: string) => string;
  goodReview: (topic: string) => string;
  weakReview: (topic: string) => string;
  resetConfirm: string;
  resetSuccess: string;
  resetAvailable: string;
  resetLocked: (count: number) => string;
  signIn: string;
  logout: string;
  loginTab: string;
  registerTab: string;
  usernameLabel: string;
  usernamePlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  submitLogin: string;
  submitRegister: string;
  authCloseLabel: string;
  profileGreeting: (name: string) => string;
  statsGreetingUser: (name: string) => string;
  statsGreetingGuest: string;
}

const defaultStats: Stats = {
  testsCompleted: 0,
  averageScore: 0,
  totalScore: 0,
};

const translations: Record<Language, Translation> = {
  ru: {
    welcomeTitle: 'Добро пожаловать в SYNAPSE / Welcome to SYNAPSE',
    welcomeSubtitle: 'Выберите язык интерфейса / Select your language',
    navGenerator: '🧠 Генератор тестов',
    navExplain: '📖 Объяснение тем',
    navStats: '📊 Моя статистика',
    navGames: '🎮 ИГРЫ (GAMES) 🔒',
    generatorTitle: 'Генератор тестов',
    generatorSubtitle: 'ИИ создаст уникальный тест по любой теме',
    topicLabel: 'ТЕМА ДЛЯ ТЕСТИРОВАНИЯ',
    topicPlaceholder: 'Введи тему (например: Асинхронный JS, Дроби, Ньютон)...',
    difficultyLabel: 'СЛОЖНОСТЬ',
    easy: 'Легкий',
    medium: 'Средний',
    hardcore: 'ХАРДКОР 😈',
    generateButton: 'Сгенерировать тест',
    loading: 'ИИ синтезирует синапсы...',
    submitButton: 'Проверить ответы',
    resultsTitle: 'Результаты тестирования',
    reviewTitle: '💬 Рецензия ИИ:',
    breakdownTitle: 'Подробный разбор:',
    questionLabel: 'Вопрос',
    yourAnswer: 'Твой ответ',
    correctAnswer: 'Правильный ответ',
    explanationLabel: '💡 Разъяснение',
    newTest: 'Новое испытание',
    explainTitle: 'Объяснение тем',
    explainSubtitle: 'ИИ разложит по полочкам любую сложную концепцию',
    explainPlaceholder:
      'Этот раздел будет подключен к Google Gemini API на следующем этапе! Ты сможешь ввести любую тему и мгновенно получить простое объяснение с примерами.',
    statsTitle: 'Моя статистика',
    statsSubtitle: 'Твои достижения сохраняются здесь',
    testsCompleted: 'Пройдено тестов',
    averageScore: 'Средний балл',
    yourStatus: 'Твой статус',
    advancedStatus: 'Император Зарождения 👑',
    beginnerStatus: 'Рядовой Студент 🧠',
    missingTopicAlert: 'Пожалуйста, введи тему для теста!',
    perfectReview: (topic: string) =>
      `🏆 Феноменально! Твои синапсы по теме "${topic}" работают на полную мощность. Ты безошибочно разобрался в теме!`,
    goodReview: (topic: string) =>
      `📖 Хороший результат! Ты уловил суть темы "${topic}", но в деталях запутался. Обрати внимание на разбор ошибок.`,
    weakReview: (topic: string) =>
      `🧠 Нужно подкачать извилины! Тема "${topic}" пока дается с трудом. ИИ рекомендует изучить теорию во вкладке "Объяснение тем".`,
    resetConfirm: 'Ты уверен, что хочешь сбросить статистику текущего цикла?',
    resetSuccess: 'Статистика успешно сброшена! Начнем новый цикл!',
    resetAvailable: '🗑️ Сбросить цикл статистики (Доступно!)',
    resetLocked: (count: number) =>
      `🔒 Сброс заблокирован (Пройди еще ${count} ${count === 1 ? 'тест' : count < 5 ? 'теста' : 'тестов'} для разблокировки)`,
    signIn: '🔑 Войти',
    logout: 'Выйти',
    loginTab: 'Вход',
    registerTab: 'Регистрация',
    usernameLabel: 'Имя пользователя',
    usernamePlaceholder: 'Как к тебе обращаться?',
    emailLabel: 'Email',
    emailPlaceholder: 'you@synapse.ai',
    passwordLabel: 'Пароль',
    passwordPlaceholder: 'Минимум 6 символов',
    submitLogin: 'Войти',
    submitRegister: 'Зарегистрироваться',
    authCloseLabel: 'Закрыть окно авторизации',
    profileGreeting: (name: string) => `👋 ${name}`,
    statsGreetingUser: (name: string) => `Hello, ${name}! Your progress is being saved.`,
    statsGreetingGuest: 'Привет, Гость! Войди в аккаунт, чтобы сохранять прогресс',
  },
  en: {
    welcomeTitle: 'Добро пожаловать в SYNAPSE / Welcome to SYNAPSE',
    welcomeSubtitle: 'Выберите язык интерфейса / Select your language',
    navGenerator: '🧠 Test Generator',
    navExplain: '📖 Topic Explainer',
    navStats: '📊 My Statistics',
    navGames: '🎮 GAMES 🔒',
    generatorTitle: 'Test Generator',
    generatorSubtitle: 'AI creates a unique test on any topic',
    topicLabel: 'TOPIC FOR TESTING',
    topicPlaceholder: 'Enter a topic, for example: Async JS, Fractions, Newton...',
    difficultyLabel: 'DIFFICULTY',
    easy: 'Easy',
    medium: 'Medium',
    hardcore: 'HARDCORE 😈',
    generateButton: 'Generate Test',
    loading: 'AI is synthesizing synapses...',
    submitButton: 'Check Answers',
    resultsTitle: 'Test Results',
    reviewTitle: '💬 AI Review:',
    breakdownTitle: 'Detailed Breakdown:',
    questionLabel: 'Question',
    yourAnswer: 'Your answer',
    correctAnswer: 'Correct answer',
    explanationLabel: '💡 Explanation',
    newTest: 'New Challenge',
    explainTitle: 'Topic Explainer',
    explainSubtitle: 'AI breaks down any complex concept into clear steps',
    explainPlaceholder:
      'This section will be connected to the Google Gemini API in the next stage. You will be able to enter any topic and instantly get a simple explanation with examples.',
    statsTitle: 'My Statistics',
    statsSubtitle: 'Your learning achievements are saved here',
    testsCompleted: 'Tests completed',
    averageScore: 'Average score',
    yourStatus: 'Your Status',
    advancedStatus: 'Emerging Emperor 👑',
    beginnerStatus: 'Rookie Student 🧠',
    missingTopicAlert: 'Please enter a topic for the test!',
    perfectReview: (topic: string) =>
      `🏆 Phenomenal! Your synapses for "${topic}" are firing at full power. You handled the topic flawlessly.`,
    goodReview: (topic: string) =>
      `📖 Good result! You caught the core idea of "${topic}", but a few details still need work. Review the breakdown carefully.`,
    weakReview: (topic: string) =>
      `🧠 Time to strengthen the neural path! "${topic}" is still challenging. The AI recommends studying the theory in the Topic Explainer tab.`,
    resetConfirm: 'Are you sure you want to reset the current statistics cycle?',
    resetSuccess: 'Statistics reset successfully! Let us start a new cycle!',
    resetAvailable: '🗑️ Reset statistics cycle (Available!)',
    resetLocked: (count: number) => `🔒 Reset locked (Complete ${count} more ${count === 1 ? 'test' : 'tests'} to unlock)`,
    signIn: '🔑 Sign In',
    logout: 'Logout',
    loginTab: 'Login',
    registerTab: 'Register',
    usernameLabel: 'Username',
    usernamePlaceholder: 'What should we call you?',
    emailLabel: 'Email',
    emailPlaceholder: 'you@synapse.ai',
    passwordLabel: 'Password',
    passwordPlaceholder: 'At least 6 characters',
    submitLogin: 'Sign In',
    submitRegister: 'Register',
    authCloseLabel: 'Close auth modal',
    profileGreeting: (name: string) => `👋 ${name}`,
    statsGreetingUser: (name: string) => `Hello, ${name}! Your progress is being saved.`,
    statsGreetingGuest: 'Hello, Guest! Sign in to save progress',
  },
};

const welcomeStyles: Record<string, CSSProperties> = {
  screen: {
    minHeight: '100vh',
    display: 'grid',
    placeItems: 'center',
    padding: '24px',
    background:
      'radial-gradient(circle at 20% 20%, rgba(139, 92, 246, 0.25), transparent 36%), radial-gradient(circle at 82% 18%, rgba(59, 130, 246, 0.2), transparent 34%), #0D0E12',
  },
  panel: {
    width: 'min(760px, 100%)',
    padding: '42px',
    border: '1px solid rgba(139, 92, 246, 0.42)',
    borderRadius: '8px',
    background: 'rgba(19, 21, 28, 0.72)',
    boxShadow: '0 0 60px rgba(139, 92, 246, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(18px)',
    textAlign: 'center',
  },
  title: {
    color: '#F8FAFC',
    fontSize: 'clamp(32px, 6vw, 58px)',
    fontWeight: 800,
    lineHeight: 1.05,
    marginBottom: '16px',
    textShadow: '0 0 22px rgba(139, 92, 246, 0.75)',
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: '18px',
    marginBottom: '30px',
  },
  choices: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
  },
  card: {
    minHeight: '104px',
    border: '1px solid rgba(139, 92, 246, 0.58)',
    borderRadius: '8px',
    background: 'rgba(30, 34, 48, 0.82)',
    color: '#F8FAFC',
    fontSize: '24px',
    fontWeight: 800,
    cursor: 'pointer',
    boxShadow: '0 0 24px rgba(139, 92, 246, 0.22)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
  },
};

const getSavedStats = (): Stats => {
  try {
    const savedStats = localStorage.getItem('synapse_stats');
    return savedStats ? (JSON.parse(savedStats) as Stats) : defaultStats;
  } catch {
    return defaultStats;
  }
};

const getSavedLanguage = (): Language | null => {
  const savedLanguage = localStorage.getItem('synapse_lang');
  return savedLanguage === 'ru' || savedLanguage === 'en' ? savedLanguage : null;
};

const getSavedUser = (): User | null => {
  try {
    const savedUser = localStorage.getItem('synapse_user');
    if (!savedUser) return null;

    const parsedUser = JSON.parse(savedUser) as Partial<User>;
    return typeof parsedUser.username === 'string' && typeof parsedUser.email === 'string'
      ? { username: parsedUser.username, email: parsedUser.email, avatarUrl: parsedUser.avatarUrl }
      : null;
  } catch {
    return null;
  }
};

const getDisplayNameFromSupabaseUser = (sessionUser: SupabaseAuthUser): string =>
  sessionUser.user_metadata?.full_name ||
  sessionUser.user_metadata?.name ||
  sessionUser.email ||
  'Synapse User';

const createUserFromSupabaseUser = (sessionUser: SupabaseAuthUser): User => ({
  username: getDisplayNameFromSupabaseUser(sessionUser),
  email: sessionUser.email || '',
  avatarUrl: sessionUser.user_metadata?.avatar_url,
});

const createLocalizedTest = (topic: string, language: Language): Question[] => {
  if (language === 'en') {
    return [
      {
        id: 1,
        question: `What is the key definition of the topic "${topic}"?`,
        options: [
          `A fundamental law and core concept that "${topic}" is built on`,
          'A secondary property that does not affect the overall structure of the topic',
          `An outdated hypothesis that is no longer applied to "${topic}"`,
          'A concept from a completely different scientific discipline',
        ],
        correctIndex: 0,
        feedback: `Correct! Understanding the foundation is 80% of success when studying "${topic}".`,
      },
      {
        id: 2,
        question: `What is the main mistake students make when studying "${topic}"?`,
        options: [
          `Ignoring how "${topic}" connects to practical examples`,
          'Moving through the basics too quickly',
          'Trying to memorize formulas without understanding the idea behind them',
          'All of these factors together',
        ],
        correctIndex: 3,
        feedback: `Excellent! A combined approach with practice is the best way to master "${topic}".`,
      },
      {
        id: 3,
        question: `Where is the concept of "${topic}" applied in practice?`,
        options: [
          `In solving applied problems and real projects connected with "${topic}"`,
          'Only in school textbooks for passing exams',
          'In professional sports and cooking',
          'Nowhere, it is purely a theoretical abstraction',
        ],
        correctIndex: 0,
        feedback: `Exactly! The practical use of "${topic}" proves its importance in the real world.`,
      },
    ];
  }

  return [
    {
      id: 1,
      question: `Какое определение точнее всего описывает тему "${topic}"?`,
      options: [
        `Фундаментальный закон и базовая концепция, на которой строится "${topic}"`,
        'Второстепенное свойство, не влияющее на общую структуру темы',
        `Устаревшая гипотеза, которая больше не применяется к теме "${topic}"`,
        'Понятие из совершенно другой научной дисциплины',
      ],
      correctIndex: 0,
      feedback: `Правильно! Понимание фундаментальной основы — это 80% успеха в изучении темы "${topic}".`,
    },
    {
      id: 2,
      question: `Какая главная ошибка часто мешает понять тему "${topic}"?`,
      options: [
        `Игнорирование связи темы "${topic}" с практическими примерами`,
        'Слишком быстрое прохождение базовых понятий',
        'Попытка зубрить формулы без понимания сути',
        'Все перечисленные факторы в совокупности',
      ],
      correctIndex: 3,
      feedback: `Отлично! Комплексный подход и практика — лучший способ освоить тему "${topic}".`,
    },
    {
      id: 3,
      question: `Где на практике чаще всего применяется концепция "${topic}"?`,
      options: [
        `В решении прикладных задач и реальных проектах, связанных с "${topic}"`,
        'Исключительно в школьных учебниках для сдачи экзаменов',
        'В профессиональном спорте и кулинарии',
        'Нигде, это чисто теоретическая абстракция',
      ],
      correctIndex: 0,
      feedback: `Верно! Практическое применение темы "${topic}" доказывает её важность в реальном мире.`,
    },
  ];
};

function App() {
  const [language, setLanguage] = useState<Language | null>(getSavedLanguage);
  const [activeTab, setActiveTab] = useState<TabType>('generator');
  const [topic, setTopic] = useState<string>('');
  const [difficulty, setDifficulty] = useState<DifficultyType>('medium');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [test, setTest] = useState<Question[] | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState<boolean>(false);
  const [review, setReview] = useState<string>('');
  const [stats, setStats] = useState<Stats>(getSavedStats);
  const [user, setUser] = useState<User | null>(getSavedUser);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [authForm, setAuthForm] = useState<AuthForm>({ username: '', email: '', password: '' });

  useEffect(() => {
    localStorage.setItem('synapse_stats', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    const syncSupabaseUser = async () => {
      const { data } = await supabase.auth.getSession();
      const sessionUser = data.session?.user;

      if (!sessionUser) {
        localStorage.removeItem('synapse_user');
        setUser(null);
        return;
      }

      const nextUser = createUserFromSupabaseUser(sessionUser);

      localStorage.setItem('synapse_user', JSON.stringify(nextUser));
      setUser(nextUser);
      setIsAuthModalOpen(false);
    };

    void syncSupabaseUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const sessionUser = session?.user;

      if (!sessionUser) {
        localStorage.removeItem('synapse_user');
        setUser(null);
        return;
      }

      const nextUser = createUserFromSupabaseUser(sessionUser);

      localStorage.setItem('synapse_user', JSON.stringify(nextUser));
      setUser(nextUser);
      setIsAuthModalOpen(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const selectLanguage = (nextLanguage: Language) => {
    localStorage.setItem('synapse_lang', nextLanguage);
    setLanguage(nextLanguage);
  };

  if (language === null) {
    return (
      <main style={welcomeStyles.screen}>
        <section style={welcomeStyles.panel}>
          <h1 style={welcomeStyles.title}>Добро пожаловать в SYNAPSE / Welcome to SYNAPSE</h1>
          <p style={welcomeStyles.subtitle}>Выберите язык интерфейса / Select your language</p>
          <div style={welcomeStyles.choices}>
            <button style={welcomeStyles.card} onClick={() => selectLanguage('en')}>
              🇬🇧 English
            </button>
            <button style={welcomeStyles.card} onClick={() => selectLanguage('ru')}>
              🇷🇺 Русский
            </button>
          </div>
        </section>
      </main>
    );
  }

  const t = translations[language];
  const testsUntilReset = 10 - (stats.testsCompleted % 10);
  const canResetStats = stats.testsCompleted > 0 && stats.testsCompleted % 10 === 0;

  const handleGenerateTest = () => {
    const normalizedTopic = topic.trim();

    if (!normalizedTopic) {
      window.alert(t.missingTopicAlert);
      return;
    }

    setIsLoading(true);
    setTest(null);
    setShowResults(false);
    setSelectedAnswers({});

    window.setTimeout(() => {
      setTest(createLocalizedTest(normalizedTopic, language));
      setIsLoading(false);
    }, 1500);
  };

  const handleSelectOption = (qId: number, optionIndex: number) => {
    setSelectedAnswers((answers) => ({
      ...answers,
      [qId]: optionIndex,
    }));
  };

  const handleSubmitTest = () => {
    if (!test) return;

    let correctCount = 0;
    test.forEach((question) => {
      if (selectedAnswers[question.id] === question.correctIndex) {
        correctCount += 1;
      }
    });

    const percent = Math.round((correctCount / test.length) * 100);
    const newCompleted = stats.testsCompleted + 1;
    const newTotal = stats.totalScore + percent;
    const normalizedTopic = topic.trim();

    setStats({
      testsCompleted: newCompleted,
      totalScore: newTotal,
      averageScore: Math.round(newTotal / newCompleted),
    });

    if (percent === 100) {
      setReview(t.perfectReview(normalizedTopic));
    } else if (percent >= 50) {
      setReview(t.goodReview(normalizedTopic));
    } else {
      setReview(t.weakReview(normalizedTopic));
    }

    setShowResults(true);
  };

  const handleResetStats = () => {
    if (!canResetStats) return;

    const confirmReset = window.confirm(t.resetConfirm);

    if (confirmReset) {
      setStats(defaultStats);
      window.alert(t.resetSuccess);
    }
  };

  const handleToggleLanguage = () => {
    selectLanguage(language === 'ru' ? 'en' : 'ru');
  };

  const openAuthModal = () => {
    setAuthMode('login');
    setIsAuthModalOpen(true);
  };

  const handleAuthSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const email = authForm.email.trim();
    const password = authForm.password;
    const fallbackUsername = email.includes('@') ? email.split('@')[0] : email || 'Synapse User';

    const { data, error } =
      authMode === 'register'
        ? await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: authForm.username.trim() || fallbackUsername,
              },
            },
          })
        : await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      window.alert(error.message);
      return;
    }

    if (data.user) {
      const nextUser = createUserFromSupabaseUser(data.user);
      localStorage.setItem('synapse_user', JSON.stringify(nextUser));
      setUser(nextUser);
      setIsAuthModalOpen(false);
      setAuthForm({ username: '', email: '', password: '' });
    }
  };

  const handleGoogleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('synapse_user');
    setUser(null);
  };

  return (
    <div className="synapse-container">
      <aside className="sidebar">
        <div className="logo">SYNAPSE</div>
        <nav className="menu-list">
          <button
            className={`menu-item ${activeTab === 'generator' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('generator');
              setTest(null);
            }}
          >
            {t.navGenerator}
          </button>
          <button className={`menu-item ${activeTab === 'explain' ? 'active' : ''}`} onClick={() => setActiveTab('explain')}>
            {t.navExplain}
          </button>
          <button className={`menu-item ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => setActiveTab('stats')}>
            {t.navStats}
          </button>
          <button className="menu-item locked" disabled>
            {t.navGames}
          </button>
        </nav>
        <div className="sidebar-footer">
          <button className="lang-toggle-btn" onClick={handleToggleLanguage}>
            🌐 {language === 'ru' ? 'English (EN)' : 'Русский (RU)'}
          </button>

          {user === null ? (
            <button className={`sidebar-auth-btn ${isAuthModalOpen ? 'active' : ''}`} onClick={openAuthModal}>
              {t.signIn}
            </button>
          ) : (
            <div className="user-profile-box">
              {user.avatarUrl ? (
                <img className="user-avatar" src={user.avatarUrl} alt="" referrerPolicy="no-referrer" />
              ) : (
                <div className="user-avatar user-avatar-fallback" aria-hidden="true">
                  {user.username.trim().charAt(0).toUpperCase() || 'S'}
                </div>
              )}
              <div className="user-profile-info">
                <span>{user.username}</span>
                <small>{user.email}</small>
              </div>
              <button className="logout-btn" onClick={handleLogout}>
                {t.logout}
              </button>
            </div>
          )}
        </div>
      </aside>

      <main className="main-content">
        {activeTab === 'generator' && (
          <div className="tab-content">
            <h1>{t.generatorTitle}</h1>
            <p className="subtitle">{t.generatorSubtitle}</p>

            <div className="card">
              <div className="form-group">
                <label>{t.topicLabel}</label>
                <input type="text" value={topic} onChange={(event) => setTopic(event.target.value)} placeholder={t.topicPlaceholder} />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>{t.difficultyLabel}</label>
                  <select value={difficulty} onChange={(event) => setDifficulty(event.target.value as DifficultyType)}>
                    <option value="easy">{t.easy}</option>
                    <option value="medium">{t.medium}</option>
                    <option value="hardcore">{t.hardcore}</option>
                  </select>
                </div>
              </div>

              <button className="btn-primary" onClick={handleGenerateTest}>
                {t.generateButton}
              </button>
            </div>

            {isLoading && (
              <div className="loader-container">
                <span className="loader" />
                <p>{t.loading}</p>
              </div>
            )}

            {test && !showResults && (
              <div className="test-area">
                {test.map((question, questionIndex) => (
                  <div key={question.id} className="question-card">
                    <div className="question-text">
                      {questionIndex + 1}. {question.question}
                    </div>
                    <div className="options-list">
                      {question.options.map((option, optionIndex) => (
                        <button
                          key={option}
                          className={`option-btn ${selectedAnswers[question.id] === optionIndex ? 'selected' : ''}`}
                          onClick={() => handleSelectOption(question.id, optionIndex)}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                <button
                  className="btn-primary submit-test"
                  onClick={handleSubmitTest}
                  disabled={Object.keys(selectedAnswers).length < test.length}
                >
                  {t.submitButton}
                </button>
              </div>
            )}

            {showResults && test && (
              <div className="card results-card">
                <h2>{t.resultsTitle}</h2>
                <div className="score-num">
                  {test.filter((question) => selectedAnswers[question.id] === question.correctIndex).length} / {test.length}
                </div>
                <div className="review-card">
                  <strong>{t.reviewTitle}</strong>
                  <p>{review}</p>
                </div>

                <div className="breakdown">
                  <h3>{t.breakdownTitle}</h3>
                  {test.map((question, index) => {
                    const isCorrect = selectedAnswers[question.id] === question.correctIndex;

                    return (
                      <div key={question.id} className="breakdown-item">
                        <p>
                          <strong>
                            {t.questionLabel} {index + 1}:
                          </strong>{' '}
                          {question.question}
                        </p>
                        <p className={isCorrect ? 'answer-correct' : 'answer-wrong'}>
                          {t.yourAnswer}: {question.options[selectedAnswers[question.id]]}
                        </p>
                        {!isCorrect && (
                          <p className="answer-correct">
                            {t.correctAnswer}: {question.options[question.correctIndex]}
                          </p>
                        )}
                        <p className="feedback-line">
                          {t.explanationLabel}: {question.feedback}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <button className="btn-primary new-test" onClick={() => setTest(null)}>
                  {t.newTest}
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'explain' && (
          <div className="tab-content">
            <h1>{t.explainTitle}</h1>
            <p className="subtitle">{t.explainSubtitle}</p>
            <div className="card">
              <p className="placeholder-text">{t.explainPlaceholder}</p>
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="tab-content">
            <h1>{t.statsTitle}</h1>
            <p className="subtitle">{t.statsSubtitle}</p>
            <p className="stats-auth-greeting">
              {user ? (
                t.statsGreetingUser(user.username)
              ) : language === 'ru' ? (
                <>
                  Привет, Гость!{' '}
                  <span className="stats-signin-link" onClick={openAuthModal}>
                    Войди
                  </span>{' '}
                  в аккаунт, чтобы сохранять прогресс
                </>
              ) : (
                <>
                  Hello, Guest!{' '}
                  <span className="stats-signin-link" onClick={openAuthModal}>
                    Sign in
                  </span>{' '}
                  to save progress
                </>
              )}
            </p>
            <div className="stats-grid">
              <div className="stat-box">
                <div>{t.testsCompleted}</div>
                <div className="stat-value">{stats.testsCompleted}</div>
              </div>
              <div className="stat-box">
                <div>{t.averageScore}</div>
                <div className="stat-value">{stats.averageScore}%</div>
              </div>
              <div className="stat-box">
                <div>{t.yourStatus}</div>
                <div className="stat-value empire-status">{stats.testsCompleted >= 3 ? t.advancedStatus : t.beginnerStatus}</div>
              </div>
            </div>
            <button
              className="btn-primary"
              disabled={!canResetStats}
              onClick={handleResetStats}
              style={
                canResetStats
                  ? {
                      marginTop: '24px',
                      background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                      boxShadow: '0 0 24px rgba(239, 68, 68, 0.5)',
                    }
                  : {
                      marginTop: '24px',
                      background: '#374151',
                      boxShadow: 'none',
                      cursor: 'not-allowed',
                      opacity: 0.55,
                    }
              }
            >
              {canResetStats ? t.resetAvailable : t.resetLocked(testsUntilReset)}
            </button>
          </div>
        )}
      </main>

      {isAuthModalOpen && (
        <div className="auth-overlay" role="dialog" aria-modal="true">
          <form className="auth-modal" onSubmit={handleAuthSubmit}>
            <button type="button" className="close-modal-btn" onClick={() => setIsAuthModalOpen(false)} aria-label={t.authCloseLabel}>
              ×
            </button>

            <div className="auth-tabs">
              <button type="button" className={`auth-tab ${authMode === 'login' ? 'active' : ''}`} onClick={() => setAuthMode('login')}>
                {t.loginTab}
              </button>
              <button type="button" className={`auth-tab ${authMode === 'register' ? 'active' : ''}`} onClick={() => setAuthMode('register')}>
                {t.registerTab}
              </button>
            </div>

            {authMode === 'register' && (
              <div className="form-group">
                <label htmlFor="auth-username">{t.usernameLabel}</label>
                <input
                  id="auth-username"
                  type="text"
                  value={authForm.username}
                  onChange={(event) => setAuthForm((form) => ({ ...form, username: event.target.value }))}
                  placeholder={t.usernamePlaceholder}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="auth-email">{t.emailLabel}</label>
              <input
                id="auth-email"
                type="email"
                value={authForm.email}
                onChange={(event) => setAuthForm((form) => ({ ...form, email: event.target.value }))}
                placeholder={t.emailPlaceholder}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="auth-password">{t.passwordLabel}</label>
              <input
                id="auth-password"
                type="password"
                value={authForm.password}
                onChange={(event) => setAuthForm((form) => ({ ...form, password: event.target.value }))}
                placeholder={t.passwordPlaceholder}
                minLength={6}
                required
              />
            </div>

            <button className="btn-primary auth-submit" type="submit">
              {authMode === 'login' ? t.submitLogin : t.submitRegister}
            </button>

            <div className="auth-divider">
              <span>{language === 'ru' ? 'или' : 'or'}</span>
            </div>

            <button className="google-login-btn" type="button" onClick={handleGoogleSignIn}>
              {authMode === 'login'
                ? language === 'ru'
                  ? 'Войти через Google'
                  : 'Sign in with Google'
                : language === 'ru'
                  ? 'Зарегистрироваться через Google'
                  : 'Sign up with Google'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;
