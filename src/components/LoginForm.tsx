import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle, Sparkles } from 'lucide-react';

interface LoginFormProps {
  onSwitchToRegister: () => void;
  onLoginSuccess: (user: { email: string }) => void;
  onSwitchToForgot?: () => void;
  defaultEmail?: string;
  onSwitchToChangePassword?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSwitchToRegister,
  onLoginSuccess,
  onSwitchToForgot,
  defaultEmail = '',
  onSwitchToChangePassword,
}) => {
  const [formData, setFormData] = useState({
    email: defaultEmail,
    password: '',
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (defaultEmail) {
      setFormData((prev) => ({ ...prev, email: defaultEmail }));
    }
  }, [defaultEmail]);

  const validate = () => {
    const errs: { email?: string; password?: string } = {};
    if (!formData.email.trim()) {
      errs.email = 'Vui lòng nhập email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = 'Email không hợp lệ';
    }

    if (!formData.password) {
      errs.password = 'Vui lòng nhập mật khẩu';
    } else if (formData.password.length < 6) {
      errs.password = 'Mật khẩu tối thiểu 6 ký tự';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onLoginSuccess({ email: formData.email });
    }, 600);
  };

  return (
    <div className="form-card">
      <div className="card-header">
        <div className="badge-pill">
          <Sparkles size={14} />
          <span>Chào mừng trở lại</span>
        </div>
        <h1 className="card-title">Đăng Nhập</h1>
        <p className="card-subtitle">Nhập thông tin tài khoản để tiếp tục trải nghiệm</p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {/* Email */}
        <div className="form-group">
          <label className="form-label">Email</label>
          <div className="input-container">
            <Mail className="input-icon" size={18} />
            <input
              type="email"
              className={`form-input ${errors.email ? 'has-error' : ''}`}
              placeholder="name@example.com"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
              }}
            />
          </div>
          {errors.email && (
            <div className="error-text">
              <AlertCircle size={14} />
              <span>{errors.email}</span>
            </div>
          )}
        </div>

        {/* Password */}
        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label className="form-label" style={{ marginBottom: 0 }}>Mật khẩu</label>
            <a
              href="#forgot"
              style={{ fontSize: '13px', color: 'var(--primary)', textDecoration: 'none' }}
              onClick={(e) => {
                e.preventDefault();
                onSwitchToForgot?.();
              }}
            >
              Quên mật khẩu?
            </a>
          </div>
          <div className="input-container">
            <Lock className="input-icon" size={18} />
            <input
              type={showPassword ? 'text' : 'password'}
              className={`form-input ${errors.password ? 'has-error' : ''}`}
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => {
                setFormData({ ...formData, password: e.target.value });
                if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
              }}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && (
            <div className="error-text">
              <AlertCircle size={14} />
              <span>{errors.password}</span>
            </div>
          )}
        </div>

        {/* Remember me */}
        <div className="checkbox-wrapper" style={{ marginTop: '4px', marginBottom: '18px' }}>
          <input
            type="checkbox"
            id="rememberMe"
            className="custom-checkbox"
            checked={formData.rememberMe}
            onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
          />
          <label htmlFor="rememberMe" className="checkbox-label">
            Ghi nhớ đăng nhập
          </label>
        </div>

        {/* Submit Button */}
        <button type="submit" className="btn-submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <div className="spinner" />
              <span>Đang đăng nhập...</span>
            </>
          ) : (
            <>
              <span>Đăng nhập</span>
              <LogIn size={18} />
            </>
          )}
        </button>

        {/* Footer */}
        <div className="card-footer" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div>
            Chưa có tài khoản?{' '}
            <a
              href="#register"
              onClick={(e) => {
                e.preventDefault();
                onSwitchToRegister();
              }}
            >
              Đăng ký ngay
            </a>
          </div>
          {onSwitchToChangePassword && (
            <div>
              <a
                href="#change-password"
                onClick={(e) => {
                  e.preventDefault();
                  onSwitchToChangePassword();
                }}
                style={{ fontSize: '13px', color: 'var(--text-muted)' }}
              >
                Đổi mật khẩu tài khoản
              </a>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};
