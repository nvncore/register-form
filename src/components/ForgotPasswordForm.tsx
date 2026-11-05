import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface ForgotPasswordFormProps {
  onSwitchToLogin: () => void;
  onResetSuccess?: (email: string) => void;
  initialEmail?: string;
}

type Step = 'email' | 'otp' | 'reset' | 'success';

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onSwitchToLogin,
  onResetSuccess,
  initialEmail = '',
}) => {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState(initialEmail);
  const [emailError, setEmailError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // OTP state
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState<string | undefined>();
  const [countdown, setCountdown] = useState(45);
  const [canResend, setCanResend] = useState(false);
  const [otpSentDemoCode] = useState('123456');
  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Reset password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<{ newPassword?: string; confirmPassword?: string }>({});

  // Countdown timer for OTP
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (step === 'otp' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    if (!newPassword) return { score: 0, text: '', color: '#94a3b8' };
    let score = 0;
    if (newPassword.length >= 8) score += 25;
    if (/[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword)) score += 25;
    if (/\d/.test(newPassword)) score += 25;
    if (/[^a-zA-Z0-9]/.test(newPassword)) score += 25;

    if (score <= 25) return { score, text: 'Rất yếu', color: '#f43f5e' };
    if (score <= 50) return { score, text: 'Trung bình', color: '#fbbf24' };
    if (score <= 75) return { score, text: 'Khá mạnh', color: '#3b82f6' };
    return { score: 100, text: 'Rất mạnh', color: '#10b981' };
  }, [newPassword]);

  // Step 1: Submit Email
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setEmailError('Vui lòng nhập địa chỉ email');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Địa chỉ email không hợp lệ');
      return;
    }

    setEmailError(undefined);
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setStep('otp');
      setCountdown(45);
      setCanResend(false);
    }, 600);
  };

  // Step 2: Handle OTP Input
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (otpError) setOtpError(undefined);

    // Auto-focus next input
    if (value && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtp(digits);
      otpInputsRef.current[5]?.focus();
      if (otpError) setOtpError(undefined);
    }
  };

  const handleQuickFillOtp = () => {
    setOtp(otpSentDemoCode.split(''));
    if (otpError) setOtpError(undefined);
    setTimeout(() => {
      otpInputsRef.current[5]?.focus();
    }, 50);
  };

  const handleResendOtp = () => {
    if (!canResend) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setCountdown(45);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      otpInputsRef.current[0]?.focus();
    }, 500);
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = otp.join('');
    if (fullCode.length < 6) {
      setOtpError('Vui lòng nhập đủ 6 chữ số mã xác thực');
      return;
    }

    // Accept demo code or any 6 digit test code
    if (fullCode !== otpSentDemoCode && fullCode !== '000000') {
      setOtpError(`Mã không chính xác. Thử mã demo: ${otpSentDemoCode}`);
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setStep('reset');
    }, 600);
  };

  // Step 3: Handle Reset Password
  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: { newPassword?: string; confirmPassword?: string } = {};

    if (!newPassword) {
      errs.newPassword = 'Vui lòng nhập mật khẩu mới';
    } else if (newPassword.length < 8) {
      errs.newPassword = 'Mật khẩu phải chứa ít nhất 8 ký tự';
    } else if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(newPassword)) {
      errs.newPassword = 'Mật khẩu nên chứa cả chữ và số';
    }

    if (!confirmPassword) {
      errs.confirmPassword = 'Vui lòng xác nhận mật khẩu mới';
    } else if (confirmPassword !== newPassword) {
      errs.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    setPasswordErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setStep('success');
    }, 800);
  };

  // Step Indicators Navigation
  const renderStepsIndicator = () => {
    if (step === 'success') return null;
    return (
      <div className="steps-nav">
        <div className={`step-dot ${step === 'email' ? 'active' : 'completed'}`}>
          <span className="step-dot-number">1</span>
          <span>Email</span>
        </div>
        <div className={`step-divider ${step === 'otp' || step === 'reset' ? 'active' : ''}`} />
        <div className={`step-dot ${step === 'otp' ? 'active' : step === 'reset' ? 'completed' : ''}`}>
          <span className="step-dot-number">2</span>
          <span>Mã OTP</span>
        </div>
        <div className={`step-divider ${step === 'reset' ? 'active' : ''}`} />
        <div className={`step-dot ${step === 'reset' ? 'active' : ''}`}>
          <span className="step-dot-number">3</span>
          <span>Mật khẩu</span>
        </div>
      </div>
    );
  };

  // Step 4: Success View
  if (step === 'success') {
    return (
      <div className="card success-card">
        <div className="success-icon-wrapper">
          <CheckCircle2 size={40} />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
          Đặt lại mật khẩu thành công!
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '20px' }}>
          Mật khẩu của bạn đã được cập nhật thành công. Hãy sử dụng mật khẩu mới để đăng nhập vào tài khoản.
        </p>

        <div className="success-details">
          <div className="success-item">
            <span>Tài khoản</span>
            <span>{email}</span>
          </div>
          <div className="success-item">
            <span>Trạng thái</span>
            <span style={{ color: '#10b981', fontWeight: 600 }}>Đã bảo vệ an toàn</span>
          </div>
        </div>

        <button
          type="button"
          className="btn-submit"
          onClick={() => {
            if (onResetSuccess) {
              onResetSuccess(email);
            } else {
              onSwitchToLogin();
            }
          }}
        >
          <span>Đăng nhập ngay</span>
          <ArrowRight size={18} />
        </button>
      </div>
    );
  }

  return (
    <div className="card">
      {/* Header back button */}
      <button
        type="button"
        className="back-header-btn"
        onClick={() => {
          if (step === 'otp') setStep('email');
          else if (step === 'reset') setStep('otp');
          else onSwitchToLogin();
        }}
      >
        <ArrowLeft size={16} />
        <span>{step === 'email' ? 'Quay lại đăng nhập' : 'Quay lại bước trước'}</span>
      </button>

      {/* Step Indicator */}
      {renderStepsIndicator()}

      {/* Step 1: Input Email */}
      {step === 'email' && (
        <>
          <div className="card-header">
            <div className="badge">
              <KeyRound size={14} />
              <span>Khôi phục mật khẩu</span>
            </div>
            <h1>Quên mật khẩu?</h1>
            <p>Nhập email đăng ký của bạn để nhận mã xác thực đặt lại mật khẩu</p>
          </div>

          <form onSubmit={handleEmailSubmit} noValidate>
            <div className="form-group">
              <label className="form-label">Địa chỉ Email</label>
              <div className="input-wrapper">
                <Mail className="input-icon" size={18} />
                <input
                  type="email"
                  className={`form-input ${emailError ? 'is-invalid' : ''}`}
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError(undefined);
                  }}
                  autoFocus
                />
              </div>
              {emailError && (
                <div className="error-text">
                  <AlertCircle size={14} />
                  <span>{emailError}</span>
                </div>
              )}
            </div>

            <button type="submit" className="btn-submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="spinner" />
                  <span>Đang gửi mã...</span>
                </>
              ) : (
                <>
                  <span>Gửi mã xác nhận</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            <div className="card-footer">
              Bạn đã nhớ lại mật khẩu?{' '}
              <a
                href="#login"
                onClick={(e) => {
                  e.preventDefault();
                  onSwitchToLogin();
                }}
              >
                Đăng nhập
              </a>
            </div>
          </form>
        </>
      )}

      {/* Step 2: Input OTP */}
      {step === 'otp' && (
        <>
          <div className="card-header">
            <div className="badge">
              <ShieldCheck size={14} />
              <span>Xác thực an toàn</span>
            </div>
            <h1>Nhập mã xác thực</h1>
            <p>
              Mã gồm 6 chữ số đã được gửi đến <br />
              <strong style={{ color: 'var(--text-main)', wordBreak: 'break-all' }}>{email}</strong>
            </p>
          </div>

          <form onSubmit={handleOtpSubmit}>
            {/* Demo Helper Banner */}
            <div className="info-alert">
              <div className="info-alert-text">
                <Sparkles size={16} style={{ color: '#818cf8', flexShrink: 0 }} />
                <span>Mã thử nghiệm: <strong>{otpSentDemoCode}</strong></span>
              </div>
              <button
                type="button"
                className="info-badge-btn"
                onClick={handleQuickFillOtp}
              >
                Tự động điền
              </button>
            </div>

            <div className="otp-group" onPaste={handleOtpPaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (otpInputsRef.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  className={`otp-box ${otpError ? 'is-invalid' : ''}`}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  autoFocus={index === 0}
                />
              ))}
            </div>

            {otpError && (
              <div className="error-text" style={{ justifyContent: 'center', marginBottom: '14px' }}>
                <AlertCircle size={14} />
                <span>{otpError}</span>
              </div>
            )}

            <button type="submit" className="btn-submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="spinner" />
                  <span>Đang xác thực...</span>
                </>
              ) : (
                <>
                  <span>Xác nhận mã OTP</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            <div className="resend-box">
              <span>Chưa nhận được mã?</span>
              {canResend ? (
                <button
                  type="button"
                  className="link-btn"
                  onClick={handleResendOtp}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <RotateCcw size={13} />
                  Gửi lại ngay
                </button>
              ) : (
                <span style={{ color: 'var(--primary)', fontWeight: 600 }}>
                  Gửi lại sau {countdown}s
                </span>
              )}
            </div>

            <div className="card-footer" style={{ marginTop: '16px' }}>
              <button
                type="button"
                className="link-btn"
                onClick={() => setStep('email')}
                style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}
              >
                Nhập địa chỉ email khác
              </button>
            </div>
          </form>
        </>
      )}

      {/* Step 3: New Password */}
      {step === 'reset' && (
        <>
          <div className="card-header">
            <div className="badge">
              <Lock size={14} />
              <span>Tạo mật khẩu mới</span>
            </div>
            <h1>Đặt lại mật khẩu</h1>
            <p>Vui lòng tạo một mật khẩu mới mạnh mẽ và an toàn cho tài khoản của bạn</p>
          </div>

          <form onSubmit={handleResetSubmit} noValidate>
            {/* New Password */}
            <div className="form-group">
              <label className="form-label">Mật khẩu mới</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={18} />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  className={`form-input has-toggle ${passwordErrors.newPassword ? 'is-invalid' : ''}`}
                  placeholder="Tối thiểu 8 ký tự (chữ & số)"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (passwordErrors.newPassword) {
                      setPasswordErrors((prev) => ({ ...prev, newPassword: undefined }));
                    }
                  }}
                  autoFocus
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Password Strength indicator */}
              {newPassword && (
                <div className="strength-bar-container">
                  <div className="strength-bar-track">
                    <div
                      className="strength-bar-fill"
                      style={{
                        width: `${passwordStrength.score}%`,
                        backgroundColor: passwordStrength.color,
                      }}
                    />
                  </div>
                  <div className="strength-label">
                    <span>Độ mạnh:</span>
                    <span style={{ color: passwordStrength.color, fontWeight: 600 }}>
                      {passwordStrength.text}
                    </span>
                  </div>
                </div>
              )}

              {passwordErrors.newPassword && (
                <div className="error-text">
                  <AlertCircle size={14} />
                  <span>{passwordErrors.newPassword}</span>
                </div>
              )}
            </div>

            {/* Confirm New Password */}
            <div className="form-group">
              <label className="form-label">Xác nhận mật khẩu mới</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={18} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className={`form-input has-toggle ${passwordErrors.confirmPassword ? 'is-invalid' : ''}`}
                  placeholder="Nhập lại mật khẩu mới"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (passwordErrors.confirmPassword) {
                      setPasswordErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                    }
                  }}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {passwordErrors.confirmPassword && (
                <div className="error-text">
                  <AlertCircle size={14} />
                  <span>{passwordErrors.confirmPassword}</span>
                </div>
              )}
            </div>

            <button type="submit" className="btn-submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="spinner" />
                  <span>Đang cập nhật...</span>
                </>
              ) : (
                <>
                  <span>Cập nhật mật khẩu</span>
                  <CheckCircle2 size={18} />
                </>
              )}
            </button>
          </form>
        </>
      )}
    </div>
  );
};
