// ====================================
// APPLICATION SCREEN - Màn hình đăng ký nội trú
// ====================================
// Form đăng ký phòng với multi-step (stepper)
// Mục đích: Hướng dẫn sinh viên qua các bước đăng ký

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { asList } from "../../api/apiClient";
import { resources } from "../../services/resource.service";
import { errorMessage } from "../../utils/errorHandler";
import { money } from "../../utils/format";
import { FIELD_CONFIGS } from "./constants";
import { Notice, Loading, Empty, Heading } from "./UIComponents";
import { useLoad } from "./useLoad";

/**
 * Component FormFields - Render input fields (simplified version)
 */
function FormFields({ names, values, onChange }) {
  const FIELD_LABELS = {
    expectedCheckInDate: "Ngày nhận phòng dự kiến",
    note: "Ghi chú",
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
          ) : (
            <input
              required={!["description", "note"].includes(key)}
              type={meta.type || "text"}
              min={meta.min}
              max={meta.max}
              value={values[key] ?? ""}
              onChange={(e) => onChange(key, e.target.value)}
              className="border-2 border-[var(--color-line)] rounded-[var(--radius-md)] px-4 py-2.5 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all"
            />
          )}
        </label>
      );
      })}
    </div>
  );
}

/**
 * Component ApplicationScreen - Form đăng ký nội trú với stepper
 * @param {object} props
 * @param {object} props.config - Cấu hình màn hình
 * 
 * Các bước:
 * 0. Thông tin sinh viên (chỉ hiển thị notice)
 * 1. Chọn nguyện vọng phòng
 * 2. Ngày nhận phòng
 * 3. Kiểm tra và gửi
 */
export default function ApplicationScreen({ config }) {
  // Hook navigate để chuyển trang
  const navigate = useNavigate();
  
  // State cho bước hiện tại (0-3)
  const [step, setStep] = useState(0);
  
  // State lưu giá trị form
  const [values, setValues] = useState({});
  
  // State cho error message
  const [error, setError] = useState("");
  
  // State cho loading của submit button
  const [busy, setBusy] = useState(false);
  
  // Load danh sách phòng trống
  const { data: rooms, loading } = useLoad("/rooms", {
    availableOnly: true,
    size: 100,
  });
  
  // Định nghĩa các bước
  const steps = [
    "Thông tin sinh viên",
    "Chọn nguyện vọng",
    "Ngày nhận phòng",
    "Kiểm tra và gửi",
  ];
  
  /**
   * Handler khi user thay đổi giá trị
   * @param {string} key - Tên field
   * @param {any} value - Giá trị mới
   */
  const change = (key, value) =>
    setValues((prev) => ({ ...prev, [key]: value }));
  
  /**
   * Handler khi click "Tiếp tục" hoặc "Gửi hồ sơ"
   * @param {Event} e - Submit event
   */
  async function next(e) {
    e.preventDefault();
    
    // Nếu chưa phải bước cuối -> chuyển sang bước tiếp theo
    if (step < 3) {
      setStep(step + 1);
      return;
    }
    
    // Bước cuối -> submit form
    setBusy(true);
    setError("");
    
    try {
      // Gọi API tạo application
      const result = await resources.create("/applications", values);
      
      // Thành công -> navigate đến trang chi tiết application
      navigate(`/student/applications/${result?.id}`, { replace: true });
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
      
      {/* Stepper - Hiển thị các bước */}
      <div className="flex items-center justify-between mb-8 px-4">
        {steps.map((name, i) => (
          <div
            className={`flex items-center gap-3 flex-1 ${i === step ? "text-[var(--color-primary)]" : i < step ? "text-[var(--color-text)]" : "text-[var(--color-text-muted)]"}`}
            key={name}
          >
            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-[family-name:var(--font-family-display)] font-bold ${i === step ? "bg-[var(--color-primary)] text-white" : i < step ? "bg-[var(--color-primary)] text-white" : "bg-[var(--color-surface-2)] text-[var(--color-text-muted)]"}`}>{i + 1}</span>
            <span className="text-sm font-[family-name:var(--font-family-display)] font-semibold hidden sm:inline">{name}</span>
            {i < steps.length - 1 && <div className="flex-1 h-0.5 bg-[var(--color-line)] mx-2" />}
          </div>
        ))}
      </div>
      
      {/* Thông báo lỗi */}
      <Notice error={error} />
      
      {/* Panel chứa form */}
      <div className="bg-white border-2 border-[var(--color-line)] rounded-[var(--radius-lg)] p-6">
        <form onSubmit={next}>
          {/* Render content tùy theo bước */}
          
          {/* Bước 0: Thông tin sinh viên */}
          {step === 0 ? (
            <div className="bg-[var(--color-primary)]/10 border-2 border-[var(--color-primary)]/30 rounded-[var(--radius-md)] p-4 text-sm text-[var(--color-primary)]">
              Hồ sơ sinh viên đã đăng nhập sẽ được hệ thống tự liên kết với đơn
              đăng ký. Hãy cập nhật hồ sơ trước khi tiếp tục.
            </div>
            
          /* Bước 1: Chọn phòng */
          ) : step === 1 ? (
            <>
              {loading ? (
                <Loading />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {asList(rooms).map((room) => (
                    <label
                      className={`border-2 rounded-[var(--radius-md)] p-4 cursor-pointer transition-all ${values.roomId === room.id ? "border-[var(--color-primary)] bg-[var(--color-primary-light)] ring-2 ring-[var(--color-primary)]/30" : "border-[var(--color-line)] hover:border-[var(--color-primary)]"}`}
                      key={room.id}
                    >
                      {/* Radio button */}
                      <input
                        type="radio"
                        name="roomId"
                        required
                        value={room.id}
                        checked={values.roomId === room.id}
                        onChange={() => change("roomId", room.id)}
                        className="sr-only"
                      />
                      
                      {/* Thông tin phòng */}
                      <strong className="block text-base font-[family-name:var(--font-family-display)] font-bold text-[var(--color-text)] mb-1">{room.roomNumber || room.name}</strong>
                      <span className="block text-sm text-[var(--color-text-muted)] mb-2">
                        {room.buildingName || room.building?.name} ·{" "}
                        {room.availableSlots ?? "—"} chỗ trống
                      </span>
                      <b className="text-lg text-[var(--color-primary)] font-bold">{money(room.monthlyPrice)}</b>
                    </label>
                  ))}
                </div>
              )}
              
              {/* Nếu không có phòng trống */}
              {!loading && asList(rooms).length === 0 && (
                <Empty text="Chưa có phòng trống." />
              )}
            </>
            
          /* Bước 2: Ngày nhận phòng */
          ) : step === 2 ? (
            <FormFields
              names={["expectedCheckInDate", "note"]}
              values={values}
              onChange={change}
            />
            
          /* Bước 3: Xác nhận thông tin */
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(values).map(([key, value]) => (
                <div className="flex flex-col gap-1" key={key}>
                  <span className="text-xs text-[var(--color-text-muted)] font-[family-name:var(--font-family-display)] font-semibold">{key}</span>
                  <strong className="text-sm text-[var(--color-text)] font-bold">{String(value)}</strong>
                </div>
              ))}
            </div>
          )}
          
          {/* Form actions: nút Quay lại và Tiếp tục/Gửi hồ sơ */}
          <div className="flex gap-3 mt-6">
            {/* Nút Quay lại (chỉ hiển thị từ bước 1) */}
            {step > 0 && (
              <button
                type="button"
                className="inline-flex items-center gap-2 px-6 py-2.5 border-2 border-[var(--color-line)] rounded-[var(--radius-md)] text-sm font-[family-name:var(--font-family-display)] font-bold text-[var(--color-text)] hover:bg-[var(--color-surface)] hover:border-[var(--color-line-strong)] transition-all"
                onClick={() => setStep(step - 1)}
              >
                Quay lại
              </button>
            )}
            
            {/* Nút Tiếp tục / Gửi hồ sơ */}
            <button
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[var(--color-primary)] text-white rounded-[var(--radius-md)] font-[family-name:var(--font-family-display)] font-bold text-sm hover:bg-[var(--color-primary-hover)] hover:shadow-[var(--shadow-md)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={busy || (step === 1 && !values.roomId)}
            >
              {step === 3 ? "Gửi hồ sơ" : "Tiếp tục"} <ArrowRight size={15} />
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
