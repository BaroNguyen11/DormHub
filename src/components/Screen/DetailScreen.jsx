// ====================================
// DETAIL SCREEN - Màn hình chi tiết (Neo-Brutalism)
// ====================================
import { useParams, useNavigate, Link } from "react-router-dom";
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
import { Notice, Loading, Empty, Heading, SystemInfo } from "./UIComponents";
import { useLoad } from "./useLoad";
import { Button, StatusBadge } from "../ui";

export default function DetailScreen({ config }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");
  const [success, setSuccess] = useState("");

  const path = config.single
    ? config.resource
    : `${config.resource}/${encodeURIComponent(id)}`;

  const { data, error, loading, reload } = useLoad(path, {});

  async function doAction(action) {
    if (action.confirm && !window.confirm(`Xác nhận: ${action.label}?`)) {
      return;
    }

    let body = action.body;

    if (action.reason) {
      const reason = window.prompt("Nhập lý do từ chối");
      if (!reason?.trim()) return;
      body = { reason: reason.trim() };
    }

    if (action.room) {
      const roomId = window.prompt("Nhập mã phòng phù hợp để phân");
      if (!roomId?.trim()) return;
      body = { roomId: roomId.trim() };
    }

    if (action.payment) {
      const method = window.prompt(
        "Phương thức thanh toán: CASH hoặc BANK_TRANSFER",
        "BANK_TRANSFER",
      );
      if (!method) return;
      body = { invoiceId: id, method };
    }

    setBusy(true);
    setActionError("");
    setSuccess("");

    try {
      await resources.action(
        action.payment
          ? "/payments"
          : `${config.resource}/${id}${action.suffix}`,
        action.method,
        body,
      );

      setSuccess("Thao tác đã được lưu thành công.");
      reload();
    } catch (e) {
      setActionError(errorMessage(e));
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
          className="inline-flex items-center gap-2 px-3 py-2 bg-primary text-black font-extrabold! text-sm! rounded-sm border-3 border-line-strong shadow-[3px_3px_0_#141413] hover:shadow-[5px_5px_0_#141413] hover:-translate-0.5 active:translate-0.5 active:shadow-none transition-all cursor-pointer"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={18} strokeWidth={2.5} />
          <span>Quay lại</span>
        </button>

        {/* Nút Chỉnh sửa */}
        {config.edit && (
          <button
            className="inline-flex items-center gap-2 px-3 py-2 bg-primary text-black font-extrabold! text-sm! rounded-sm border-3 border-line-strong shadow-[3px_3px_0_#141413] hover:shadow-[5px_5px_0_#141413] hover:-translate-0.5 active:translate-0.5 active:shadow-none transition-all cursor-pointer"
            onClick={() => navigate(`${config.edit}/${id}/edit`)}
          >
            <FileEdit size={18} strokeWidth={2.5} />
            <span>Chỉnh sửa</span>
          </button>
        )}

        {/* Các nút Action linh hoạt (Duyệt, Từ chối, Thanh toán, Phân phòng...) */}
        {config.actions?.map((action) => (
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
    ${action.reason ? "bg-red-500 text-white" : "bg-primary text-black"}
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
          <div className="lg:col-span-8 bg-white border-4 border-line-strong rounded-2xl p-6 sm:p-8 shadow-[6px_6px_0_#141413] space-y-6">
            <div className="flex items-center justify-between pb-4 border-b-3 border-line-strong">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-xl bg-primary border-2 border-line-strong flex items-center justify-center shadow-[2px_2px_0_#141413]">
                  <FileText
                    size={18}
                    className="text-black"
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
          <div className="lg:col-span-4 space-y-6">
            <SystemInfo />
          </div>
        </div>
      )}
    </div>
  );
}
