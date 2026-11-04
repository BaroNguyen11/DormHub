// ====================================
// PAYMENT RESULT - Kết quả thanh toán
// ====================================
// Hiển thị sau khi user quay về từ payment gateway
// Mục đích: Hướng dẫn user kiểm tra trạng thái hóa đơn

import { Link } from "react-router-dom";
import { CreditCard } from "lucide-react";

/**
 * Component PaymentResult - Màn hình kết quả thanh toán
 * Hiển thị warning và link đến trang hóa đơn
 * 
 * Lưu ý: Không hiển thị "thành công" hoặc "thất bại" ở đây
 * vì cần kiểm tra trạng thái từ backend
 */
export default function PaymentResult() {
  return (
    <div className="bg-surface border-2 border-[var(--color-line)] rounded-[var(--radius-lg)] p-8 max-w-md mx-auto mt-12 text-center flex flex-col items-center gap-4">
      {/* Icon thanh toán */}
      <CreditCard size={35} className="text-[var(--color-primary)]" />
      
      {/* Heading */}
      <h1 className="text-2xl font-[family-name:var(--font-family-display)] font-bold text-[var(--color-text)]">Kết quả thanh toán</h1>
      
      {/* Warning message */}
      <p className="text-sm text-[var(--color-text-muted)]">
        Cần kiểm tra trạng thái hóa đơn đã được backend cập nhật trước khi xác
        nhận giao dịch. Thông tin trên URL không được xem là bằng chứng thanh toán.
      </p>
      
      {/* Link đến trang hóa đơn */}
      <Link className="inline-flex items-center gap-2 px-6 py-2.5 bg-[var(--color-primary)] text-white rounded-[var(--radius-md)] font-[family-name:var(--font-family-display)] font-bold text-sm hover:bg-[var(--color-primary-hover)] hover:shadow-[var(--shadow-md)] transition-all" to="/student/invoices">
        Kiểm tra hóa đơn
      </Link>
    </div>
  );
}
