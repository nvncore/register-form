import React, { useState, useMemo } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Sparkles,
  RotateCcw 
} from 'lucide-react';

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  agreeTerms?: string;
}

export const RegisterForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Tính độ mạnh mật khẩu (0 - 100%)
  const passwordStrength = useMemo(() => {
    const pwd = formData.password;
    if (!pwd) return { score: 0, text: '', color: '#94a3b8' };
    
    let score = 0;
    if (pwd.length >= 8) score += 25;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score += 25;
    if (/\d/.test(pwd)) score += 25;
    if (/[^a-zA-Z0-9]/.test(pwd)) score += 25;

    if (score <= 25) return { score, text: 'Rất yếu', color: '#f43f5e' };
    if (score <= 50) return { score, text: 'Trung bình', color: '#fbbf24' };
    if (score <= 75) return { score, text: 'Khá mạnh', color: '#3b82f6' };
    return { score: 100, text: 'Rất mạnh', color: '#10b981' };
  }, [formData.password]);

  const validateField = (name: keyof FormData, value: string | boolean): string | undefined => {
    switch (name) {
      case 'fullName':
        if (!value || typeof value !== 'string' || value.trim().length < 2) {
          return 'Vui lòng nhập họ và tên (tối thiểu 2 ký tự)';
        }
        return undefined;

      case 'email':
        if (!value || typeof value !== 'string') {
          return 'Vui lòng nhập email';
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'Địa chỉ email không hợp lệ';
        }
        return undefined;

      case 'phone':
        if (!value || typeof value !== 'string') {
          return 'Vui lòng nhập số điện thoại';
        }
        if (!/^(0|\+84)[3|5|7|8|9][0-9]{8}$/.test(value.replace(/\s+/g, ''))) {
          return 'Số điện thoại không hợp lệ (VD: 0912345678)';
        }
        return undefined;

      case 'password':
        if (!value || typeof value !== 'string') {
          return 'Vui lòng nhập mật khẩu';
        }
        if (value.length < 8) {
          return 'Mật khẩu phải chứa ít nhất 8 ký tự';
        }
        if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(value)) {
          return 'Mật khẩu nên chứa cả chữ và số';
        }
        return undefined;

      case 'confirmPassword':
        if (!value) {
          return 'Vui lòng xác nhận lại mật khẩu';
        }
        if (value !== formData.password) {
          return 'Mật khẩu xác nhận không khớp';
        }
        return undefined;

      case 'agreeTerms':
        if (!value) {
          return 'Bạn cần đồng ý với điều khoản sử dụng';
        }
        return undefined;

      default:
        return undefined;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === 'checkbox' ? checked : value;

    setFormData(prev => ({
      ...prev,
      [name]: fieldValue,
    }));

    if (touched[name]) {
      const error = validateField(name as keyof FormData, fieldValue);
      setErrors(prev => ({ ...prev, [name]: error }));
    }

    if (name === 'password' && touched.confirmPassword) {
      const confirmError = formData.confirmPassword !== value ? 'Mật khẩu xác nhận không khớp' : undefined;
      setErrors(prev => ({ ...prev, confirmPassword: confirmError }));
    }
  };

  const handleBlur = (name: keyof FormData) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, formData[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const newErrors: FormErrors = {};
    (Object.keys(formData) as Array<keyof FormData>).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
      }
    });

    setErrors(newErrors);
    setTouched({
      fullName: true,
      email: true,
      phone: true,
      password: true,
      confirmPassword: true,
      agreeTerms: true,
    });

    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true);
      // Simulate API call
      setTimeout(() => {
        setIsSubmitting(false);
        setIsSubmitted(true);
      }, 1200);
    }
  };

  const handleReset = () => {
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      agreeTerms: false,
    });
    setErrors({});
    setTouched({});
    setIsSubmitted(false);
  };

  if (isSubmitted) {
    return (
      <div className="card success-card">
        <div className="success-icon-wrapper">
          <CheckCircle2 size={40} />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
          Đăng ký thành công!
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
          Tài khoản của bạn đã được khởi tạo và sẵn sàng sử dụng.
        </p>

        <div className="success-details">
          <div className="success-item">
            <span>Họ và tên</span>
            <span>{formData.fullName}</span>
          </div>
          <div className="success-item">
            <span>Email</span>
            <span>{formData.email}</span>
          </div>
          <div className="success-item">
            <span>Số điện thoại</span>
            <span>{formData.phone}</span>
          </div>
        </div>

        <button 
          type="button" 
          className="btn-submit" 
          onClick={handleReset}
          style={{ marginTop: '16px' }}
        >
          <RotateCcw size={18} />
          Tạo tài khoản khác
        </button>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <div className="badge">
          <Sparkles size={14} />
          <span>Đăng ký thành viên</span>
        </div>
        <h1>Tạo tài khoản mới</h1>
        <p>Tham gia cùng chúng tôi chỉ với vài bước đơn giản</p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {/* Full Name */}
        <div className="form-group">
          <label className="form-label" htmlFor="fullName">Họ và tên</label>
          <div className="input-wrapper">
            <span className="input-icon"><User size={18} /></span>
            <input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="Nguyễn Văn A"
              value={formData.fullName}
              onChange={handleChange}
              onBlur={() => handleBlur('fullName')}
              className={`form-input ${touched.fullName && errors.fullName ? 'is-invalid' : ''}`}
            />
          </div>
          {touched.fullName && errors.fullName && (
            <div className="error-text">
              <AlertCircle size={14} />
              <span>{errors.fullName}</span>
            </div>
          )}
        </div>

        {/* Email */}
        <div className="form-group">
          <label className="form-label" htmlFor="email">Địa chỉ Email</label>
          <div className="input-wrapper">
            <span className="input-icon"><Mail size={18} /></span>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              onBlur={() => handleBlur('email')}
              className={`form-input ${touched.email && errors.email ? 'is-invalid' : ''}`}
            />
          </div>
          {touched.email && errors.email && (
            <div className="error-text">
              <AlertCircle size={14} />
              <span>{errors.email}</span>
            </div>
          )}
        </div>

        {/* Phone */}
        <div className="form-group">
          <label className="form-label" htmlFor="phone">Số điện thoại</label>
          <div className="input-wrapper">
            <span className="input-icon"><Phone size={18} /></span>
            <input
              id="phone"
              name="phone"
              type="tel"
              placeholder="0912 345 678"
              value={formData.phone}
              onChange={handleChange}
              onBlur={() => handleBlur('phone')}
              className={`form-input ${touched.phone && errors.phone ? 'is-invalid' : ''}`}
            />
          </div>
          {touched.phone && errors.phone && (
            <div className="error-text">
              <AlertCircle size={14} />
              <span>{errors.phone}</span>
            </div>
          )}
        </div>

        {/* Password */}
        <div className="form-group">
          <label className="form-label" htmlFor="password">Mật khẩu</label>
          <div className="input-wrapper">
            <span className="input-icon"><Lock size={18} /></span>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Ít nhất 8 ký tự gồm chữ & số"
              value={formData.password}
              onChange={handleChange}
              onBlur={() => handleBlur('password')}
              className={`form-input has-toggle ${touched.password && errors.password ? 'is-invalid' : ''}`}
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {formData.password && (
            <div className="strength-bar-container">
              <div className="strength-bar-track">
                <div 
                  className="strength-bar-fill" 
                  style={{ 
                    width: `${passwordStrength.score}%`,
                    backgroundColor: passwordStrength.color 
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
          {touched.password && errors.password && (
            <div className="error-text">
              <AlertCircle size={14} />
              <span>{errors.password}</span>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div className="form-group">
          <label className="form-label" htmlFor="confirmPassword">Xác nhận mật khẩu</label>
          <div className="input-wrapper">
            <span className="input-icon"><Lock size={18} /></span>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Nhập lại mật khẩu vừa đặt"
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={() => handleBlur('confirmPassword')}
              className={`form-input has-toggle ${touched.confirmPassword && errors.confirmPassword ? 'is-invalid' : ''}`}
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              tabIndex={-1}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {touched.confirmPassword && errors.confirmPassword && (
            <div className="error-text">
              <AlertCircle size={14} />
              <span>{errors.confirmPassword}</span>
            </div>
          )}
        </div>

        {/* Agree Terms Checkbox */}
        <div className="checkbox-group">
          <label className="checkbox-custom">
            <input
              type="checkbox"
              name="agreeTerms"
              checked={formData.agreeTerms}
              onChange={handleChange}
              onBlur={() => handleBlur('agreeTerms')}
            />
            <span className="checkmark">
              <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                <path d="M1 5L4.5 8.5L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </label>
          <span className="checkbox-text" onClick={() => {
            const nextVal = !formData.agreeTerms;
            setFormData(prev => ({ ...prev, agreeTerms: nextVal }));
            if (touched.agreeTerms) {
              setErrors(prev => ({ ...prev, agreeTerms: validateField('agreeTerms', nextVal) }));
            }
          }}>
            Tôi đồng ý với <a href="#terms" onClick={e => e.preventDefault()}>Điều khoản dịch vụ</a> và <a href="#privacy" onClick={e => e.preventDefault()}>Chính sách bảo mật</a>
          </span>
        </div>
        {touched.agreeTerms && errors.agreeTerms && (
          <div className="error-text" style={{ marginTop: '-10px', marginBottom: '14px' }}>
            <AlertCircle size={14} />
            <span>{errors.agreeTerms}</span>
          </div>
        )}

        {/* Submit Button */}
        <button type="submit" className="btn-submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <div className="spinner" />
              <span>Đang xử lý đăng ký...</span>
            </>
          ) : (
            <>
              <span>Hoàn tất đăng ký</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>

        {/* Footer */}
        <div className="card-footer">
          Đã có tài khoản?
          <a href="#login" onClick={e => e.preventDefault()}>Đăng nhập ngay</a>
        </div>
      </form>
    </div>
  );
};
