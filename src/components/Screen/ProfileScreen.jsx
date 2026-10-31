// ====================================
// PROFILE SCREEN - Màn hình cập nhật hồ sơ
// ====================================
// Cho phép user cập nhật thông tin cá nhân
// Mục đích: Form chỉnh sửa profile với các field cố định

import { useState } from "react";
import { api } from "../../api/apiClient";
import { errorMessage } from "../../utils/errorHandler";
import { FIELD_CONFIGS } from "./constants";
import { Notice, Loading, Heading } from "./UIComponents";
import { useLoad } from "./useLoad";

/**
 * Component FormFields - Render các input fields (copy từ FormScreen)
 * TODO: Nên extract thành shared component
 */
function FormFields({ names, values, onChange }) {
  const FIELD_LABELS = {
    fullName: "Họ và tên",
    studentCode: "Mã sinh viên",
    phone: "Số điện thoại",
    gender: "Giới tính",
    address: "Địa chỉ",
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {names.map((key) => {
        const meta = FIELD_CONFIGS[key] || {};
        
      return (
        <label
          className={`flex flex-col gap-1.5 ${meta.tag === "textarea" ? "md:col-span-2" : ""}`}
          key={key}
        >
          <span className="text-sm font-[family-name:var(--font-family-display)] font-semibold text-[var(--color-text)]">{FIELD_LABELS[key] || key}</span>
          
          {meta.tag === "textarea" ? (
            <textarea
              required={!["description", "note"].includes(key)}
              value={values[key] ?? ""}
              onChange={(e) => onChange(key, e.target.value)}
              rows={4}
              className="border-2 border-[var(--color-line)] rounded-[var(--radius-md)] px-4 py-2.5 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 resize-none transition-all"
            />
          ) : meta.options ? (
            <select
              value={values[key] ?? ""}
              required
              onChange={(e) => onChange(key, e.target.value)}
              className="border-2 border-[var(--color-line)] rounded-[var(--radius-md)] px-4 py-2.5 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all"
            >
              <option value="">Chọn {FIELD_LABELS[key]?.toLowerCase()}</option>
              {meta.options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          ) : (
            <input
              required={!["description", "note"].includes(key)}
              type={meta.type || "text"}
              min={meta.min}
              max={meta.max}
              value={values[key] ?? ""}
              onChange={(e) => onChange(key, e.target.value)}
              disabled={key === "studentCode"} // Mã SV không được sửa
              className="border-2 border-[var(--color-line)] rounded-[var(--radius-md)] px-4 py-2.5 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all disabled:bg-[var(--color-surface-2)] disabled:cursor-not-allowed disabled:opacity-50"
            />
          )}
        </label>
      );
      })}
    </div>
  );
}

/**
 * Component ProfileScreen - Màn hình cập nhật profile
 * @param {object} props
 * @param {object} props.config - Cấu hình màn hình
 * 
 * Config structure:
 * {
 *   resource: "/students/profile",  // API endpoint
 * }
 */
export default function ProfileScreen({ config }) {
  // Load profile data từ API
  const { data, error, loading, reload } = useLoad(config.resource, {});
  
  // State lưu giá trị các fields (chỉ lưu những gì user thay đổi)
  const [values, setValues] = useState({});
  
  // State cho loading của submit button
  const [busy, setBusy] = useState(false);
  
  // State cho error khi save
  const [saveError, setSaveError] = useState("");
  
  // State cho thông báo thành công
  const [success, setSuccess] = useState("");
  
  // Merge data từ API với values từ state
  const currentValues = { ...(data || {}), ...values };
  
  // Các fields được phép chỉnh sửa
  const names = ["fullName", "studentCode", "phone", "gender", "address"];
  
  /**
   * Handler khi submit form
   * @param {Event} e - Submit event
   */
  async function submit(e) {
    e.preventDefault();
    
    // Bắt đầu loading
    setBusy(true);
    setSaveError("");
    setSuccess("");
    
    try {
      // Gọi API PATCH để cập nhật profile
      // Lọc bỏ studentCode (không được sửa)
      await api(config.resource, {
        method: "PATCH",
        body: Object.fromEntries(
          names
            .filter((key) => key !== "studentCode")
            .map((key) => [key, currentValues[key]]),
        ),
      });
      
      // Thành công -> hiển thị thông báo và reload data
      setSuccess("Hồ sơ đã được cập nhật.");
      reload();
    } catch (e) {
      // Lỗi -> hiển thị error message
      setSaveError(errorMessage(e));
    } finally {
      // Kết thúc loading
      setBusy(false);
    }
  }
  
  return (
    <>
      {/* Heading với breadcrumb */}
      <Heading config={config} />
      
      {/* Thông báo lỗi hoặc thành công */}
      <Notice error={saveError || error} success={success} />
      
      {/* Hiển thị loading hoặc form */}
      {loading ? (
        <Loading />
      ) : (
        <div className="bg-white border-2 border-[var(--color-line)] rounded-[var(--radius-lg)] p-6">
          <form onSubmit={submit}>
            {/* Render các input fields */}
            <FormFields
              names={names}
              values={currentValues}
              onChange={(key, value) =>
                setValues((prev) => ({ ...prev, [key]: value }))
              }
            />
            
            {/* Form actions: chỉ có nút Lưu */}
            <div className="flex gap-3 mt-6">
              <button className="inline-flex items-center gap-2 px-6 py-2.5 bg-[var(--color-primary)] text-white rounded-[var(--radius-md)] font-[family-name:var(--font-family-display)] font-bold text-sm hover:bg-[var(--color-primary-hover)] hover:shadow-[var(--shadow-md)] transition-all disabled:opacity-50 disabled:cursor-not-allowed" disabled={busy}>
                Lưu hồ sơ
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
