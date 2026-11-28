import useCurrentStay from "../../../hooks/useCurrentStay";
// ====================================
// TẠO YÊU CẦU TRẢ PHÒNG — trang riêng thay cho FormScreen trống
// ====================================
// Vào từ nút "Tạo mới" của trang danh sách yêu cầu trả phòng.
// Hiện phòng + hợp đồng + tiền cọc đang giữ, chọn ngày trả dự kiến và gửi yêu cầu.

import { useNavigate } from "react-router-dom";
import { DoorOpen } from "lucide-react";
import Workspace from "../../../components/Workspace";
import { Loading, Notice } from "../../../components/Screen/UIComponents";
import {
  CheckoutForm,
  RequestPageShell,
} from "../../../components/RequestDialogs";

export default function CheckoutRequestPage() {
  const navigate = useNavigate();
  const { room, contract, loading, error } = useCurrentStay();

  return (
    <Workspace group="student" title="Tạo yêu cầu trả phòng">
      {loading ? (
        <Loading />
      ) : (
        <RequestPageShell
          icon={DoorOpen}
          tone="bg-error text-white"
          title="Trả phòng"
          subtitle="Gửi lý do và phối hợp với ban quản lý để bàn giao phòng thực tế"
          onBack={() => navigate(-1)}
        >
          {error && <Notice error={error} />}
          {!room ? (
            <Notice
              type="warning"
              message="Bạn chưa có phòng đang ở nên không thể tạo yêu cầu trả phòng."
              description="Yêu cầu trả phòng chỉ dành cho sinh viên đang có chỗ ở trong KTX."
            />
          ) : (
            <CheckoutForm
              room={room}
              contract={contract}
              onDone={() => navigate("/student/checkout-requests")}
              onCancel={() => navigate(-1)}
              submitLabel="Gửi yêu cầu trả phòng"
            />
          )}
        </RequestPageShell>
      )}
    </Workspace>
  );
}
