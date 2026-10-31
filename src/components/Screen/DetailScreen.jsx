// ====================================
// DETAIL SCREEN - Màn hình chi tiết
// ====================================
// Hiển thị thông tin chi tiết của 1 item (hóa đơn, hợp đồng, đơn đăng ký...)
// Mục đích: Xem đầy đủ thông tin và thực hiện các actions (duyệt, từ chối...)

import { useParams, useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { resources } from "../../services/resource.service";
import { errorMessage } from "../../utils/errorHandler";
import { FIELD_LABELS } from "./constants";
import { formatValue } from "./formatters";
import { Notice, Loading, Empty, Heading, SystemInfo } from "./UIComponents";
import { useLoad } from "./useLoad";

/**
 * Component DetailScreen - Hiển thị chi tiết 1 record
 * @param {object} props
 * @param {object} props.config - Cấu hình màn hình
 * 
 * Config structure:
 * {
 *   resource: "/invoices",  // API endpoint
 *   single: false,  // true nếu không cần ID (vd: /profile)
 *   edit: "/student/profile",  // Link chỉnh sửa
 *   actions: [  // Các actions có thể thực hiện
 *     { label: "Duyệt", method: "POST", suffix: "/approve", confirm: true },
 *     { label: "Từ chối", method: "POST", suffix: "/reject", reason: true }
 *   ]
 * }
 */
export default function DetailScreen({ config }) {
  // Lấy ID từ URL params (vd: /invoices/123 -> id = "123")
  const { id } = useParams();
  
  // Hook navigate để chuyển trang
  const navigate = useNavigate();
  
  // State cho loading của action buttons
  const [busy, setBusy] = useState(false);
  
  // State cho lỗi khi thực hiện action
  const [actionError, setActionError] = useState("");
  
  // State cho thông báo thành công
  const [success, setSuccess] = useState("");
  
  // Xác định API path
  // - Nếu single = true: dùng resource trực tiếp (vd: /profile)
  // - Nếu single = false: thêm ID vào path (vd: /invoices/123)
  const path = config.single
    ? config.resource
    : `${config.resource}/${encodeURIComponent(id)}`;
  
  // Load data từ API
  const { data, error, loading, reload } = useLoad(path, {});
  
  /**
   * Thực hiện action (duyệt, từ chối, thanh toán...)
   * @param {object} action - Config của action
   */
  async function doAction(action) {
    // Nếu action yêu cầu confirm, hiển thị dialog xác nhận
    if (action.confirm && !window.confirm(`Xác nhận: ${action.label}?`)) {
      return;
    }
    
    let body = action.body;
    
    // Nếu action yêu cầu nhập lý do (vd: từ chối đơn)
    if (action.reason) {
      const reason = window.prompt("Nhập lý do từ chối");
      if (!reason?.trim()) return;
      body = { reason: reason.trim() };
    }
    
    // Nếu action yêu cầu nhập mã phòng (vd: phân phòng)
    if (action.room) {
      const roomId = window.prompt("Nhập mã phòng phù hợp để phân");
      if (!roomId?.trim()) return;
      body = { roomId: roomId.trim() };
    }
    
    // Nếu action là thanh toán
    if (action.payment) {
      const method = window.prompt(
        "Phương thức thanh toán: CASH hoặc BANK_TRANSFER",
        "BANK_TRANSFER",
      );
      if (!method) return;
      body = { invoiceId: id, method };
    }
    
    // Bắt đầu loading
    setBusy(true);
    setActionError("");
    setSuccess("");
    
    try {
      // Gọi API action
      await resources.action(
        action.payment
          ? "/payments"
          : `${config.resource}/${id}${action.suffix}`,
        action.method,
        body,
      );
      
      // Thành công -> hiển thị thông báo và reload data
      setSuccess("Thao tác đã được lưu trên máy chủ.");
      reload();
    } catch (e) {
      // Lỗi -> hiển thị thông báo lỗi
      setActionError(errorMessage(e));
    } finally {
      // Kết thúc loading
      setBusy(false);
    }
  }
  
  // Filter data: chỉ hiển thị các fields không phải object (trừ array)
  // Ví dụ: hiển thị id, name, status... nhưng không hiển thị nested object
  const entries =
    data && typeof data === "object"
      ? Object.entries(data).filter(
          ([, value]) =>
            (value !== null && typeof value !== "object") ||
            Array.isArray(value),
        )
      : [];
  
  return (
    <>
      {/* Heading với breadcrumb và action buttons */}
      <Heading config={config}>
        {/* Nút quay lại */}
        <button className="button subtle" onClick={() => navigate(-1)}>
          Quay lại
        </button>
        
        {/* Nút chỉnh sửa (nếu có) */}
        {config.edit && (
          <Link className="button primary" to={`${config.edit}/${id}/edit`}>
            Chỉnh sửa
          </Link>
        )}
        
        {/* Action buttons (duyệt, từ chối, thanh toán...) */}
        {config.actions?.map((action) => (
          <button
            key={action.label}
            className="button primary"
            disabled={busy || loading}
            onClick={() => doAction(action)}
          >
            {action.label}
          </button>
        ))}
      </Heading>
      
      {/* Thông báo lỗi hoặc thành công */}
      <Notice error={actionError || error} success={success} />
      
      {/* Hiển thị loading, empty, hoặc chi tiết */}
      {loading ? (
        <Loading />
      ) : !data ? (
        <Empty />
      ) : (
        <div className="detail-grid">
          {/* Panel hiển thị thông tin chi tiết */}
          <div className="panel">
            <div className="section-title">Thông tin chi tiết</div>
            
            {/* Grid hiển thị key-value pairs */}
            <div className="kv-grid">
              {entries.map(([key, value]) => (
                <div className="kv" key={key}>
                  {/* Label: lấy từ FIELD_LABELS hoặc dùng key */}
                  <span>{FIELD_LABELS[key] || key}</span>
                  
                  {/* Value: format bằng formatValue */}
                  <strong>{formatValue(key, value)}</strong>
                </div>
              ))}
            </div>
          </div>
          
          {/* Panel thông tin hệ thống */}
          <SystemInfo />
        </div>
      )}
    </>
  );
}
