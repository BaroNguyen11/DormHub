import { useState } from "react";
import { toast } from "sonner";
import { resources } from "../../services/resource.service";
import { Heading } from "./UIComponents";

function calculateStrength(password) {
  return [
    password.length >= 8,
    /[A-Z]/.test(password) && /[a-z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;
}

function getStrengthHint(password) {
  const suggestions = [];
  if (password.length < 8) suggestions.push("ít nhất 8 ký tự");
  if (!(/[A-Z]/.test(password) && /[a-z]/.test(password))) {
    suggestions.push("chữ hoa và chữ thường");
  }
  if (!/\d/.test(password)) suggestions.push("chữ số");
  if (!/[^A-Za-z0-9]/.test(password)) suggestions.push("ký tự đặc biệt");
  return suggestions.length
    ? `Cần bổ sung ${suggestions.join(", ")}.`
    : "Mật khẩu đáp ứng đầy đủ các tiêu chí bảo mật.";
}

export default function StudentAccountForm({ student, onSuccess, onCancel }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState(student?.email || "");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const passwordStrength = calculateStrength(password);
  const strengthLabels = [
    "Mật khẩu quá yếu",
    "Mật khẩu trung bình",
    "Mật khẩu khá mạnh",
    "Mật khẩu rất mạnh",
  ];
  const strengthColors = ["bg-error", "bg-warning", "bg-blue-300", "bg-success"];

  async function submit(event) {
    event.preventDefault();
    if (!student?.studentId) {
      toast.error("Không tìm thấy mã sinh viên cần cấp tài khoản.");
      return;
    }

    setBusy(true);
    try {
      const response = await resources.action(
        `/manager/students/${student.studentId}/account`,
        "POST",
        { username, email, password },
        { successNotify: false, includeResponse: true },
      );
      toast.success(
        response?.message ||
          `Cấp tài khoản thành công cho sinh viên ${student.fullName}.`,
      );
      onSuccess?.();
    } catch {
      // API client displays the backend validation or business error.
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <Heading
        config={{ group: "manager", title: "Cấp tài khoản sinh viên" }}
      >
        <button
          type="button"
          onClick={onCancel}
          className="border-2 border-line-strong bg-surface px-3 py-2 text-sm font-bold shadow-[2px_2px_0_#141413]"
        >
          Quay lại danh sách
        </button>
      </Heading>

      <form
        onSubmit={submit}
        className="space-y-5 border-4 border-line-strong bg-surface p-6 shadow-[5px_5px_0_#141413]"
      >
        <div>
          <h2 className="text-lg font-black">Thông tin sinh viên</h2>
          <p className="mt-1 text-sm font-semibold text-text-muted">
            Tài khoản mới sẽ được liên kết trực tiếp với hồ sơ sinh viên này.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-bold">
            Mã hồ sơ sinh viên
            <input
              value={student?.studentId ?? ""}
              readOnly
              className="mt-1 w-full border-2 rounded-sm outline-none! shadow-[2px_2px_0_#141413] hover:shadow-[3px_3px_0_#141413] transition-all border-line-strong bg-surface-2 px-3 py-2"
            />
          </label>
          <label className="text-sm font-bold">
            Mã sinh viên
            <input
              value={student?.studentCode || ""}
              readOnly
              placeholder="Chưa có mã sinh viên"
              className="mt-1 w-full border-2 rounded-sm  outline-none! shadow-[2px_2px_0_#141413] hover:shadow-[3px_3px_0_#141413] transition-all  border-line-strong bg-surface-2 px-3 py-2"
            />
          </label>
          <label className="text-sm font-bold sm:col-span-2">
            Họ và tên
            <input
              value={student?.fullName || ""}
              readOnly
              className="mt-1 w-full border-2 border-line-strong bg-surface-2 px-3 py-2 rounded-sm  outline-none! shadow-[2px_2px_0_#141413] hover:shadow-[3px_3px_0_#141413] transition-all  "
            />
          </label>
          <label className="text-sm font-bold sm:col-span-2">
            Email
            <input
              type="email"
              required
              maxLength={50}
              value={email}
              readOnly={Boolean(student?.email)}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 w-full border-2 border-line-strong bg-surface-2 px-3 py-2 read-only:cursor-not-allowed rounded-sm  outline-none! shadow-[2px_2px_0_#141413] hover:shadow-[3px_3px_0_#141413] transition-all  "
            />
          </label>
        </div>

        <div className="border-t-2 border-line-strong pt-5">
          <h2 className="text-lg font-black">Thông tin tài khoản</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-bold">
              Tên đăng nhập
              <input
                required
                maxLength={50}
                autoComplete="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="mt-1 w-full border-2 border-line-strong bg-surface px-3 py-2 rounded-sm  outline-none! shadow-[2px_2px_0_#141413] hover:shadow-[3px_3px_0_#141413] transition-all  "
              />
            </label>
            <label className="text-sm font-bold">
              Mật khẩu khởi tạo
              <input
                required
                type="password"
                minLength={8}
                maxLength={72}
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-1 w-full border-2 border-line-strong bg-surface px-3 py-2 rounded-sm  outline-none! shadow-[2px_2px_0_#141413] hover:shadow-[3px_3px_0_#141413] transition-all  "
              />
              {password && (
                <div className="mt-2" aria-live="polite">
                  <div
                    className="grid grid-cols-4 gap-1.5"
                    aria-label={strengthLabels[Math.max(1, passwordStrength) - 1]}
                  >
                    {strengthColors.map((color, index) => (
                      <span
                        key={color}
                        className={`h-2 rounded-xs border-2 border-line-strong transition-all duration-300 ${index < Math.max(1, passwordStrength) ? color : "bg-surface-2"}`}
                      />
                    ))}
                  </div>
                  <p className="mt-1.5 text-xs font-extrabold text-text">
                    {strengthLabels[Math.max(1, passwordStrength) - 1]}
                  </p>
                  <p className="text-xs font-semibold text-text-muted">
                    {getStrengthHint(password)}
                  </p>
                </div>
              )}
            </label>
          </div>
          <p className="mt-3 text-xs font-medium text-text-muted">
            Tài khoản được kích hoạt ngay sau khi cấp. Chia sẻ tên đăng nhập và mật khẩu khởi tạo trực tiếp với sinh viên.
          </p>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={busy}
            className="border-3 border-line-strong bg-primary px-4 rounded-sm  outline-none! hover:shadow-[3px_3px_0_#141413] transition-all   py-2 font-black! text-sm! text-black shadow-[2px_2px_0_#141413] disabled:cursor-not-allowed disabled:opacity-50 hover:-translate-0.5 active:translate-0 active:shadow-none  "
          >
            {busy ? "Đang cấp tài khoản..." : "Cấp tài khoản"}
          </button>
        </div>
      </form>
    </div>
  );
}
