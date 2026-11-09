// ====================================
// DETAIL SCREEN - Màn hình chi tiết (Neo-Brutalism)
// ====================================
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  ArrowLeft,
  FileEdit,
  CheckCircle2,
  XCircle,
  CreditCard,
  Home,
  FileText,
} from "lucide-react";
import { resources } from "../../services/resource.service";
import { errorMessage } from "../../utils/errorHandler";
import { FIELD_LABELS } from "./constants";
import { formatValue } from "./formatters";
import { Notice, Loading, Empty, Heading } from "./UIComponents";
import { useLoad } from "./useLoad";
import { StatusBadge } from "../ui";
import { toast } from "sonner";

export default function DetailScreen({ config }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");
  const [success, setSuccess] = useState("");

  const path = config.single
    ? config.resource
    : `${config.resource}/${encodeURIComponent(id)}`;

  const { data: raw, error, loading, reload } = useLoad(path, {});

  // Khi single: true, backend có thể trả về Page (vd /student/room-assignments
  // trả Page<RoomAssignmentResponse>). Lấy phần tử đầu tiên của content/items
  // để hiển thị như bản ghi chi tiết của sinh viên.
  const data =
    config.single && raw && typeof raw === "object" && !Array.isArray(raw)
      ? Array.isArray(raw.content)
        ? raw.content[0] || null
        : Array.isArray(raw.items)
          ? raw.items[0] || null
          : raw
      : raw;

  async function doAction(action) {
    if (action.confirm && !window.confirm(`Xác nhận: ${action.label}?`)) {
      return;
    }

    let body = action.body;

    // Handle promptField logic (new mechanism for rejection reason, etc.)
    if (action.promptField) {
      const promptText = action.promptLabel || `Nhập ${action.promptField}`;
      let promptValue = window.prompt(promptText);
      
      // Validation
      if (action.promptRequired && !promptValue?.trim()) {
        toast.error(`${action.promptLabel || action.promptField} là bắt buộc.`);
        return;
      }
      
      if (promptValue && action.promptMaxLength && promptValue.length > action.promptMaxLength) {
        toast.error(`${action.promptLabel || action.promptField} không được vượt quá ${action.promptMaxLength} ký tự.`);
        return;
      }
      
      // Build body using bodyBuilder if provided
      if (action.bodyBuilder) {
        body = action.bodyBuilder(data, promptValue?.trim());
      } else {
        body = { ...(action.body || {}), [action.promptField]: promptValue?.trim() };
      }
    }

    // Legacy reason mechanism (for backward compatibility)
    if (action.reason && !action.promptField) {
      const reason = window.prompt("Nhập lý do từ chối");
      if (!reason?.trim()) return;
      // Backend /review yêu cầu {status, note} — giữ status từ action.body, thêm note.
      body = { ...(action.body || {}), note: reason.trim() };
    }

    if (action.room) {
      const roomId = window.prompt("Nhập mã phòng phù hợp để phân");
      if (!roomId?.trim()) return;
      body = { roomId: roomId.trim() };
    }

    if (action.payment) {
      // Backend: POST /api/v1/student/invoices/{invoiceId}/payments (không cần body).
      // Sau khi tạo payment thành công, chuyển sang trang kết quả thanh toán.
      try {
        setBusy(true);
        const result = await resources.action(
          `${config.resource}/${id}${action.suffix}`,
          action.method,
        );
        const paymentId = result?.paymentId || result?.id;
        toast.success("Đã tạo yêu cầu thanh toán.");
        if (paymentId) {
          navigate(
            `/student/payment-result?paymentId=${paymentId}&invoiceId=${id}`,
          );
        }
      } catch (e) {
        toast.error(errorMessage(e));
      } finally {
        setBusy(false);
      }
      return;
    }

    setBusy(true);
    setActionError("");
    setSuccess("");

    try {
      await resources.action(
        `${config.resource}/${id}${action.suffix}`,
        action.method,
        body,
      );

      toast.success("Thao tác đã được lưu thành công.");
      reload();
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  const entries =
    data && typeof data === "object"
      ? Object.entries(data).filter(
          ([, value]) =>
            (value !== null && typeof value !== "object") ||
            Array.isArray(value),
        )
      : [];

  return (
    <div className="space-y-6">
      {/* Heading với breadcrumbs & nút hành động */}
      <Heading config={config}>
        <button
          className="inline-flex items-center gap-2 px-3 py-2 bg-primary text-[#000000] font-extrabold! text-sm! rounded-sm border-3 border-line-strong shadow-[3px_3px_0_#141413] hover:shadow-[5px_5px_0_#141413] hover:-translate-0.5 active:translate-0.5 active:shadow-none transition-all cursor-pointer"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={18} strokeWidth={2.5} />
          <span>Quay lại</span>
        </button>

        {/* Nút Chỉnh sửa */}
        {config.edit && (
          <button
            className="inline-flex items-center gap-2 px-3 py-2 bg-primary text-text font-extrabold! text-sm! rounded-sm border-3 border-line-strong shadow-[3px_3px_0_#141413] hover:shadow-[5px_5px_0_#141413] hover:-translate-0.5 active:translate-0.5 active:shadow-none transition-all cursor-pointer"
            onClick={() => navigate(`${config.edit}/${id}/edit`)}
          >
            <FileEdit size={18} strokeWidth={2.5} />
            <span>Chỉnh sửa</span>
          </button>
        )}

        {/* Các nút Action linh hoạt (Duyệt, Từ chối, Thanh toán, Phân phòng...) */}
        {/* visibleWhen: { field: value, ... } — chỉ hiện nút khi mọi điều kiện khớp dữ liệu hiện tại */}
        {(config.actions || [])
          .filter((action) =>
            !action.visibleWhen ||
            Object.entries(action.visibleWhen).every(
              ([field, value]) =>
                String(data?.[field] ?? "") === String(value),
            ),
          )
          .map((action) => {
          // Handle redirect actions
          if (action.type === "redirect") {
            const targetPath = action.useRoomId
              ? `${action.path}?roomId=${id}`
              : action.path;
            return (
              <Link
                key={action.label}
                to={targetPath}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-success text-[#000000] font-extrabold text-sm rounded-sm border-3 border-line-strong shadow-[3px_3px_0_#141413] hover:shadow-[5px_5px_0_#141413] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none transition-all"
              >
                {action.label}
              </Link>
            );
          }

          // Existing action button logic
          return (
            <button
              key={action.label}
              type="button"
              disabled={busy || loading}
              onClick={() => doAction(action)}
              className={`
    inline-flex items-center gap-2
    px-3 py-2
    font-extrabold! text-sm!
    rounded-sm border-3 border-line-strong
    shadow-[3px_3px_0_#141413]
    transition-all duration-200
    ${action.reason ? "bg-error text-surface" : "bg-primary text-[#000000]"}
    enabled:hover:shadow-[5px_5px_0_#141413]
    enabled:hover:-translate-y-0.5
    enabled:active:translate-y-0.5
    enabled:active:shadow-none
    disabled:opacity-50
    disabled:cursor-not-allowed
    disabled:shadow-none
  `}
            >
              {action.payment ? (
                <CreditCard size={18} strokeWidth={2.5} />
              ) : action.room ? (
                <Home size={18} strokeWidth={2.5} />
              ) : action.reason ? (
                <XCircle size={18} strokeWidth={2.5} />
              ) : (
                <CheckCircle2 size={18} strokeWidth={2.5} />
              )}

              <span>{busy ? "Đang xử lý..." : action.label}</span>
            </button>
          );
        })}

        {/* Public Actions for Guest */}
        {config.publicActions?.map((action) => (
          <Link
            key={action.label}
            to={`${action.redirect}?redirect=${encodeURIComponent(location.pathname)}`}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-[#000000] font-extrabold text-sm rounded-sm border-3 border-line-strong shadow-[3px_3px_0_#141413] hover:shadow-[5px_5px_0_#141413] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none transition-all"
          >
            {action.label}
          </Link>
        ))}
      </Heading>

      {/* Notice hiển thị Thông báo Lỗi / Thành công */}
      <Notice error={actionError || error} success={success} />

      {/* Hiển thị Loading, Empty hoặc Chi tiết */}
      {loading ? (
        <Loading />
      ) : !data ? (
        <Empty />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Khung Thông tin chi tiết chính (Chiếm 8 cột ở màn hình rộng) */}
          <div className="lg:col-span-12 bg-surface border-4 border-line-strong rounded-sm p-6 sm:p-8 shadow-[6px_6px_0_#141413] space-y-6">
            <div className="flex items-center justify-between pb-4 border-b-3 border-line-strong">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-sm bg-primary border-2 border-line-strong flex items-center justify-center shadow-[2px_2px_0_#141413]">
                  <FileText
                    size={18}
                    className="text-text"
                    strokeWidth={2.5}
                  />
                </div>
                <h2 className="text-lg font-black text-text">
                  Thông tin chi tiết {id ? `#${id}` : ""}
                </h2>
              </div>

              {data.status && typeof data.status === "string" && (
                <StatusBadge status={data.status} />
              )}
            </div>

            {/* Danh sách Key - Value dạng Grid */}
            <dl className="divide-y-2 divide-line-strong/10 m-0">
              {entries.map(([key, value]) => (
                <div
                  key={key}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 py-3.5 items-center first:pt-0 last:pb-0"
                >
                  <dt className="sm:col-span-4 text-xs sm:text-sm font-extrabold text-text-muted uppercase tracking-wider">
                    {FIELD_LABELS[key] || key}
                  </dt>

                  <dd className="sm:col-span-8 text-sm font-black text-text wrap-break-word m-0">
                    {key === "status" && typeof value === "string" ? (
                      <StatusBadge status={value} />
                    ) : (
                      formatValue(key, value)
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Sidebar Thông tin hệ thống (Chiếm 4 cột ở màn hình rộng) */}
          {/* <div className="lg:col-span-4 space-y-6">
            <SystemInfo />
          </div> */}
        </div>
      )}
    </div>
  );
}
