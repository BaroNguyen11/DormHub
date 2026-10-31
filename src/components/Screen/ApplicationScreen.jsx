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
            ) : (
              <input
                required={!["description", "note"].includes(key)}
                type={meta.type || "text"}
                min={meta.min}
                max={meta.max}
                value={values[key] ?? ""}
                onChange={(e) => onChange(key, e.target.value)}
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
      <div className="stepper">
        {steps.map((name, i) => (
          <div
            className={i === step ? "current" : i < step ? "done" : ""}
            key={name}
          >
            <span>{i + 1}</span>
            {name}
          </div>
        ))}
      </div>
      
      {/* Thông báo lỗi */}
      <Notice error={error} />
      
      {/* Panel chứa form */}
      <div className="panel form-panel">
        <form onSubmit={next}>
          {/* Render content tùy theo bước */}
          
          {/* Bước 0: Thông tin sinh viên */}
          {step === 0 ? (
            <div className="notice info">
              Hồ sơ sinh viên đã đăng nhập sẽ được hệ thống tự liên kết với đơn
              đăng ký. Hãy cập nhật hồ sơ trước khi tiếp tục.
            </div>
            
          /* Bước 1: Chọn phòng */
          ) : step === 1 ? (
            <>
              {loading ? (
                <Loading />
              ) : (
                <div className="room-choices">
                  {asList(rooms).map((room) => (
                    <label
                      className={`room-choice ${values.roomId === room.id ? "selected" : ""}`}
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
                      />
                      
                      {/* Thông tin phòng */}
                      <strong>{room.roomNumber || room.name}</strong>
                      <span>
                        {room.buildingName || room.building?.name} ·{" "}
                        {room.availableSlots ?? "—"} chỗ trống
                      </span>
                      <b>{money(room.monthlyPrice)}</b>
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
            <div className="kv-grid">
              {Object.entries(values).map(([key, value]) => (
                <div className="kv" key={key}>
                  <span>{key}</span>
                  <strong>{String(value)}</strong>
                </div>
              ))}
            </div>
          )}
          
          {/* Form actions: nút Quay lại và Tiếp tục/Gửi hồ sơ */}
          <div className="form-actions">
            {/* Nút Quay lại (chỉ hiển thị từ bước 1) */}
            {step > 0 && (
              <button
                type="button"
                className="button subtle"
                onClick={() => setStep(step - 1)}
              >
                Quay lại
              </button>
            )}
            
            {/* Nút Tiếp tục / Gửi hồ sơ */}
            <button
              className="button primary"
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
