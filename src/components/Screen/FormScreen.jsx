// ====================================
// FORM SCREEN - Màn hình tạo mới/chỉnh sửa
// ====================================
// Dùng cho: tạo phòng mới, tạo hóa đơn, chỉnh sửa thông tin...
// Mục đích: Form nhập liệu với validation

import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { resources } from "../../services/resource.service";
import { errorMessage } from "../../utils/errorHandler";
import { FIELD_LABELS, FIELD_CONFIGS } from "./constants";
import { Notice, Loading, Heading } from "./UIComponents";
import { useLoad } from "./useLoad";
import { Input, Button } from "../ui";

/**
 * Component FormFields - Render các input fields
 * @param {object} props
 * @param {string[]} props.names - Danh sách tên fields cần hiển thị
 * @param {object} props.values - Object chứa giá trị của các fields
 * @param {function} props.onChange - Callback khi user thay đổi giá trị
 * 
 * Ví dụ:
 * <FormFields
 *   names={["fullName", "email", "phone"]}
 *   values={{ fullName: "Nguyễn Văn A", email: "a@email.com" }}
 *   onChange={(key, value) => console.log(key, value)}
 * />
 */
function FormFields({ names, values, onChange }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {names.map((key) => {
        // Lấy cấu hình của field từ FIELD_CONFIGS
        const meta = FIELD_CONFIGS[key] || {};
        
        return (
          <label
            className={`flex flex-col gap-1.5 ${meta.tag === "textarea" ? "md:col-span-2" : ""}`}
            key={key}
          >
            {/* Label của field */}
            <span className="text-sm font-[family-name:var(--font-family-display)] font-medium text-[var(--color-text)]">
              {FIELD_LABELS[key] || key}
            </span>
            
            {/* Render input tùy theo loại field */}
            
            {/* 1. Textarea - cho nội dung dài */}
            {meta.tag === "textarea" ? (
              <textarea
                required={!["description", "note"].includes(key)}
                value={values[key] ?? ""}
                onChange={(e) => onChange(key, e.target.value)}
                rows={4}
                placeholder={`Nhập ${FIELD_LABELS[key]?.toLowerCase()}`}
                className="border-2 border-[var(--color-line)] rounded-[var(--radius-md)] px-4 py-2.5 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 resize-none transition-all"
              />
              
            /* 2. Select - cho dropdown với options */
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
              
            /* 3. Input - cho text, number, date, email... */
            ) : (
              <Input
                required={!["description", "note"].includes(key)}
                type={meta.type || "text"}
                min={meta.min}
                max={meta.max}
                value={values[key] ?? ""}
                onChange={(e) => onChange(key, e.target.value)}
                placeholder={`Nhập ${FIELD_LABELS[key]?.toLowerCase()}`}
              />
            )}
          </label>
        );
      })}
    </div>
  );
}

/**
 * Component FormScreen - Màn hình form tạo mới hoặc chỉnh sửa
 * @param {object} props
 * @param {object} props.config - Cấu hình màn hình
 * 
 * Config structure:
 * {
 *   resource: "/rooms",  // API endpoint
 *   fields: ["roomNumber", "buildingId", "capacity", "monthlyPrice"],  // Fields hiển thị
 *   edit: true,  // true nếu là form chỉnh sửa
 * }
 */
export default function FormScreen({ config }) {
  // Lấy ID từ URL (nếu là edit mode)
  const { id } = useParams();
  
  // Hook navigate để chuyển trang
  const navigate = useNavigate();
  
  // Hook location để lấy pathname hiện tại
  const location = useLocation();
  
  // State lưu giá trị các fields (chỉ lưu những gì user thay đổi)
  const [values, setValues] = useState({});
  
  // State cho loading của submit button
  const [busy, setBusy] = useState(false);
  
  // State cho error message
  const [error, setError] = useState("");
  
  // Load data nếu là edit mode
  const { data, loading } = useLoad(
    config.edit ? `${config.resource}/${id}` : config.resource,
    {},
  );
  
  // Merge data từ API với values từ state
  // - Nếu edit: data từ API + override bằng values user thay đổi
  // - Nếu create: chỉ có values
  const currentValues = config.edit ? { ...(data || {}), ...values } : values;
  
  /**
   * Handler khi user thay đổi giá trị
   * @param {string} key - Tên field
   * @param {any} value - Giá trị mới
   */
  const change = (key, value) =>
    setValues((prev) => ({ ...prev, [key]: value }));
  
  /**
   * Handler khi submit form
   * @param {Event} e - Submit event
   */
  async function submit(e) {
    // Prevent default form submission (tránh reload trang)
    e.preventDefault();
    
    // Bắt đầu loading
    setBusy(true);
    setError("");
    
    try {
      // Tạo body object chỉ chứa các fields được config
      const body = Object.fromEntries(
        config.fields.map((key) => [key, currentValues[key]]),
      );
      
      // Gọi API create hoặc update
      const result = config.edit
        ? await resources.update(config.resource, id, body)
        : await resources.create(config.resource, body);
      
      // Thành công -> navigate về trang trước với thông báo success
      navigate(
        config.edit
          ? location.pathname.replace(/\/edit$/, "")
          : config.resource === "/maintenance-requests"
            ? "/student/maintenance"
            : config.resource === "/notifications"
              ? "/manager"
              : location.pathname.replace(/\/new$/, ""),
        {
          state: {
            success: `Đã lưu ${result?.id ? `mã ${result.id}` : "thành công"}.`,
          },
        },
      );
    } catch (e) {
      // Lỗi -> hiển thị error message
      setError(errorMessage(e));
    } finally {
      // Kết thúc loading
      setBusy(false);
    }
  }
  
  return (
    <>
      {/* Heading với breadcrumb */}
      <Heading config={config} />
      
      {/* Thông báo lỗi */}
      <Notice error={error} />
      
      {/* Panel chứa form */}
      <div className="bg-white border-2 border-[var(--color-line)] rounded-[var(--radius-lg)] p-6">
        {/* Nếu edit mode và đang loading -> hiển thị Loading */}
        {config.edit && loading ? (
          <Loading />
        ) : (
          <form onSubmit={submit}>
            {/* Render các input fields */}
            <FormFields
              names={config.fields}
              values={currentValues}
              onChange={change}
            />
            
            {/* Form actions: nút Hủy và Lưu */}
            <div className="flex gap-3 mt-6">
              {/* Nút Hủy - quay lại trang trước */}
              <Button
                variant="secondary"
                type="button"
                onClick={() => navigate(-1)}
              >
                Hủy
              </Button>
              
              {/* Nút Lưu - submit form */}
              <Button
                variant="primary"
                size="lg"
                type="submit"
                loading={busy}
                disabled={busy}
                className="flex-1"
              >
                {busy ? "Đang lưu…" : "Lưu thông tin"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}
