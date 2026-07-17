import { CSSProperties, FormEvent, useEffect, useState } from 'react';
import type { User as SupabaseAuthUser } from '@supabase/supabase-js';
import { Menu } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { explainTopic, generateTest, TopicExplanationStep } from './lib/gemini';
import { supabase } from './lib/supabase';

interface AiTestQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
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
type ThemeMode = 'light' | 'dark';

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
    background: 'var(--page-glow), var(--bg-main)',
  },
  panel: {
    width: 'min(760px, 100%)',
    padding: '42px',
    border: '1px solid var(--border-color)',
    borderRadius: '24px',
    background: 'var(--bg-card)',
    boxShadow: '0 24px 80px var(--surface-shadow)',
    textAlign: 'center',
  },
  title: {
    color: 'var(--text-main)',
    fontSize: 'clamp(32px, 6vw, 58px)',
    fontWeight: 900,
    lineHeight: 1.05,
    marginBottom: '16px',
    letterSpacing: '0.04em',
  },
  subtitle: {
    color: 'var(--text-soft)',
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
    border: '1px solid var(--border-color)',
    borderRadius: '18px',
    background: 'var(--glacier)',
    color: 'var(--brand-dark)',
    fontSize: '24px',
    fontWeight: 800,
    cursor: 'pointer',
    boxShadow: '0 18px 40px color-mix(in srgb, var(--glacier) 24%, transparent)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease, filter 0.2s ease',
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

const getSavedTheme = (): ThemeMode => {
  const savedTheme = localStorage.getItem('synapse_theme');
  return savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : 'dark';
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

const buildVisualChartData = (step: TopicExplanationStep) =>
  step.visualData?.data.map((value, index) => ({
    label: `${index + 1}`,
    value,
  })) ?? [];

function App() {
  const [language, setLanguage] = useState<Language | null>(getSavedLanguage);
  const [themeMode, setThemeMode] = useState<ThemeMode>(getSavedTheme);
  const [activeTab, setActiveTab] = useState<TabType>('generator');
  const [topic, setTopic] = useState<string>('');
  const [difficulty, setDifficulty] = useState<DifficultyType>('medium');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [testQuestions, setTestQuestions] = useState<AiTestQuestion[]>([]);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string>('');
  const [explainTopicInput, setExplainTopicInput] = useState<string>('');
  const [explanationSteps, setExplanationSteps] = useState<TopicExplanationStep[]>([]);
  const [activeExplanationStepIndex, setActiveExplanationStepIndex] = useState<number>(0);
  const [isExplainLoading, setIsExplainLoading] = useState<boolean>(false);
  const [explainError, setExplainError] = useState<string>('');
  const [stats, setStats] = useState<Stats>(getSavedStats);
  const [user, setUser] = useState<User | null>(getSavedUser);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [authForm, setAuthForm] = useState<AuthForm>({ username: '', email: '', password: '' });

  useEffect(() => {
    localStorage.setItem('synapse_stats', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedTab = params.get('tab');
    const requestedTopic = params.get('topic');

    if (requestedTab === 'generator') {
      setActiveTab('generator');
    }

    if (requestedTopic) {
      setTopic(requestedTopic);
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', themeMode === 'dark');
    localStorage.setItem('synapse_theme', themeMode);
  }, [themeMode]);

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
  const desktopNavLabels =
    language === 'ru'
      ? {
          generator: 'Генератор тестов',
          explain: 'Объяснение тем',
          stats: 'Моя статистика',
          games: 'Игры',
        }
      : {
          generator: 'Test Generator',
          explain: 'Topic Explainer',
          stats: 'My Statistics',
          games: 'Games',
        };
  const isDarkTheme = themeMode === 'dark';
  const testsUntilReset = 10 - (stats.testsCompleted % 10);
  const canResetStats = stats.testsCompleted > 0 && stats.testsCompleted % 10 === 0;
  const currentQuestion = testQuestions[activeQuestionIndex];
  const correctAnswersCount = testQuestions.filter((question, index) => userAnswers[index] === question.correctAnswer).length;
  const currentExplanationStep = explanationSteps[activeExplanationStepIndex];
  const currentVisualChartData = currentExplanationStep ? buildVisualChartData(currentExplanationStep) : [];
  const explanationProgress =
    explanationSteps.length > 0 ? Math.round(((activeExplanationStepIndex + 1) / explanationSteps.length) * 100) : 0;
  const isExplanationComplete =
    explanationSteps.length > 0 && activeExplanationStepIndex === explanationSteps.length - 1;

  const handleGenerateTest = async () => {
    const normalizedTopic = topic.trim();

    if (!normalizedTopic) {
      window.alert(t.missingTopicAlert);
      return;
    }

    setIsLoading(true);
    setTestQuestions([]);
    setActiveQuestionIndex(0);
    setUserAnswers([]);
    setShowResults(false);
    setAiError('');

    try {
      const normalizedQuestions = await generateTest(normalizedTopic, difficulty);
      setTestQuestions(normalizedQuestions);
      setActiveQuestionIndex(0);
      setUserAnswers([]);
    } catch (generationError) {
      setAiError(generationError instanceof Error ? generationError.message : 'Could not generate a test. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const finishAiTest = (answers: string[]) => {
    const correctCount = testQuestions.filter((question, index) => answers[index] === question.correctAnswer).length;
    const percent = Math.round((correctCount / testQuestions.length) * 100);
    const newCompleted = stats.testsCompleted + 1;
    const newTotal = stats.totalScore + percent;

    setStats({
      testsCompleted: newCompleted,
      totalScore: newTotal,
      averageScore: Math.round(newTotal / newCompleted),
    });

    setShowResults(true);
  };

  const handleAnswerQuestion = (answer: string) => {
    const nextAnswers = [...userAnswers];
    nextAnswers[activeQuestionIndex] = answer;
    setUserAnswers(nextAnswers);

    if (activeQuestionIndex < testQuestions.length - 1) {
      setActiveQuestionIndex((index) => index + 1);
      return;
    }

    finishAiTest(nextAnswers);
  };

  const handleTryAnotherTopic = () => {
    setTestQuestions([]);
    setActiveQuestionIndex(0);
    setUserAnswers([]);
    setShowResults(false);
    setIsLoading(false);
    setAiError('');
  };

  const handleExplainTopic = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedTopic = explainTopicInput.trim();

    if (!normalizedTopic) {
      window.alert(language === 'ru' ? 'Пожалуйста, введи тему для объяснения!' : 'Please enter a topic to explain!');
      return;
    }

    setIsExplainLoading(true);
    setExplanationSteps([]);
    setActiveExplanationStepIndex(0);
    setExplainError('');

    try {
      const steps = await explainTopic(normalizedTopic);
      setExplanationSteps(steps.slice(0, 5));
      setActiveExplanationStepIndex(0);
    } catch (error) {
      setExplainError(error instanceof Error ? error.message : 'Could not explain this topic. Please try again.');
    } finally {
      setIsExplainLoading(false);
    }
  };

  const handleNextExplanationStep = () => {
    if (activeExplanationStepIndex >= explanationSteps.length - 1) return;

    setIsExplainLoading(true);
    window.setTimeout(() => {
      setActiveExplanationStepIndex((index) => index + 1);
      setIsExplainLoading(false);
    }, 450);
  };

  const handleSimplifyExplanationStep = async () => {
    if (!currentExplanationStep) return;

    setIsExplainLoading(true);
    setExplainError('');

    try {
      const [simpleStep] = await explainTopic(explainTopicInput.trim(), currentExplanationStep);

      if (!simpleStep) {
        throw new Error('AI did not return a simplified explanation.');
      }

      setExplanationSteps((steps) =>
        steps.map((step, index) => (index === activeExplanationStepIndex ? simpleStep : step)),
      );
    } catch (error) {
      setExplainError(error instanceof Error ? error.message : 'Could not simplify this step. Please try again.');
    } finally {
      setIsExplainLoading(false);
    }
  };

  const handleGenerateTestFromExplanation = () => {
    const normalizedTopic = explainTopicInput.trim();
    const params = new URLSearchParams(window.location.search);

    params.set('tab', 'generator');
    params.set('topic', normalizedTopic);
    window.history.pushState({}, '', `${window.location.pathname}?${params.toString()}`);

    setTopic(normalizedTopic);
    handleTryAnotherTopic();
    setActiveTab('generator');
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

  const handleToggleTheme = () => {
    setThemeMode((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'));
  };

  const handleMobileTabClick = (nextTab: TabType) => {
    setActiveTab(nextTab);
    setIsMobileMenuOpen(false);

    if (nextTab === 'generator') {
      handleTryAnotherTopic();
    }
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

  return (
    <div className="synapse-container bg-white text-[#0F172A] dark:bg-[#0A0A0A] dark:text-[#E5E5E5]">
      <header className="mobile-header flex md:hidden bg-white border-b border-slate-200 dark:bg-[#0A0A0A] dark:border-b dark:border-[#1F1F1F]">
        <div className="mobile-logo">SYNAPSE</div>
        <button
          className="mobile-menu-button"
          type="button"
          onClick={() => setIsMobileMenuOpen((open) => !open)}
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          <Menu size={18} strokeWidth={2.2} />
        </button>
      </header>

      <div className={`mobile-overlay md:hidden ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-overlay-header">
          <div className="mobile-logo">SYNAPSE</div>
          <button className="mobile-close-button" type="button" onClick={() => setIsMobileMenuOpen(false)} aria-label="Close menu">
            ×
          </button>
        </div>

        <nav className="mobile-nav-list">
          <button className={`mobile-nav-item ${activeTab === 'generator' ? 'active' : ''}`} type="button" onClick={() => handleMobileTabClick('generator')}>
            {t.navGenerator}
          </button>
          <button className={`mobile-nav-item ${activeTab === 'explain' ? 'active' : ''}`} type="button" onClick={() => handleMobileTabClick('explain')}>
            {t.navExplain}
          </button>
          <button className={`mobile-nav-item ${activeTab === 'stats' ? 'active' : ''}`} type="button" onClick={() => handleMobileTabClick('stats')}>
            {t.navStats}
          </button>
          <button className="mobile-nav-item mobile-nav-item-locked" type="button" onClick={() => setIsMobileMenuOpen(false)}>
            {t.navGames}
          </button>
        </nav>
      </div>

      <header className="desktop-navbar hidden md:flex bg-white border-b border-slate-200 dark:bg-[#0A0A0A] dark:border-b dark:border-[#1F1F1F]">
        <div className="logo">SYNAPSE</div>
        <nav className="desktop-nav-list">
          <button
            className={`menu-item text-slate-500 hover:text-[#0F172A] dark:text-gray-400 dark:hover:text-white ${activeTab === 'generator' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('generator');
              handleTryAnotherTopic();
            }}
          >
            {desktopNavLabels.generator}
          </button>
          <button className={`menu-item text-slate-500 hover:text-[#0F172A] dark:text-gray-400 dark:hover:text-white ${activeTab === 'explain' ? 'active' : ''}`} onClick={() => setActiveTab('explain')}>
            {desktopNavLabels.explain}
          </button>
          <button className={`menu-item text-slate-500 hover:text-[#0F172A] dark:text-gray-400 dark:hover:text-white ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => setActiveTab('stats')}>
            {desktopNavLabels.stats}
          </button>
          <button className="menu-item locked text-slate-500 dark:text-gray-400" disabled>
            {desktopNavLabels.games}
          </button>
        </nav>
        <div className="navbar-actions">
          <button className="lang-toggle-btn" onClick={handleToggleLanguage}>
            🌐 {language === 'ru' ? 'English (EN)' : 'Русский (RU)'}
          </button>

          <button
            className="theme-toggle-btn"
            type="button"
            onClick={handleToggleTheme}
            aria-label={isDarkTheme ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkTheme ? (
              <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2" />
                <path d="M12 20v2" />
                <path d="m4.93 4.93 1.41 1.41" />
                <path d="m17.66 17.66 1.41 1.41" />
                <path d="M2 12h2" />
                <path d="M20 12h2" />
                <path d="m6.34 17.66-1.41 1.41" />
                <path d="m19.07 4.93-1.41 1.41" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
                <path d="M21 12.8A8.6 8.6 0 1 1 11.2 3a6.7 6.7 0 0 0 9.8 9.8Z" />
              </svg>
            )}
          </button>

          {user === null ? (
            <button className={`navbar-auth-btn ${isAuthModalOpen ? 'active' : ''}`} onClick={openAuthModal}>
              {t.signIn}
            </button>
          ) : (
            <div className="profile-menu-container">
              {isProfileMenuOpen && (
                <div className="profile-menu-dropdown navbar-profile-dropdown">
                  <button className="profile-menu-item" type="button">
                    My Profile
                  </button>
                  <button className="profile-menu-item" type="button">
                    Appearance
                  </button>
                  <button className="profile-menu-item" type="button">
                    Tutorial
                  </button>
                  <button className="profile-menu-item" type="button">
                    Settings
                  </button>
                  <hr className="profile-menu-divider" />
                  <button className="profile-menu-sign-out" type="button" onClick={() => setIsProfileMenuOpen(false)}>
                    Sign Out
                  </button>
                </div>
              )}

              <button className="user-profile-box" onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}>
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
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="main-content">
        {activeTab === 'generator' && (
          <div className="tab-content">
            <h1>{t.generatorTitle}</h1>
            <p className="subtitle">{t.generatorSubtitle}</p>

            {aiError && <div className="error-card">{aiError}</div>}

            {!isLoading && testQuestions.length === 0 && !showResults && (
              <div className="card bg-white border border-slate-200 shadow-sm dark:bg-[#121212] dark:border dark:border-[#262626]">
              <div className="form-group">
                <label>{t.topicLabel}</label>
                <input className="bg-white border border-slate-300 text-[#0F172A] dark:bg-[#171717] dark:border dark:border-[#333333] dark:text-[#E5E5E5]" type="text" value={topic} onChange={(event) => setTopic(event.target.value)} placeholder={t.topicPlaceholder} />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>{t.difficultyLabel}</label>
                  <select className="bg-white border border-slate-300 text-[#0F172A] dark:bg-[#171717] dark:border dark:border-[#333333] dark:text-[#E5E5E5]" value={difficulty} onChange={(event) => setDifficulty(event.target.value as DifficultyType)}>
                    <option value="easy">{t.easy}</option>
                    <option value="medium">{t.medium}</option>
                    <option value="hardcore">{t.hardcore}</option>
                  </select>
                </div>
              </div>

              <button className="btn-primary bg-teal-500 text-[#0F172A] dark:bg-teal-500 dark:text-[#0F172A]" onClick={handleGenerateTest} disabled={isLoading}>
                {isLoading ? 'Генерация теста...' : t.generateButton}
              </button>
              </div>
            )}

            {isLoading && (
              <div className="loader-container">
                <span className="loader" />
                <p>🧠 Synapse AI is thinking... Creating your custom test (takes about 3 seconds)</p>
              </div>
            )}

            {currentQuestion && !showResults && (
              <div className="test-area">
                <div className="question-progress">
                  <span>
                    Вопрос {activeQuestionIndex + 1} из {testQuestions.length}
                  </span>
                  <div className="question-progress-track">
                    <div
                      className="question-progress-fill"
                      style={{ width: `${((activeQuestionIndex + 1) / testQuestions.length) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="question-card active-question-card bg-white border border-slate-200 dark:bg-[#121212] dark:border dark:border-[#262626]">
                  <div className="question-text">{currentQuestion.question}</div>
                  <div className="options-list">
                    {currentQuestion.options.map((option) => (
                <button key={option} className="option-btn border-slate-300 text-[#0F172A] dark:border-[#333333] dark:text-[#E5E5E5]" onClick={() => handleAnswerQuestion(option)}>
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                <p className="ai-disclaimer">⚠️ AI-generated content. ИИ может ошибаться.</p>
              </div>
            )}

            {showResults && testQuestions.length > 0 && (
              <div className="card results-card bg-white border border-slate-200 shadow-sm dark:bg-[#121212] dark:border dark:border-[#262626]">
                <h2>{t.resultsTitle}</h2>
                <div className="score-num">{correctAnswersCount} / {testQuestions.length}</div>
                <p className="result-summary">
                  Вы ответили правильно на {correctAnswersCount} из {testQuestions.length} вопросов!
                </p>

                <div className="breakdown">
                  <h3>{t.breakdownTitle}</h3>
                  {testQuestions.map((question, index) => {
                    const isCorrect = userAnswers[index] === question.correctAnswer;

                    return (
                      <div key={`${question.question}-${index}`} className="breakdown-item">
                        <p>
                          <strong>
                            {t.questionLabel} {index + 1}:
                          </strong>{' '}
                          {question.question}
                        </p>
                        <p className={isCorrect ? 'answer-correct' : 'answer-wrong'}>
                          {t.yourAnswer}: {userAnswers[index]}
                        </p>
                        {!isCorrect && (
                          <p className="answer-correct">
                            {t.correctAnswer}: {question.correctAnswer}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

                <p className="ai-disclaimer">⚠️ AI-generated content. ИИ может ошибаться.</p>

                <button className="btn-primary new-test bg-teal-500 text-[#0F172A] dark:bg-teal-500 dark:text-[#0F172A]" onClick={handleTryAnotherTopic}>
                  Try Another Topic
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'explain' && (
          <div className="tab-content">
            <h1>{t.explainTitle}</h1>
            <p className="subtitle">{t.explainSubtitle}</p>

            {explainError && <div className="error-card">{explainError}</div>}

            <form className="card bg-white border border-slate-200 shadow-sm dark:bg-[#121212] dark:border dark:border-[#262626]" onSubmit={handleExplainTopic}>
              <div className="form-group">
                <label>{language === 'ru' ? 'ТЕМА ДЛЯ ОБЪЯСНЕНИЯ' : 'TOPIC TO EXPLAIN'}</label>
                <input
                  className="bg-white border border-slate-300 text-[#0F172A] dark:bg-[#171717] dark:border dark:border-[#333333] dark:text-[#E5E5E5]"
                  type="text"
                  value={explainTopicInput}
                  onChange={(event) => setExplainTopicInput(event.target.value)}
                  placeholder={language === 'ru' ? 'Например: производная, React hooks, фотосинтез...' : 'For example: derivatives, React hooks, photosynthesis...'}
                />
              </div>
              <button className="btn-primary bg-teal-500 text-[#0F172A] dark:bg-teal-500 dark:text-[#0F172A]" type="submit" disabled={isExplainLoading}>
                {isExplainLoading && explanationSteps.length === 0
                  ? language === 'ru'
                    ? 'Готовлю шаги...'
                    : 'Preparing steps...'
                  : language === 'ru'
                    ? 'Объяснить по шагам'
                    : 'Explain step by step'}
              </button>
            </form>

            {explanationSteps.length > 0 && (
              <div className="socratic-area">
                <div className="question-progress">
                  <span>
                    {language === 'ru' ? 'Шаг' : 'Step'} {activeExplanationStepIndex + 1} {language === 'ru' ? 'из' : 'of'} {explanationSteps.length}
                  </span>
                  <div className="question-progress-track">
                    <div className="question-progress-fill" style={{ width: `${explanationProgress}%` }} />
                  </div>
                </div>

                {isExplainLoading ? (
                  <div className="loader-container socratic-loader">
                    <span className="loader" />
                    <p>{language === 'ru' ? 'Подстраиваю объяснение...' : 'Adjusting the explanation...'}</p>
                  </div>
                ) : (
                  currentExplanationStep && (
                    <div key={`${activeExplanationStepIndex}-${currentExplanationStep.title}`} className="socratic-step-card bg-white border border-slate-200 dark:bg-[#121212] dark:border dark:border-[#262626]">
                      <div className="socratic-step-label">
                        {language === 'ru' ? 'Сократический шаг' : 'Socratic step'} {activeExplanationStepIndex + 1}
                      </div>
                      <h2>{currentExplanationStep.title}</h2>
                      <p>{currentExplanationStep.content}</p>

                      {currentExplanationStep.visualData && (
                        <div className="socratic-visual">
                          {currentExplanationStep.visualData.title && <h3>{currentExplanationStep.visualData.title}</h3>}
                          <div className="socratic-chart" aria-label={currentExplanationStep.visualData.title || 'Topic visualization'}>
                            <ResponsiveContainer width="100%" height="100%">
                              {currentExplanationStep.visualData.type === 'bar' ? (
                                <BarChart data={currentVisualChartData} margin={{ top: 12, right: 14, bottom: 8, left: 0 }}>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="label" label={currentExplanationStep.visualData.xLabel ? { value: currentExplanationStep.visualData.xLabel, position: 'insideBottom', offset: -4 } : undefined} />
                                  <YAxis label={currentExplanationStep.visualData.yLabel ? { value: currentExplanationStep.visualData.yLabel, angle: -90, position: 'insideLeft' } : undefined} />
                                  <Tooltip />
                                  <Bar dataKey="value" fill="var(--glacier)" radius={[6, 6, 0, 0]} />
                                </BarChart>
                              ) : (
                                <LineChart data={currentVisualChartData} margin={{ top: 12, right: 14, bottom: 8, left: 0 }}>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="label" label={currentExplanationStep.visualData.xLabel ? { value: currentExplanationStep.visualData.xLabel, position: 'insideBottom', offset: -4 } : undefined} />
                                  <YAxis label={currentExplanationStep.visualData.yLabel ? { value: currentExplanationStep.visualData.yLabel, angle: -90, position: 'insideLeft' } : undefined} />
                                  <Tooltip />
                                  <Line type="monotone" dataKey="value" stroke="var(--glacier)" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                </LineChart>
                              )}
                            </ResponsiveContainer>
                          </div>
                        </div>
                      )}

                      <div className="socratic-actions">
                        {!isExplanationComplete && (
                          <button className="btn-primary" type="button" onClick={handleNextExplanationStep}>
                            {language === 'ru' ? 'Понял, дальше' : 'Got it, next'}
                          </button>
                        )}
                        <button className="socratic-secondary-btn" type="button" onClick={handleSimplifyExplanationStep}>
                          {language === 'ru' ? 'Проще, пожалуйста' : 'Simpler, please'}
                        </button>
                      </div>
                    </div>
                  )
                )}

                {isExplanationComplete && !isExplainLoading && (
                  <button className="btn-primary new-test bg-teal-500 text-[#0F172A] dark:bg-teal-500 dark:text-[#0F172A]" type="button" onClick={handleGenerateTestFromExplanation}>
                    {language === 'ru' ? 'Сгенерировать тест по теме' : 'Generate a test on this topic'}
                  </button>
                )}

                <p className="ai-disclaimer">AI-generated content. ИИ может ошибаться.</p>
              </div>
            )}
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
              <div className="stat-box bg-white border border-slate-200 shadow-sm dark:bg-[#121212] dark:border dark:border-[#262626]">
                <div>{t.testsCompleted}</div>
                <div className="stat-value">{stats.testsCompleted}</div>
              </div>
              <div className="stat-box bg-white border border-slate-200 shadow-sm dark:bg-[#121212] dark:border dark:border-[#262626]">
                <div>{t.averageScore}</div>
                <div className="stat-value">{stats.averageScore}%</div>
              </div>
              <div className="stat-box bg-white border border-slate-200 shadow-sm dark:bg-[#121212] dark:border dark:border-[#262626]">
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
                      background: 'var(--glacier)',
                      boxShadow: '0 18px 40px color-mix(in srgb, var(--glacier) 24%, transparent)',
                    }
                  : {
                      marginTop: '24px',
                      background: 'var(--border-color)',
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
          <form className="auth-modal bg-white border border-slate-200 shadow-sm dark:bg-[#121212] dark:border dark:border-[#262626]" onSubmit={handleAuthSubmit}>
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
                  className="bg-white border border-slate-300 text-[#0F172A] dark:bg-[#171717] dark:border dark:border-[#333333] dark:text-[#E5E5E5]"
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
                className="bg-white border border-slate-300 text-[#0F172A] dark:bg-[#171717] dark:border dark:border-[#333333] dark:text-[#E5E5E5]"
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
                className="bg-white border border-slate-300 text-[#0F172A] dark:bg-[#171717] dark:border dark:border-[#333333] dark:text-[#E5E5E5]"
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
