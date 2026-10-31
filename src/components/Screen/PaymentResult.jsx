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
    <div className="panel result">
      {/* Icon thanh toán */}
      <CreditCard size={35} />
      
      {/* Heading */}
      <h1>Kết quả thanh toán</h1>
      
      {/* Warning message */}
      <p>
        Cần kiểm tra trạng thái hóa đơn đã được backend cập nhật trước khi xác
        nhận giao dịch. Thông tin trên URL không được xem là bằng chứng thanh toán.
      </p>
      
      {/* Link đến trang hóa đơn */}
      <Link className="button primary" to="/student/invoices">
        Kiểm tra hóa đơn
      </Link>
    </div>
  );
}
