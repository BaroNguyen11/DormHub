import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, CheckCircle2, Mail, RefreshCw, Send } from "lucide-react";
import AuthLayout from "../../layouts/AuthLayout";
import { authService } from "../../services/auth.service";

const controlClass =
  "w-full h-12 border-3 border-line-strong bg-surface rounded-sm px-4 text-sm! font-bold! text-text shadow-[3px_3px_0_#141413] focus:shadow-[4px_4px_0_#141413] outline-none! transition-all";
const buttonClass =
  "w-full h-12 px-5 border-3 border-line-strong rounded-sm inline-flex items-center justify-center gap-2 font-black! text-sm! shadow-[3px_3px_0_#141413] hover:shadow-[5px_5px_0_#141413] hover:-translate-0.5 active:translate-0.5 active:shadow-none transition-all cursor-pointer outline-none! disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryEmail = searchParams.get("email")?.trim() || "";

  // State quản lý luồng: 1 (Nhập Email) | 2 (Nhập OTP)
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState(queryEmail);
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const emailInputRef = useRef(null);
  const otpInputRef = useRef(null);

  // Auto focus theo bước
  useEffect(() => {
    if (step === 1) {
      emailInputRef.current?.focus();
    } else if (step === 2) {
      otpInputRef.current?.focus();
    }
  }, [step]);

  // Bộ đếm ngược 60s cho nút gửi lại OTP ở Bước 2
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // BƯỚC 1: Xử lý gửi OTP
  async function handleSendOtp(event) {
    event.preventDefault();
    if (!email.trim()) return;

    setBusy(true);
    try {
      // Gọi API gửi OTP (Backend tự check nếu tài khoản đã active thì ném exception/response riêng)
      const res = await authService.resendOtp({ email: email.trim() });

      // Nếu Backend báo tài khoản đã kích hoạt rồi
      if (res?.data?.message?.includes("đã được kích hoạt")) {
        setTimeout(() => navigate("/login", { replace: true }), 1500);
        return;
      }

      // Chuyển sang Bước 2 (Nhập OTP) & bật đếm ngược 60s
      setStep(2);
      setCountdown(60);
    } catch (err) {
      // Nếu Backend trả về 400/409 báo tài khoản đã kích hoạt
      if (err.response?.data?.message?.toLowerCase().includes("kích hoạt")) {
        setTimeout(() => navigate("/login", { replace: true }), 1500);
      }
    } finally {
      setBusy(false);
    }
  }

  // BƯỚC 2: Xử lý xác thực OTP
  async function handleVerifyOtp(event) {
    event.preventDefault();
    if (otp.length !== 6) return;

    setBusy(true);
    try {
      await authService.verifyEmail({ email: email.trim(), otp: otp.trim() });
      // Xác thực thành công -> Nhảy sang trang Đăng nhập
      navigate("/login", { replace: true });
    } catch {
      // Axios interceptor tự động bắt lỗi
    } finally {
      setBusy(false);
    }
  }

  // BƯỚC 2: Gửi lại mã OTP
  async function handleResendOtp() {
    if (countdown > 0 || resending) return;
    setResending(true);
    try {
      await authService.resendOtp({ email: email.trim() });
      setCountdown(60);
    } catch {
      // Axios interceptor tự động bắt lỗi
    } finally {
      setResending(false);
    }
  }

  return (
    <AuthLayout>
      <section className="w-full min-w-0 mx-auto">
        <div className="size-12 rounded-sm bg-primary text-black border-3 border-line-strong grid place-items-center mb-5 shadow-[3px_3px_0_#141413]">
          <Mail size={22} strokeWidth={2.5} />
        </div>

        <h1 className="text-2xl font-black text-text">
          {step === 1 ? "Kích hoạt tài khoản" : "Nhập mã xác thực OTP"}
        </h1>
        <p className="mt-2 mb-6 text-sm font-bold text-text-muted">
          {step === 1
            ? "Nhập email trường cấp để nhận mã kích hoạt tài khoản."
            : `Mã OTP gồm 6 chữ số đã được gửi tới email: ${email}`}
        </p>

        {/* BƯỚC 1: FORM NHẬP EMAIL */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <label className="block">
              <span className="block mb-2 text-sm font-extrabold text-text">
                Email trường cấp
              </span>
              <input
                ref={emailInputRef}
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@student.iuh.edu.vn"
                className={controlClass}
              />
            </label>

            <button
              type="submit"
              disabled={busy || !email.trim()}
              className={`${buttonClass} bg-primary text-black`}
            >
              {busy ? (
                <RefreshCw size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
              {busy ? "Đang gửi OTP…" : "Gửi mã OTP"}
            </button>
          </form>
        )}

        {/* BƯỚC 2: FORM NHẬP OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="p-3 bg-surface-2 border-2 border-line-strong rounded-sm flex items-center justify-between text-xs font-bold text-text-muted mb-2">
              <span>
                Email: <strong className="text-text">{email}</strong>
              </span>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-primary underline font-black hover:text-primary-dark cursor-pointer"
              >
                Đổi email
              </button>
            </div>

            <label className="block">
              <span className="block mb-2 text-sm font-extrabold text-text">
                Mã OTP (6 chữ số)
              </span>
              <input
                ref={otpInputRef}
                type="text"
                required
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                pattern="[0-9]{6}"
                value={otp}
                onChange={(event) =>
                  setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="Nhập mã gồm 6 chữ số"
                className={controlClass}
              />
            </label>

            <button
              type="submit"
              disabled={busy || otp.length !== 6}
              className={`${buttonClass} bg-success text-black`}
            >
              {busy ? (
                <RefreshCw size={18} className="animate-spin" />
              ) : (
                <CheckCircle2 size={18} />
              )}
              {busy ? "Đang xác thực…" : "Xác thực & Đăng nhập"}
            </button>

            <div className="mt-4 text-center text-sm font-bold text-text-muted">
              Chưa nhận được mã?{" "}
              <button
                type="button"
                disabled={countdown > 0 || resending}
                onClick={handleResendOtp}
                className="font-black text-primary underline underline-offset-4 transition-all outline-none! disabled:text-text-muted disabled:no-underline disabled:cursor-not-allowed"
              >
                {resending
                  ? "Đang gửi…"
                  : countdown > 0
                    ? `Gửi lại OTP (${countdown}s)`
                    : "Gửi lại OTP"}
              </button>
            </div>
          </form>
        )}

        <div className="mt-5 text-center text-sm font-bold text-text-muted">
          <Link to="/login" className="font-black text-primary hover:underline">
            Quay lại đăng nhập
          </Link>
        </div>
      </section>
    </AuthLayout>
  );
}
