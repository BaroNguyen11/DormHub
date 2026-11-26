import useCurrentStay from "../../../hooks/useCurrentStay";
// ====================================
// TẠO YÊU CẦU CHUYỂN PHÒNG — trang riêng thay cho FormScreen trống
// ====================================
// Vào từ nút "Tạo mới" của trang danh sách yêu cầu chuyển phòng.
// Hiện phòng hiện tại + danh sách phòng trống thật (/student/rooms-available) để chọn.

import { useNavigate } from "react-router-dom";
import { ArrowLeftRight } from "lucide-react";
import Workspace from "../../../components/Workspace";
import { Loading, Notice } from "../../../components/Screen/UIComponents";
import {
  RequestPageShell,
  TransferForm,
} from "../../../components/RequestDialogs";

export default function TransferRequestPage() {
  const navigate = useNavigate();
  const { room, contract, loading, error } = useCurrentStay();

  return (
    <Workspace group="student" title="Tạo yêu cầu chuyển phòng">
      {loading ? (
        <Loading />
      ) : (
        <RequestPageShell
          icon={ArrowLeftRight}
          tone="bg-info text-black"
          title="Chuyển phòng"
          subtitle="Chọn phòng trống bạn muốn chuyển đến và cho ban quản lý biết lý do"
          onBack={() => navigate(-1)}
        >
          {error && <Notice error={error} />}
          {!room ? (
            <Notice
              type="warning"
              message="Bạn chưa có phòng nên không thể tạo yêu cầu chuyển phòng."
              description="Yêu cầu chuyển phòng chỉ dành cho sinh viên đang có chỗ ở trong KTX."
            />
          ) : (
            <TransferForm
              room={room}
              contract={contract}
              onDone={() => navigate("/student/room-transfer-requests")}
              onCancel={() => navigate(-1)}
              submitLabel="Gửi yêu cầu chuyển phòng"
            />
          )}
        </RequestPageShell>
      )}
    </Workspace>
  );
}
