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
  Eye,
  X,
} from "lucide-react";
import { resources } from "../../services/resource.service";
import { FIELD_LABELS } from "./constants";
import { formatValue } from "./formatters";
import { Notice, Loading, Empty, Heading } from "./UIComponents";
import { useLoad } from "./useLoad";
import { MaintenanceStatusBadge, StatusBadge } from "../ui";
import { toast } from "sonner";
import { asList } from "../../api/apiClient";

function DetailTile({ field, value }) {
  return (
    <div className="min-w-0 rounded-sm border-2 border-line-strong/15 bg-surface-2 p-4">
      <dt className="text-[11px] font-extrabold uppercase tracking-wider text-text-muted">
        {FIELD_LABELS[field] || field}
      </dt>
      <dd className="mt-1.5 break-words text-sm font-black text-text">
        {field === "imageUrl" && typeof value === "string" ? (
          <a href={value} target="_blank" rel="noopener noreferrer" aria-label="Mở ảnh đính kèm ở kích thước gốc trong tab mới" className="relative group inline-block overflow-hidden rounded-sm border-2 border-line-strong shadow-[2px_2px_0_#141413]">
            <img src={value} alt="Ảnh đính kèm" className="size-[120px] object-cover" />
            <span className="absolute inset-0 flex items-center justify-center bg-black/60 text-xs font-black text-white opacity-0 transition group-hover:opacity-100">Xem ảnh gốc</span>
          </a>
        ) : field === "status" && typeof value === "string" ? (
          <StatusBadge status={value} />
        ) : (
          formatValue(field, value)
        )}
      </dd>
    </div>
  );
}

const MANAGER_DETAIL_SECTIONS = {
  "/manager/students": [
    { title: "Thông tin định danh", fields: ["fullName", "studentCode", "dateOfBirth", "gender", "cic"] },
    { title: "Thông tin liên hệ", fields: ["email", "phone", "address"] },
    { title: "Tài khoản", fields: ["username", "accountStatus"] },
  ],
  "/contracts": [
    { title: "Người thuê và chỗ ở", fields: ["studentName", "studentCode", "roomNumber", "buildingName"] },
    { title: "Thời hạn và chi phí", fields: ["startDate", "endDate", "monthlyRent", "depositAmount"] },
    { title: "Trạng thái hợp đồng", fields: ["status", "depositStatus", "assignmentStatus"] },
    { title: "Ghi chú", fields: ["description", "createdAt", "updatedAt"] },
  ],
  "/invoices": [
    { title: "Đối tượng hóa đơn", fields: ["invoiceType", "studentName", "roomNumber", "buildingName", "billingMonth"] },
    { title: "Thanh toán", fields: ["totalAmount", "status", "overdue", "issueDate", "dueDate"] },
  ],
  "/manager/sepay-transactions": [
    { title: "Thông tin giao dịch", fields: ["status", "transferAmount", "gateway", "transferType", "transactionAt", "receivedAt"] },
    { title: "Nội dung chuyển khoản", fields: ["paymentReference", "code", "bankReferenceCode", "accountNumber", "content"] },
    { title: "Đối soát", fields: ["reviewReason"] },
  ],
  "/manager/maintenance": [
    { title: "Yêu cầu sửa chữa", fields: ["title", "priority", "status", "description", "imageUrl"] },
    { title: "Thời gian xử lý", fields: ["createdAt", "updatedAt", "processedAt"] },
  ],
  "/manager/dorm-applications": [
    { title: "Sinh viên", fields: ["studentName", "studentCode", "studentGender"] },
    { title: "Phòng đăng ký", fields: ["requestedRoomNumber", "requestedBuildingName", "requestDate", "status"] },
    { title: "Kết quả xử lý", fields: ["note", "reviewNote", "processedAt", "contractStartDate", "contractEndDate", "depositAmount"] },
  ],
};

function hasDetailValue(value) {
  return value !== null && value !== undefined &&
    !(typeof value === "string" && ["", "-", "—"].includes(value.trim()));
}

function DetailSection({ section, data }) {
  const fields = section.fields.filter((field) => hasDetailValue(data[field]));
  if (fields.length === 0) return null;
  return (
    <section className="rounded-sm border-2 border-line-strong/15 bg-surface p-5">
      <h3 className="mb-4 border-b-2 border-line-strong/10 pb-3 text-sm font-black uppercase tracking-wide text-text">
        {section.title}
      </h3>
      <dl className="m-0 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {fields.map((field) => (
          <DetailTile key={field} field={field} value={data[field]} />
        ))}
      </dl>
    </section>
  );
}

function InvoiceItems({ details }) {
  if (!Array.isArray(details) || details.length === 0) return null;
  return (
    <section className="rounded-sm border-2 border-line-strong/15 bg-surface p-5">
      <h3 className="mb-4 border-b-2 border-line-strong/10 pb-3 text-sm font-black uppercase tracking-wide text-text">Các khoản thu</h3>
      <div className="space-y-3">
        {details.map((item, index) => (
          <div key={item.detailId || index} className="grid grid-cols-2 gap-3 rounded-sm bg-surface-2 p-3 sm:grid-cols-4">
            <div><p className="m-0 text-[11px] font-extrabold uppercase text-text-muted">Khoản thu</p><p className="mt-1 text-sm font-black">{formatValue("itemType", item.itemType)}</p></div>
            <div className="col-span-2 sm:col-span-1"><p className="m-0 text-[11px] font-extrabold uppercase text-text-muted">Mô tả</p><p className="mt-1 text-sm font-bold">{formatValue("description", item.description)}</p></div>
            <div><p className="m-0 text-[11px] font-extrabold uppercase text-text-muted">Số lượng × đơn giá</p><p className="mt-1 text-sm font-bold">{item.quantity ?? "—"} × {formatValue("unitPrice", item.unitPrice)}</p></div>
            <div><p className="m-0 text-[11px] font-extrabold uppercase text-text-muted">Thành tiền</p><p className="mt-1 text-sm font-black">{formatValue("amount", item.amount)}</p></div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function DetailScreen({ config }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");
  const [success, setSuccess] = useState("");
  const [confirmationAction, setConfirmationAction] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [resolvedApplicationStatus, setResolvedApplicationStatus] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, action: null });
  const [pendingConfirmAction, setPendingConfirmAction] = useState(null);
  const [pendingInput, setPendingInput] = useState(null);

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

  const isStudentDetail = config.resource === "/manager/students";
  const isMaintenanceDetail = config.resource === "/manager/maintenance";
  const isRoomDetail = config.resource === "/manager/rooms";
  const isBuildingDetail = config.resource === "/manager/buildings";
  const detailSections = MANAGER_DETAIL_SECTIONS[config.resource];
  const { data: buildingRoomsData, loading: buildingRoomsLoading, error: buildingRoomsError } = useLoad(
    isBuildingDetail ? "/manager/rooms" : "",
    { buildingId: id, page: 0, size: 100 },
  );
  const buildingRooms = asList(buildingRoomsData);
  const maintenanceStatus = String(data?.status || "").toUpperCase();
  const isMaintenanceTerminal = [
    "COMPLETED",
    "RESOLVED",
    "DONE",
    "REJECTED",
    "CANCELLED",
  ].includes(maintenanceStatus);
  const student = isStudentDetail ? data : null;
  const isLocked =
    student?.status === "INACTIVE" ||
    student?.status === "LOCKED" ||
    student?.user?.isActive === false ||
    student?.isLocked === true;
  const isApplicationReview = config.resource === "/manager/dorm-applications";
  const applicationStatus = String(
    resolvedApplicationStatus || data?.status || "",
  ).toUpperCase();
  const isApplicationPending = applicationStatus === "PENDING";

  async function doAction(action, options = {}) {
    if (isApplicationReview && !options.confirmed) {
      setConfirmationAction(action);
      setRejectionReason("");
      return;
    }

    if (action.confirm && !options.confirmed) {
      const actionType = isStudentDetail
        ? action.body?.status === "LOCKED" ? "LOCK" : "UNLOCK"
        : "ACTION";
      setPendingConfirmAction(action);
      setConfirmModal({ isOpen: true, action: actionType });
      return;
    }

    let body = action.body;

    const needsInput = action.promptField || action.reason || action.room;
    if (needsInput && !options.inputSubmitted && !options.reason) {
      setPendingInput({
        action,
        value: "",
        kind: action.room ? "room" : action.reason ? "reason" : "field",
      });
      return;
    }

    // Handle promptField logic (new mechanism for rejection reason, etc.)
    if (action.promptField) {
      const promptValue = options.inputValue ?? "";
      
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
      const reason = options.reason ?? options.inputValue;
      if (!reason?.trim()) {
        if (isApplicationReview) setActionError("Vui lòng nhập lý do từ chối.");
        return;
      }
      // Backend /review yêu cầu {status, note} — giữ status từ action.body, thêm note.
      body = { ...(action.body || {}), note: reason.trim() };
    }

    if (action.room) {
      const roomId = options.inputValue;
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
        if (paymentId) {
          navigate(
            `/student/payment-result?paymentId=${paymentId}&invoiceId=${id}`,
          );
        }
      } catch {
        // API client reports request failures globally.
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

      if (isApplicationReview && action.body?.status) {
        setResolvedApplicationStatus(action.body.status);
      }
      setConfirmationAction(null);
      setRejectionReason("");
      setPendingConfirmAction(null);
      setConfirmModal({ isOpen: false, action: null });
      setPendingInput(null);
      reload();
    } catch {
      // API client reports request failures globally.
    } finally {
      setBusy(false);
    }
  }

  function handleLockStudent() {
    if (pendingConfirmAction) void doAction(pendingConfirmAction, { confirmed: true });
  }

  function handleUnlockStudent() {
    if (pendingConfirmAction) void doAction(pendingConfirmAction, { confirmed: true });
  }

  const entries =
    data && typeof data === "object"
      ? Object.entries(data).filter(
          ([key, value]) =>
            (value !== null && typeof value !== "object") ||
            Array.isArray(value) ||
            (isMaintenanceDetail && key === "imageUrl"),
        )
      : [];

  if (isStudentDetail && loading) return <Loading />;
  if (isStudentDetail && !student) {
    return (
      <div className="rounded-sm border-3 border-line-strong bg-surface p-6 text-sm font-extrabold text-text shadow-[4px_4px_0_#141413]">
        Không tìm thấy thông tin sinh viên
      </div>
    );
  }

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
          .filter(() => !isApplicationReview || isApplicationPending)
          .filter(() => !isMaintenanceDetail || !isMaintenanceTerminal)
          .filter((action) => {
            if (!data) return false;
            if (isStudentDetail) {
              return action.body?.status === (isLocked ? "ACTIVE" : "LOCKED");
            }
            if (!action.visibleWhen) return true;
            if (typeof action.visibleWhen === "function") {
              return action.visibleWhen(data);
            }
            return Object.entries(action.visibleWhen).every(
              ([field, value]) =>
                String(data?.[field] ?? "") === String(value),
            );
          })
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
    ${isStudentDetail
      ? action.body?.status === "LOCKED"
        ? "bg-error text-white"
        : "bg-success text-black"
      : action.reason ? "bg-error text-surface" : "bg-primary text-[#000000]"}
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
      <Notice error={actionError || error || buildingRoomsError} success={success} />

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
                  {isRoomDetail
                    ? `Phòng ${data.roomNumber || `#${id}`}`
                    : isBuildingDetail
                      ? data.name || `Tòa nhà #${id}`
                      : `Thông tin chi tiết ${id ? `#${id}` : ""}`}
                </h2>
              </div>

              {isApplicationReview && applicationStatus === "APPROVED" ? (
                <span className="bg-success text-black font-extrabold px-3 py-1 border-2 border-line-strong rounded-xs shadow-[2px_2px_0_#141413]">
                  Đã duyệt
                </span>
              ) : isApplicationReview && applicationStatus === "REJECTED" ? (
                <span className="bg-error text-white font-extrabold px-3 py-1 border-2 border-line-strong rounded-xs shadow-[2px_2px_0_#141413]">
                  Đã từ chối
                </span>
              ) : data.status && typeof data.status === "string" ? (
                isMaintenanceDetail ? (
                  <MaintenanceStatusBadge status={data.status} />
                ) : (
                  <StatusBadge status={data.status} />
                )
              ) : null}
            </div>

            {isRoomDetail || isBuildingDetail ? (
              <dl className="m-0 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {(isRoomDetail
                  ? ["buildingName", "buildingCode", "floor", "roomType", "genderRestriction", "status", "capacity", "currentOccupancy", "availableSlots", "pricePerMonth", "electricMeterNumber", "waterMeterNumber", "description"]
                  : ["buildingCode", "address", "totalFloors", "genderRestriction", "totalRooms", "availableRooms", "description"]
                ).map((field) => (
                  <DetailTile key={field} field={field} value={data[field]} />
                ))}
              </dl>
            ) : detailSections ? (
              <div className="space-y-4">
                {detailSections.map((section) => (
                  <DetailSection key={section.title} section={section} data={data} />
                ))}
                {config.resource === "/invoices" && <InvoiceItems details={data.details} />}
              </div>
            ) : (
              <dl className="divide-y-2 divide-line-strong/10 m-0">
                {entries.map(([key, value]) => (
                  <div key={key} className="grid grid-cols-1 items-center gap-2 py-3.5 sm:grid-cols-12 sm:gap-4">
                    <dt className="text-xs font-extrabold uppercase tracking-wider text-text-muted sm:col-span-4 sm:text-sm">
                      {FIELD_LABELS[key] || key}
                    </dt>
                    <dd className="m-0 break-words text-sm font-black text-text sm:col-span-8">
                      {isMaintenanceDetail && key === "imageUrl" ? (
                        value ? (
                          <a href={value} target="_blank" rel="noopener noreferrer" aria-label="Mở ảnh đính kèm ở kích thước gốc trong tab mới" className="relative group inline-block overflow-hidden rounded-sm border-3 border-line-strong bg-surface shadow-[4px_4px_0_#141413] hover:shadow-[6px_6px_0_#141413] hover:-translate-y-0.5 transition-all outline-none!">
                            <img src={value} alt="Ảnh đính kèm báo hỏng" className="size-[120px] object-cover block" />
                            <span className="absolute inset-0 flex items-center justify-center bg-black/60 text-white font-black text-xs px-2 py-1 rounded-xs border border-white opacity-0 group-hover:opacity-100 transition-all">
                              <Eye size={15} className="mr-1" /> Xem ảnh gốc
                            </span>
                          </a>
                        ) : <span className="text-text-muted font-bold">Không có ảnh đính kèm</span>
                      ) : key === "status" && typeof value === "string" ? (
                        isMaintenanceDetail ? <MaintenanceStatusBadge status={value} /> : <StatusBadge status={value} />
                      ) : formatValue(key, value)}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </div>

          {isRoomDetail && (
            <section className="lg:col-span-12 space-y-4 rounded-sm border-4 border-line-strong bg-surface p-6 shadow-[6px_6px_0_#141413] sm:p-8">
              <div className="flex items-center justify-between gap-3 border-b-3 border-line-strong pb-4">
                <div>
                  <h3 className="text-lg font-black text-text">Sinh viên đang cư trú</h3>
                  <p className="mt-1 text-sm font-semibold text-text-muted">Danh sách sinh viên đã nhận phòng và còn hợp đồng hiệu lực.</p>
                </div>
                <span className="rounded-sm border-2 border-line-strong bg-primary px-3 py-1 text-sm font-black">{data.residents?.length || 0}</span>
              </div>
              {data.residents?.length ? (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {data.residents.map((resident) => (
                    <div key={resident.studentId} className="rounded-sm border-2 border-line-strong/15 bg-surface-2 p-4">
                      <p className="font-black text-text">{resident.fullName || "Chưa cập nhật họ tên"}</p>
                      <p className="mt-1 text-sm font-semibold text-text-muted">Mã sinh viên: {resident.studentCode || "Chưa cập nhật"}</p>
                      <p className="mt-1 text-sm font-semibold text-text-muted">Giới tính: {formatValue("gender", resident.gender)}</p>
                    </div>
                  ))}
                </div>
              ) : <p className="m-0 text-sm font-semibold text-text-muted">Phòng hiện chưa có sinh viên cư trú.</p>}
            </section>
          )}

          {isBuildingDetail && (
            <section className="lg:col-span-12 space-y-4 rounded-sm border-4 border-line-strong bg-surface p-6 shadow-[6px_6px_0_#141413] sm:p-8">
              <div className="flex items-center justify-between gap-3 border-b-3 border-line-strong pb-4">
                <div>
                  <h3 className="text-lg font-black text-text">Các phòng trong tòa</h3>
                  <p className="mt-1 text-sm font-semibold text-text-muted">Chọn một phòng để xem thông tin chi tiết và sinh viên cư trú.</p>
                </div>
                <span className="rounded-sm border-2 border-line-strong bg-primary px-3 py-1 text-sm font-black">{buildingRooms.length}</span>
              </div>
              {buildingRoomsLoading ? (
                <Loading />
              ) : buildingRooms.length ? (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {buildingRooms.map((room) => (
                    <Link key={room.id} to={`/manager/rooms/${room.id}`} className="rounded-sm border-2 border-line-strong bg-surface p-4 text-text shadow-[2px_2px_0_#141413] transition hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#141413]">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-black">Phòng {room.roomNumber || room.id}</p>
                          <p className="mt-1 text-sm font-semibold text-text-muted">Tầng {formatValue("floor", room.floor)}</p>
                        </div>
                        <StatusBadge status={room.status} />
                      </div>
                      <p className="mt-3 text-sm font-bold">Sức chứa: {room.currentOccupancy ?? 0}/{room.capacity ?? "—"}</p>
                      <p className="mt-1 text-sm font-bold">Giá tháng: {formatValue("pricePerMonth", room.pricePerMonth)}</p>
                    </Link>
                  ))}
                </div>
              ) : <p className="m-0 text-sm font-semibold text-text-muted">Tòa nhà chưa có phòng nào.</p>}
            </section>
          )}

          {/* Sidebar Thông tin hệ thống (Chiếm 4 cột ở màn hình rộng) */}
          {/* <div className="lg:col-span-4 space-y-6">
            <SystemInfo />
          </div> */}
        </div>
      )}

      {isApplicationReview && confirmationAction && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !busy) setConfirmationAction(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="application-confirm-title"
            className="box-border w-[480px] max-w-[95vw] max-h-[90vh] overflow-y-auto bg-surface border-3 border-line-strong shadow-[6px_6px_0_#141413] rounded-sm p-6"
          >
            <div className="flex items-start justify-between gap-4 mb-5">
              <h2 id="application-confirm-title" className="w-full block leading-normal text-lg font-black text-text">
                {confirmationAction.reason ? "Xác nhận từ chối đơn" : "Xác nhận duyệt đơn"}
              </h2>
              <button
                type="button"
                aria-label="Đóng"
                disabled={busy}
                onClick={() => setConfirmationAction(null)}
                className="p-1 border-2 border-transparent hover:border-line-strong rounded-sm text-text-muted hover:text-text outline-none! transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {confirmationAction.reason ? (
              <div className="space-y-2 mb-5">
                <label htmlFor="application-rejection-reason" className="text-sm font-extrabold text-text">
                  Lý do từ chối (bắt buộc)
                </label>
                <textarea
                  id="application-rejection-reason"
                  value={rejectionReason}
                  onChange={(event) => setRejectionReason(event.target.value)}
                  rows={4}
                  maxLength={500}
                  placeholder="Nhập lý do từ chối đơn đăng ký..."
                  className="w-full border-3 border-line-strong bg-surface rounded-sm p-3 text-sm font-bold text-text shadow-[3px_3px_0_#141413] focus:shadow-[4px_4px_0_#141413] outline-none! transition-all resize-y"
                />
                <div className="text-right text-xs font-bold text-text-muted">{rejectionReason.length}/500</div>
              </div>
            ) : (
              <p className="w-full block leading-normal mb-6 text-sm font-bold leading-relaxed text-text">
                Xác nhận duyệt đơn đăng ký #{id} và phân phòng {data?.requestedRoomNumber || data?.roomNumber || data?.room?.roomNumber || "theo nguyện vọng"} cho sinh viên {data?.studentName || data?.fullName || data?.student?.fullName || "này"}?
              </p>
            )}

            {actionError && <p role="alert" className="mb-4 text-sm font-extrabold text-error">{actionError}</p>}

            <div className="flex flex-wrap justify-end gap-3">
              <button
                type="button"
                disabled={busy}
                onClick={() => setConfirmationAction(null)}
                className="border-3 border-line-strong bg-surface rounded-sm px-4 py-2.5 font-extrabold text-sm text-text shadow-[3px_3px_0_#141413] hover:-translate-y-0.5 transition-all outline-none! disabled:opacity-50"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={busy || (confirmationAction.reason && !rejectionReason.trim()) || rejectionReason.length > 500}
                onClick={() => doAction(confirmationAction, { confirmed: true, reason: rejectionReason })}
                className={`border-3 border-line-strong rounded-sm px-4 py-2.5 font-black text-sm shadow-[3px_3px_0_#141413] hover:-translate-y-0.5 active:translate-y-0 transition-all outline-none! disabled:opacity-50 disabled:cursor-not-allowed ${confirmationAction.reason ? "bg-error text-white" : "bg-primary text-black"}`}
              >
                {busy ? "Đang xử lý..." : confirmationAction.reason ? "Xác nhận từ chối" : "Xác nhận duyệt"}
              </button>
            </div>
          </section>
        </div>
      )}

      {confirmModal.isOpen && pendingConfirmAction && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="box-border w-[480px] max-w-[95vw] bg-surface border-3 border-line-strong rounded-sm p-6 shadow-[6px_6px_0_#141413]">
            <h3 className="w-full block leading-normal text-xl font-black text-text mb-2">
              {confirmModal.action === "LOCK"
                ? "Xác nhận khóa tài khoản?"
                : confirmModal.action === "UNLOCK"
                  ? "Xác nhận mở khóa tài khoản?"
                  : `Xác nhận ${pendingConfirmAction.label.toLowerCase()}?`}
            </h3>
            <p className="w-full block leading-normal text-sm font-bold text-text-muted mb-6">
              {confirmModal.action === "LOCK"
                ? `Tài khoản sinh viên ${student?.fullName || ""} sẽ bị tạm khóa.`
                : confirmModal.action === "UNLOCK"
                  ? `Mở khóa quyền truy cập cho sinh viên ${student?.fullName || ""}.`
                  : `Bạn có chắc muốn thực hiện thao tác “${pendingConfirmAction.label}”?`}
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  setConfirmModal({ isOpen: false, action: null });
                  setPendingConfirmAction(null);
                }}
                className="px-4 py-2 border-2 text-sm! shadow-[2px_2px_0_#141413]  border-line-strong rounded-sm font-bold! bg-surface hover:bg-surface-2 transition-all cursor-pointer outline-none! disabled:opacity-50"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={
                  confirmModal.action === "LOCK"
                    ? handleLockStudent
                    : confirmModal.action === "UNLOCK"
                      ? handleUnlockStudent
                      : () => void doAction(pendingConfirmAction, { confirmed: true })
                }
                className={`px-4 py-2 border-2 text-sm! border-line-strong rounded-sm font-black! text-white shadow-[2px_2px_0_#141413] transition-all cursor-pointer outline-none! disabled:opacity-50 ${
                  confirmModal.action === "LOCK"
                    ? "bg-error"
                    : "bg-success text-black!"
                }`}
              >
                {busy
                  ? "Đang xử lý..."
                  : confirmModal.action === "LOCK"
                    ? "Xác nhận khóa"
                    : confirmModal.action === "UNLOCK"
                      ? "Xác nhận mở khóa"
                      : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}

      {pendingInput && (
        <div className="fixed inset-0 z-[101] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <form
            className="box-border w-[480px] max-w-[95vw] bg-surface border-3 border-line-strong rounded-sm p-6 shadow-[6px_6px_0_#141413]"
            onSubmit={(event) => {
              event.preventDefault();
              const value = pendingInput.value.trim();
              if (!value && (pendingInput.kind === "room" || pendingInput.action.promptRequired || pendingInput.kind === "reason")) {
                toast.error(pendingInput.kind === "room" ? "Vui lòng nhập mã phòng." : "Trường này là bắt buộc.");
                return;
              }
              const action = pendingInput.action;
              setPendingInput(null);
              void doAction(action, { inputSubmitted: true, inputValue: value });
            }}
          >
            <h3 className="w-full block leading-normal text-xl font-black text-text mb-2">
              {pendingInput.action.promptLabel || (pendingInput.kind === "room" ? "Nhập mã phòng" : pendingInput.kind === "reason" ? "Nhập lý do" : `Nhập ${pendingInput.action.promptField}`)}
            </h3>
            <p className="w-full block leading-normal text-sm font-bold text-text-muted mb-4">
              {pendingInput.kind === "room" ? "Nhập mã phòng phù hợp để phân cho sinh viên." : pendingInput.kind === "reason" ? "Vui lòng cung cấp lý do để hoàn tất thao tác." : "Điền thông tin để tiếp tục thao tác."}
            </p>
            {pendingInput.kind === "reason" || pendingInput.action.promptMultiline ? (
              <textarea
                autoFocus
                value={pendingInput.value}
                maxLength={pendingInput.action.promptMaxLength || 1000}
                onChange={(event) => setPendingInput((current) => ({ ...current, value: event.target.value }))}
                rows={4}
                className="w-full box-border border-3 border-line-strong bg-surface rounded-sm p-3 text-sm font-bold text-text shadow-[3px_3px_0_#141413] outline-none! transition-all"
              />
            ) : (
              <input
                autoFocus
                value={pendingInput.value}
                onChange={(event) => setPendingInput((current) => ({ ...current, value: event.target.value }))}
                className="w-full box-border border-3 border-line-strong bg-surface rounded-sm p-3 text-sm font-bold text-text shadow-[3px_3px_0_#141413] outline-none! transition-all"
              />
            )}
            <div className="flex justify-end gap-3 mt-5">
              <button type="button" onClick={() => setPendingInput(null)} className="border-3 border-line-strong bg-surface rounded-sm px-4 py-2 font-bold shadow-[2px_2px_0_#141413] outline-none! transition-all">Hủy</button>
              <button type="submit" className="border-3 border-line-strong bg-primary text-black rounded-sm px-4 py-2 font-black shadow-[3px_3px_0_#141413] outline-none! transition-all">Tiếp tục</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
