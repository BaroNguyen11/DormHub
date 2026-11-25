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
  DialogShell,
  RenewDialog,
  TransferDialog,
} from "../../components/RequestDialogs";

const card =
  "bg-surface border-4 border-line-strong rounded-sm p-6 shadow-[5px_5px_0_#141413]";
const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(`${String(value).slice(0, 10)}T12:00:00Z`);
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
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [pdfError, setPdfError] = useState("");
  const [plan, setPlan] = useState(null);
  const [planError, setPlanError] = useState("");
  const [chosenDate, setChosenDate] = useState("");
  const [planBusy, setPlanBusy] = useState(false);
  const [acceptedTerm, setAcceptedTerm] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  useEffect(() => () => {
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
  }, [pdfUrl]);

  async function openContractPdf(download = false) {
    if (!contract?.contractId || pdfBusy) return;
    setPdfBusy(true);
    setPdfError("");
    try {
      const blob = await api(`/student/contracts/${contract.contractId}/pdf`, {
        responseType: "blob",
        notify: false,
      });
      const url = URL.createObjectURL(blob);
      if (download) {
        const link = document.createElement("a");
        link.href = url;
        link.download = `hop-dong-${contract.contractId}.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
      } else {
        setPdfUrl(url);
        setModal("pdf");
      }
    } catch (error) {
      setPdfError(errorMessage(error));
    } finally {
      setPdfBusy(false);
    }
  }

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
        if (String(currentAssignment?.assignmentStatus || currentAssignment?.status || "").toUpperCase() === "CHECKED_IN") {
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
        const currentContract = contractList.find(
            (item) => String(item?.status || "").toUpperCase() === "ACTIVE",
          ) ||
            contractList[0] ||
            null;
        setContract(currentContract);
        setPlan(null);
        setPlanError("");
        if (currentContract?.status === "PENDING"
            && currentContract?.depositStatus === "HELD" && currentAssignment) {
          try {
            const nextPlan = await api(
              `/student/contracts/${currentContract.contractId}/check-in-plan`,
              { notify: false },
            );
            setPlan(nextPlan);
            setChosenDate(nextPlan.checkInDate || "");
          } catch (error) {
            setPlanError(errorMessage(error));
          }
        }
      } catch {
        // API client reports request failures globally.
      } finally {
        setLoading(false);
      }
    })();
  }, [reloadKey]);

  async function previewDate() {
    if (!contract?.contractId || !chosenDate || planBusy) return;
    setPlanBusy(true);
    setPlanError("");
    setAcceptedTerm(false);
    try {
      const nextPlan = await api(
        `/student/contracts/${contract.contractId}/check-in-plan?date=${encodeURIComponent(chosenDate)}`,
        { notify: false },
      );
      setPlan(nextPlan);
    } catch (error) {
      setPlan(null);
      setPlanError(errorMessage(error));
    } finally {
      setPlanBusy(false);
    }
  }

  async function confirmDate() {
    if (!contract?.contractId || !acceptedTerm || plan?.checkInDate !== chosenDate || planBusy) return;
    setPlanBusy(true);
    setPlanError("");
    try {
      await api(`/student/contracts/${contract.contractId}/confirm-check-in-date`, {
        method: "POST",
        body: { checkInDate: chosenDate },
        notify: false,
      });
      setAcceptedTerm(false);
      setReloadKey((value) => value + 1);
    } catch (error) {
      setPlanError(errorMessage(error));
    } finally {
      setPlanBusy(false);
    }
  }

  const room = assignment?.room || assignment;
  const deposit =
    contract?.depositAmount ?? contract?.deposit ?? assignment?.depositAmount;
  const contractStatus = String(
    contract?.status || contract?.contractStatus || "",
  ).toUpperCase();
  const activeContract = contractStatus === "ACTIVE";
  const checkedIn = String(
    assignment?.assignmentStatus || assignment?.status || "",
  ).toUpperCase() === "CHECKED_IN";
  const todayVN = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Ho_Chi_Minh" });

  const statusBadge = {
    PENDING: { label: contract?.depositStatus === "HELD" ? "CHỜ XÁC NHẬN LỊCH" : "CHỜ ĐÓNG CỌC", style: "bg-warning text-black" },
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
          <>
          {assignment && !checkedIn && (
            <section className={card}>
              {contractStatus === "PENDING" && contract?.depositStatus === "HELD" ? (
                <>
                  <h2 className="mb-3 text-xl font-black">Chọn ngày nhận phòng</h2>
                  <p className="font-semibold">
                    Phòng {plan?.roomNumber || room?.roomNumber} · {plan?.buildingName || room?.buildingName}
                  </p>
                  {plan && (
                    <p className="mt-2 text-sm font-semibold">
                      Đã đóng cọc: {formatDate(plan.depositPaidAt)} · Hạn chọn ngày: {formatDate(plan.latestDate)}
                    </p>
                  )}
                  <p className="mt-3 text-sm font-semibold">
                    Bạn có thể chọn từ ngày đóng cọc đến hết 7 ngày sau đó. Thời hạn hợp đồng hiện tại chỉ là dự kiến.
                    Thanh toán cọc sớm giúp bạn chủ động nhận phòng sớm hơn.
                  </p>
                  {plan && (
                    <div className="mt-4 space-y-4">
                      <div className="flex flex-wrap items-end gap-3">
                        <label className="font-bold">
                          Ngày nhận phòng
                          <input
                            type="date"
                            value={chosenDate}
                            min={plan.earliestDate > todayVN ? plan.earliestDate : todayVN}
                            max={plan.latestDate}
                            onChange={(event) => {
                              setChosenDate(event.target.value);
                              setAcceptedTerm(false);
                            }}
                            className="mt-1 block rounded-sm border-3 border-line-strong bg-surface p-2"
                          />
                        </label>
                        <button type="button" disabled={!chosenDate || planBusy} onClick={previewDate}
                          className="rounded-sm border-3 border-line-strong bg-secondary px-4 py-2 font-black disabled:opacity-50">
                          Xem thời hạn
                        </button>
                      </div>
                      {plan.checkInDate === chosenDate && (
                        <>
                          <p className="font-semibold">
                            Thời hạn chính thức: {formatDate(plan.startDate)} – {formatDate(plan.endDate)}
                            {" "}· Tiền thuê tháng đầu: {formatCurrency(plan.firstMonthRent)}
                            {" "}· Giá tháng: {formatCurrency(plan.monthlyRent)}
                          </p>
                          <label className="flex items-start gap-2 font-semibold">
                            <input type="checkbox" checked={acceptedTerm}
                              onChange={(event) => setAcceptedTerm(event.target.checked)} />
                            Tôi đã kiểm tra ngày nhận phòng và thời hạn thuê, đồng ý xác nhận một lần.
                          </label>
                          <button type="button" disabled={!acceptedTerm || planBusy} onClick={confirmDate}
                            className="rounded-sm border-3 border-line-strong bg-primary px-4 py-2 font-black disabled:opacity-50">
                            Xác nhận ngày nhận phòng
                          </button>
                        </>
                      )}
                    </div>
                  )}
                  {planBusy && <p className="mt-3 font-semibold">Đang xử lý…</p>}
                  {planError && <p role="alert" className="mt-3 font-semibold text-error">{planError}</p>}
                  <p className="mt-3 text-sm font-semibold text-error">
                    Nếu quá hạn do bạn chưa xác nhận, ban quản lý có thể hủy suất và xử lý tiền cọc sau khi kiểm tra nguyên nhân.
                  </p>
                </>
              ) : (
                <>
                  <h2 className="mb-2 text-xl font-black">Chờ nhận phòng</h2>
                  <p className="font-semibold">
                    Bạn đã được phân phòng. Vui lòng đến ký túc xá đúng ngày;
                    quản lý sẽ xác nhận Check-in khi bàn giao phòng.
                  </p>
                  {contract?.startDate && contract?.endDate && (
                    <p className="mt-3 font-semibold">
                      Thời hạn hợp đồng: {formatDate(contract.startDate)} – {formatDate(contract.endDate)}
                    </p>
                  )}
                </>
              )}
            </section>
          )}
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
                    {checkedIn ? "Bạn đang ở một mình." : assignment ? "Chưa có thông tin bạn cùng phòng." : "Bạn chưa có phòng."}
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
                      <dt className="text-sm opacity-70">
                        {contractStatus === "PENDING" ? "Thời hạn dự kiến" : "Thời hạn"}
                      </dt>
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
                  <div className="mt-6 flex flex-wrap gap-3">
                    <button type="button" disabled={pdfBusy} onClick={() => openContractPdf()}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-secondary text-black font-extrabold border-2 border-line-strong rounded-sm shadow-[2px_2px_0_#141413] disabled:opacity-60 outline-none!">
                      <FileText size={18} /> Xem hợp đồng PDF
                    </button>
                    <button type="button" disabled={pdfBusy} onClick={() => openContractPdf(true)}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-surface text-text font-extrabold border-2 border-line-strong rounded-sm shadow-[2px_2px_0_#141413] disabled:opacity-60 outline-none!">
                      <Download size={18} /> Tải PDF
                    </button>
                  </div>
                  {pdfBusy && <p className="mt-3 text-sm font-semibold">Đang chuẩn bị hợp đồng…</p>}
                  {pdfError && <p role="alert" className="mt-3 text-sm font-semibold text-error">Không thể tải hợp đồng: {pdfError}</p>}
                  {activeContract && checkedIn && (
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
          </>
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
      {modal === "pdf" && pdfUrl && (
        <DialogShell icon={FileText} title="Hợp đồng thuê ký túc xá"
          subtitle={`Hợp đồng số ${contract?.contractId} · Bản PDF từ dữ liệu hiện tại`}
          onClose={() => { setModal(""); setPdfUrl(null); }}>
          <iframe title="Nội dung hợp đồng PDF" src={pdfUrl} className="h-[70vh] w-full border-2 border-line-strong" />
          <p className="mt-3 text-xs font-semibold text-text-muted">Bạn có thể tải PDF bằng nút Tải PDF trên trang hợp đồng.</p>
        </DialogShell>
      )}
    </Workspace>
  );
}
