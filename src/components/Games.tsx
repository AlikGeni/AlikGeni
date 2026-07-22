import { useEffect, useRef, useState } from 'react';
import { generateTest } from '../lib/gemini';

interface GameQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

interface GamesTranslation {
  gamesTitle: string;
  gamesSubtitle: string;
  gamesHint: string;
  gamesCardTimeAttackTitle: string;
  gamesCardTimeAttackDescription: string;
  gamesCardPlayButton: string;
  gamesBackToHub: string;
  timeAttackTopicLabel: string;
  timeAttackTopicPlaceholder: string;
  timeAttackTimerLabel: string;
  timeAttackStartButton: string;
  timeAttackScoreLabel: string;
  timeAttackStreakLabel: string;
  timeAttackFinalScore: string;
  timeAttackBestStreak: string;
  timeAttackLoadingText: string;
  timeAttackPlayAgain: string;
  timeAttackBackToLobby: string;
}

const generateMockQuestions = (topic: string, count: number): GameQuestion[] => {
  const normalizedTopic = topic.trim().toLowerCase();
  const isVectorTopic = /(^|\s)(vector|вектор|векторы)(\s|$)/i.test(normalizedTopic);

  const vectorQuestions: GameQuestion[] = [
    {
      question: 'Что определяет векторную величину?',
      options: ['Только модуль', 'Только направление', 'Направление и модуль', 'Ничего из перечисленного'],
      correctAnswer: 'Направление и модуль',
    },
    {
      question: 'Какая из этих величин является векторной?',
      options: ['Масса', 'Температура', 'Перемещение', 'Время'],
      correctAnswer: 'Перемещение',
    },
    {
      question: 'Сумма двух векторов определяется по правилу...',
      options: ['Треугольника', 'Параллелограмма', 'Квадрата', 'Прямоугольника'],
      correctAnswer: 'Параллелограмма',
    },
    {
      question: 'Если вектор умножить на -1, он...',
      options: ['Теряет направление', 'Меняет направление', 'Становится нулевым', 'Становится скаляром'],
      correctAnswer: 'Меняет направление',
    },
    {
      question: 'Нулевой вектор имеет...',
      options: ['Направление', 'Модуль 0', 'Длину 1', 'Произведение 0'],
      correctAnswer: 'Модуль 0',
    },
    {
      question: 'Скалярное произведение двух векторов даёт...',
      options: ['Число', 'Вектор', 'Матрицу', 'Угол'],
      correctAnswer: 'Число',
    },
    {
      question: 'Векторы называются ортогональными, если их...',
      options: ['Сумма равна нулю', 'Модули равны', 'Направления совпадают', 'Скалярное произведение равно 0'],
      correctAnswer: 'Скалярное произведение равно 0',
    },
    {
      question: 'Модуль вектора показывает...',
      options: ['Его направление', 'Его величину', 'Его знак', 'Его положение'],
      correctAnswer: 'Его величину',
    },
    {
      question: 'Скалярное произведение векторов равно 0, когда они...',
      options: ['Параллельны', 'Перпендикулярны', 'Антипараллельны', 'Одинаковы'],
      correctAnswer: 'Перпендикулярны',
    },
    {
      question: 'Какой из этих векторов нельзя представить в одной точке без изменения?',
      options: ['Отрезок', 'Перемещение', 'Сила', 'Скорость'],
      correctAnswer: 'Все перечисленные можно представить',
    },
    {
      question: 'Сумма двух противоположных векторов равна...',
      options: ['Двойному вектору', 'Нулевому вектору', 'Единичному вектору', 'Вектору с тем же направлением'],
      correctAnswer: 'Нулевому вектору',
    },
    {
      question: 'Ортонормированные векторы имеют...',
      options: ['Модули 1 и угол 90°', 'Разные модули', 'Параллельные направления', 'Одинаковое направление'],
      correctAnswer: 'Модули 1 и угол 90°',
    },
    {
      question: 'Проекция вектора на ось показывает...',
      options: ['Только модуль', 'Только направление', 'Компоненту вдоль оси', 'Угол между векторами'],
      correctAnswer: 'Компоненту вдоль оси',
    },
    {
      question: 'Антипараллельные векторы имеют...',
      options: ['Одинаковое направление', 'Противоположное направление', 'Одинаковый модуль', 'Нулевой угол'],
      correctAnswer: 'Противоположное направление',
    },
    {
      question: 'Скалярное произведение векторов зависит от...',
      options: ['Их модулей и угла между ними', 'Только модулей', 'Только направления', 'Только расстояния'],
      correctAnswer: 'Их модулей и угла между ними',
    },
  ];

  const generalQuestions: GameQuestion[] = [
    {
      question: 'Кто написал Мону Лизу?',
      options: ['Леонардо да Винчи', 'Микеланджело', 'Пикассо', 'Ван Гог'],
      correctAnswer: 'Леонардо да Винчи',
    },
    {
      question: 'Столица Франции?',
      options: ['Лондон', 'Париж', 'Берлин', 'Рим'],
      correctAnswer: 'Париж',
    },
    {
      question: 'Какая планета ближе всего к Солнцу?',
      options: ['Меркурий', 'Венера', 'Земля', 'Марс'],
      correctAnswer: 'Меркурий',
    },
    {
      question: 'Сколько цветов в радуге?',
      options: ['5', '6', '7', '8'],
      correctAnswer: '7',
    },
    {
      question: 'Чему равен 2 + 2?',
      options: ['3', '4', '5', '22'],
      correctAnswer: '4',
    },
    {
      question: 'Что изучает ботаника?',
      options: ['Звёзды', 'Растения', 'Фильмы', 'Числа'],
      correctAnswer: 'Растения',
    },
    {
      question: 'Какой газ необходим человеку для дыхания?',
      options: ['Кислород', 'Углекислый газ', 'Азот', 'Водород'],
      correctAnswer: 'Кислород',
    },
    {
      question: 'Какой океан самый большой?',
      options: ['Тихий', 'Атлантический', 'Индийский', 'Северный Ледовитый'],
      correctAnswer: 'Тихий',
    },
    {
      question: 'Кто написал «Войну и мир»?',
      options: ['Пушкин', 'Достоевский', 'Толстой', 'Чехов'],
      correctAnswer: 'Толстой',
    },
    {
      question: 'Сколько дней в високосном году?',
      options: ['365', '366', '364', '367'],
      correctAnswer: '366',
    },
    {
      question: 'Какой металл является самым легким?',
      options: ['Железо', 'Алюминий', 'Литий', 'Медь'],
      correctAnswer: 'Литий',
    },
    {
      question: 'Какой самый большой материк?',
      options: ['Африка', 'Евразия', 'Антарктида', 'Австралия'],
      correctAnswer: 'Евразия',
    },
    {
      question: 'Какой инструмент используют для измерения углов?',
      options: ['Рулетка', 'Компас', 'Транспортир', 'Штангенциркуль'],
      correctAnswer: 'Транспортир',
    },
    {
      question: 'Какое животное является самым быстрым на суше?',
      options: ['Слон', 'Тигр', 'Гепард', 'Лев'],
      correctAnswer: 'Гепард',
    },
    {
      question: 'Что происходит при испарении воды?',
      options: ['Вода превращается в лёд', 'Вода превращается в пар', 'Вода становится газом', 'Вода становится твердым веществом'],
      correctAnswer: 'Вода превращается в пар',
    },
  ];

  const source = isVectorTopic ? vectorQuestions : generalQuestions;
  const shuffledQuestions = [...source].sort(() => Math.random() - 0.5);
  return shuffledQuestions.slice(0, Math.min(count, shuffledQuestions.length));
};
void generateMockQuestions;
export function Games({ t, language }: { t: GamesTranslation; language: 'ru' | 'en' }) {
  const [gameState, setGameState] = useState<'lobby' | 'loading' | 'playing' | 'result'>('lobby');
  const [topic, setTopic] = useState('');
  const [timer, setTimer] = useState<30 | 60 | 90>(60);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number>(timer);
  const [questions, setQuestions] = useState<GameQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [buttonsLocked, setButtonsLocked] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const loadingTimeoutRef = useRef<number | null>(null);
  const answerTimeoutRef = useRef<number | null>(null);
  const questionsBufferRef = useRef<GameQuestion[]>([]);
  const seenQuestionsRef = useRef(new Set<string>());
  const requestInFlightRef = useRef(false);

  const sectionStyle = {
    minHeight: 'calc(100vh - 64px)',
    background: 'var(--page-glow), var(--bg-main)',
    color: 'var(--text-main)',
    transition: 'background-color 0.2s ease, color 0.2s ease',
  };

  const contentWrapper = {
    width: '100%',
    maxWidth: '860px',
    margin: '0 auto',
    padding: '72px 24px',
    boxSizing: 'border-box' as const,
  };

  const cardBaseStyle = {
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: '28px',
    boxShadow: '0 24px 70px var(--surface-shadow)',
    color: 'var(--text-main)',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease',
  };

  const textSoftStyle = {
    color: 'var(--text-soft)',
  };

  const linkButtonStyle = {
    border: 'none',
    background: 'transparent',
    color: 'var(--text-main)',
    padding: 0,
    fontSize: '14px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'color 0.2s ease',
  } as const;

  const inputStyle = {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '16px',
    border: '1px solid var(--input-border)',
    backgroundColor: 'var(--input-bg)',
    color: 'var(--text-main)',
    outline: 'none',
    fontSize: '15px',
    transition: 'border-color 0.2s ease, background-color 0.2s ease',
  } as const;

  const timerButtonStyle = (value: 30 | 60 | 90) => ({
    flex: 1,
    padding: '12px 0',
    borderRadius: '14px',
    border: `1px solid ${timer === value ? 'var(--glacier)' : 'var(--border-color)'}`,
    backgroundColor: timer === value ? 'rgba(16,185,129,0.12)' : 'var(--bg-card)',
    color: 'var(--text-main)',
    cursor: 'pointer',
    fontWeight: timer === value ? 700 : 500,
    transition: 'all 0.2s ease',
  });

  const currentQuestion = questions[currentQuestionIndex];
  const progressPercent = timer > 0 ? Math.max(0, Math.min(100, Math.round((timeLeft / timer) * 100))) : 0;
  const progressColor = progressPercent > 35 ? '#10b981' : '#f97316';

  useEffect(() => {
    if (gameState !== 'playing') {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(intervalId);
          setGameState('result');
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [gameState]);

  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) {
        window.clearTimeout(loadingTimeoutRef.current);
      }
      if (answerTimeoutRef.current) {
        window.clearTimeout(answerTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (gameState !== 'playing') {
      return;
    }

    if (questionsBufferRef.current.length - currentQuestionIndex <= 2 && timeLeft > 0) {
      void loadMoreQuestions(topic.trim() || 'General Knowledge');
    }
  }, [currentQuestionIndex, gameState, timeLeft, topic, language]);

  const resetToLobby = () => {
    setGameState('lobby');
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setTimeLeft(timer);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setButtonsLocked(false);
    setIsFetchingMore(false);
    questionsBufferRef.current = [];
    seenQuestionsRef.current = new Set();
    requestInFlightRef.current = false;
  };

  const loadMoreQuestions = async (topicToUse: string) => {
    if (requestInFlightRef.current || timeLeft <= 0) {
      return;
    }

    requestInFlightRef.current = true;
    setIsFetchingMore(true);

    try {
      const uniqueQuestions: GameQuestion[] = [];
      let attempts = 0;

      while (uniqueQuestions.length < 5 && attempts < 4 && timeLeft > 0) {
        const generatedQuestions = await generateTest(
          `${topicToUse}. Generate fresh, non-repeating questions that do not duplicate any previously asked question in this session.`,
          'medium',
          language,
        );

        generatedQuestions.forEach((question) => {
          const signature = question.question.trim().toLowerCase();
          if (!seenQuestionsRef.current.has(signature) && !uniqueQuestions.some((item) => item.question.trim().toLowerCase() === signature)) {
            seenQuestionsRef.current.add(signature);
            uniqueQuestions.push(question);
          }
        });

        attempts += 1;
      }

      if (uniqueQuestions.length > 0) {
        questionsBufferRef.current = [...questionsBufferRef.current, ...uniqueQuestions];
      }

      setQuestions([...questionsBufferRef.current]);
    } catch (error) {
      console.error('Failed to generate test questions:', error);
    } finally {
      requestInFlightRef.current = false;
      setIsFetchingMore(false);
    }
  };

  const startGame = async () => {
    const topicToUse = topic.trim() || 'General Knowledge';

    setGameState('loading');
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setSelectedAnswer(null);
    setButtonsLocked(false);
    setCurrentQuestionIndex(0);
    setTimeLeft(timer);
    questionsBufferRef.current = [];
    seenQuestionsRef.current = new Set();
    requestInFlightRef.current = false;

    try {
      const generatedQuestions = await generateTest(
        `${topicToUse}. Generate fresh, non-repeating questions that do not duplicate any previously asked question in this session.`,
        'medium',
        language,
      );
      const initialUniqueQuestions = generatedQuestions.filter((question) => {
        const signature = question.question.trim().toLowerCase();
        if (seenQuestionsRef.current.has(signature)) {
          return false;
        }

        seenQuestionsRef.current.add(signature);
        return true;
      });

      questionsBufferRef.current = initialUniqueQuestions;
      setQuestions(initialUniqueQuestions);
      setGameState('playing');

      if (initialUniqueQuestions.length < 5 && timer > 0) {
        void loadMoreQuestions(topicToUse);
      }
    } catch (error) {
      console.error('Failed to generate test questions:', error);
      setQuestions([]);
      setGameState('lobby');
    }
  };

  const playAgain = () => {
    void startGame();
  };

  const handleAnswer = (answer: string) => {
    if (buttonsLocked || selectedAnswer || gameState !== 'playing' || !currentQuestion) {
      return;
    }

    const isCorrect = answer === currentQuestion.correctAnswer;
    setSelectedAnswer(answer);
    setButtonsLocked(true);

    if (isCorrect) {
      setStreak((prevStreak) => {
        const nextStreak = prevStreak + 1;
        setScore((prevScore) => prevScore + 100 * (prevStreak === 0 ? 1 : prevStreak));
        setBestStreak((best) => Math.max(best, nextStreak));
        return nextStreak;
      });
    } else {
      setStreak(0);
    }

    const nextQuestionIndex = currentQuestionIndex + 1;
    answerTimeoutRef.current = window.setTimeout(() => {
      void (async () => {
        if (timeLeft <= 0) {
          setGameState('result');
          return;
        }

        if (nextQuestionIndex >= questionsBufferRef.current.length) {
          await loadMoreQuestions(topic.trim() || 'General Knowledge');
        }

        setSelectedAnswer(null);
        setButtonsLocked(false);
        setCurrentQuestionIndex(nextQuestionIndex);
      })();
    }, 500);
  };

  const getOptionStyle = (option: string) => {
    const baseStyle = {
      width: '100%',
      padding: '16px 18px',
      borderRadius: '18px',
      border: '1px solid var(--border-color)',
      backgroundColor: 'var(--bg-card)',
      color: 'var(--text-main)',
      cursor: selectedAnswer ? 'not-allowed' : 'pointer',
      transition: 'all 0.2s ease',
      textAlign: 'left' as const,
      fontSize: '15px',
      fontWeight: 600,
      minHeight: '54px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    };

    if (!selectedAnswer) {
      return baseStyle;
    }

    if (option !== selectedAnswer) {
      return {
        ...baseStyle,
        opacity: 0.65,
      };
    }

    const correct = option === currentQuestion.correctAnswer;
    return {
      ...baseStyle,
      backgroundColor: correct ? '#10b981' : '#f87171',
      borderColor: correct ? '#059669' : '#ef4444',
      color: correct ? '#0f172a' : '#ffffff',
    };
  };

  const handleTimerChange = (value: 30 | 60 | 90) => {
    setTimer(value);
    if (gameState === 'lobby') {
      setTimeLeft(value);
    }
  };

  if (gameState === 'loading') {
    return (
      <div className="games-screen" style={sectionStyle}>
        <div style={contentWrapper}>
          <div style={{ ...cardBaseStyle, borderRadius: '28px', padding: '40px', textAlign: 'center' }}>
            <p style={{ margin: 0, color: 'var(--text-main)', fontWeight: 700, fontSize: '24px' }}>{t.timeAttackLoadingText}</p>
            <p style={{ margin: '14px 0 0', ...textSoftStyle }}>Preparing questions for “{topic.trim() || 'General Knowledge'}”</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="games-screen" style={sectionStyle}>
      <div style={contentWrapper}>
        {gameState === 'lobby' && (
          <div style={{ display: 'grid', gap: '24px' }}>
            <div style={{ display: 'grid', gap: '12px' }}>
              <p style={{ margin: 0, color: 'var(--glacier)', textTransform: 'uppercase', letterSpacing: '0.18em', fontSize: '12px', fontWeight: 700 }}>
                {t.gamesTitle}
              </p>
              <h1 style={{ margin: 0, fontSize: 'clamp(42px, 5vw, 64px)', lineHeight: 1.03, fontWeight: 900, color: 'var(--text-main)' }}>
                {t.gamesCardTimeAttackTitle}
              </h1>
              <p style={{ margin: 0, ...textSoftStyle, fontSize: '18px', lineHeight: 1.8 }}>{t.gamesCardTimeAttackDescription}</p>
            </div>

            <div style={{ ...cardBaseStyle, padding: '32px', display: 'grid', gap: '24px' }}>
              <div style={{ display: 'grid', gap: '10px' }}>
                <label style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>{t.timeAttackTopicLabel}</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(event) => setTopic(event.target.value)}
                  placeholder={t.timeAttackTopicPlaceholder}
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'grid', gap: '10px' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>{t.timeAttackTimerLabel}</span>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {[30, 60, 90].map((value) => (
                    <button
                      key={value}
                      type="button"
                      style={timerButtonStyle(value as 30 | 60 | 90)}
                      onClick={() => handleTimerChange(value as 30 | 60 | 90)}
                    >
                      {value}s
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  borderRadius: '18px',
                  border: 'none',
                  backgroundColor: '#10b981',
                  color: '#0f172a',
                  fontWeight: 700,
                  fontSize: '15px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s ease, transform 0.2s ease',
                }}
                onMouseEnter={(event) => {
                  (event.currentTarget as HTMLButtonElement).style.backgroundColor = '#059669';
                  (event.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(event) => {
                  (event.currentTarget as HTMLButtonElement).style.backgroundColor = '#10b981';
                  (event.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                }}
                onClick={startGame}
              >
                {t.timeAttackStartButton}
              </button>
            </div>
          </div>
        )}

        {gameState === 'playing' && currentQuestion && (
          <div style={{ display: 'grid', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '14px', color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.18em' }}>{t.timeAttackScoreLabel}</span>
                <p style={{ margin: 0, fontSize: '28px', fontWeight: 900, color: 'var(--text-main)' }}>{score}</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'right' as const }}>
                <span style={{ fontSize: '14px', color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.18em' }}>{t.timeAttackStreakLabel}</span>
                <p style={{ margin: 0, fontSize: '28px', fontWeight: 900, color: 'var(--glacier)' }}>{streak}</p>
              </div>
            </div>

            <div style={{ display: 'grid', gap: '12px' }}>
              <div style={{ height: '12px', width: '100%', borderRadius: '999px', overflow: 'hidden', backgroundColor: 'var(--border-color)' }}>
                <div style={{ width: `${progressPercent}%`, height: '100%', backgroundColor: progressColor, transition: 'width 0.2s ease, background-color 0.2s ease' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '14px', color: 'var(--text-soft)' }}>⏱️ {timeLeft}s</span>
                <span style={{ fontSize: '14px', color: 'var(--text-soft)' }}>
                  {currentQuestionIndex + 1}/{questions.length}
                </span>
              </div>
            </div>

            <div style={{ ...cardBaseStyle, padding: '28px' }}>
              <h2 style={{ margin: 0, fontSize: 'clamp(26px, 3vw, 34px)', lineHeight: 1.05, fontWeight: 900, color: 'var(--text-main)' }}>
                {currentQuestion.question}
              </h2>
            </div>

            <div style={{ display: 'grid', gap: '14px' }}>
              {currentQuestion.options.map((option) => (
                <button
                  key={option}
                  type="button"
                  disabled={buttonsLocked}
                  onClick={() => handleAnswer(option)}
                  style={getOptionStyle(option)}
                >
                  {option}
                </button>
              ))}
            </div>
            {isFetchingMore && (
              <p style={{ margin: 0, color: 'var(--text-soft)', fontSize: '14px' }}>
                Генерируем вопросы...
              </p>
            )}
          </div>
        )}

        {gameState === 'result' && (
          <div style={{ display: 'grid', gap: '24px' }}>
            <button
              type="button"
              onClick={resetToLobby}
              style={linkButtonStyle}
              onMouseEnter={(event) => {
                (event.currentTarget as HTMLButtonElement).style.color = 'var(--glacier)';
              }}
              onMouseLeave={(event) => {
                (event.currentTarget as HTMLButtonElement).style.color = 'var(--text-main)';
              }}
            >
              ← {t.timeAttackBackToLobby}
            </button>

            <div style={{ ...cardBaseStyle, padding: '36px', textAlign: 'center' as const }}>
              <p style={{ margin: 0, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.18em', fontSize: '12px' }}>
                {t.gamesCardTimeAttackTitle}
              </p>
              <h1 style={{ margin: '18px 0 0', fontSize: 'clamp(42px, 5vw, 56px)', lineHeight: 1.05, fontWeight: 900, color: 'var(--text-main)' }}>
                {t.timeAttackFinalScore}
              </h1>
              <p style={{ margin: '18px 0 0', fontSize: '28px', fontWeight: 900, color: 'var(--glacier)' }}>{score}</p>
              <p style={{ margin: '24px 0 0', color: 'var(--text-soft)', fontSize: '16px', lineHeight: 1.7 }}>
                {t.timeAttackBestStreak}: {bestStreak}
              </p>
            </div>

            <div style={{ display: 'grid', gap: '14px', maxWidth: '320px' }}>
              <button
                type="button"
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  borderRadius: '18px',
                  border: 'none',
                  backgroundColor: '#10b981',
                  color: '#0f172a',
                  fontWeight: 700,
                  fontSize: '15px',
                  cursor: 'pointer',
                }}
                onClick={playAgain}
              >
                {t.timeAttackPlayAgain}
              </button>
              <button
                type="button"
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  borderRadius: '18px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-card)',
                  color: 'var(--text-main)',
                  fontWeight: 700,
                  fontSize: '15px',
                  cursor: 'pointer',
                }}
                onClick={resetToLobby}
              >
                {t.timeAttackBackToLobby}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
