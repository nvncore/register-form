import React, { useState } from 'react';
import { RegisterForm } from './components/RegisterForm';
import { LoginForm } from './components/LoginForm';
import { ForgotPasswordForm } from './components/ForgotPasswordForm';
import { ChangePasswordForm } from './components/ChangePasswordForm';
import { TotpForm } from './components/TotpForm';
import { CheckCircle2, LogOut, User, KeyRound, LogIn, UserPlus, ShieldCheck } from 'lucide-react';

export const App: React.FC = () => {
  const [view, setView] = useState<'login' | 'register' | 'change-password' | 'forgot-password' | 'totp'>('login');
  const [loggedInUser, setLoggedInUser] = useState<{ email: string } | null>(null);
  const [resetEmail, setResetEmail] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isConfiguringTotp, setIsConfiguringTotp] = useState(false);

  const handleLogout = () => {
    setLoggedInUser(null);
    setIsChangingPassword(false);
    setIsConfiguringTotp(false);
    setView('login');
  };

  return (
    <>
      <div className="blob-1" />
      <div className="blob-2" />
      <main className="app-container">
        {loggedInUser ? (
          isChangingPassword ? (
            <ChangePasswordForm
              userEmail={loggedInUser.email}
              onCancel={() => setIsChangingPassword(false)}
              onSwitchToLogin={handleLogout}
            />
          ) : isConfiguringTotp ? (
            <TotpForm
              userEmail={loggedInUser.email}
              onSwitchToLogin={() => setIsConfiguringTotp(false)}
            />
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '40px 24px' }}>
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

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button
                  type="button"
                  className="btn-submit"
                  onClick={() => setIsChangingPassword(true)}
                  style={{ marginTop: 0 }}
                >
                  <KeyRound size={18} />
                  <span>Đổi mật khẩu</span>
                </button>

                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsConfiguringTotp(true)}
                  style={{
                    background: 'rgba(99, 102, 241, 0.12)',
                    color: '#818cf8',
                    border: '1px solid rgba(99, 102, 241, 0.25)',
                  }}
                >
                  <ShieldCheck size={18} />
                  <span>Cài đặt mã TOTP (2FA)</span>
                </button>

                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleLogout}
                  style={{
                    background: 'rgba(244, 63, 94, 0.12)',
                    color: '#f43f5e',
                    border: '1px solid rgba(244, 63, 94, 0.25)',
                  }}
                >
                  <LogOut size={18} />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </div>
          )
        ) : (
          <>
            {view !== 'forgot-password' && (
              <div className="segmented-control">
                <button
                  type="button"
                  className={`segment-btn ${view === 'login' ? 'active' : ''}`}
                  onClick={() => setView('login')}
                >
                  <LogIn size={15} />
                  <span>Đăng nhập</span>
                </button>
                <button
                  type="button"
                  className={`segment-btn ${view === 'register' ? 'active' : ''}`}
                  onClick={() => setView('register')}
                >
                  <UserPlus size={15} />
                  <span>Đăng ký</span>
                </button>
                <button
                  type="button"
                  className={`segment-btn ${view === 'change-password' ? 'active' : ''}`}
                  onClick={() => setView('change-password')}
                >
                  <KeyRound size={15} />
                  <span>Đổi mật khẩu</span>
                </button>
                <button
                  type="button"
                  className={`segment-btn ${view === 'totp' ? 'active' : ''}`}
                  onClick={() => setView('totp')}
                >
                  <ShieldCheck size={15} />
                  <span>Mã TOTP</span>
                </button>
              </div>
            )}

            {view === 'login' && (
              <LoginForm
                onSwitchToRegister={() => setView('register')}
                onSwitchToForgot={() => setView('forgot-password')}
                onSwitchToChangePassword={() => setView('change-password')}
                onSwitchToTotp={() => setView('totp')}
                defaultEmail={resetEmail}
                onLoginSuccess={(user) => setLoggedInUser(user)}
              />
            )}

            {view === 'register' && (
              <RegisterForm onSwitchToLogin={() => setView('login')} />
            )}

            {view === 'change-password' && (
              <ChangePasswordForm onSwitchToLogin={() => setView('login')} />
            )}

            {view === 'totp' && (
              <TotpForm
                userEmail={resetEmail || 'user@example.com'}
                onSwitchToLogin={() => setView('login')}
              />
            )}

            {view === 'forgot-password' && (
              <ForgotPasswordForm
                initialEmail={resetEmail}
                onSwitchToLogin={() => setView('login')}
                onResetSuccess={(email) => {
                  setResetEmail(email);
                  setView('login');
                }}
              />
            )}
          </>
        )}
      </main>
    </>
  );
};

export default App;
