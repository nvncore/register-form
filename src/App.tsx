import React, { useState } from 'react';
import { RegisterForm } from './components/RegisterForm';
import { LoginForm } from './components/LoginForm';
import { ForgotPasswordForm } from './components/ForgotPasswordForm';
import { CheckCircle2, LogOut, User } from 'lucide-react';

export const App: React.FC = () => {
  const [view, setView] = useState<'login' | 'register' | 'forgot-password'>('login');
  const [loggedInUser, setLoggedInUser] = useState<{ email: string } | null>(null);
  const [resetEmail, setResetEmail] = useState('');

  const handleLogout = () => {
    setLoggedInUser(null);
    setView('login');
  };

  return (
    <>
      <div className="blob-1" />
      <div className="blob-2" />
      <main className="app-container">
        {loggedInUser ? (
          <div className="form-card" style={{ textAlign: 'center', padding: '40px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: 'var(--success)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CheckCircle2 size={36} />
              </div>
            </div>

            <h2 className="card-title" style={{ fontSize: '24px', marginBottom: '8px' }}>
              Đăng nhập thành công!
            </h2>
            <p className="card-subtitle" style={{ marginBottom: '24px' }}>
              Hệ thống đã xác thực và sẵn sàng hoạt động.
            </p>

            <div
              style={{
                background: 'var(--input-bg)',
                border: '1px solid var(--card-border)',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                textAlign: 'left',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  background: 'rgba(99, 102, 241, 0.2)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <User size={20} />
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Tài khoản đang đăng nhập</div>
                <div style={{ fontWeight: 600, color: 'var(--text-main)', wordBreak: 'break-all' }}>
                  {loggedInUser.email}
                </div>
              </div>
            </div>

            <button
              type="button"
              className="btn-submit"
              onClick={handleLogout}
              style={{
                background: 'rgba(244, 63, 94, 0.15)',
                color: '#f43f5e',
                border: '1px solid rgba(244, 63, 94, 0.3)',
              }}
            >
              <span>Đăng xuất</span>
              <LogOut size={18} />
            </button>
          </div>
        ) : view === 'login' ? (
          <LoginForm
            onSwitchToRegister={() => setView('register')}
            onSwitchToForgot={() => setView('forgot-password')}
            defaultEmail={resetEmail}
            onLoginSuccess={(user) => setLoggedInUser(user)}
          />
        ) : view === 'forgot-password' ? (
          <ForgotPasswordForm
            initialEmail={resetEmail}
            onSwitchToLogin={() => setView('login')}
            onResetSuccess={(email) => {
              setResetEmail(email);
              setView('login');
            }}
          />
        ) : (
          <RegisterForm onSwitchToLogin={() => setView('login')} />
        )}
      </main>
    </>
  );
};

export default App;
