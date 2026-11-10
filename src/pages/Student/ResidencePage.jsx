import { useEffect, useState } from "react";
import {
  ArrowLeftRight,
  Building2,
  DoorOpen,
  FileText,
  Users,
  CalendarDays,
  Download,
  RefreshCw,
} from "lucide-react";
import Workspace from "../../components/Workspace";
import { resources } from "../../services/resource.service";
import { api } from "../../api/apiClient";
import { CustomSelect } from "../../components/ui/CustomSelect";
import { CustomDatePicker } from "../../components/ui/CustomDatePicker";

const card =
  "bg-surface border-4 border-line-strong rounded-sm p-6 shadow-[5px_5px_0_#141413]";
const action =
  "px-4 py-2 bg-warning border-3 border-line-strong rounded-sm text-sm! font-extrabold! shadow-[2px_2px_0_#141413] hover:shadow-[3px_3px_0_#141413]  hover:-translate-0.5 active:translate-0.5 active:shadow-none outline-none! transition-all";
const control =
  "mt-2 w-full rounded-sm border-3 border-line-strong px-3 py-2.5 shadow-[3px_3px_0_#141413] outline-none! transition-all";
const first = (r) => r?.content?.[0] || r?.items?.[0] || null;
const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("vi-VN", { timeZone: "UTC" });
};
const formatCurrency = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

export default function ResidencePage() {
  const [assignment, setAssignment] = useState(null);
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState("");
  const [form, setForm] = useState({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [assignments, contracts] = await Promise.all([
          resources.list("/student/room-assignments", { page: 0, size: 20 }),
          resources.list("/student/contracts", { page: 0, size: 20 }),
        ]);
        setAssignment(
          (assignments?.content || []).find((a) =>
            ["ASSIGNED", "CHECKED_IN"].includes(
              String(a.assignmentStatus || a.status).toUpperCase(),
            ),
          ) || first(assignments),
        );
        const contractList = contracts?.content || contracts?.items || [];
        setContract(
          contractList.find(
            (item) => String(item?.status || "").toUpperCase() === "ACTIVE",
          ) ||
            contractList[0] ||
            null,
        );
      } catch {
        // API client reports request failures globally.
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const open = (kind) => {
    setForm({});
    setModal(kind);
  };
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      let endpoint, body;
      if (modal === "renew") {
        const date = new Date(contract?.endDate || Date.now());
        date.setMonth(date.getMonth() + Number(form.months));
        endpoint = `/student/contracts/${contract.contractId}/renewal-requests`;
        body = {
          requestedEndDate: date.toISOString().slice(0, 10),
          reason: form.reason || "",
        };
      } else if (modal === "transfer") {
        endpoint = "/student/room-transfer-requests";
        body = {
          preferredBuilding: form.building,
          preferredRoomId: form.room || undefined,
          reason: form.reason,
        };
      } else {
        endpoint = "/student/checkout-requests";
        body = { checkoutDate: form.date, reason: form.reason || "" };
      }
      await api(endpoint, { method: "POST", body });
      setModal("");
    } catch {
      // API client reports request failures globally.
    } finally {
      setBusy(false);
    }
  }

  const room = assignment?.room || assignment;
  const roommates =
    assignment?.roommates ||
    assignment?.roomAssignments ||
    room?.roommates ||
    room?.roomAssignments ||
    [];
  const deposit =
    contract?.depositAmount ?? contract?.deposit ?? assignment?.depositAmount;
  const contractStatus = String(
    contract?.status || contract?.contractStatus || "",
  ).toUpperCase();
  const activeContract = contractStatus === "ACTIVE";

  const statusBadge = {
    ACTIVE: { label: "ĐANG HOẠT ĐỘNG", style: "bg-success text-black" },
    EXPIRED: { label: "ĐÃ HẾT HẠN", style: "bg-surface-3 text-text-muted" },
    TERMINATED: { label: "ĐÃ HỦY", style: "bg-error text-white" },
    CANCELLED: { label: "ĐÃ HỦY", style: "bg-error text-white" },
  }[contractStatus] || {
    label: contractStatus || "CHƯA CÓ TRẠNG THÁI",
    style: "bg-surface-3 text-text-muted",
  };
  return (
    <Workspace group="student" title="Chỗ ở & Hợp đồng">
      <div className="space-y-7">
        {loading && (
          <p className="font-bold text-text-muted">Đang tải thông tin…</p>
        )}
        {!loading && (
          <div className="grid lg:grid-cols-2 gap-6">
            <section className={card}>
              <h2 className="w-full block leading-normal text-xl font-black flex gap-2 items-center mb-5">
                <Building2 /> Thông tin chỗ ở
              </h2>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm opacity-70">Phòng</dt>
                  <dd className="font-extrabold">
                    {room?.roomNumber || "Chưa có thông tin"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm opacity-70">Tòa nhà</dt>
                  <dd className="font-extrabold">
                    {room?.buildingName || room?.building?.name || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm opacity-70">Diện tích</dt>
                  <dd className="font-extrabold">
                    {room?.area ? `${room.area} m²` : "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm opacity-70">Tầng</dt>
                  <dd className="font-extrabold">{room?.floor ?? "—"}</dd>
                </div>
              </dl>
              <h3 className="font-black flex items-center gap-2 mt-6 mb-3">
                <Users size={18} /> Bạn cùng phòng
              </h3>
              {roommates.length ? (
                <ul className="grid sm:grid-cols-2 gap-3 list-none p-0 m-0">
                  {roommates.map((entry, i) => {
                    const member = entry?.student || entry;
                    const fullName =
                      member?.fullName ||
                      member?.studentName ||
                      member?.user?.fullName ||
                      `Sinh viên ${i + 1}`;
                    const contactPhone =
                      member?.phoneNumber ||
                      member?.phone ||
                      member?.user?.phoneNumber;
                    const contactEmail = member?.email || member?.user?.email;
                    return (
                      <li
                        key={
                          member?.studentId ||
                          member?.id ||
                          entry?.assignmentId ||
                          i
                        }
                        className="flex min-w-0 items-center gap-3 border-2 border-line-strong bg-surface-2 rounded-sm p-3 shadow-[2px_2px_0_#141413]"
                      >
                        <span className="grid size-10 shrink-0 place-items-center border-2 border-line-strong bg-primary rounded-sm font-black uppercase shadow-[2px_2px_0_#141413]">
                          {fullName.trim().charAt(0) || "?"}
                        </span>
                        <span className="min-w-0">
                          <strong className="block truncate text-sm font-black text-text">
                            {fullName}
                          </strong>
                          {contactPhone && (
                            <span className="block truncate text-xs font-semibold text-text-muted">
                              {contactPhone}
                            </span>
                          )}
                          {!contactPhone && contactEmail && (
                            <span className="block truncate text-xs font-semibold text-text-muted">
                              {contactEmail}
                            </span>
                          )}
                          {contactPhone && contactEmail && (
                            <span className="block truncate text-xs font-semibold text-text-muted">
                              {contactEmail}
                            </span>
                          )}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="flex items-center gap-3 border-2 border-dashed border-line-strong bg-surface-2 rounded-sm p-4 text-sm font-semibold text-text-muted">
                  <Users size={20} className="shrink-0" />
                  <span>Chưa có thông tin bạn cùng phòng.</span>
                </div>
              )}
            </section>
            <section className={card}>
              <h2 className="w-full block leading-normal text-xl font-black flex gap-2 items-center mb-5">
                <FileText /> Chi tiết hợp đồng
              </h2>
              {contract ? (
                <>
                  <dl className="space-y-4">
                    <div>
                      <dt className="text-sm opacity-70">Mã hợp đồng</dt>
                      <dd className="font-extrabold">
                        {contract.contractId || contract.id || "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm opacity-70">Thời hạn</dt>
                      <dd className="font-extrabold">
                        {formatDate(contract.startDate)} –{" "}
                        {formatDate(contract.endDate)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm opacity-70">Trạng thái</dt>
                      <dd>
                        <span
                          className={`inline-flex items-center px-3 py-1 border-2 border-line-strong rounded-xs shadow-[2px_2px_0_#141413] font-extrabold text-xs ${statusBadge.style}`}
                        >
                          {statusBadge.label}
                        </span>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm opacity-70">Tiền cọc</dt>
                      <dd className="font-extrabold">
                        {deposit == null ? "—" : formatCurrency(deposit)}
                      </dd>
                    </div>
                  </dl>
                  {contract.pdfUrl || contract.documentUrl ? (
                    <a
                      className="mt-6 inline-flex items-center gap-2 px-3 py-1.5 bg-secondary text-black font-extrabold border-2 border-line-strong rounded-sm shadow-[2px_2px_0_#141413] hover:-translate-y-0.5 hover:shadow-[3px_3px_0_#141413] transition-all outline-none!"
                      href={contract.pdfUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Download size={18} /> Xem / Tải hợp đồng PDF
                    </a>
                  ) : (
                    <p className="mt-6 text-sm font-semibold text-text-muted">
                      Chưa cập nhật bản scan PDF
                    </p>
                  )}
                  {activeContract && (
                    <div className="mt-6 border-t-2 border-line-strong pt-4">
                      <p className="mb-3 text-xs font-black uppercase tracking-wide text-text-muted">
                        Thao tác hợp đồng
                      </p>
                      <div className="flex flex-wrap gap-2.5">
                        <button
                          type="button"
                          onClick={() => open("renew")}
                          className="inline-flex items-center gap-2 rounded-sm border-2 border-line-strong bg-primary px-3 py-2 text-sm! font-black! text-black shadow-[2px_2px_0_#141413] hover:translate-y-0.5 hover:shadow-none transition-all outline-none!"
                        >
                          <RefreshCw size={16} /> Gia hạn hợp đồng
                        </button>
                        <button
                          type="button"
                          onClick={() => open("transfer")}
                          className="inline-flex items-center gap-2 rounded-sm border-2 border-line-strong bg-info px-3 py-2 text-sm! font-black! text-black shadow-[2px_2px_0_#141413] hover:translate-y-0.5 hover:shadow-none transition-all outline-none!"
                        >
                          <ArrowLeftRight size={16} /> Chuyển phòng
                        </button>
                        <button
                          type="button"
                          onClick={() => open("checkout")}
                          className="inline-flex items-center gap-2 rounded-sm border-2 border-line-strong bg-surface px-3 py-2 text-sm! font-bold! text-text shadow-[2px_2px_0_#141413] hover:bg-error hover:text-white hover:translate-y-0.5 hover:shadow-none transition-all outline-none!"
                        >
                          <DoorOpen size={16} /> Trả phòng
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p>Chưa có hợp đồng đang hiệu lực.</p>
              )}
            </section>
          </div>
        )}
      </div>
      {modal && (
        <div
          className="fixed inset-0 z-50 bg-black/50 grid place-items-center p-4"
          onMouseDown={(e) => e.target === e.currentTarget && setModal("")}
        >
          <form
            onSubmit={submit}
            className={`${card} box-border w-125 max-w-[95vw] space-y-4`}
          >
            <h2 className="w-full block leading-normal text-xl font-black">
              {modal === "renew"
                ? "Gia hạn hợp đồng"
                : modal === "transfer"
                  ? "Yêu cầu chuyển phòng"
                  : "Yêu cầu trả phòng"}
            </h2>
            {modal === "renew" && (
              <label className="block font-bold">
                Số tháng muốn gia hạn
                <CustomSelect
                  required
                  value={form.months || ""}
                  onChange={(value) => setForm({ ...form, months: value })}
                  options={[1, 2, 3, 6, 12].map((n) => ({
                    value: String(n),
                    label: `${n} tháng`,
                  }))}
                  placeholder="Chọn số tháng"
                  className="mt-2"
                />
              </label>
            )}
            {modal === "transfer" && (
              <>
                <label className="block font-bold">
                  Tòa nhà mong muốn
                  <input
                    required
                    className={control}
                    value={form.building || ""}
                    onChange={(e) =>
                      setForm({ ...form, building: e.target.value })
                    }
                  />
                </label>
                <label className="block font-bold">
                  Phòng mong muốn (nếu có)
                  <input
                    className={control}
                    value={form.room || ""}
                    onChange={(e) => setForm({ ...form, room: e.target.value })}
                  />
                </label>
              </>
            )}
            {modal === "checkout" && (
              <label className="block font-bold">
                Ngày dự kiến trả phòng
                <CustomDatePicker
                  required
                  min={new Date().toISOString().slice(0, 10)}
                  value={form.date || ""}
                  onChange={(value) => setForm({ ...form, date: value })}
                  className="mt-2"
                />
              </label>
            )}
            <label className="block font-bold">
              {modal === "transfer" ? "Lý do" : "Ghi chú"}
              <textarea
                className={control}
                required={modal === "transfer"}
                value={form.reason || ""}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
              />
            </label>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setModal("")}
                className="px-4 py-2 border-3 border-line-strong rounded-sm text-sm! shadow-[2px_2px_0_#141413] font-bold! outline-none! transition-all hover:shadow-[3px_3px_0_#141413]  hover:-translate-0.5 active:translate-0.5 active:shadow-none"
              >
                Đóng
              </button>
              <button disabled={busy} className={action}>
                {busy ? (
                  <RefreshCw className="animate-spin" />
                ) : (
                  <CalendarDays className="inline mr-2" />
                )}
                Gửi yêu cầu
              </button>
            </div>
          </form>
        </div>
      )}
    </Workspace>
  );
}
