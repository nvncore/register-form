import React, { useState, useMemo } from 'react';
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ArrowLeft,
  ShieldCheck,
  Check,
  X,
  Mail,
  RotateCcw
} from 'lucide-react';

interface ChangePasswordFormProps {
  userEmail?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  onSwitchToLogin?: () => void;
}

interface FormState {
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface FormErrors {
  email?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({
  userEmail,
  onSuccess,
  onCancel,
  onSwitchToLogin,
}) => {
  const [formData, setFormData] = useState<FormState>({
    email: userEmail || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Password requirements breakdown
  const requirements = useMemo(() => {
    const pwd = formData.newPassword;
    return {
      minLength: pwd.length >= 8,
      hasUpperLower: /[a-z]/.test(pwd) && /[A-Z]/.test(pwd),
      hasNumber: /\d/.test(pwd),
      hasSpecial: /[^a-zA-Z0-9]/.test(pwd),
    };
  }, [formData.newPassword]);

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    const pwd = formData.newPassword;
    if (!pwd) return { score: 0, text: '', color: '#94a3b8' };

    let score = 0;
    if (requirements.minLength) score += 25;
    if (requirements.hasUpperLower) score += 25;
    if (requirements.hasNumber) score += 25;
    if (requirements.hasSpecial) score += 25;

    if (score <= 25) return { score, text: 'Rất yếu', color: '#f43f5e' };
    if (score <= 50) return { score, text: 'Trung bình', color: '#fbbf24' };
    if (score <= 75) return { score, text: 'Khá mạnh', color: '#3b82f6' };
    return { score: 100, text: 'Rất mạnh', color: '#10b981' };
  }, [formData.newPassword, requirements]);

  const validateField = (name: keyof FormState, value: string): string | undefined => {
    switch (name) {
      case 'email':
        if (!userEmail) {
          if (!value.trim()) return 'Vui lòng nhập email tài khoản';
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Địa chỉ email không hợp lệ';
        }
        return undefined;

      case 'currentPassword':
        if (!value) return 'Vui lòng nhập mật khẩu hiện tại';
        if (value.length < 6) return 'Mật khẩu hiện tại tối thiểu 6 ký tự';
        return undefined;

      case 'newPassword':
        if (!value) return 'Vui lòng nhập mật khẩu mới';
        if (value.length < 8) return 'Mật khẩu mới phải có ít nhất 8 ký tự';
        if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(value)) {
          return 'Mật khẩu phải chứa ít nhất một chữ cái và một số';
        }
        if (formData.currentPassword && value === formData.currentPassword) {
          return 'Mật khẩu mới không được trùng với mật khẩu hiện tại';
        }
        return undefined;

      case 'confirmPassword':
        if (!value) return 'Vui lòng xác nhận mật khẩu mới';
        if (value !== formData.newPassword) return 'Mật khẩu xác nhận không khớp';
        return undefined;

      default:
        return undefined;
    }
  };

  const handleBlur = (field: keyof FormState) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field]);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleChange = (field: keyof FormState, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (touched[field]) {
      const error = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: error }));
    }

    // Revalidate confirmPassword when newPassword changes
    if (field === 'newPassword' && touched.confirmPassword) {
      if (formData.confirmPassword && value !== formData.confirmPassword) {
        setErrors((prev) => ({ ...prev, confirmPassword: 'Mật khẩu xác nhận không khớp' }));
      } else {
        setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
      }
    }

    // Revalidate newPassword against currentPassword
    if (field === 'currentPassword' && touched.newPassword && formData.newPassword) {
      if (formData.newPassword === value) {
        setErrors((prev) => ({ ...prev, newPassword: 'Mật khẩu mới không được trùng với mật khẩu hiện tại' }));
      } else if (errors.newPassword === 'Mật khẩu mới không được trùng với mật khẩu hiện tại') {
        setErrors((prev) => ({ ...prev, newPassword: undefined }));
      }
    }
  };

  const validateAll = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    if (!userEmail) {
      const emailErr = validateField('email', formData.email);
      if (emailErr) {
        newErrors.email = emailErr;
        isValid = false;
      }
    }

    const currentErr = validateField('currentPassword', formData.currentPassword);
    if (currentErr) {
      newErrors.currentPassword = currentErr;
      isValid = false;
    }

    const newPwdErr = validateField('newPassword', formData.newPassword);
    if (newPwdErr) {
      newErrors.newPassword = newPwdErr;
      isValid = false;
    }

    const confirmErr = validateField('confirmPassword', formData.confirmPassword);
    if (confirmErr) {
      newErrors.confirmPassword = confirmErr;
      isValid = false;
    }

    setErrors(newErrors);
    setTouched({
      email: true,
      currentPassword: true,
      newPassword: true,
      confirmPassword: true,
    });

    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAll()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      if (onSuccess) {
        // give the user a moment to see the success card, or let them click
      }
    }, 800);
  };

  const handleResetForm = () => {
    setFormData({
      email: userEmail || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setErrors({});
    setTouched({});
    setIsSubmitted(false);
  };

  // Success screen
  if (isSubmitted) {
    return (
      <div className="card success-card">
        <div className="success-icon-wrapper">
          <CheckCircle2 size={36} />
        </div>

        <h2 className="card-title" style={{ fontSize: '24px', marginBottom: '8px' }}>
          Đổi mật khẩu thành công!
        </h2>
        <p className="card-subtitle" style={{ marginBottom: '24px' }}>
          Mật khẩu tài khoản của bạn đã được cập nhật an toàn.
        </p>

        <div className="success-details">
          <div className="success-item">
            <span>Tài khoản:</span>
            <span>{userEmail || formData.email}</span>
          </div>
          <div className="success-item">
            <span>Trạng thái:</span>
            <span style={{ color: 'var(--success)', fontWeight: 600 }}>Đã kích hoạt mật khẩu mới</span>
          </div>
          <div className="success-item">
            <span>Thời gian:</span>
            <span>{new Date().toLocaleTimeString()}</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
          {onSwitchToLogin && (
            <button
              type="button"
              className="btn-submit"
              onClick={onSwitchToLogin}
              style={{ marginTop: 0 }}
            >
              <span>Đăng nhập bằng mật khẩu mới</span>
              <KeyRound size={18} />
            </button>
          )}

          {onCancel && (
            <button
              type="button"
              className="btn-secondary"
              onClick={onCancel}
            >
              <ArrowLeft size={16} />
              <span>Quay lại trang chính</span>
            </button>
          )}

          {!onSwitchToLogin && !onCancel && (
            <button
              type="button"
              className="btn-submit"
              onClick={handleResetForm}
              style={{ marginTop: 0 }}
            >
              <RotateCcw size={16} />
              <span>Tiếp tục đổi mật khẩu khác</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <div className="badge">
          <ShieldCheck size={14} />
          <span>Bảo mật tài khoản</span>
        </div>
        <h1 className="card-title">Đổi Mật Khẩu</h1>
        <p className="card-subtitle">
          {userEmail
            ? `Cập nhật mật khẩu cho tài khoản ${userEmail}`
            : 'Nhập thông tin xác thực để thay đổi mật khẩu'}
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {/* Email field if not provided by prop */}
        {!userEmail && (
          <div className="form-group">
            <label className="form-label">Email tài khoản</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={18} />
              <input
                type="email"
                className={`form-input ${errors.email && touched.email ? 'is-invalid' : ''}`}
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
              />
            </div>
            {errors.email && touched.email && (
              <div className="error-text">
                <AlertCircle size={14} />
                <span>{errors.email}</span>
              </div>
            )}
          </div>
        )}

        {/* Current Password */}
        <div className="form-group">
          <label className="form-label">Mật khẩu hiện tại</label>
          <div className="input-wrapper">
            <Lock className="input-icon" size={18} />
            <input
              type={showCurrentPassword ? 'text' : 'password'}
              className={`form-input has-toggle ${
                errors.currentPassword && touched.currentPassword ? 'is-invalid' : ''
              }`}
              placeholder="Nhập mật khẩu hiện tại"
              value={formData.currentPassword}
              onChange={(e) => handleChange('currentPassword', e.target.value)}
              onBlur={() => handleBlur('currentPassword')}
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              aria-label="Toggle password visibility"
            >
              {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.currentPassword && touched.currentPassword && (
            <div className="error-text">
              <AlertCircle size={14} />
              <span>{errors.currentPassword}</span>
            </div>
          )}
        </div>

        {/* New Password */}
        <div className="form-group">
          <label className="form-label">Mật khẩu mới</label>
          <div className="input-wrapper">
            <KeyRound className="input-icon" size={18} />
            <input
              type={showNewPassword ? 'text' : 'password'}
              className={`form-input has-toggle ${
                errors.newPassword && touched.newPassword ? 'is-invalid' : ''
              }`}
              placeholder="Nhập mật khẩu mới"
              value={formData.newPassword}
              onChange={(e) => handleChange('newPassword', e.target.value)}
              onBlur={() => handleBlur('newPassword')}
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowNewPassword(!showNewPassword)}
              aria-label="Toggle password visibility"
            >
              {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Password strength indicator */}
          {formData.newPassword && (
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
                <span>Độ mạnh mật khẩu:</span>
                <span style={{ color: passwordStrength.color, fontWeight: 600 }}>
                  {passwordStrength.text}
                </span>
              </div>
            </div>
          )}

          {/* Password rules checklist */}
          <div className="password-rules-box">
            <div className={`rule-item ${requirements.minLength ? 'valid' : ''}`}>
              {requirements.minLength ? <Check size={13} /> : <X size={13} />}
              <span>Ít nhất 8 ký tự</span>
            </div>
            <div className={`rule-item ${requirements.hasUpperLower ? 'valid' : ''}`}>
              {requirements.hasUpperLower ? <Check size={13} /> : <X size={13} />}
              <span>Chữ hoa và chữ thường</span>
            </div>
            <div className={`rule-item ${requirements.hasNumber ? 'valid' : ''}`}>
              {requirements.hasNumber ? <Check size={13} /> : <X size={13} />}
              <span>Ít nhất một số</span>
            </div>
            <div className={`rule-item ${requirements.hasSpecial ? 'valid' : ''}`}>
              {requirements.hasSpecial ? <Check size={13} /> : <X size={13} />}
              <span>Ký tự đặc biệt (!@#$...)</span>
            </div>
          </div>

          {errors.newPassword && touched.newPassword && (
            <div className="error-text">
              <AlertCircle size={14} />
              <span>{errors.newPassword}</span>
            </div>
          )}
        </div>

        {/* Confirm New Password */}
        <div className="form-group">
          <label className="form-label">Xác nhận mật khẩu mới</label>
          <div className="input-wrapper">
            <CheckCircle2 className="input-icon" size={18} />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              className={`form-input has-toggle ${
                errors.confirmPassword && touched.confirmPassword ? 'is-invalid' : ''
              }`}
              placeholder="Nhập lại mật khẩu mới"
              value={formData.confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              onBlur={() => handleBlur('confirmPassword')}
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label="Toggle password visibility"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.confirmPassword && touched.confirmPassword && (
            <div className="error-text">
              <AlertCircle size={14} />
              <span>{errors.confirmPassword}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          {onCancel && (
            <button
              type="button"
              className="btn-secondary"
              onClick={onCancel}
              style={{ flex: 1 }}
              disabled={isSubmitting}
            >
              <span>Hủy</span>
            </button>
          )}

          <button
            type="submit"
            className="btn-submit"
            disabled={isSubmitting}
            style={{ flex: onCancel ? 2 : 1, marginTop: 0 }}
          >
            {isSubmitting ? (
              <>
                <div className="spinner" />
                <span>Đang lưu...</span>
              </>
            ) : (
              <>
                <ShieldCheck size={18} />
                <span>Cập nhật mật khẩu</span>
              </>
            )}
          </button>
        </div>

        {/* Footer switch to login if provided and not logged in */}
        {onSwitchToLogin && !userEmail && (
          <div className="card-footer">
            Nhớ mật khẩu của bạn?{' '}
            <a
              href="#login"
              onClick={(e) => {
                e.preventDefault();
                onSwitchToLogin();
              }}
            >
              Đăng nhập ngay
            </a>
          </div>
        )}
      </form>
    </div>
  );
};
