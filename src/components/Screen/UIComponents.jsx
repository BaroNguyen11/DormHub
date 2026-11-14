import {
  RefreshCw,
  Search,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

/**
 * Component Notice - Thông báo Lỗi hoặc Thành công
 */
export function Notice({ error, success, type, message, description }) {
  // Support both old API (error, success) and new API (type, message, description)
  if (!error && !success && !type && !message) return null;

  // Determine display type
  let displayType = type;
  if (error) displayType = 'error';
  if (success) displayType = 'success';

  // Determine content
  const displayMessage = message || error || success;

  // Style mappings
  const typeStyles = {
    error: {
      bg: 'bg-error-light',
      icon: 'text-error',
      IconComponent: AlertTriangle,
    },
    success: {
      bg: 'bg-success-light',
      icon: 'text-success',
      IconComponent: CheckCircle2,
    },
    warning: {
      bg: 'bg-warning-light',
      icon: 'text-warning',
      IconComponent: AlertTriangle,
    },
  };

  const styles = typeStyles[displayType] || typeStyles.error;
  const IconComponent = styles.IconComponent;

  return (
    <div className="space-y-4 mb-6">
      <div
        role={displayType === 'error' ? 'alert' : 'status'}
        className={`flex items-start gap-3 px-4 py-3 rounded-sm ${styles.bg} text-text border-3 border-line-strong shadow-[3px_3px_0_#141413] font-extrabold text-sm leading-relaxed animate-in fade-in slide-in-from-top-2 duration-200`}
      >
        <IconComponent
          size={20}
          className={`${styles.icon} shrink-0 mt-0.5`}
          strokeWidth={2.5}
        />
        <div className="flex-1">
          <div className="font-extrabold">{displayMessage}</div>
          {description && (
            <p className="text-xs font-semibold text-text-muted mt-1 m-0">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Component Loading - Khung hiển thị khi đang tải dữ liệu bên trong Panel/Card
 */
export function Loading() {
  return (
    <div className="py-16 px-6 text-center flex flex-col items-center justify-center bg-surface border-4 border-line-strong rounded-sm shadow-[4px_4px_0_#141413] my-4">
      <div className="size-12 rounded-sm bg-primary border-3 border-line-strong flex items-center justify-center shadow-[2px_2px_0_#141413] mb-3">
        <RefreshCw
          className="animate-spin text-text"
          size={22}
          strokeWidth={2.5}
        />
      </div>
      <strong className="block text-base font-extrabold text-text">
        Đang tải dữ liệu…
      </strong>
      <span className="text-xs font-bold text-text-muted mt-1">
        Vui lòng chờ trong giây lát
      </span>
    </div>
  );
}

/**
 * Component AuthLoading - Màn hình chờ xác thực phiên đăng nhập toàn trang (Cho AuthRoute & ProtectRoute)
 */
export function AuthLoading({ text = "Đang xác thực phiên đăng nhập…" }) {
  return (
    <div className="min-h-screen z-9999 w-full flex items-center justify-center bg-surface/50 p-4">
      <div className="rounded-sm p-6 sm:p-8 flex flex-col items-center justify-center gap-4  w-full text-center">
        {/* Badge Icon với Spinner */}
        <div className="relative">
          <div className="size-14 rounded-sm bg-primary border-3 border-line-strong flex items-center justify-center shadow-[3px_3px_0_#141413]">
            <ShieldCheck size={28} className="text-text" strokeWidth={2.5} />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-warning rounded-sm p-1 border-2 border-line-strong shadow-[1px_1px_0_#141413]">
            <RefreshCw
              size={14}
              className="animate-spin text-text"
              strokeWidth={3}
            />
          </div>
        </div>

        {/* Thông báo trạng thái */}
        <div className="space-y-1">
          <h3 className="text-base font-black text-text">DormHub</h3>
          <p className="text-xs font-extrabold text-text-muted m-0">{text}</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Component Empty - Khung hiển thị khi không tìm thấy dữ liệu
 */
export function Empty({ text = "Chưa có dữ liệu phù hợp." }) {
  return (
    <div className="py-16 px-6 text-center bg-surface border-4 border-line-strong rounded-sm shadow-[4px_4px_0_#141413] my-4 flex flex-col items-center justify-center">
      <div className="size-12 rounded-sm bg-warning border-3 border-line-strong flex items-center justify-center shadow-[2px_2px_0_#141413] mb-3">
        <Search size={22} className="text-text" strokeWidth={2.5} />
      </div>
      <strong className="block text-base font-extrabold text-text mb-1">
        {text}
      </strong>
      <p className="text-xs font-bold text-text-muted m-0">
        Dữ liệu sẽ xuất hiện khi máy chủ có thông tin tương ứng.
      </p>
    </div>
  );
}

/**
 * Component Heading - Header trang chứa Breadcrumb, Title & Action buttons
 */
export function Heading({ config, children }) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6">
      <div>
        {/* Breadcrumb Tag */}
        <div className="inline-block px-3 py-1 mb-2 bg-surface-2 text-text-muted text-[11px] font-extrabold uppercase tracking-widest rounded-md border-2 border-line-strong shadow-[2px_2px_0_#141413]">
          DORMHUB /{" "}
          {config?.group ? String(config.group).toUpperCase() : "SYSTEM"}
        </div>

        {/* Title chính */}
        <h1 className="text-2xl sm:text-3xl font-black text-text tracking-tight leading-tight mb-1">
          {config?.title || "Trang quản lý"}
        </h1>

        {/* Subtitle */}
        <p className="text-text-muted text-xs sm:text-sm font-semibold leading-relaxed m-0">
          Quản lý thông tin và theo dõi tiến trình trên cùng một không gian.
        </p>
      </div>

      {/* Khu vực chứa Action buttons (Tạo mới, Tải lại,...) */}
      {children && (
        <div className="flex gap-3 flex-wrap items-center shrink-0 w-full sm:w-auto">
          {children}
        </div>
      )}
    </div>
  );
}

/**
 * Component SystemInfo - Khung ghi chú hệ thống (dùng trong trang Detail)
 */
export function SystemInfo() {
  return (
    <div className="p-5 sm:p-6 border-3 border-line-strong rounded-sm bg-surface-2 shadow-[4px_4px_0_#141413]">
      <div className="flex items-center gap-2.5 mb-2">
        <div className="size-8 rounded-sm bg-primary border-2 border-line-strong flex items-center justify-center shadow-[1.5px_1.5px_0_#141413]">
          <ShieldCheck size={18} className="text-text" strokeWidth={2.5} />
        </div>
        <h3 className="text-sm font-extrabold text-text m-0">
          Thông tin từ hệ thống
        </h3>
      </div>
      <p className="text-xs font-semibold text-text-muted leading-relaxed m-0 pl-10">
        Dữ liệu được tải trực tiếp từ API DormHub. Nếu cần điều chỉnh, hãy sử
        dụng các thao tác phù hợp với quyền hạn tài khoản của bạn.
      </p>
    </div>
  );
}
