// ====================================
// REQUEST DIALOGS - Gia hạn / Chuyển phòng / Trả phòng
// ====================================
// Ba luồng yêu cầu của sinh viên dùng chung một nền tảng dialog thay vì form trống:
// 1. Luôn hiển thị NGỮ CẢNH (phòng hiện tại + hợp đồng) để SV biết mình đang thao tác trên gì.
// 2. Chuyển phòng: chọn từ danh sách phòng trống THẬT (/student/rooms-available) có giá,
//    chỗ còn lại, trạng thái — không còn nhập tên phòng tự do.
// 3. Tách Form (nhúng được vào trang riêng) và Dialog (overlay) để tái sử dụng ở cả
//    ResidencePage lẫn /student/.../new pages.

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowLeftRight,
  BedDouble,
  Building2,
  CalendarClock,
  CheckCircle2,
  CircleAlert,
  DoorOpen,
  Layers,
  LoaderCircle,
  RefreshCw,
  Search,
  Wallet,
  X,
} from "lucide-react";
import { api, asList } from "../api/apiClient";
import { resources } from "../services/resource.service";
import { errorMessage } from "../utils/errorHandler";
import { money, date as formatDate } from "../utils/format";
import { CustomSelect } from "./ui/CustomSelect";
import { CustomDatePicker } from "./ui/CustomDatePicker";
import { StatusBadge } from "./ui";

const shellOverlay =
  "fixed inset-0 z-90 flex items-start justify-center overflow-y-auto bg-black/60 backdrop-blur-xs p-4 sm:p-6";
const shellPanel =
  "relative box-border w-160 max-w-[96vw] my-auto bg-surface border-4 border-line-strong rounded-sm shadow-[8px_8px_0_#141413] overflow-hidden";
const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-sm border-3 border-line-strong bg-primary px-4 py-2.5 text-sm font-black text-black shadow-[3px_3px_0_#141413] transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#141413] active:translate-y-0.5 active:shadow-none outline-none! disabled:opacity-60 disabled:pointer-events-none";
const btnGhost =
  "inline-flex items-center justify-center gap-2 rounded-sm border-3 border-line-strong bg-surface px-4 py-2.5 text-sm font-bold text-text shadow-[3px_3px_0_#141413] transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#141413] active:translate-y-0.5 active:shadow-none outline-none!";
const fieldLabel =
  "block text-xs font-black uppercase tracking-wide text-text-muted";
const control =
  "mt-1.5 w-full rounded-sm border-3 border-line-strong bg-surface px-3 py-2.5 text-sm font-bold text-text shadow-[3px_3px_0_#141413] outline-none! transition-all";

const ROOM_TYPE_LABELS = {
  SINGLE: "Phòng đơn",
  DOUBLE: "Phòng đôi",
  QUAD: "Phòng 4 người",
  SIX_BED: "Phòng 6 người",
  EIGHT_BED: "Phòng 8 người",
};

function roomTypeLabel(value) {
  return ROOM_TYPE_LABELS[String(value || "").toUpperCase()] || value || "—";
}

/** Thêm `months` tháng vào một mốc ngày (giữ logic cũ của ResidencePage). */
function addMonths(value, months) {
  const base = value ? new Date(value) : new Date();
  if (Number.isNaN(base.getTime())) return null;
  const next = new Date(base);
  next.setMonth(next.getMonth() + Number(months));
  return next;
}

// ------------------------------------------------------------------
// Khung dialog dùng chung (Neo-Brutalism) — header icon + title + nút đóng, Esc để đóng
// ------------------------------------------------------------------
export function DialogShell({ icon: Icon, tone = "bg-primary text-black", title, subtitle, onClose, children }) {
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className={shellOverlay}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className={shellPanel}>
        <div className="flex items-start gap-3 border-b-3 border-line-strong bg-surface-2 px-5 py-4">
          <span
            className={`grid size-10 shrink-0 place-items-center rounded-sm border-3 border-line-strong shadow-[2px_2px_0_#141413] ${tone}`}
          >
            <Icon size={20} strokeWidth={2.5} />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-black text-text">{title}</h2>
            {subtitle && (
              <p className="mt-0.5 text-xs font-bold text-text-muted">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            aria-label="Đóng"
            onClick={onClose}
            className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-sm border-3 border-line-strong bg-surface shadow-[2px_2px_0_#141413] transition-all hover:bg-error hover:text-white outline-none!"
          >
            <X size={16} strokeWidth={3} />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// Thẻ ngữ cảnh: phòng hiện tại + hợp đồng — hiển thị ở đầu cả 3 dialog/trang
// ------------------------------------------------------------------
export function RoomContractContext({ room, contract, extra }) {
  const facts = [
    { icon: BedDouble, label: "Phòng hiện tại", value: room?.roomNumber || "—" },
    {
      icon: Building2,
      label: "Tòa nhà",
      value: room?.buildingName || room?.building?.name || "—",
    },
    { icon: Layers, label: "Tầng", value: room?.floor ?? "—" },
  ];
  return (
    <div className="rounded-sm border-3 border-line-strong bg-surface-2 p-4 shadow-[3px_3px_0_#141413]">
      <p className="mb-3 text-[11px] font-black uppercase tracking-wider text-text-muted">
        Thông tin hiện tại của bạn
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {facts.map(({ icon: Icon, label, value }) => (
          <div key={label} className="min-w-0">
            <p className="m-0 flex items-center gap-1.5 text-[11px] font-extrabold uppercase text-text-muted">
              <Icon size={13} /> {label}
            </p>
            <p className="mt-1 truncate text-sm font-black text-text">{value}</p>
          </div>
        ))}
      </div>
      {contract && (
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 border-t-2 border-line-strong/20 pt-3 text-xs font-bold text-text-muted">
          <span className="text-text">
            Hợp đồng #{contract.contractId || contract.id || "—"}
          </span>
          <span>
            {formatDate(contract.startDate)} – {formatDate(contract.endDate)}
          </span>
          {contract.status && <StatusBadge status={contract.status} />}
          {extra}
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------------
// 1) GIA HẠN HỢP ĐỒNG — hiện hợp đồng hiện tại + xem trước ngày kết thúc mới
// ------------------------------------------------------------------
export function RenewForm({ contract, room, onDone, onCancel, disabled = false, submitLabel = "Gửi yêu cầu gia hạn" }) {
  const [months, setMonths] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  const newEnd = useMemo(
    () => (months ? addMonths(contract?.endDate, Number(months)) : null),
    [months, contract?.endDate],
  );

  async function handleSubmit(event) {
    event.preventDefault();
    const contractId = contract?.contractId ?? contract?.id;
    if (!contractId || !months) return;
    setBusy(true);
    try {
      const nextEnd = addMonths(contract?.endDate, Number(months));
      await api(`/student/contracts/${contractId}/renewal-requests`, {
        method: "POST",
        body: {
          requestedEndDate: nextEnd.toISOString().slice(0, 10),
          reason: reason.trim(),
        },
      });
      onDone?.();
    } catch {
      // API client đã toast lỗi globally.
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <RoomContractContext room={room} contract={contract} />

      <div>
        <label className={fieldLabel}>
          Gia hạn thêm bao lâu?
          <CustomSelect
            required
            disabled={disabled}
            value={months}
            onChange={setMonths}
            options={[1, 2, 3, 6, 12].map((n) => ({
              value: String(n),
              label: `${n} tháng`,
            }))}
            placeholder="Chọn số tháng gia hạn"
            className="mt-1.5"
          />
        </label>
        {/* Xem trước ngày kết thúc mới ngay khi chọn số tháng */}
        {newEnd && !Number.isNaN(newEnd.getTime()) && (
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-sm border-3 border-line-strong bg-surface-2 px-4 py-3 text-sm font-bold text-text shadow-[3px_3px_0_#141413]">
            <CalendarClock size={18} className="shrink-0 text-text-muted" />
            <span className="text-text-muted">
              {formatDate(contract?.endDate)}
            </span>
            <span aria-hidden="true">→</span>
            <span className="font-black text-text">
              {newEnd.toLocaleDateString("vi-VN", { timeZone: "UTC" })}
            </span>
            <span className="text-xs font-bold text-text-muted">
              (hạn mới dự kiến sau khi duyệt)
            </span>
          </div>
        )}
      </div>

      <label className={fieldLabel}>
        Lý do / ghi chú (không bắt buộc)
        <textarea
          rows={3}
          disabled={disabled}
          className={control}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Ví dụ: gia hạn để tiếp tục ở học tiếp kỳ tới…"
        />
      </label>

      <div className="flex flex-wrap justify-end gap-3 pt-1">
        {onCancel && (
          <button type="button" onClick={onCancel} className={btnGhost}>
            Đóng
          </button>
        )}
        <button type="submit" disabled={busy || disabled || !months} className={btnPrimary}>
          {busy ? (
            <LoaderCircle size={18} className="animate-spin" />
          ) : (
            <RefreshCw size={18} />
          )}
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

export function RenewDialog({ contract, room, onClose }) {
  return (
    <DialogShell
      icon={RefreshCw}
      title="Gia hạn hợp đồng"
      subtitle="Chọn thời gian gia hạn cho hợp đồng hiện tại — yêu cầu sẽ được ban quản lý duyệt"
      onClose={onClose}
    >
      <RenewForm contract={contract} room={room} onDone={onClose} onCancel={onClose} />
    </DialogShell>
  );
}

// ------------------------------------------------------------------
// 2) CHUYỂN PHÒNG — hiện phòng hiện tại + danh sách phòng trống thật để chọn
// ------------------------------------------------------------------
function RoomOptionCard({ roomOption, selected, onSelect }) {
  const available =
    String(roomOption.status || "").toUpperCase() === "AVAILABLE";
  const free = Math.max(
    0,
    (roomOption.capacity || 0) - (roomOption.currentOccupancy || 0),
  );
  return (
    <button
      type="button"
      disabled={!available}
      onClick={() => onSelect(roomOption)}
      aria-pressed={selected}
      className={`relative w-full cursor-pointer rounded-sm border-3 border-line-strong bg-surface p-3.5 text-left transition-all outline-none! shadow-[3px_3px_0_#141413] ${
        selected
          ? "border-primary bg-primary/25 ring-2 ring-line-strong"
          : "hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#141413]"
      } ${!available ? "opacity-55 saturate-0 pointer-events-none" : ""}`}
    >
      {selected && (
        <span className="absolute top-2 right-2 grid size-6 place-items-center rounded-full border-2 border-line-strong bg-primary text-black shadow-[1px_1px_0_#141413]">
          <CheckCircle2 size={14} strokeWidth={3} />
        </span>
      )}
      <div className="flex flex-wrap items-center gap-2 pr-7">
        <span className="text-base font-black text-text">
          {roomOption.roomNumber || "?"}
        </span>
        <span className="text-xs font-bold text-text-muted">
          Tòa {roomOption.buildingName || "—"}
          {roomOption.floor != null ? ` · Tầng ${roomOption.floor}` : ""}
        </span>
        <StatusBadge status={roomOption.status || "AVAILABLE"} />
      </div>
      <p className="m-0 mt-1.5 text-xs font-bold text-text-muted">
        {roomTypeLabel(roomOption.roomType)} · {roomOption.currentOccupancy || 0}/
        {roomOption.capacity || 0} người · còn {free} chỗ
      </p>
      <p className="m-0 mt-1 text-sm font-black text-text">
        {money(roomOption.pricePerMonth)}
        <span className="text-xs font-bold text-text-muted">/tháng</span>
      </p>
    </button>
  );
}

export function TransferForm({ room, contract, onDone, onCancel, submitLabel = "Gửi yêu cầu chuyển phòng" }) {
  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [roomsError, setRoomsError] = useState("");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoadingRooms(true);
      setRoomsError("");
      try {
        // Endpoint phòng trống cho sinh viên (backend đã lọc theo giới tính/điều kiện).
        const data = await resources.list("/student/rooms-available", {
          page: 0,
          size: 50,
        });
        if (active) setRooms(asList(data));
      } catch {
        if (active) setRoomsError("Không tải được danh sách phòng trống. Vui lòng thử lại.");
      } finally {
        if (active) setLoadingRooms(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const currentRoomId = room?.id ?? room?.roomId;
  const candidates = rooms.filter((item) => {
    if (String(item.id) === String(currentRoomId)) return false; // ẩn phòng đang ở
    const keyword = query.trim().toLocaleLowerCase("vi");
    if (!keyword) return true;
    return [item.roomNumber, item.buildingName]
      .filter(Boolean)
      .some((value) =>
        String(value).toLocaleLowerCase("vi").includes(keyword),
      );
  });
  const selectedRoom = rooms.find(
    (item) => String(item.id) === String(selectedId),
  );

  async function handleSubmit(event) {
    event.preventDefault();
    if (!selectedRoom) return;
    setBusy(true);
    try {
      await api("/student/room-transfer-requests", {
        method: "POST",
        body: {
          preferredBuilding: selectedRoom.buildingName || "",
          preferredRoomId: selectedRoom.id,
          reason: reason.trim(),
        },
      });
      onDone?.();
    } catch {
      // API client đã toast lỗi globally.
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <RoomContractContext room={room} contract={contract} />

      <fieldset className="min-w-0" disabled={busy}>
        <legend className="mb-2 block text-xs font-black uppercase tracking-wide text-text-muted">
          Chọn phòng muốn chuyển đến
        </legend>

        <label className="relative block">
          <Search
            size={16}
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-text-muted"
          />
          <input
            type="search"
            className={`${control} pl-9`}
            placeholder="Tìm theo số phòng hoặc tòa nhà…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>

        {loadingRooms ? (
          <div className="mt-3 flex items-center gap-2 rounded-sm border-3 border-dashed border-line-strong bg-surface-2 px-4 py-5 text-sm font-bold text-text-muted">
            <LoaderCircle size={18} className="animate-spin" />
            Đang tải danh sách phòng trống…
          </div>
        ) : roomsError ? (
          <div className="mt-3 flex items-center gap-2 rounded-sm border-3 border-line-strong bg-error-light px-4 py-5 text-sm font-bold text-error">
            <CircleAlert size={18} className="shrink-0" />
            {roomsError}
          </div>
        ) : candidates.length === 0 ? (
          <div className="mt-3 flex items-center gap-2 rounded-sm border-3 border-dashed border-line-strong bg-surface-2 px-4 py-5 text-sm font-bold text-text-muted">
            <Search size={18} className="shrink-0" />
            Không có phòng trống nào phù hợp
            {query ? " với từ khóa này" : " hiện tại"}.
          </div>
        ) : (
          <div className="mt-3 grid max-h-72 gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
            {candidates.map((item) => (
              <RoomOptionCard
                key={item.id}
                roomOption={item}
                selected={String(item.id) === String(selectedId)}
                onSelect={(option) => setSelectedId(option.id)}
              />
            ))}
          </div>
        )}
      </fieldset>

      {selectedRoom && (
        <div className="flex flex-wrap items-center gap-2 rounded-sm border-3 border-line-strong bg-success-light px-4 py-3 text-sm font-bold text-text shadow-[3px_3px_0_#141413]">
          <CheckCircle2 size={18} className="shrink-0 text-success" />
          Đã chọn phòng{" "}
          <strong className="font-black">
            {selectedRoom.roomNumber} · Tòa {selectedRoom.buildingName}
          </strong>{" "}
          — {money(selectedRoom.pricePerMonth)}/tháng
        </div>
      )}

      <label className={fieldLabel}>
        Lý do chuyển phòng
        <textarea
          rows={3}
          required
          disabled={busy}
          className={control}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Ví dụ: muốn ở gần bạn cùng lớp / phòng hiện tại ẩm mốc…"
        />
      </label>

      <p className="m-0 flex items-start gap-2 text-xs font-bold text-text-muted">
        <CircleAlert size={14} className="mt-0.5 shrink-0" />
        Yêu cầu chuyển phòng cần ban quản lý phê duyệt; giá phòng mới có thể
        khác giá phòng hiện tại.
      </p>

      <div className="flex flex-wrap justify-end gap-3 pt-1">
        {onCancel && (
          <button type="button" onClick={onCancel} className={btnGhost}>
            Đóng
          </button>
        )}
        <button type="submit" disabled={busy || !selectedRoom} className={btnPrimary}>
          {busy ? (
            <LoaderCircle size={18} className="animate-spin" />
          ) : (
            <ArrowLeftRight size={18} />
          )}
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

export function TransferDialog({ room, contract, onClose }) {
  return (
    <DialogShell
      icon={ArrowLeftRight}
      tone="bg-info text-black"
      title="Yêu cầu chuyển phòng"
      subtitle="Chọn phòng trống bạn muốn chuyển đến — danh sách lấy trực tiếp từ hệ thống"
      onClose={onClose}
    >
      <TransferForm room={room} contract={contract} onDone={onClose} onCancel={onClose} />
    </DialogShell>
  );
}

// ------------------------------------------------------------------
// 3) TRẢ PHÒNG — hiện phòng + hợp đồng + tiền cọc, chọn ngày trả dự kiến
// ------------------------------------------------------------------
export function CheckoutForm({ room, contract, onDone, onCancel, submitLabel = "Gửi yêu cầu trả phòng" }) {
  const [checkoutDate, setCheckoutDate] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  const deposit =
    contract?.depositAmount ?? contract?.deposit ?? room?.depositAmount;

  async function handleSubmit(event) {
    event.preventDefault();
    if (!checkoutDate) return;
    setBusy(true);
    try {
      await api("/student/checkout-requests", {
        method: "POST",
        body: { checkoutDate, reason: reason.trim() },
      });
      onDone?.();
    } catch {
      // API client đã toast lỗi globally.
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <RoomContractContext
        room={room}
        contract={contract}
        extra={
          deposit != null ? (
            <span className="inline-flex items-center gap-1.5 text-text">
              <Wallet size={14} /> Tiền cọc đang giữ: {money(deposit)}
            </span>
          ) : null
        }
      />

      <label className={fieldLabel}>
        Ngày dự kiến trả phòng
        <CustomDatePicker
          required
          disabled={busy}
          min={new Date().toISOString().slice(0, 10)}
          value={checkoutDate}
          onChange={setCheckoutDate}
          className="mt-1.5"
        />
      </label>

      <label className={fieldLabel}>
        Lý do / ghi chú (không bắt buộc)
        <textarea
          rows={3}
          disabled={busy}
          className={control}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Ví dụ: hoàn thành khóa học, chuyển nơi ở khác…"
        />
      </label>

      <p className="m-0 flex items-start gap-2 rounded-sm border-3 border-line-strong bg-warning px-4 py-3 text-xs font-bold text-black shadow-[3px_3px_0_#141413]">
        <CircleAlert size={16} className="mt-0.5 shrink-0" />
        Yêu cầu cần ban quản lý phê duyệt. Khi hoàn tất trả phòng, ban quản lý
        sẽ quyết định hoàn trả hoặc xử lý tiền cọc theo tình trạng phòng.
      </p>

      <div className="flex flex-wrap justify-end gap-3 pt-1">
        {onCancel && (
          <button type="button" onClick={onCancel} className={btnGhost}>
            Đóng
          </button>
        )}
        <button type="submit" disabled={busy || !checkoutDate} className={btnPrimary}>
          {busy ? (
            <LoaderCircle size={18} className="animate-spin" />
          ) : (
            <DoorOpen size={18} />
          )}
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

export function CheckoutDialog({ room, contract, onClose }) {
  return (
    <DialogShell
      icon={DoorOpen}
      tone="bg-error text-white"
      title="Yêu cầu trả phòng"
      subtitle="Chọn ngày dự kiến trả phòng — ban quản lý sẽ xem xét và phản hồi"
      onClose={onClose}
    >
      <CheckoutForm room={room} contract={contract} onDone={onClose} onCancel={onClose} />
    </DialogShell>
  );
}

// ------------------------------------------------------------------
// Hook dùng chung: lấy chỗ ở + hợp đồng hiện tại của sinh viên (cho các trang riêng)
// ------------------------------------------------------------------
export function useCurrentStay() {
  const [room, setRoom] = useState(null);
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [assignments, contracts] = await Promise.all([
          resources.list("/student/room-assignments", { page: 0, size: 20 }),
          resources.list("/student/contracts", { page: 0, size: 20 }),
        ]);
        if (!active) return;
        const current = (assignments?.content || []).find((item) =>
          ["ASSIGNED", "CHECKED_IN"].includes(
            String(item.assignmentStatus || item.status).toUpperCase(),
          ),
        );
        setRoom(current?.room || current || null);
        const list = contracts?.content || contracts?.items || [];
        setContract(
          list.find(
            (item) => String(item?.status || "").toUpperCase() === "ACTIVE",
          ) ||
            list[0] ||
            null,
        );
      } catch (err) {
        if (active) setError(errorMessage(err));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return { room, contract, loading, error };
}

// ------------------------------------------------------------------
// Khung trang riêng cho từng luồng (thay thế FormScreen trống):
// nút quay lại + card tiêu đề + nội dung form có ngữ cảnh
// ------------------------------------------------------------------
export function RequestPageShell({
  icon: Icon,
  tone = "bg-primary text-black",
  title,
  subtitle,
  onBack,
  children,
}) {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-5">
      {onBack && (
        <button type="button" onClick={onBack} className={btnGhost}>
          <ArrowLeft size={16} strokeWidth={2.5} /> Quay lại
        </button>
      )}
      <section className="bg-surface border-4 border-line-strong rounded-sm shadow-[6px_6px_0_#141413]">
        <div className="flex items-start gap-3 border-b-3 border-line-strong bg-surface-2 px-5 py-4">
          <span
            className={`grid size-10 shrink-0 place-items-center rounded-sm border-3 border-line-strong shadow-[2px_2px_0_#141413] ${tone}`}
          >
            <Icon size={20} strokeWidth={2.5} />
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-black text-text">{title}</h1>
            {subtitle && (
              <p className="mt-0.5 text-xs font-bold text-text-muted">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        <div className="px-5 py-5">{children}</div>
      </section>
    </div>
  );
}
