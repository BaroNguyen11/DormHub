import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useStudentRoom from "../../hooks/useStudentRoom";
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
import { loadJourneyPages } from "../../utils/studentJourney";
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
    : date.toLocaleDateString("vi-VN", { timeZone: "UTC", day: "2-digit", month: "2-digit", year: "numeric" });
};
const formatCurrency = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

function RentalSummary({ plan, deposit }) {
  const start = new Date(`${plan.startDate}T00:00:00Z`);
  const end = new Date(`${plan.endDate}T00:00:00Z`);
  const firstMonthEnd = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 0));
  const firstDays = firstMonthEnd.getUTCDate() - start.getUTCDate() + 1;
  const followingMonths = (end.getUTCFullYear() - start.getUTCFullYear()) * 12 + end.getUTCMonth() - start.getUTCMonth();
  const fullMonths = followingMonths + (start.getUTCDate() === 1 ? 1 : 0);
  const rows = [
    ["Ngày bắt đầu thuê", formatDate(plan.startDate)],
    ["Ngày ở cuối cùng", formatDate(plan.endDate)],
    ["Tổng thời hạn thuê", `${fullMonths} tháng${start.getUTCDate() === 1 ? "" : ` và ${firstDays} ngày`}`],
    ["Số ngày thuê trong tháng đầu", `${firstDays} ngày`],
    ["Số tháng thuê trọn vẹn", `${fullMonths} tháng`],
    ["Giá thuê hàng tháng", formatCurrency(plan.monthlyRent)],
    ["Tiền thuê tháng đầu", formatCurrency(plan.firstMonthRent)],
    ["Tổng tiền thuê dự kiến toàn kỳ", "Chưa có thông tin tổng hợp"],
    ["Tiền cọc đã thanh toán (riêng)", deposit == null ? "—" : formatCurrency(deposit)],
  ];
  return <div className="space-y-5"><dl className="space-y-3">{rows.map(([label, value]) => <div key={label} className="flex flex-wrap justify-between gap-2 border-b border-line-strong/20 pb-3"><dt className="text-sm text-text-muted">{label}</dt><dd className="font-black">{value}</dd></div>)}</dl>
    <p className="text-sm font-semibold">Bắt đầu ngày 1–15: tháng đầu được tính trong 12 kỳ tháng. Từ ngày 16: tháng đầu là kỳ lẻ, tiếp theo là 12 tháng trọn vẹn. Ngày ở cuối cùng là ngày cuối tháng do hợp đồng xác định.</p>
    <p className="text-sm text-text-muted">Tiền thuê tháng đầu được tính theo số ngày thực tế. Các số tiền hiển thị theo thông tin hợp đồng, chưa bao gồm điện nước và chi phí phát sinh.</p>
  </div>;
}

export default function ResidencePage() {
  const { hasRoom, residenceRequest, requestsLoading, requestsError } = useStudentRoom();
  const requestBlocked = !hasRoom || Boolean(residenceRequest) || requestsLoading || requestsError;
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
  const [confirmBusy, setConfirmBusy] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [dateBounds, setDateBounds] = useState(null);
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
    let active = true;
    (async () => {
      try {
        const [assignments, contracts] = await Promise.all([
          ...["/student/room-assignments", "/student/contracts"].map((path) =>
            loadJourneyPages((page, size) => resources.list(path, { page, size }))),
        ]);
        if (!active) return;
        setLoadError("");
        const currentAssignment = assignments.find((a) =>
          String(a.assignmentStatus || a.status).toUpperCase() === "CHECKED_IN",
        ) || assignments.find((a) =>
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
            if (!active) return;
            setRoommates(Array.isArray(members) ? members : []);
          } catch (err) {
            setRoommatesError(errorMessage(err));
          }
        }
        if (!active) return;
        const contractList = contracts;
        const currentContract = contractList.find((item) => currentAssignment?.contractId != null && item.contractId === currentAssignment.contractId) || contractList.find(
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
            setDateBounds(nextPlan);
            setChosenDate(nextPlan.checkInDate || "");
          } catch (error) {
            setPlanError(errorMessage(error));
          }
        }
      } catch (error) {
        if (active) setLoadError(errorMessage(error));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [reloadKey]);

  useEffect(() => {
    if (!contract?.contractId || !chosenDate || contract.status !== "PENDING" || contract.depositStatus !== "HELD") return;
    let active = true;
    const timer = window.setTimeout(async () => {
      setPlanBusy(true);
      setPlanError("");
      setAcceptedTerm(false);
      try {
        const nextPlan = await api(
        `/student/contracts/${contract.contractId}/check-in-plan?date=${encodeURIComponent(chosenDate)}`,
        { notify: false },
      );
        if (active) setPlan(nextPlan);
    } catch (error) {
      if (active) { setPlan(null); setPlanError(errorMessage(error)); }
    } finally {
      if (active) setPlanBusy(false);
    }
    }, 250);
    return () => { active = false; window.clearTimeout(timer); };
  }, [chosenDate, contract?.contractId, contract?.status, contract?.depositStatus]);

  async function confirmDate() {
    if (!contract?.contractId || !acceptedTerm || plan?.checkInDate !== chosenDate || planBusy || confirmBusy) return;
    setConfirmBusy(true);
    setPlanError("");
    try {
      await api(`/student/contracts/${contract.contractId}/confirm-check-in-date`, {
        method: "POST",
        body: { checkInDate: chosenDate },
        notify: false,
      });
      setAcceptedTerm(false);
      setReloadKey((value) => value + 1);
      window.dispatchEvent(new Event("residence-updated"));
    } catch (error) {
      setPlanError(errorMessage(error));
    } finally {
      setConfirmBusy(false);
    }
  }

  const room = assignment?.room || assignment;
  const deposit =
    contract?.depositAmount ?? contract?.deposit ?? assignment?.depositAmount;
  const contractStatus = String(
    contract?.status || contract?.contractStatus || "",
  ).toUpperCase();
  const activeContract = contractStatus === "ACTIVE";
  const canCheckout = ["ACTIVE", "EXPIRED"].includes(contractStatus);
  const checkedIn = String(
    assignment?.assignmentStatus || assignment?.status || "",
  ).toUpperCase() === "CHECKED_IN";
  const todayVN = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Ho_Chi_Minh" });

  useEffect(() => {

    const update = () => setReloadKey((value) => value + 1);
    const timer = window.setInterval(update, 30_000);
    window.addEventListener("residence-updated", update);
    window.addEventListener("focus", update);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("residence-updated", update);
      window.removeEventListener("focus", update);
    };
  }, [assignment, contract?.status, checkedIn]);

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
      <nav aria-label="Lịch sử yêu cầu cư trú" className="mb-5 flex flex-wrap gap-3 text-sm font-bold">
        <Link className="underline" to="/student/renewal-requests">Lịch sử gia hạn</Link>
        <Link className="underline" to="/student/room-transfer-requests">Lịch sử chuyển phòng</Link>
        <Link className="underline" to="/student/checkout-requests">Lịch sử trả phòng</Link>
      </nav>
      <div className="space-y-7">
        {loadError && <p role="alert" className="rounded-sm border-2 border-error p-4 font-bold text-error">{loadError} <button onClick={() => { setLoadError(""); setLoading(true); setReloadKey((value) => value + 1); }} className="underline">Thử lại</button></p>}
        {loading && (
          <p className="font-bold text-text-muted">Đang tải thông tin…</p>
        )}
        {!loading && (
          <>
          {assignment && !checkedIn && (
            <section className={card}>
              {contractStatus === "PENDING" && contract?.depositStatus === "HELD" ? (
                <>
                  <div className="space-y-6">
                  <div>
                  <p className="mb-3 text-sm font-bold text-text-muted">Đã thanh toán cọc thành công</p>
                  <h2 className="mb-3 text-xl font-black">Chọn lịch nhận phòng</h2>
                  <p className="font-semibold">
                    Phòng {plan?.roomNumber || room?.roomNumber} · {plan?.buildingName || room?.buildingName}
                  </p>
                  {dateBounds && (
                    <div className="mt-4 rounded-sm border-2 border-line-strong bg-surface-2 p-4">
                      <p className="font-bold">Hạn cuối chọn ngày nhận phòng</p>
                      <p className="text-lg font-black">{formatDate(dateBounds.latestDate)}</p>
                      <p className="mt-2 text-sm">Đã đóng cọc ngày {formatDate(dateBounds.depositPaidAt)}</p>
                    </div>
                  )}
                  <p className="mt-3 text-sm font-semibold">
                    Bạn có thể chọn từ ngày đóng cọc đến hết 7 ngày sau đó. Thời hạn hợp đồng hiện tại chỉ là dự kiến.
                    Thanh toán cọc sớm giúp bạn chủ động nhận phòng sớm hơn.
                  </p>
                  {dateBounds && (
                    <div className="mt-4 space-y-4">
                      <div className="flex flex-wrap items-end gap-3">
                        <label className="font-bold">
                          Ngày nhận phòng
                          <input
                            type="date"
                            value={chosenDate}
                            min={dateBounds.earliestDate > todayVN ? dateBounds.earliestDate : todayVN}
                            max={dateBounds.latestDate}
                            disabled={confirmBusy}
                            onChange={(event) => {
                              setChosenDate(event.target.value);
                              setAcceptedTerm(false);
                            }}
                            className="mt-2 block w-full rounded-sm border-3 border-line-strong bg-surface p-3 text-text [color-scheme:light_dark]"
                          />
                        </label>
                      </div>
                      {!planBusy && plan?.checkInDate === chosenDate && (
                        <>
                          <label className="flex items-start gap-2 font-semibold">
                            <input type="checkbox" checked={acceptedTerm}
                              onChange={(event) => setAcceptedTerm(event.target.checked)} />
                            Tôi đã kiểm tra ngày nhận phòng và thời hạn thuê, đồng ý xác nhận một lần.
                          </label>
                          <button type="button" disabled={!acceptedTerm || planBusy || confirmBusy} onClick={confirmDate}
                            className="rounded-sm border-3 border-line-strong bg-primary px-4 py-2 font-black disabled:opacity-50">
                            {confirmBusy ? "Đang xác nhận…" : "Xác nhận ngày nhận phòng"}
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
                  </div>
                  <div className="border-t-2 border-line-strong/20 pt-5">
                    <h3 className="mb-5 text-xl font-black">Thời hạn & chi phí dự kiến</h3>
                    {!planBusy && plan?.checkInDate === chosenDate ? <RentalSummary plan={plan} deposit={deposit} /> : <p role="status">Chọn ngày hợp lệ để xem thời hạn và chi phí tương ứng.</p>}
                  </div>
                  </div>
                </>
              ) : (
                <>
                  <p className="mb-3 text-sm font-bold text-text-muted">Lịch nhận phòng đã được xác nhận</p>
                  <h2 className="mb-2 text-xl font-black">Chờ nhận phòng</h2>
                  <div className="my-4 rounded-sm border-2 border-line-strong bg-surface-2 p-4">
                    <p className="font-bold">Ngày nhận phòng</p><p className="text-xl font-black">{formatDate(contract?.startDate)}</p>
                    <p className="mt-2 font-bold">Phòng {room?.roomNumber} · {room?.buildingName || room?.building?.name}</p>
                  </div>
                  <p className="mb-3 text-sm font-semibold">Chuẩn bị CCCD và thông tin hợp đồng, đến ban quản lý để được hướng dẫn bàn giao phòng. Chức năng cư trú được mở sau khi quản lý xác nhận Check-in.</p>
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
                  {canCheckout && checkedIn && (
                    <div className="mt-6 border-t-2 border-line-strong pt-4">
                      <p className="mb-3 text-xs font-black uppercase tracking-wide text-text-muted">
                        Thao tác hợp đồng
                      </p>
                      <div className="flex flex-wrap gap-2.5">
                        <button
                          type="button"
                          disabled={!activeContract || requestBlocked}
                          onClick={() => setModal("renew")}
                          className="inline-flex items-center gap-2 rounded-sm border-2 border-line-strong bg-primary px-3 py-2 text-sm! font-black! text-black shadow-[2px_2px_0_#141413] hover:-translate-0.5 hover:shadow-[3px_3px_0_#141413] active:shadow-none active:translate-0.5 transition-all outline-none!"
                        >
                          <RefreshCw size={16} /> Gia hạn hợp đồng
                        </button>
                        <button
                          type="button"
                          disabled={!activeContract || requestBlocked}
                          onClick={() => setModal("transfer")}
                          className="inline-flex items-center gap-2 rounded-sm border-2 border-line-strong bg-info px-3 py-2 text-sm! font-black! text-black shadow-[2px_2px_0_#141413] hover:-translate-0.5 hover:shadow-[3px_3px_0_#141413] active:shadow-none active:translate-0.5 transition-all outline-none!"
                        >
                          <ArrowLeftRight size={16} /> Chuyển phòng
                        </button>
                        <button
                          type="button"
                          disabled={requestBlocked}
                          onClick={() => setModal("checkout")}
                          className="inline-flex items-center gap-2 rounded-sm border-2 border-line-strong bg-surface px-3 py-2 text-sm! font-bold! text-text shadow-[2px_2px_0_#141413] hover:bg-error hover:text-white hover:-translate-0.5 hover:shadow-[3px_3px_0_#141413] active:shadow-none active:translate-0.5 transition-all outline-none!"
                        >
                          <DoorOpen size={16} /> Trả phòng
                        </button>
                      </div>
                      {residenceRequest && <p className="mt-3 text-sm font-semibold">Bạn đang có yêu cầu chưa hoàn tất. <Link className="underline" to={residenceRequest.path}>Xem yêu cầu hiện tại</Link>.</p>}
                      {requestsError && <p role="alert" className="mt-3 text-sm text-error">Chưa thể kiểm tra yêu cầu hiện tại. Vui lòng thử lại sau.</p>}
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
