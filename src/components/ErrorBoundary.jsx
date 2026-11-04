// Component bắt lỗi chuẩn Neo-Brutalism
import { Component } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false, // Có lỗi hay không?
      error: null, // Lỗi là gì?
    };
  }

  // React tự gọi hàm này khi có lỗi xảy ra
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  // Log lỗi ra console để debug
  componentDidCatch(error, info) {
    console.error("❌ Lỗi component:", error);
    console.error("📍 Vị trí lỗi:", info.componentStack);
  }

  render() {
    // Nếu có lỗi, hiển thị màn hình thông báo lỗi Neo-Brutalism thay vì crash
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-surface">
          <div className="max-w-md w-full bg-surface border-4 border-line-strong rounded-2xl p-8 shadow-[8px_8px_0_#141413] text-center space-y-6">
            {/* Icon Cảnh báo */}
            <div className="size-14 mx-auto rounded-2xl bg-error text-white border-3 border-line-strong flex items-center justify-center shadow-[3px_3px_0_#141413]">
              <AlertTriangle size={28} strokeWidth={2.5} />
            </div>

            {/* Nội dung thông báo */}
            <div className="space-y-2">
              <h1 className="text-xl font-black text-text">
                Đã xảy ra lỗi hệ thống
              </h1>
              <p className="text-xs font-semibold text-text-muted wrap-break-word bg-surface-2 p-3 rounded-xl border-2 border-line-strong">
                {this.state.error?.message ||
                  "Có gì đó không đúng đã xảy ra..."}
              </p>
            </div>

            {/* Nút Tải lại trang chuẩn Neo-Brutalism */}
            <button
              onClick={() => window.location.reload()}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-black font-extrabold text-sm rounded-xl border-3 border-line-strong shadow-[3px_3px_0_#141413] hover:shadow-[5px_5px_0_#141413] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all cursor-pointer"
            >
              <RefreshCw size={18} strokeWidth={2.5} />
              <span>Tải lại trang</span>
            </button>
          </div>
        </div>
      );
    }

    // Không có lỗi thì render bình thường các component con
    return this.props.children;
  }
}
