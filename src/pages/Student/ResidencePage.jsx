import { useEffect, useState } from "react";
import {
  ArrowLeftRight,
  Building2,
  DoorOpen,
  FileText,
  Users,
  Download,
  RefreshCw,
} from "lucide-react";
import Workspace from "../../components/Workspace";
import { resources } from "../../services/resource.service";
import { api } from "../../api/apiClient";
import { errorMessage } from "../../utils/errorHandler";
import {
  CheckoutDialog,
  RenewDialog,
  TransferDialog,
} from "../../components/RequestDialogs";

const card =
  "bg-surface border-4 border-line-strong rounded-sm p-6 shadow-[5px_5px_0_#141413]";
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
  const [roommates, setRoommates] = useState([]);
  const [roommatesError, setRoommatesError] = useState("");
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [assignments, contracts] = await Promise.all([
          resources.list("/student/room-assignments", { page: 0, size: 20 }),
          resources.list("/student/contracts", { page: 0, size: 20 }),
        ]);
        const currentAssignment = (assignments?.content || []).find((a) =>
          ["ASSIGNED", "CHECKED_IN"].includes(
            String(a.assignmentStatus || a.status).toUpperCase(),
          ),
        );
        setAssignment(currentAssignment || null);
        setRoommates([]);
        setRoommatesError("");
        if (currentAssignment) {
          try {
            const members = await api("/student/room-assignments/roommates", {
              notify: false,
            });
            setRoommates(Array.isArray(members) ? members : []);
          } catch (err) {
            setRoommatesError(errorMessage(err));
          }
        }
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

  const room = assignment?.room || assignment;
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
              {roommatesError ? (
                <p role="alert" className="text-sm font-semibold text-error">
                  Không thể tải danh sách bạn cùng phòng: {roommatesError}
                </p>
              ) : roommates.length ? (
                <ul className="grid sm:grid-cols-2 gap-3 list-none p-0 m-0">
                  {roommates.map((member) => {
                    const fullName = member.fullName || "Sinh viên";
                    const gender =
                      member.gender === "MALE"
                        ? "Nam"
                        : member.gender === "FEMALE"
                          ? "Nữ"
                          : "Chưa cập nhật";
                    return (
                      <li
                        key={member.studentCode}
                        className="flex min-w-0 items-center gap-3 border-2 border-line-strong bg-surface-2 rounded-sm p-3 shadow-[2px_2px_0_#141413]"
                      >
                        <span className="grid size-10 shrink-0 place-items-center border-2 border-line-strong bg-primary rounded-sm font-black uppercase shadow-[2px_2px_0_#141413]">
                          {fullName.trim().charAt(0) || "?"}
                        </span>
                        <span className="min-w-0">
                          <strong className="block truncate text-sm font-black text-text">
                            {fullName}
                          </strong>
                          {member.studentCode && (
                            <span className="block truncate text-xs font-semibold text-text-muted">
                              Mã sinh viên: {member.studentCode}
                            </span>
                          )}
                          <span className="block text-xs font-semibold text-text-muted">
                            Giới tính: {gender}
                          </span>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="flex items-center gap-3 border-2 border-dashed border-line-strong bg-surface-2 rounded-sm p-4 text-sm font-semibold text-text-muted">
                  <Users size={20} className="shrink-0" />
                  <span>
                    {assignment ? "Bạn đang ở một mình." : "Bạn chưa có phòng."}
                  </span>
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
                          className={`inline-flex items-center px-3 py-1 border-2 border-line-strong rounded-sm shadow-[2px_2px_0_#141413] font-extrabold text-xs ${statusBadge.style}`}
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
                          onClick={() => setModal("renew")}
                          className="inline-flex items-center gap-2 rounded-sm border-2 border-line-strong bg-primary px-3 py-2 text-sm! font-black! text-black shadow-[2px_2px_0_#141413] hover:-translate-0.5 hover:shadow-[3px_3px_0_#141413] active:shadow-none active:translate-0.5 transition-all outline-none!"
                        >
                          <RefreshCw size={16} /> Gia hạn hợp đồng
                        </button>
                        <button
                          type="button"
                          onClick={() => setModal("transfer")}
                          className="inline-flex items-center gap-2 rounded-sm border-2 border-line-strong bg-info px-3 py-2 text-sm! font-black! text-black shadow-[2px_2px_0_#141413] hover:-translate-0.5 hover:shadow-[3px_3px_0_#141413] active:shadow-none active:translate-0.5 transition-all outline-none!"
                        >
                          <ArrowLeftRight size={16} /> Chuyển phòng
                        </button>
                        <button
                          type="button"
                          onClick={() => setModal("checkout")}
                          className="inline-flex items-center gap-2 rounded-sm border-2 border-line-strong bg-surface px-3 py-2 text-sm! font-bold! text-text shadow-[2px_2px_0_#141413] hover:bg-error hover:text-white hover:-translate-0.5 hover:shadow-[3px_3px_0_#141413] active:shadow-none active:translate-0.5 transition-all outline-none!"
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
      {modal === "renew" && (
        <RenewDialog
          contract={contract}
          room={room}
          onClose={() => setModal("")}
        />
      )}
      {modal === "transfer" && (
        <TransferDialog
          room={room}
          contract={contract}
          onClose={() => setModal("")}
        />
      )}
      {modal === "checkout" && (
        <CheckoutDialog
          room={room}
          contract={contract}
          onClose={() => setModal("")}
        />
      )}
    </Workspace>
  );
}
