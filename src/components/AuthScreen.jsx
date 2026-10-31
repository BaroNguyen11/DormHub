import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Mail, LockKeyhole } from 'lucide-react';
import AuthLayout from '../layouts/AuthLayout';
import useAuth from '../hooks/useAuth';
import { authService } from '../services/auth.service';
import { errorMessage } from '../utils/errorHandler';
import {
  DEMO_ACCOUNTS,
  DEMO_ENABLED,
  DEMO_PASSWORD,
} from '../services/demo.service';

const configs = {
  login: {
    title: 'Chào mừng trở lại',
    intro: 'Đăng nhập để quản lý hành trình nội trú.',
    fields: [
      ['email', 'Email', 'email'],
      ['password', 'Mật khẩu', 'password'],
    ],
    button: 'Đăng nhập',
  },
  verifyEmail: {
    title: 'Kích hoạt tài khoản',
    intro:
      'Nhập email do nhà trường cấp và mã OTP đã gửi đến email để kích hoạt tài khoản.',
    fields: [
      ['email', 'Email trường cấp', 'email'],
      ['otp', 'Mã OTP (6 chữ số)', 'text'],
    ],
    button: 'Xác thực email',
  },
  forgot: {
    title: 'Quên mật khẩu',
    intro: 'Chúng tôi sẽ gửi mã khôi phục đến email của bạn nếu tài khoản hợp lệ.',
    fields: [['email', 'Email', 'email']],
    button: 'Gửi mã khôi phục',
  },
  reset: {
    title: 'Đặt lại mật khẩu',
    intro: 'Nhập email, mã OTP và mật khẩu mới để hoàn tất khôi phục.',
    fields: [
      ['email', 'Email', 'email'],
      ['otp', 'Mã OTP (6 chữ số)', 'text'],
      ['newPassword', 'Mật khẩu mới', 'password'],
    ],
    button: 'Đổi mật khẩu',
  },
};

export default function AuthScreen({ type }) {
  const config = configs[type];
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [values, setValues] = useState({
    email: new URLSearchParams(location.search).get('email') || '',
  });
  const [busy, setBusy] = useState(false);
  const [resendBusy, setResendBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function submit(event) {
    event.preventDefault();
    setError('');
    setSuccess('');
    setBusy(true);

    try {
      if (type === 'login') {
        const account = await login({
          email: values.email.trim(),
          password: values.password,
        });
        const role = String(account?.role || account?.roles?.[0] || 'STUDENT')
          .replace(/^ROLE_/, '')
          .toLowerCase();
        const destination = role === 'manager' ? '/manager' : '/student';
        navigate(location.state?.from || destination, { replace: true });
      } else if (type === 'verifyEmail') {
        await authService.verifyEmail({
          email: values.email.trim(),
          otp: values.otp.trim(),
        });
        navigate('/login', {
          replace: true,
          state: { success: 'Email đã được xác thực. Bạn có thể đăng nhập.' },
        });
      } else if (type === 'forgot') {
        await authService.forgotPassword({ email: values.email.trim() });
        setSuccess('Nếu email hợp lệ, mã khôi phục đã được gửi. Hãy kiểm tra hộp thư.');
      } else if (type === 'reset') {
        await authService.resetPassword({
          email: values.email.trim(),
          otp: values.otp.trim(),
          newPassword: values.newPassword,
        });
        navigate('/login', {
          replace: true,
          state: { success: 'Mật khẩu đã được cập nhật. Hãy đăng nhập lại.' },
        });
      }
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setBusy(false);
    }
  }

  async function resendOtp() {
    if (!values.email.trim()) {
      setError('Hãy nhập email do nhà trường cấp trước khi gửi lại mã OTP.');
      return;
    }

    setError('');
    setSuccess('');
    setResendBusy(true);
    try {
      await authService.resendOtp({ email: values.email.trim() });
      setSuccess('Nếu tài khoản cần kích hoạt, mã OTP mới đã được gửi đến email.');
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setResendBusy(false);
    }
  }

  return (
    <AuthLayout>
      <div className="auth-card">
        <div className="auth-icon">
          {type === 'login' ? <LockKeyhole size={22} /> : <Mail size={22} />}
        </div>
        <p className="eyebrow">TÀI KHOẢN DORMHUB</p>
        <h2>{config.title}</h2>
        <p className="subheading">{config.intro}</p>

        {location.state?.success && (
          <div className="notice success" role="status">
            {location.state.success}
          </div>
        )}
        {error && (
          <div className="notice error" role="alert">
            {error}
          </div>
        )}
        {success && (
          <div className="notice success" role="status">
            {success}
          </div>
        )}

        {type === 'login' && DEMO_ENABLED && (
          <div className="demo-login">
            <strong>Xem thử giao diện không cần backend</strong>
            <p>
              Chọn vai trò để điền tài khoản mẫu. Mật khẩu chung:{' '}
              <code>{DEMO_PASSWORD}</code>
            </p>
            <div>
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  className="button subtle"
                  type="button"
                  key={account.role}
                  onClick={() =>
                    setValues({ email: account.email, password: DEMO_PASSWORD })
                  }
                >
                  {account.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={submit}>
          {config.fields.map(([key, label, inputType]) => (
            <label className="field" key={key}>
              <span>{label}</span>
              <input
                type={inputType}
                required
                minLength={inputType === 'password' ? 8 : undefined}
                maxLength={key === 'otp' ? 6 : undefined}
                pattern={key === 'otp' ? '[0-9]{6}' : undefined}
                inputMode={key === 'otp' ? 'numeric' : undefined}
                value={values[key] || ''}
                onChange={(event) =>
                  setValues((previous) => ({
                    ...previous,
                    [key]: event.target.value,
                  }))
                }
                autoComplete={
                  key === 'password' || key === 'newPassword'
                    ? key === 'password'
                      ? 'current-password'
                      : 'new-password'
                    : key === 'email'
                      ? 'email'
                      : 'one-time-code'
                }
              />
            </label>
          ))}
          <button className="button primary auth-submit" disabled={busy}>
            {busy ? 'Đang xử lý…' : config.button}
            <ArrowRight size={16} />
          </button>
        </form>

        {type === 'verifyEmail' && (
          <button
            className="button subtle auth-resend"
            type="button"
            disabled={resendBusy || busy}
            onClick={resendOtp}
          >
            {resendBusy ? 'Đang gửi lại…' : 'Gửi lại mã OTP'}
          </button>
        )}

        <div className="auth-links">
          {type === 'login' ? (
            <>
              <Link to="/forgot-password">Quên mật khẩu?</Link>
              <span>
                Đã được nhà trường cấp tài khoản?{' '}
                <Link to="/verify-email">Kích hoạt email</Link>
              </span>
            </>
          ) : (
            <Link to="/login">Quay lại đăng nhập</Link>
          )}
        </div>
        {type === 'login' && (
          <p className="auth-footnote">
            Tài khoản sinh viên được nhà trường cấp; DormHub không mở đăng ký sinh viên công khai.
          </p>
        )}
      </div>
    </AuthLayout>
  );
}
