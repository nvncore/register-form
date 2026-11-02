import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  ShieldCheck,
  KeyRound,
  QrCode,
  Copy,
  Check,
  RefreshCw,
  Clock,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  Smartphone
} from 'lucide-react';
import {
  generateSecret,
  formatSecret,
  generateTOTP,
  verifyTOTP,
  getRemainingSeconds,
  buildOtpAuthUri
} from '../utils/totp';

interface TotpFormProps {
  userEmail?: string;
  onSwitchToLogin?: () => void;
  onVerified?: () => void;
}

export const TotpForm: React.FC<TotpFormProps> = ({
  userEmail = 'user@example.com',
  onSwitchToLogin,
  onVerified,
}) => {
  const [activeTab, setActiveTab] = useState<'setup' | 'verify'>('setup');
  const [secret, setSecret] = useState<string>(() => generateSecret(20));
  const [accountEmail, setAccountEmail] = useState<string>(userEmail);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [currentCode, setCurrentCode] = useState<string>('------');
  const [remainingSec, setRemainingSec] = useState<number>(30);
  const [timerProgress, setTimerProgress] = useState<number>(100);
  const [copiedSecret, setCopiedSecret] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Verification state (6 digits)
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verifyResult, setVerifyResult] = useState<{
    status: 'idle' | 'success' | 'error';
    message: string;
  }>({ status: 'idle', message: '' });

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Generate QR Code when secret or email changes
  useEffect(() => {
    const uri = buildOtpAuthUri({
      secret,
      account: accountEmail.trim() || 'user@example.com',
      issuer: 'RegisterApp',
    });

    QRCode.toDataURL(uri, {
      width: 220,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Error generating QR code:', err));
  }, [secret, accountEmail]);

  // Keep live TOTP and countdown updated
  useEffect(() => {
    let isMounted = true;

    const updateTOTP = async () => {
      try {
        const code = await generateTOTP(secret);
        if (isMounted) {
          setCurrentCode(code);
        }
      } catch (err) {
        console.error('Failed to generate TOTP:', err);
      }
    };

    updateTOTP();

    const interval = setInterval(() => {
      const { remaining, percentage } = getRemainingSeconds();
      setRemainingSec(remaining);
      setTimerProgress(percentage);

      // When the 30s period rolls over, refresh the TOTP code
      if (remaining === 30 || remaining === 29) {
        updateTOTP();
      }
    }, 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [secret]);

  // Handle regenerating a new secret
  const handleRegenerateSecret = () => {
    const newSecret = generateSecret(20);
    setSecret(newSecret);
    setVerifyResult({ status: 'idle', message: '' });
    setOtpDigits(['', '', '', '', '', '']);
  };

  // Copy secret key to clipboard
  const handleCopySecret = async () => {
    try {
      await navigator.clipboard.writeText(secret.replace(/\s+/g, ''));
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    } catch {
      // Fallback
    }
  };

  // Copy current TOTP code to clipboard
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(currentCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      // Fallback
    }
  };

  // Fill in the current code into the 6 input boxes
  const handleFillCurrentCode = () => {
    if (currentCode && currentCode.length === 6) {
      setOtpDigits(currentCode.split(''));
      setVerifyResult({ status: 'idle', message: '' });
      inputRefs.current[5]?.focus();
    }
  };

  // Handle individual OTP digit change
  const handleOtpChange = (index: number, value: string) => {
    // Only accept numeric digit
    const cleaned = value.replace(/\D/g, '');
    const newOtp = [...otpDigits];

    if (!cleaned) {
      newOtp[index] = '';
      setOtpDigits(newOtp);
      return;
    }

    // If pasted multiple digits
    if (cleaned.length > 1) {
      const pasted = cleaned.slice(0, 6).split('');
      for (let i = 0; i < 6; i++) {
        newOtp[i] = pasted[i] || '';
      }
      setOtpDigits(newOtp);
      const nextIndex = Math.min(pasted.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    newOtp[index] = cleaned[cleaned.length - 1];
    setOtpDigits(newOtp);
    setVerifyResult({ status: 'idle', message: '' });

    // Focus next input box
    if (index < 5 && cleaned) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle Backspace navigation across OTP boxes
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste in OTP inputs
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasteData) return;

    const newOtp = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pasteData[i] || '';
    }
    setOtpDigits(newOtp);
    setVerifyResult({ status: 'idle', message: '' });
    inputRefs.current[Math.min(pasteData.length, 5)]?.focus();
  };

  // Verify the submitted OTP code
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otpDigits.join('');

    if (code.length < 6) {
      setVerifyResult({
        status: 'error',
        message: 'Vui lòng nhập đủ 6 chữ số mã xác thực.',
      });
      return;
    }

    setIsVerifying(true);
    setVerifyResult({ status: 'idle', message: '' });

    try {
      const isValid = await verifyTOTP(code, secret);
      setIsVerifying(false);

      if (isValid) {
        setVerifyResult({
          status: 'success',
          message: 'Xác thực thành công! Mã TOTP chính xác và hợp lệ.',
        });
        if (onVerified) {
          onVerified();
        }
      } else {
        setVerifyResult({
          status: 'error',
          message: 'Mã xác thực không đúng hoặc đã hết hạn. Vui lòng thử lại.',
        });
      }
    } catch {
      setIsVerifying(false);
      setVerifyResult({
        status: 'error',
        message: 'Có lỗi xảy ra khi kiểm tra mã xác thực.',
      });
    }
  };

  return (
    <div className="form-card">
      {/* Header */}
      <div className="card-header">
        <div className="badge-pill">
          <ShieldCheck size={14} />
          <span>Bảo mật hai lớp (2FA)</span>
        </div>
        <h1 className="card-title">Mã Xác Thực TOTP</h1>
        <p className="card-subtitle">
          Tạo mã xác thực dùng một lần theo thời gian chuẩn RFC 6238
        </p>
      </div>

      {/* Internal Sub-navigation: Setup vs Verify */}
      <div className="segmented-control" style={{ marginBottom: '20px' }}>
        <button
          type="button"
          className={`segment-btn ${activeTab === 'setup' ? 'active' : ''}`}
          onClick={() => setActiveTab('setup')}
        >
          <QrCode size={15} />
          <span>Thiết lập & Lấy mã</span>
        </button>
        <button
          type="button"
          className={`segment-btn ${activeTab === 'verify' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('verify');
            setVerifyResult({ status: 'idle', message: '' });
          }}
        >
          <KeyRound size={15} />
          <span>Xác minh mã</span>
        </button>
      </div>

      {activeTab === 'setup' ? (
        <div>
          {/* Email input for account label */}
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label" style={{ fontSize: '0.85rem' }}>
              Tài khoản liên kết
            </label>
            <input
              type="email"
              className="form-input"
              style={{ paddingLeft: '14px' }}
              value={accountEmail}
              onChange={(e) => setAccountEmail(e.target.value)}
              placeholder="user@example.com"
            />
          </div>

          {/* QR Code Container */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(15, 23, 42, 0.5)',
              border: '1px solid var(--card-border)',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '20px',
            }}
          >
            <div
              style={{
                background: '#ffffff',
                padding: '10px',
                borderRadius: '12px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                display: 'inline-block',
              }}
            >
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="QR Code TOTP"
                  style={{
                    width: '180px',
                    height: '180px',
                    display: 'block',
                    borderRadius: '6px',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '180px',
                    height: '180px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#64748b',
                    fontSize: '13px',
                  }}
                >
                  Đang tạo mã QR...
                </div>
              )}
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginTop: '12px',
                color: 'var(--text-muted)',
                fontSize: '0.8rem',
                textAlign: 'center',
              }}
            >
              <Smartphone size={14} style={{ color: 'var(--primary)' }} />
              <span>Quét bằng Google Authenticator hoặc Microsoft Authenticator</span>
            </div>
          </div>

          {/* Secret Key Display */}
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '6px',
              }}
            >
              <label className="form-label" style={{ marginBottom: 0 }}>
                Mã khóa bí mật (Secret Key)
              </label>
              <button
                type="button"
                onClick={handleRegenerateSecret}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary)',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '2px 6px',
                  borderRadius: '4px',
                }}
                title="Tạo khóa bí mật mới"
              >
                <RefreshCw size={12} />
                <span>Tạo khóa mới</span>
              </button>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'var(--input-bg)',
                border: '1px solid var(--input-border)',
                borderRadius: '10px',
                padding: '10px 12px',
              }}
            >
              <span
                style={{
                  flex: 1,
                  fontFamily: 'monospace',
                  fontSize: '0.95rem',
                  letterSpacing: '1px',
                  color: '#e2e8f0',
                  wordBreak: 'break-all',
                }}
              >
                {formatSecret(secret)}
              </span>
              <button
                type="button"
                onClick={handleCopySecret}
                className="btn-secondary"
                style={{
                  padding: '6px 12px',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  flexShrink: 0,
                }}
              >
                {copiedSecret ? (
                  <>
                    <Check size={14} style={{ color: 'var(--success)' }} />
                    <span style={{ color: 'var(--success)' }}>Đã chép</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>Sao chép</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Live TOTP Code Simulation Card */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(15, 23, 42, 0.6) 100%)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              borderRadius: '14px',
              padding: '16px',
              marginBottom: '20px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '10px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={14} style={{ color: 'var(--primary)' }} />
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  Mã OTP hiện tại (Tự đổi mỗi 30s)
                </span>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.75rem',
                  color: remainingSec <= 5 ? '#f43f5e' : 'var(--text-muted)',
                  fontWeight: 600,
                }}
              >
                <Clock size={12} />
                <span>{remainingSec}s</span>
              </div>
            </div>

            {/* Countdown bar */}
            <div
              style={{
                height: '4px',
                width: '100%',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '999px',
                overflow: 'hidden',
                marginBottom: '14px',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${timerProgress}%`,
                  background: remainingSec <= 5 ? '#f43f5e' : 'var(--primary)',
                  transition: 'width 1s linear, background-color 0.3s ease',
                  borderRadius: '999px',
                }}
              />
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
              }}
            >
              <div
                style={{
                  fontSize: '2rem',
                  fontWeight: 700,
                  fontFamily: 'monospace',
                  letterSpacing: '6px',
                  color: '#ffffff',
                  textShadow: '0 2px 10px rgba(99, 102, 241, 0.4)',
                }}
              >
                {currentCode.slice(0, 3)} {currentCode.slice(3)}
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="btn-secondary"
                  style={{
                    padding: '8px 12px',
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                  title="Sao chép 6 chữ số này"
                >
                  {copiedCode ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedCode ? 'Đã chép' : 'Chép mã'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Action button to switch to verify */}
          <button
            type="button"
            className="btn-submit"
            onClick={() => {
              setActiveTab('verify');
              handleFillCurrentCode();
            }}
            style={{ width: '100%', marginBottom: '12px' }}
          >
            <KeyRound size={16} />
            <span>Chuyển sang kiểm tra mã này</span>
          </button>
        </div>
      ) : (
        /* Verification Tab */
        <form onSubmit={handleVerify}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Nhập mã gồm 6 chữ số từ ứng dụng xác thực của bạn
            </p>
          </div>

          {/* 6 Digit Inputs */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '8px',
              marginBottom: '20px',
            }}
          >
            {otpDigits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                onPaste={handlePaste}
                style={{
                  width: '46px',
                  height: '56px',
                  textAlign: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  fontFamily: 'monospace',
                  background: 'var(--input-bg)',
                  border: digit ? '2px solid var(--primary)' : '1px solid var(--input-border)',
                  borderRadius: '12px',
                  color: '#ffffff',
                  outline: 'none',
                  boxShadow: digit ? '0 0 12px var(--primary-glow)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              />
            ))}
          </div>

          {/* Helper button to fill current code */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <button
              type="button"
              onClick={handleFillCurrentCode}
              style={{
                background: 'rgba(99, 102, 241, 0.1)',
                border: '1px dashed rgba(99, 102, 241, 0.3)',
                color: '#a5b4fc',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s',
              }}
            >
              <Sparkles size={13} />
              <span>Điền nhanh mã hiện tại ({currentCode})</span>
            </button>
          </div>

          {/* Feedback message */}
          {verifyResult.status !== 'idle' && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 16px',
                borderRadius: '10px',
                marginBottom: '20px',
                background:
                  verifyResult.status === 'success'
                    ? 'rgba(16, 185, 129, 0.15)'
                    : 'var(--error-bg)',
                border: `1px solid ${
                  verifyResult.status === 'success' ? 'var(--success)' : 'var(--error)'
                }`,
                color:
                  verifyResult.status === 'success' ? '#34d399' : 'var(--error)',
                fontSize: '0.88rem',
                animation: 'slideDown 0.2s ease-out',
              }}
            >
              {verifyResult.status === 'success' ? (
                <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
              ) : (
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
              )}
              <span>{verifyResult.message}</span>
            </div>
          )}

          {/* Verify button */}
          <button
            type="submit"
            className="btn-submit"
            disabled={isVerifying || otpDigits.join('').length < 6}
            style={{ width: '100%', marginBottom: '12px' }}
          >
            <ShieldCheck size={18} />
            <span>{isVerifying ? 'Đang xác minh...' : 'Xác minh mã'}</span>
          </button>
        </form>
      )}

      {/* Back button */}
      {onSwitchToLogin && (
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="btn-secondary"
          style={{
            width: '100%',
            marginTop: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <ArrowLeft size={16} />
          <span>Quay lại Đăng nhập</span>
        </button>
      )}
    </div>
  );
};
