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
        <div role="alert" className="px-4 py-3 rounded-[var(--radius-md)] mb-6 text-sm leading-relaxed bg-[var(--color-error)]/10 text-[var(--color-error)] border-2 border-[var(--color-error)]/30">
          {error}
        </div>
      )}
      
      {/* Hiển thị thông báo thành công với icon ✅ */}
      {success && (
        <div role="status" className="px-4 py-3 rounded-[var(--radius-md)] mb-6 text-sm leading-relaxed bg-[var(--color-success)]/10 text-[var(--color-success)] border-2 border-[var(--color-success)]/30">
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
    <div className="py-20 text-center text-[var(--color-text-muted)]">
      {/* Icon xoay tròn (class "spin" được định nghĩa trong CSS) */}
      <RefreshCw className="animate-spin inline-block mb-3" size={21} />
      <strong className="block text-sm font-[family-name:var(--font-family-display)] font-semibold">Đang tải dữ liệu…</strong>
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
    <div className="py-20 text-center text-[var(--color-text-muted)]">
      <Search size={22} className="inline-block mb-3" />
      <strong className="block text-sm font-[family-name:var(--font-family-display)] font-semibold text-[var(--color-text)] mb-2">{text}</strong>
      <p className="text-xs text-[var(--color-text-muted)] m-0">Dữ liệu sẽ xuất hiện khi máy chủ có thông tin tương ứng.</p>
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
    <div className="flex justify-between items-start gap-6 mb-8 max-[760px]:flex-col">
      <div>
        {/* Breadcrumb: DORMHUB / STUDENT hoặc DORMHUB / MANAGER */}
        <p className="text-[10px] font-extrabold tracking-[0.15em] text-[var(--color-text-muted)] uppercase m-0 mb-3">DORMHUB / {config.group.toUpperCase()}</p>
        
        {/* Title chính của page */}
        <h1 className="m-0 mb-2 text-3xl font-[family-name:var(--font-family-display)] font-bold tracking-tight text-[var(--color-text)] leading-tight">
          {config.title}
        </h1>
        
        {/* Subheading mô tả ngắn gọn */}
        <p className="text-[var(--color-text-muted)] text-sm leading-[1.8] m-0">
          Quản lý thông tin và theo dõi tiến trình trên cùng một không gian.
        </p>
      </div>
      
      {/* Khu vực chứa các action buttons */}
      <div className="flex gap-3 flex-wrap max-[760px]:justify-start">{children}</div>
    </div>
  );
}

/**
 * Component hiển thị thông tin hệ thống (dùng trong DetailScreen)
 * Hiển thị icon shield và text thông báo
 */
export function SystemInfo() {
  return (
    <div className="p-6 border-2 border-[var(--color-line)] rounded-[var(--radius-md)] bg-[var(--color-surface)] text-[var(--color-text-muted)]">
      <ShieldCheck size={25} className="mb-3 text-[var(--color-primary)]" />
      <h3 className="text-sm font-[family-name:var(--font-family-display)] font-bold text-[var(--color-text)] m-0 mb-2">Thông tin từ hệ thống</h3>
      <p className="text-xs text-[var(--color-text-muted)] leading-relaxed m-0">
        Dữ liệu được tải từ API DormHub. Nếu cần điều chỉnh, hãy dùng thao tác
        phù hợp với vai trò của bạn.
      </p>
    </div>
  );
}
