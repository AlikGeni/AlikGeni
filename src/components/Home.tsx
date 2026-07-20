import React from 'react';

interface HomeTranslation {
  homeTitle: string;
  homeSubtitle: string;
  homeDescription: string;
  homeStartButton: string;
  homeHowItHelps: string;
  homeCardExam: string;
  homeCardExamText: string;
  homeCardSimple: string;
  homeCardSimpleText: string;
  homeCardTime: string;
  homeCardTimeText: string;
  homeCardFun: string;
  homeCardFunText: string;
  homeHowItWorks: string;
  homeStepEnterTopic: string;
  homeStepEnterTopicText: string;
  homeStepChooseFormat: string;
  homeStepChooseFormatText: string;
  homeStepBoost: string;
  homeStepBoostText: string;
  homeQuickStart: string;
  homeButtonTestGenerator: string;
  homeButtonTopicExplainer: string;
  homeButtonGames: string;
}

export function Home({ setActiveTab, t }: { setActiveTab?: (tab: string) => void; t: HomeTranslation }) {
  const handleNavigation = (tab: string) => {
    if (setActiveTab) {
      setActiveTab(tab);
    }
  };

  return (
    <div className="home-container">
      <style>{`
        .home-container {
          width: 100%;
          min-height: calc(100vh - 64px);
          background-color: var(--bg-main);
          color: var(--text-main);
          font-family: system-ui, -apple-system, sans-serif;
          padding: 60px 20px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .hero-section {
          text-align: center;
          max-width: 800px;
          margin-bottom: 80px;
          animation: fadeIn 0.8s ease-out;
        }
        .hero-title {
          font-size: 64px;
          font-weight: 900;
          color: #10b981;
          margin: 0 0 16px 0;
          letter-spacing: -2px;
        }
        .hero-subtitle {
          font-size: 24px;
          font-weight: 600;
          color: var(--text-main);
          margin: 0 0 16px 0;
        }
        .hero-desc {
          font-size: 16px;
          color: var(--text-soft);
          line-height: 1.6;
          margin: 0 0 32px 0;
        }
        .btn-primary {
          background: #10b981;
          color: #fff;
          border: none;
          padding: 16px 32px;
          font-size: 18px;
          font-weight: 700;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);
        }
        .btn-primary:hover {
          background: #059669;
          transform: translateY(-2px);
        }
        .section-title {
          font-size: 32px;
          font-weight: 700;
          color: var(--text-main);
          margin: 0 0 40px 0;
          text-align: center;
          width: 100%;
        }
        .grid-4 {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 24px;
          width: 100%;
          max-width: 1200px;
          margin-bottom: 80px;
        }
        .card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 20px;
          padding: 32px;
          transition: all 0.3s;
          text-align: left;
          box-shadow: 0 24px 70px var(--surface-shadow);
        }
        .card:hover {
          border-color: #10b981;
          transform: translateY(-4px);
        }
        .card-icon {
          font-size: 32px;
          margin-bottom: 16px;
        }
        .card-title {
          font-size: 20px;
          font-weight: 600;
          color: var(--text-main);
          margin: 0 0 12px 0;
        }
        .card-text {
          font-size: 15px;
          color: var(--text-soft);
          line-height: 1.5;
          margin: 0;
        }
        .grid-3 {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
          width: 100%;
          max-width: 1200px;
          margin-bottom: 80px;
        }
        .step-card {
          background: transparent;
          border-top: 2px solid var(--border-color);
          padding-top: 24px;
          text-align: left;
        }
        .step-num {
          color: #10b981;
          font-size: 24px;
          font-weight: 800;
          margin-bottom: 12px;
        }
        .action-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          width: 100%;
          max-width: 800px;
        }
        .action-btn {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          color: var(--text-main);
          padding: 24px;
          border-radius: 16px;
          font-size: 18px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          box-shadow: 0 24px 70px var(--surface-shadow);
        }
        .action-btn:hover {
          background: var(--bg-elevated);
          border-color: #10b981;
          color: #10b981;
          transform: translateY(-2px);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="hero-section">
        <h1 className="hero-title">{t.homeTitle}</h1>
        <h2 className="hero-subtitle">{t.homeSubtitle}</h2>
        <p className="hero-desc">{t.homeDescription}</p>
        <button className="btn-primary" onClick={() => handleNavigation('generator')}>
          {t.homeStartButton}
        </button>
      </div>

      <h3 className="section-title">{t.homeHowItHelps}</h3>
      <div className="grid-4">
        <div className="card">
          <div className="card-icon">🎓</div>
          <h4 className="card-title">{t.homeCardExam}</h4>
          <p className="card-text">{t.homeCardExamText}</p>
        </div>
        <div className="card">
          <div className="card-icon">🧠</div>
          <h4 className="card-title">{t.homeCardSimple}</h4>
          <p className="card-text">{t.homeCardSimpleText}</p>
        </div>
        <div className="card">
          <div className="card-icon">⏱️</div>
          <h4 className="card-title">{t.homeCardTime}</h4>
          <p className="card-text">{t.homeCardTimeText}</p>
        </div>
        <div className="card">
          <div className="card-icon">🎮</div>
          <h4 className="card-title">{t.homeCardFun}</h4>
          <p className="card-text">{t.homeCardFunText}</p>
        </div>
      </div>

      <h3 className="section-title">{t.homeHowItWorks}</h3>
      <div className="grid-3">
        <div className="step-card">
          <div className="step-num">01</div>
          <h4 className="card-title">{t.homeStepEnterTopic}</h4>
          <p className="card-text">{t.homeStepEnterTopicText}</p>
        </div>
        <div className="step-card">
          <div className="step-num">02</div>
          <h4 className="card-title">{t.homeStepChooseFormat}</h4>
          <p className="card-text">{t.homeStepChooseFormatText}</p>
        </div>
        <div className="step-card">
          <div className="step-num">03</div>
          <h4 className="card-title">{t.homeStepBoost}</h4>
          <p className="card-text">{t.homeStepBoostText}</p>
        </div>
      </div>

      <h3 className="section-title">{t.homeQuickStart}</h3>
      <div className="action-grid">
        <button className="action-btn" onClick={() => handleNavigation('generator')}>
          <span style={{ fontSize: '24px' }}>📝</span>
          {t.homeButtonTestGenerator}
        </button>
        <button className="action-btn" onClick={() => handleNavigation('explain')}>
          <span style={{ fontSize: '24px' }}>📖</span>
          {t.homeButtonTopicExplainer}
        </button>
        <button className="action-btn" onClick={() => handleNavigation('stats')}>
          <span style={{ fontSize: '24px' }}>🎮</span>
          {t.homeButtonGames}
        </button>
      </div>
    </div>
  );
}
