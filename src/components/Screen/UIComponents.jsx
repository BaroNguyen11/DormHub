// ====================================
// UI COMPONENTS - Các component UI nhỏ
// ====================================
// File này chứa các component UI tái sử dụng
// Mục đích: Tránh lặp code, dễ bảo trì

import { RefreshCw, Search, ShieldCheck } from "lucide-react";

/**
 * Component hiển thị thông báo lỗi hoặc thành công
 * @param {object} props
 * @param {string} props.error - Thông báo lỗi (nếu có)
 * @param {string} props.success - Thông báo thành công (nếu có)
 * 
 * Ví dụ:
 * <Notice error="Không tìm thấy dữ liệu" />
 * <Notice success="Lưu thành công!" />
 */
export function Notice({ error, success }) {
  // Nếu không có error và success thì không hiển thị gì
  if (!error && !success) return null;

  return (
    <>
      {/* Hiển thị thông báo lỗi với icon ⚠️ */}
      {error && (
        <div role="alert" className="notice error">
          {error}
        </div>
      )}
      
      {/* Hiển thị thông báo thành công với icon ✅ */}
      {success && (
        <div role="status" className="notice success">
          {success}
        </div>
      )}
    </>
  );
}

/**
 * Component hiển thị khi đang loading
 * Hiển thị icon spinner xoay tròn và text "Đang tải dữ liệu…"
 */
export function Loading() {
  return (
    <div className="empty-state">
      {/* Icon xoay tròn (class "spin" được định nghĩa trong CSS) */}
      <RefreshCw className="spin" size={21} />
      <strong>Đang tải dữ liệu…</strong>
    </div>
  );
}

/**
 * Component hiển thị khi không có dữ liệu
 * @param {object} props
 * @param {string} props.text - Text tùy chỉnh (mặc định: "Chưa có dữ liệu phù hợp.")
 * 
 * Ví dụ:
 * <Empty />
 * <Empty text="Chưa có phòng trống." />
 */
export function Empty({ text = "Chưa có dữ liệu phù hợp." }) {
  return (
    <div className="empty-state">
      <Search size={22} />
      <strong>{text}</strong>
      <p>Dữ liệu sẽ xuất hiện khi máy chủ có thông tin tương ứng.</p>
    </div>
  );
}

/**
 * Component heading cho page
 * Hiển thị breadcrumb, title, subheading và các action buttons
 * 
 * @param {object} props
 * @param {object} props.config - Config của screen (chứa group, title)
 * @param {React.ReactNode} props.children - Action buttons (vd: nút "Tạo mới")
 * 
 * Ví dụ:
 * <Heading config={config}>
 *   <button>Tạo mới</button>
 * </Heading>
 */
export function Heading({ config, children }) {
  return (
    <div className="page-heading">
      <div>
        {/* Breadcrumb: DORMHUB / STUDENT hoặc DORMHUB / MANAGER */}
        <p className="eyebrow">DORMHUB / {config.group.toUpperCase()}</p>
        
        {/* Title chính của page */}
        <h1>{config.title}</h1>
        
        {/* Subheading mô tả ngắn gọn */}
        <p className="subheading">
          Quản lý thông tin và theo dõi tiến trình trên cùng một không gian.
        </p>
      </div>
      
      {/* Khu vực chứa các action buttons */}
      <div className="heading-actions">{children}</div>
    </div>
  );
}

/**
 * Component hiển thị thông tin hệ thống (dùng trong DetailScreen)
 * Hiển thị icon shield và text thông báo
 */
export function SystemInfo() {
  return (
    <div className="panel tinted">
      <ShieldCheck size={25} />
      <h3>Thông tin từ hệ thống</h3>
      <p>
        Dữ liệu được tải từ API DormHub. Nếu cần điều chỉnh, hãy dùng thao tác
        phù hợp với vai trò của bạn.
      </p>
    </div>
  );
}
