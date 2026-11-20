import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowRight,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  RefreshCw,
} from "lucide-react";
import AuthLayout from "../layouts/AuthLayout";
import useAuth from "../hooks/useAuth";
import { api } from "../api/apiClient";
import { authService } from "../services/auth.service";
import { errorMessage } from "../utils/errorHandler";
import {
  DEMO_ACCOUNTS,
  DEMO_ENABLED,
  DEMO_PASSWORD,
} from "../services/demo.service";

const configs = {
  login: {
    title: "Chào mừng trở lại",
    intro: "Đăng nhập để quản lý hành trình nội trú.",
    fields: [
      ["email", "Email", "email"],
      ["password", "Mật khẩu", "password"],
    ],
    button: "Đăng nhập",
  },
  verifyEmail: {
    title: "Kích hoạt tài khoản",
    intro:
      "Nhập email do nhà trường cấp và mã OTP đã gửi đến email để kích hoạt tài khoản.",
    fields: [
      ["email", "Email trường cấp", "email"],
      ["otp", "Mã OTP (6 chữ số)", "text"],
    ],
    button: "Xác thực email",
  },
  forgot: {
    title: "Quên mật khẩu",
    intro:
      "Chúng tôi sẽ gửi mã khôi phục đến email của bạn nếu tài khoản hợp lệ.",
    fields: [["email", "Email", "email"]],
    button: "Gửi mã khôi phục",
  },
  reset: {
    title: "Đặt lại mật khẩu",
    intro: "Nhập email, mã OTP và mật khẩu mới để hoàn tất khôi phục.",
    fields: [
      ["email", "Email", "email"],
      ["otp", "Mã OTP (6 chữ số)", "text"],
      ["newPassword", "Mật khẩu mới", "password"],
    ],
    button: "Đổi mật khẩu",
  },
};

export default function AuthScreen({ type }) {
  const config = configs[type];
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [values, setValues] = useState({
    email: new URLSearchParams(location.search).get("email") || "",
  });
  const [busy, setBusy] = useState(false);
  const [resendBusy, setResendBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function submit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setBusy(true);

    try {
      if (type === "login") {
        const account = await login({
          email: values.email.trim(),
          password: values.password,
        });
        const role = String(account?.role || account?.roles?.[0] || "STUDENT")
          .replace(/^ROLE_/, "")
          .toLowerCase();

        if (role === "manager") {
          navigate(location.state?.from || "/manager", { replace: true });
          return;
        }

        // SINH VIÊN: hỏi backend "bước tiếp theo là gì" rồi tự động chuyển hướng:
        //   - đang có phiên thanh toán chờ -> trang kết quả thanh toán (tự poll)
        //   - đã có phòng (cọc đã được xác nhận) -> "Phòng của tôi"
        //   - có hóa đơn cọc chưa trả -> chi tiết hóa đơn cọc
        //   - còn lại -> dashboard (tự hướng dẫn tìm phòng)
        let destination = "/student";
        if (!location.state?.from) {
          try {
            const overview = await api("/student/overview");
            if (overview?.redirect) destination = overview.redirect;
          } catch {
            /* lỗi overview: rơi về dashboard mặc định */
          }
        }
        navigate(location.state?.from || destination, { replace: true });
      } else if (type === "verifyEmail") {
        await authService.verifyEmail({
          email: values.email.trim(),
          otp: values.otp.trim(),
        });
        navigate("/login", {
          replace: true,
          state: { success: "Email đã được xác thực. Bạn có thể đăng nhập." },
        });
      } else if (type === "forgot") {
        await authService.forgotPassword({ email: values.email.trim() });
        setSuccess(
          "Nếu email hợp lệ, mã khôi phục đã được gửi. Hãy kiểm tra hộp thư.",
        );
      } else if (type === "reset") {
        await authService.resetPassword({
          email: values.email.trim(),
          otp: values.otp.trim(),
          newPassword: values.newPassword,
        });
        navigate("/login", {
          replace: true,
          state: { success: "Mật khẩu đã được cập nhật. Hãy đăng nhập lại." },
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
      setError("Hãy nhập email do nhà trường cấp trước khi gửi lại mã OTP.");
      return;
    }

    setError("");
    setSuccess("");
    setResendBusy(true);
    try {
      await authService.resendOtp({ email: values.email.trim() });
      setSuccess(
        "Nếu tài khoản cần kích hoạt, mã OTP mới đã được gửi đến email.",
      );
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
        className="w-full min-w-0 mx-auto"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            delay: 0.2,
            duration: 0.4,
            type: "spring",
            stiffness: 200,
          }}
          className="size-12 rounded-sm bg-primary text-text border-3 border-line-strong grid place-items-center mb-5 shadow-[3px_3px_0_#141413]"
        >
          {type === "login" ? (
            <LockKeyhole size={22} strokeWidth={2.5} />
          ) : (
            <Mail size={22} strokeWidth={2.5} />
          )}
        </motion.div>

        <p className="text-xs font-black tracking-widest text-primary uppercase mb-2">
          TÀI KHOẢN DORMHUB
        </p>
        <h2 className="text-3xl font-black tracking-tight text-text mb-2">
          {config.title}
        </h2>
        <p className="text-text-muted text-sm! leading-relaxed mb-6 font-bold">
          {config.intro}
        </p>

        {location.state?.success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-4 py-3 rounded-sm mb-4 text-sm! font-black! bg-success/20 text-text border-3 border-line-strong shadow-[3px_3px_0_#141413]"
            role="status"
          >
            {location.state.success}
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-4 py-3 rounded-sm mb-4 text-sm! font-black! bg-error/20 text-text border-3 border-line-strong shadow-[3px_3px_0_#141413]"
            role="alert"
          >
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-4 py-3 rounded-sm mb-4 text-sm! font-black! bg-success/20 text-text border-3 border-line-strong shadow-[3px_3px_0_#141413]"
            role="status"
          >
            {success}
          </motion.div>
        )}

        <form onSubmit={submit} className="space-y-4">
          {config.fields.map(([key, label, inputType]) => {
            const isPassword = inputType === "password";
            const actualType = isPassword
              ? showPassword
                ? "text"
                : "password"
              : inputType;

            return (
              <label className="block" key={key}>
                <span className="block text-sm font-extrabold text-text mb-2">
                  {label}
                </span>
                <div className="relative">
                  {/* Ô INPUT THUẦN CHUẨN NEO-BRUTALISM */}
                  <input
                    type={actualType}
                    required
                    minLength={isPassword ? 8 : undefined}
                    maxLength={key === "otp" ? 6 : undefined}
                    pattern={key === "otp" ? "[0-9]{6}" : undefined}
                    inputMode={key === "otp" ? "numeric" : undefined}
                    value={values[key] || ""}
                    onChange={(event) =>
                      setValues((previous) => ({
                        ...previous,
                        [key]: event.target.value,
                      }))
                    }
                    onPaste={(event) => {
                      event.preventDefault();

                      const pastedText = event.clipboardData
                        .getData("text")
                        .trim();

                      setValues((previous) => ({
                        ...previous,
                        [key]: pastedText,
                      }));
                    }}
                    autoComplete={
                      isPassword
                        ? key === "password"
                          ? "current-password"
                          : "new-password"
                        : key === "email"
                          ? "email"
                          : "one-time-code"
                    }
                    placeholder={`Nhập ${label.toLowerCase()}...`}
                    className={`w-full border-3 border-line-strong bg-surface rounded-sm h-12 px-4 text-sm font-bold text-text shadow-[2px_2px_0_#141413] focus:shadow-[4px_4px_0_#141413] outline-none! transition-all placeholder:font-medium placeholder:text-text-muted/60 ${
                      isPassword ? "pr-12" : ""
                    }`}
                  />

                  {/* Nút bật/tắt xem mật khẩu */}
                  {isPassword && (
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors p-1 cursor-pointer focus:outline-none"
                      title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    >
                      {showPassword ? (
                        <EyeOff size={18} strokeWidth={2.5} />
                      ) : (
                        <Eye size={18} strokeWidth={2.5} />
                      )}
                    </button>
                  )}
                </div>
              </label>
            );
          })}

          {/* NÚT SUBMIT THUẦN CHUẨN NEO-BRUTALISM */}
          <button
            type="submit"
            disabled={busy}
            className="w-full border-3 border-line-strong bg-primary rounded-sm h-12 px-7 py-3 inline-flex gap-2 items-center justify-center font-black text-sm whitespace-nowrap text-text  hover:border-line-strong shadow-[3px_3px_0_#141413] hover:shadow-[5px_5px_0_#141413] hover:-translate-0.5 active:translate-0.5 active:shadow-none transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
          >
            {busy ? (
              <RefreshCw size={18} strokeWidth={2.5} className="animate-spin" />
            ) : (
              <ArrowRight size={18} strokeWidth={2.5} />
            )}
            <span>{busy ? "Đang xử lý…" : config.button}</span>
          </button>
        </form>

        {type === "verifyEmail" && (
          <button
            type="button"
            disabled={resendBusy || busy}
            onClick={resendOtp}
            className="w-full mt-3 border-3 border-line-strong bg-surface rounded-sm h-12 px-7 py-3 inline-flex gap-2 items-center justify-center font-black text-sm whitespace-nowrap text-text hover:bg-surface-2 hover:border-line-strong shadow-[3px_3px_0_#141413] hover:shadow-[5px_5px_0_#141413] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
          >
            {resendBusy ? (
              <RefreshCw size={18} strokeWidth={2.5} className="animate-spin" />
            ) : (
              <Mail size={18} strokeWidth={2.5} />
            )}
            <span>{resendBusy ? "Đang gửi lại…" : "Gửi lại mã OTP"}</span>
          </button>
        )}

        <div className="flex flex-col items-center gap-2.5 mt-6 text-sm font-bold text-text-muted">
          {type === "login" ? (
            <>
              <Link
                to="/forgot-password"
                className="text-primary font-black hover:underline"
              >
                Quên mật khẩu?
              </Link>
              <span className="text-xs font-bold">
                Đã được nhà trường cấp tài khoản?{" "}
                <Link
                  to="/verify-email"
                  className="text-primary font-black hover:underline"
                >
                  Kích hoạt email
                </Link>
              </span>
            </>
          ) : (
            <Link
              to="/login"
              className="text-primary font-black hover:underline"
            >
              Quay lại đăng nhập
            </Link>
          )}
        </div>

        {type === "login" && (
          <p className="mt-5 text-text-muted text-xs font-bold leading-relaxed text-center">
            Tài khoản sinh viên được nhà trường cấp; DormHub không mở đăng ký
            sinh viên công khai.
          </p>
        )}
      </motion.div>
    </AuthLayout>
  );
}
