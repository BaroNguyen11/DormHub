// ====================================
// YÊU CẦU GIA HẠN HỢP ĐỒNG — trang riêng thay cho FormScreen trống
// ====================================
// Vào từ nút "Yêu cầu gia hạn" ở trang chi tiết hợp đồng (/student/contracts/:id).
// Hiện thông tin hợp đồng + phòng hiện tại, chọn số tháng và xem trước hạn mới.

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import Workspace from "../../../components/Workspace";
import { resources } from "../../../services/resource.service";
import { errorMessage } from "../../../utils/errorHandler";
import { Loading, Notice } from "../../../components/Screen/UIComponents";
import {
  RequestPageShell,
  RenewForm,
} from "../../../components/RequestDialogs";

export default function RenewRequestPage() {
  const { contractId } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const detail = await resources.get("/student/contracts", contractId);
        if (!active) return;
        setContract(detail);
        try {
          const assignments = await resources.list("/student/room-assignments", {
            page: 0,
            size: 20,
          });
          const current = (assignments?.content || []).find((item) =>
            ["ASSIGNED", "CHECKED_IN"].includes(
              String(item.assignmentStatus || item.status).toUpperCase(),
            ),
          );
          if (active) setRoom(current?.room || current || null);
        } catch {
          // Không có phòng vẫn cho xem hợp đồng.
        }
      } catch (err) {
        if (active) setError(errorMessage(err));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [contractId]);

  const contractStatus = String(contract?.status || "").toUpperCase();
  const isActive = contractStatus === "ACTIVE";

  return (
    <Workspace group="student" title="Yêu cầu gia hạn hợp đồng">
      {loading ? (
        <Loading />
      ) : error ? (
        <div className="mx-auto w-full max-w-3xl">
          <Notice error={error} />
        </div>
      ) : !contract ? (
        <div className="mx-auto w-full max-w-3xl">
          <Notice
            type="warning"
            message="Không tìm thấy hợp đồng cần gia hạn."
          />
        </div>
      ) : (
        <RequestPageShell
          icon={RefreshCw}
          title="Gia hạn hợp đồng"
          subtitle="Kiểm tra thông tin hợp đồng, chọn số tháng gia hạn và gửi yêu cầu cho ban quản lý"
          onBack={() => navigate(-1)}
        >
          {!isActive && (
            <Notice
              type="warning"
              message="Hợp đồng này không còn hiệu lực — chỉ hợp đồng ĐANG HOẠT ĐỘNG mới có thể gia hạn."
            />
          )}
          <RenewForm
            contract={contract}
            room={room}
            disabled={!isActive}
            onDone={() => navigate(`/student/contracts/${contractId}`)}
            onCancel={() => navigate(-1)}
            submitLabel="Gửi yêu cầu gia hạn"
          />
        </RequestPageShell>
      )}
    </Workspace>
  );
}
