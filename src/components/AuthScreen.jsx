import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Mail, LockKeyhole } from 'lucide-react';
import AuthLayout from '../layouts/AuthLayout';
import { Button } from './ui/button';
import { Input } from './ui/input';
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
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full min-w-0 max-w-[430px]"
      >
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4, type: 'spring', stiffness: 200 }}
          className="w-[42px] h-[42px] rounded-lg bg-[var(--color-primary-surface)] text-[var(--color-primary)] grid place-items-center mb-5"
        >
          {type === 'login' ? <LockKeyhole size={22} /> : <Mail size={22} />}
        </motion.div>
        <p className="text-[10px] font-[family-name:var(--font-family-display)] font-extrabold tracking-[0.15em] text-[var(--color-primary)] uppercase m-0 mb-[11px]">TÀI KHOẢN DORMHUB</p>
        <h2 className="text-[28px] font-[family-name:var(--font-family-display)] font-bold tracking-tight m-0 mb-[7px] text-[var(--color-text)]">{config.title}</h2>
        <p className="text-[var(--color-text-muted)] text-sm leading-[1.8] m-0 mb-7">{config.intro}</p>

        {location.state?.success && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-4 py-3 rounded-[var(--radius-md)] mb-4 text-sm leading-relaxed bg-[var(--color-success)]/10 text-[var(--color-success)] border border-[var(--color-success)]/20" 
            role="status"
          >
            {location.state.success}
          </motion.div>
        )}
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-4 py-3 rounded-[var(--radius-md)] mb-4 text-sm leading-relaxed bg-[var(--color-error)]/10 text-[var(--color-error)] border border-[var(--color-error)]/20" 
            role="alert"
          >
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-4 py-3 rounded-[var(--radius-md)] mb-4 text-sm leading-relaxed bg-[var(--color-success)]/10 text-[var(--color-success)] border border-[var(--color-success)]/20" 
            role="status"
          >
            {success}
          </motion.div>
        )}

        {type === 'login' && DEMO_ENABLED && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-[var(--color-surface-2)] border border-[var(--color-line)] rounded-[var(--radius-lg)] p-4 mb-5 text-[var(--color-text)] text-sm"
          >
            <strong className="block mb-2 font-[family-name:var(--font-family-display)] font-semibold">Xem thử giao diện không cần backend</strong>
            <p className="text-[var(--color-text-muted)] text-sm leading-normal m-0 mb-3">
              Chọn vai trò để điền tài khoản mẫu. Mật khẩu chung:{' '}
              <code className="px-2 py-1 rounded-[var(--radius-sm)] bg-white text-[var(--color-primary)] text-xs font-[family-name:var(--font-family-mono)]">{DEMO_PASSWORD}</code>
            </p>
            <div className="flex gap-2 flex-wrap">
              {DEMO_ACCOUNTS.map((account) => (
                <Button
                  variant="secondary"
                  size="sm"
                  type="button"
                  key={account.role}
                  onClick={() =>
                    setValues({ email: account.email, password: DEMO_PASSWORD })
                  }
                >
                  {account.label}
                </Button>
              ))}
            </div>
          </motion.div>
        )}

        <form onSubmit={submit}>
          {config.fields.map(([key, label, inputType]) => (
            <label className="block mb-4" key={key}>
              <span className="block text-sm font-[family-name:var(--font-family-display)] font-semibold text-[var(--color-text)] mb-2">{label}</span>
              <Input
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
          <Button className="w-full mt-3" size="lg" disabled={busy}>
            {busy ? 'Đang xử lý…' : config.button}
            <ArrowRight size={16} />
          </Button>
        </form>

        {type === 'verifyEmail' && (
          <Button
            className="w-full mt-3"
            variant="secondary"
            size="lg"
            type="button"
            disabled={resendBusy || busy}
            onClick={resendOtp}
          >
            {resendBusy ? 'Đang gửi lại…' : 'Gửi lại mã OTP'}
          </Button>
        )}

        <div className="flex justify-between gap-3 mt-6 text-sm text-[var(--color-text-muted)]">
          {type === 'login' ? (
            <>
              <Link to="/forgot-password" className="text-[var(--color-primary)] font-semibold hover:underline">Quên mật khẩu?</Link>
              <span>
                Đã được nhà trường cấp tài khoản?{' '}
                <Link to="/verify-email" className="text-[var(--color-primary)] font-semibold hover:underline">Kích hoạt email</Link>
              </span>
            </>
          ) : (
            <Link to="/login" className="text-[var(--color-primary)] font-semibold hover:underline">Quay lại đăng nhập</Link>
          )}
        </div>
        {type === 'login' && (
          <p className="mt-5 text-[var(--color-text-muted)] text-xs leading-normal text-center">
            Tài khoản sinh viên được nhà trường cấp; DormHub không mở đăng ký sinh viên công khai.
          </p>
        )}
      </motion.div>
    </AuthLayout>
  );
}
