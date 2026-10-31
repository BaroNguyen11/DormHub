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
    <div className="form-grid">
      {names.map((key) => {
        const meta = FIELD_CONFIGS[key] || {};
        
        return (
          <label
            className={`field ${meta.tag === "textarea" ? "wide" : ""}`}
            key={key}
          >
            <span>{FIELD_LABELS[key] || key}</span>
            
            {meta.tag === "textarea" ? (
              <textarea
                required={!["description", "note"].includes(key)}
                value={values[key] ?? ""}
                onChange={(e) => onChange(key, e.target.value)}
                rows={4}
              />
            ) : meta.options ? (
              <select
                value={values[key] ?? ""}
                required
                onChange={(e) => onChange(key, e.target.value)}
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
        <div className="panel form-panel">
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
            <div className="form-actions">
              <button className="button primary" disabled={busy}>
                Lưu hồ sơ
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
