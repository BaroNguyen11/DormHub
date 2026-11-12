// ====================================
// PROFILE SCREEN - Màn hình cập nhật hồ sơ (Neo-Brutalism)
// ====================================
import { useState } from "react";
import { toast } from "sonner";
import { Save, RefreshCw, Lock, ShieldCheck } from "lucide-react";
import { api } from "../../api/apiClient";
import { FIELD_CONFIGS, FIELD_LABELS } from "./constants";
import { Loading, Heading } from "./UIComponents";
import { useLoad } from "./useLoad";
import { CustomSelect } from "../ui/CustomSelect";
import { CustomDatePicker } from "../ui/CustomDatePicker";

/**
 * Component FormFields - Render các input fields chuẩn Neo-Brutalism
 */
function FormFields({ names, values, onChange, isCodeAlreadySaved }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {names.map((key) => {
        const meta = FIELD_CONFIGS[key] || {};
        // Mã SV chỉ khóa khi ĐÃ có mã; chưa có thì cho nhập một lần duy nhất
        const isDisabled =
          key === "fullName" || key === "gender" || (key === "studentCode" && isCodeAlreadySaved);

        return (
          <div
            className={`flex flex-col gap-2 ${
              meta.tag === "textarea" || key === "address"
                ? "md:col-span-2"
                : ""
            }`}
            key={key}
          >
            {/* Label + Badge khóa nếu là mã SV */}
            <div className="flex items-center justify-between text-sm font-extrabold text-text">
              <span>{FIELD_LABELS[key] || key}</span>
              {isDisabled && (
                <span className="text-[11px] font-extrabold text-text-muted flex items-center gap-1 bg-surface-2 px-2 py-0.5 rounded-md border-2 border-line-strong shadow-[1px_1px_0_#141413]">
                  <Lock size={12} strokeWidth={2.5} /> Không thể sửa
                </span>
              )}
            </div>

            {/* Render Input / CustomSelect / Textarea */}
            {meta.tag === "textarea" ? (
              <textarea
                required={!["description", "note"].includes(key)}
                value={values[key] ?? ""}
                onChange={(e) => onChange(key, e.target.value)}
                rows={4}
                placeholder={`Nhập ${FIELD_LABELS[key]?.toLowerCase() || key}...`}
                className="w-full border-3 border-line-strong rounded-sm px-4 py-3 text-sm font-bold text-text bg-surface shadow-[2px_2px_0_#141413] focus:shadow-[4px_4px_0_#141413] outline-none! resize-none transition-all placeholder:font-medium placeholder:text-text-muted/60"
              />
            ) : key === "gender" ? (
              <input
                type="text"
                value={meta.options?.find((option) => option.value === values[key])?.label || ""}
                disabled
                className="w-full border-3 border-line-strong rounded-sm px-4 py-3 text-sm font-bold text-text-muted bg-surface-2 shadow-none cursor-not-allowed"
              />
            ) : meta.options ? (
              <CustomSelect
                value={values[key] ?? ""}
                options={meta.options}
                placeholder={`-- Chọn ${FIELD_LABELS[key]?.toLowerCase() || key} --`}
                onChange={(val) => onChange(key, val)}
              />
            ) : meta.type === "date" ? (
              <CustomDatePicker
                value={values[key] ?? ""}
                max={meta.max}
                required={!isDisabled}
                onChange={(value) => onChange(key, value)}
              />
            ) : (
              <input
                required={!["description", "note", "cic"].includes(key)}
                type={meta.type || "text"}
                min={meta.min}
                max={meta.max}
                maxLength={key === "studentCode" ? 8 : key === "cic" ? 12 : undefined}
                inputMode={["studentCode", "cic"].includes(key) ? "numeric" : undefined}
                pattern={key === "studentCode" ? "[0-9]{8}" : key === "cic" ? "[0-9]{12}" : undefined}
                value={values[key] ?? ""}
                onChange={(e) =>
                  onChange(
                    key,
                    ["studentCode", "cic"].includes(key)
                      ? e.target.value.replace(/\D/g, "").slice(0, key === "cic" ? 12 : 8)
                      : e.target.value,
                  )
                }
                disabled={isDisabled}
                placeholder={`Nhập ${FIELD_LABELS[key]?.toLowerCase() || key}...`}
                className="w-full border-3 border-line-strong rounded-sm px-4 py-3 text-sm font-bold text-text bg-surface shadow-[2px_2px_0_#141413] focus:shadow-[4px_4px_0_#141413] outline-none! transition-all placeholder:font-medium placeholder:text-text-muted/60 disabled:bg-surface-2 disabled:text-text-muted disabled:cursor-not-allowed disabled:shadow-none"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Component ProfileScreen - Màn hình cập nhật hồ sơ cá nhân
 */
export default function ProfileScreen({ config }) {
  const { data, loading } = useLoad(config.resource, {});

  const [values, setValues] = useState({});
  const [savedProfile, setSavedProfile] = useState(null);
  const [busy, setBusy] = useState(false);

  const currentValues = { ...(savedProfile || data || {}), ...values };
  const isCodeAlreadySaved = Boolean((savedProfile || data)?.studentCode);
  const names = [
    "fullName",
    "studentCode",
    "cic",
    "phone",
    "gender",
    "dateOfBirth",
    "address",
  ];

  // Profile data loaded via useLoad hook
  // No action needed on data change

  async function submit(e) {
    e.preventDefault();
    setBusy(true);

    try {
      // Chỉ gửi các fields backend chấp nhận
      const allowedFields = [
        "studentCode",
        "cic",
        "phone",
        "dateOfBirth",
        "address",
        "avatarUrl",
      ];
      const body = {};
      allowedFields.forEach((key) => {
        const val = currentValues[key];
        if (val === undefined || val === null) return;
        if (key === "studentCode" && !String(val).trim()) return;
        body[key] = val;
      });

      const updatedProfile = await api(config.resource, {
        method: "PATCH",
        body,
      });

      setSavedProfile(updatedProfile);
      setValues({});
      toast.success("Lưu hồ sơ thành công!");
    } catch {
      // API client reports request failures globally.
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Heading tiêu đề trang */}
      <Heading config={config} />

      {/* Thông báo Lỗi / Thành công */}

      {loading ? (
        <Loading />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Card Form Chính (8 cột) */}
          <div className="lg:col-span-8 bg-surface border-4 border-line-strong rounded-sm p-6 sm:p-8 shadow-[6px_6px_0_#141413] space-y-6">
            {/* Card Header với Avatar viết tắt */}
            <div className="flex items-center gap-4 pb-6 border-b-3 border-line-strong">
              <div className="size-14 rounded-sm bg-warning border-3 border-line-strong flex items-center justify-center text-xl font-black text-text shadow-[3px_3px_0_#141413] shrink-0">
                {(currentValues?.fullName || "U").slice(0, 1).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-black text-text">
                  {currentValues?.fullName || "Hồ sơ cá nhân"}
                </h2>
                <p className="text-xs font-bold text-text-muted mt-0.5">
                  Mã SV: {currentValues?.studentCode || "Chưa cập nhật"}
                </p>
              </div>
            </div>

            <form onSubmit={submit} className="space-y-8">
              {/* Render các Input Fields */}
              <FormFields
                names={names}
                values={currentValues}
                isCodeAlreadySaved={isCodeAlreadySaved}
                onChange={(key, value) =>
                  setValues((prev) => ({ ...prev, [key]: value }))
                }
              />

              {/* Form Action: Nút Lưu */}
              <div className="flex justify-end pt-4 border-t-3 border-line-strong">
                <button
                  type="submit"
                  disabled={busy}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2 bg-primary text-black font-extrabold! text-sm! rounded-sm border-3 border-line-strong shadow-[3px_3px_0_#141413] hover:shadow-[5px_5px_0_#141413] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none transition-all cursor-pointer"
                >
                  {busy ? (
                    <RefreshCw
                      size={18}
                      strokeWidth={2.5}
                      className="animate-spin"
                    />
                  ) : (
                    <Save size={18} strokeWidth={2.5} />
                  )}
                  <span>{busy ? "Đang lưu..." : "Lưu hồ sơ"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Sidebar Thông tin Bảo mật KTX (4 cột) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-6 border-4 border-line-strong rounded-sm bg-surface-2 shadow-[6px_6px_0_#141413]">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="size-9 rounded-sm bg-primary border-2 border-line-strong flex items-center justify-center shadow-[1.5px_1.5px_0_#141413]">
                  <ShieldCheck
                    size={20}
                    className="text-text"
                    strokeWidth={2.5}
                  />
                </div>
                <h3 className="text-sm font-black text-text m-0">
                  Quyền riêng tư & Mã SV
                </h3>
              </div>
              <p className="text-xs font-semibold text-text-muted leading-relaxed m-0">
                Nếu hồ sơ chưa có mã sinh viên, bạn tự nhập mã 8 chữ số một lần
                duy nhất. Sau khi đã lưu, mã không thể thay đổi — nếu sai sót
                vui lòng liên hệ trực tiếp Ban quản lý DormHub để được hỗ trợ.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
