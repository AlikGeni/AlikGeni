import React, { useState } from 'react';

export function Auth({ onLogin, onGuestLogin, onGoogleLogin }: { onLogin?: (email: string, password: string) => void; onGuestLogin?: () => void; onGoogleLogin?: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onLogin) onLogin(email, password);
  };

  return (
    <div className="auth-container">
      <style>{`
        .auth-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background-color: #000;
          font-family: system-ui, -apple-system, sans-serif;
          padding: 20px;
          box-sizing: border-box;
        }
        .auth-card {
          width: 100%;
          max-w: 400px;
          background: #141417;
          border: 1px solid #27272a;
          border-radius: 24px;
          padding: 40px 32px;
          box-sizing: border-box;
          text-align: center;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
        }
        .auth-logo {
          font-size: 32px;
          font-weight: 800;
          color: #10b981;
          margin: 0 0 8px 0;
          letter-spacing: -0.5px;
        }
        .auth-subtitle {
          color: #71717a;
          font-size: 14px;
          margin: 0 0 32px 0;
        }
        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .auth-input-wrapper {
          text-align: left;
        }
        .auth-label {
          display: block;
          color: #a1a1aa;
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 6px;
          text-transform: uppercase;
        }
        .auth-input {
          width: 100%;
          padding: 14px 16px;
          background: #1e1e22;
          border: 1px solid #27272a;
          border-radius: 12px;
          color: #fff;
          font-size: 15px;
          box-sizing: border-box;
        }
        .auth-input:focus {
          outline: none;
          border-color: #10b981;
        }
        .auth-btn-primary {
          width: 100%;
          padding: 14px;
          background: #10b981;
          color: #fff;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          margin-top: 8px;
        }
        .auth-btn-primary:hover {
          background: #059669;
        }
        .auth-divider {
          display: flex;
          align-items: center;
          color: #4b5563;
          font-size: 12px;
          margin: 24px 0;
        }
        .auth-divider::before, .auth-divider::after {
          content: "";
          flex: 1;
          height: 1px;
          background: #27272a;
        }
        .auth-divider span {
          padding: 0 10px;
        }
        .auth-btn-secondary {
          width: 100%;
          padding: 12px;
          background: transparent;
          border: 1px solid #27272a;
          border-radius: 12px;
          color: #e4e4e7;
          font-size: 14px;
          cursor: pointer;
        }
        .auth-guest-btn {
          background: none;
          border: none;
          margin-top: 24px;
          color: #71717a;
          font-size: 14px;
          cursor: pointer;
          text-decoration: underline;
        }
        .auth-guest-btn:hover {
          color: #10b981;
        }
      `}</style>

      <div className="auth-card">
        <h1 className="auth-logo">SYNAPSE</h1>
        <p className="auth-subtitle">Sign in to continue your education</p>
        
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-input-wrapper">
            <label className="auth-label">Email</label>
            <input type="email" placeholder="you@synapse.ai" className="auth-input" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          
          <div className="auth-input-wrapper">
            <label className="auth-label">Password</label>
            <input type="password" placeholder="••••••••" className="auth-input" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          
          <button type="submit" className="auth-btn-primary">Log in</button>
        </form>

        <div className="auth-divider">
          <span>or</span>
        </div>

        <button className="auth-btn-secondary" onClick={onGoogleLogin}>Continue with Google</button>

        <button className="auth-guest-btn" onClick={onGuestLogin}>
          Continue as guest
        </button>
      </div>
    </div>
  );
}
