import { useEffect, useState } from "react";
import {
  Building2,
  FileText,
  Users,
  CalendarDays,
  Download,
  RefreshCw,
} from "lucide-react";
import Workspace from "../../components/Workspace";
import { resources } from "../../services/resource.service";
import { api } from "../../api/apiClient";
import { errorMessage } from "../../utils/errorHandler";
import { CustomSelect } from "../../components/ui/CustomSelect";
import { CustomDatePicker } from "../../components/ui/CustomDatePicker";
import { toast } from "sonner";

const card =
  "bg-surface border-4 border-line-strong rounded-sm p-6 shadow-[5px_5px_0_#141413]";
const action =
  "px-4 py-2 bg-warning border-3 border-line-strong rounded-sm text-sm! font-extrabold! shadow-[2px_2px_0_#141413] hover:shadow-[3px_3px_0_#141413]  hover:-translate-0.5 active:translate-0.5 active:shadow-none outline-none! transition-all";
const control =
  "mt-2 w-full rounded-sm border-3 border-line-strong px-3 py-2.5 shadow-[3px_3px_0_#141413] outline-none! transition-all";
const first = (r) => r?.content?.[0] || r?.items?.[0] || null;

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
          resources.list("/student/contracts", {
            status: "ACTIVE",
            page: 0,
            size: 20,
          }),
        ]);
        setAssignment(
          (assignments?.content || []).find((a) =>
            ["ASSIGNED", "CHECKED_IN"].includes(
              String(a.assignmentStatus || a.status).toUpperCase(),
            ),
          ) || first(assignments),
        );
        setContract(first(contracts));
      } catch (e) {
        toast.error(errorMessage(e));
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
      toast.success("Yêu cầu đã được gửi.");
      setModal("");
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  const room = assignment?.room || assignment;
  const roommates = assignment?.roommates || room?.roommates || [];
  const deposit = contract?.depositAmount ?? assignment?.depositAmount;
  return (
    <Workspace group="student" title="Chỗ ở & Hợp đồng">
      <div className="space-y-7">
        <div className="flex flex-wrap gap-3">
          <button className={action} onClick={() => open("renew")}>
            Gia hạn hợp đồng
          </button>
          <button className={action} onClick={() => open("transfer")}>
            Yêu cầu chuyển phòng
          </button>
          <button className={action} onClick={() => open("checkout")}>
            Yêu cầu trả phòng
          </button>
        </div>
        {loading && <p>Đang tải thông tin…</p>}
        {!loading && (
          <div className="grid lg:grid-cols-2 gap-6">
            <section className={card}>
              <h2 className="text-xl font-black flex gap-2 items-center mb-5">
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
                <ul className="space-y-2">
                  {roommates.map((m, i) => (
                    <li
                      key={m.studentId || m.id || i}
                      className="p-3 bg-surface-2 rounded-sm"
                    >
                      {m.fullName || m.studentName || `Sinh viên ${i + 1}`}
                      {m.studentCode ? ` · ${m.studentCode}` : ""}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="opacity-70">Chưa có thông tin bạn cùng phòng.</p>
              )}
            </section>
            <section className={card}>
              <h2 className="text-xl font-black flex gap-2 items-center mb-5">
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
                        {contract.startDate || "—"} — {contract.endDate || "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm opacity-70">Trạng thái</dt>
                      <dd className="font-extrabold">
                        {contract.status || "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm opacity-70">Tiền cọc</dt>
                      <dd className="font-extrabold">
                        {deposit == null
                          ? "—"
                          : new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            }).format(deposit)}
                      </dd>
                    </div>
                  </dl>
                  {contract.pdfUrl || contract.documentUrl ? (
                    <a
                      className={`${action} inline-flex items-center gap-2 mt-6`}
                      href={contract.pdfUrl || contract.documentUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Download size={18} /> Tải PDF hợp đồng
                    </a>
                  ) : (
                    <p className="mt-6 opacity-70">Chưa có tệp PDF hợp đồng.</p>
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
          <form onSubmit={submit} className={`${card} w-[50%] space-y-4`}>
            <h2 className="text-xl  font-black">
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
