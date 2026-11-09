import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  Home,
  FileText,
  DollarSign,
  Wrench,
  Users,
  Calendar,
  Clock,
  AlertCircle,
  MapPin,
  Layers,
  CreditCard,
} from "lucide-react";
import { Loading, Notice } from "../../components/Screen/UIComponents";
import { resources } from "../../services/resource.service";
import { api } from "../../api/apiClient";
import { errorMessage } from "../../utils/errorHandler";
import useStudentRoom from "../../hooks/useStudentRoom";
import Workspace from "@/components/Workspace";


const cardBase =
  "bg-surface border-4 border-line-strong rounded-md shadow-[6px_6px_0_#141413]";

const ROOM_POLL_INTERVAL_MS = 3000;
const MAX_ROOM_POLLS = 10;

export default function MyRoomDashboard() {
  const [roomData, setRoomData] = useState(null);
  const [contractData, setContractData] = useState(null);
  const [invoiceData, setInvoiceData] = useState(null);
  const [pendingInfo, setPendingInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const pollTimer = useRef(null);
  const pollCount = useRef(0);
  const { hasRoom: gateHasRoom, refresh: refreshRoomGate } = useStudentRoom();

  useEffect(() => {
    return () => {
      if (pollTimer.current) clearTimeout(pollTimer.current);
    };
  }, []);

  useEffect(() => {
    async function fetchAllData() {
      setLoading(true);
      setError("");

      try {
        const roomAssignments = await resources.list(
          "/student/room-assignments",
          { page: 0, size: 20 },
        );

        const currentRoom = roomAssignments?.content?.find((assignment) => {
          const status = String(
            assignment.assignmentStatus || assignment.status || "",
          ).toUpperCase();
          return status === "ASSIGNED" || status === "CHECKED_IN";
        });

        if (!currentRoom) {
          let depositPaidForMessage = false;
          let approvedFound = false;
          try {
            const apps = await resources.list("/student/dorm-applications", {
              page: 0,
              size: 20,
            });
            const items = apps?.content || [];
            const approved = items.find((a) => a?.status === "APPROVED");
            const pending = items.find((a) => a?.status === "PENDING");
            if (approved) {
              approvedFound = true;
              let depositPaid = false;
              if (approved.depositInvoiceId) {
                try {
                  const depositInvoice = await api(
                    `/student/invoices/${encodeURIComponent(approved.depositInvoiceId)}`,
                  );
                  depositPaid =
                    String(depositInvoice?.status || "").toUpperCase() ===
                    "PAID";
                } catch {
                  /* ignore error */
                }
              }
              setPendingInfo({
                type: "APPROVED",
                applicationId: approved.id,
                depositInvoiceId: approved.depositInvoiceId,
                depositAmount: approved.depositAmount,
                depositPaid,
              });
              depositPaidForMessage = depositPaid;
            } else if (pending) {
              setPendingInfo({ type: "PENDING", applicationId: pending.id });
            }
          } catch {
            /* ignore error */
          }
          setError(
            depositPaidForMessage
              ? "Tiền cọc đã được ghi nhận — đang cập nhật chỗ ở của bạn…"
              : "Bạn chưa được phân phòng",
          );
          setLoading(false);

          if (approvedFound && pollCount.current < MAX_ROOM_POLLS) {
            pollCount.current += 1;
            if (pollTimer.current) clearTimeout(pollTimer.current);
            pollTimer.current = setTimeout(
              () => setRefreshKey((value) => value + 1),
              ROOM_POLL_INTERVAL_MS,
            );
          }
          return;
        }

        if (pollTimer.current) clearTimeout(pollTimer.current);
        pollCount.current = 0;
        setRoomData(currentRoom);
        if (!gateHasRoom) refreshRoomGate?.();

        const contracts = await resources.list("/student/contracts", {
          status: "ACTIVE",
          page: 0,
          size: 1,
        });

        if (contracts?.content?.length > 0) {
          setContractData(contracts.content[0]);
        }

        const invoices = await resources.list("/student/invoices", {
          page: 0,
          size: 1,
        });

        const recentInvoice = invoices?.content?.find(
          (inv) => inv.status === "UNPAID" || inv.status === "PENDING",
        );

        if (recentInvoice) {
          setInvoiceData(recentInvoice);
        }
      } catch (err) {
        setError(errorMessage(err));
      } finally {
        setLoading(false);
      }
    }

    fetchAllData();
  }, [refreshKey, gateHasRoom, refreshRoomGate]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  const quickActions = [
    {
      name: "Báo hỏng",
      path: "/student/maintenance/new",
      icon: Wrench,
      bg: "bg-error",
    },
    {
      name: "Xem hóa đơn",
      path: "/student/invoices",
      icon: DollarSign,
      bg: "bg-warning",
    },
    {
      name: "Hợp đồng",
      path: "/student/contracts",
      icon: FileText,
      bg: "bg-success",
    },
    {
      name: "Chi tiết phòng",
      path: "/student/residence",
      icon: Home,
      bg: "bg-primary",
    },
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const getDaysRemaining = (endDate) => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const now = new Date();
    return Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  };

  return (
    <Workspace group="student" title="Tổng quan">
      <div className="space-y-6">
        {loading && <Loading />}

        {!loading && (error || !roomData) && (
          <div className="space-y-6">
            <Notice error={error || "Bạn chưa được phân phòng"} />

            {pendingInfo?.type === "APPROVED" && (
              <Notice
                type={pendingInfo.depositPaid ? "success" : "warning"}
                message={
                  pendingInfo.depositPaid
                    ? "Tiền cọc đã được ghi nhận"
                    : "Đơn đăng ký của bạn đã được duyệt"
                }
                description={
                  pendingInfo.depositPaid
                    ? "Hệ thống đã nhận cọc và đang cập nhật phòng ở của bạn. Nếu màn hình chưa hiện phòng, hãy bấm “Kiểm tra lại phân phòng” bên dưới sau vài giây."
                    : pendingInfo.depositInvoiceId
                      ? `Bước tiếp theo: thanh toán hóa đơn đặt cọc${
                          pendingInfo.depositAmount
                            ? ` (${formatCurrency(pendingInfo.depositAmount)})`
                            : ""
                        } để giữ chỗ. Ngay khi cọc được xác nhận, bạn sẽ tự động được phân phòng.`
                      : "Đơn của bạn đã được duyệt, hợp đồng đang chờ thanh toán cọc. Vui lòng liên hệ ban quản lý KTX."
                }
              />
            )}
            {pendingInfo?.type === "PENDING" && (
              <Notice
                type="warning"
                message="Đơn đăng ký đang chờ duyệt"
                description={`Đơn #${pendingInfo.applicationId} đã được nộp và đang chờ ban quản lý duyệt. Khi được duyệt bạn sẽ nhận thông báo để thanh toán tiền cọc.`}
              />
            )}
            <div
              className={`${cardBase} p-8 text-center flex flex-col items-center justify-center gap-4`}
            >
              <div className="size-14 rounded-sm bg-warning border-3 border-line-strong flex items-center justify-center shadow-[2px_2px_0_#141413]">
                <Home size={28} className="text-text" strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-lg font-black text-text mb-2">
                  Chưa có phòng ở
                </h3>
                <p className="text-sm font-bold text-text-muted mb-4">
                  Bạn chưa được phân phòng. Vui lòng đăng ký nội trú để được xếp
                  phòng.
                </p>
                {pendingInfo?.type === "APPROVED" && pendingInfo.depositPaid ? (
                  <button
                    type="button"
                    onClick={() => setRefreshKey((value) => value + 1)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary border-3 border-line-strong rounded-sm font-extrabold text-sm text-text shadow-[3px_3px_0_#141413] hover:shadow-[5px_5px_0_#141413] hover:-translate-0.5 active:translate-0.5 active:shadow-none transition-all cursor-pointer"
                  >
                    Kiểm tra lại phân phòng
                  </button>
                ) : (
                  <Link
                    to={
                      pendingInfo?.type === "APPROVED"
                        ? pendingInfo.depositInvoiceId
                          ? `/student/invoices/${pendingInfo.depositInvoiceId}`
                          : "/student/invoices"
                        : pendingInfo?.type === "PENDING"
                          ? "/student/applications"
                          : "/student/rooms"
                    }
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary border-3 border-line-strong rounded-sm font-extrabold text-sm text-text shadow-[3px_3px_0_#141413] hover:shadow-[5px_5px_0_#141413] hover:-translate-0.5 active:translate-0.5 active:shadow-none transition-all"
                  >
                    {pendingInfo?.type === "APPROVED"
                      ? "Thanh toán cọc để nhận phòng"
                      : pendingInfo?.type === "PENDING"
                        ? "Xem đơn đăng ký"
                        : "Tìm phòng ngay"}
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        {!loading && roomData && (
          <>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {/* Card 1: Phòng của tôi */}
              <motion.div
                variants={itemVariants}
                className={`${cardBase} p-6 hover:shadow-[8px_8px_0_#141413] hover:-translate-y-1 transition-all duration-300`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="size-10 rounded-sm bg-primary border-3 border-line-strong flex items-center justify-center shadow-[2px_2px_0_#141413]">
                    <Home size={20} className="text-text" strokeWidth={2.5} />
                  </div>
                  <h2 className="text-lg font-black text-text">
                    Phòng của tôi
                  </h2>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <MapPin
                      size={16}
                      className="text-text-muted mt-1 shrink-0"
                      strokeWidth={2.5}
                    />
                    <div className="flex-1">
                      <p className="text-xs font-extrabold text-text-muted uppercase">
                        Số phòng
                      </p>
                      <p className="text-xl font-black text-text">
                        {roomData.roomNumber || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs font-extrabold text-text-muted uppercase mb-1">
                        Tòa nhà
                      </p>
                      <p className="text-sm font-extrabold text-text">
                        {roomData.buildingName || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-text-muted uppercase mb-1">
                        Tầng
                      </p>
                      <p className="text-sm font-extrabold text-text flex items-center gap-1">
                        <Layers size={14} strokeWidth={2.5} />
                        {roomData.floor || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs font-extrabold text-text-muted uppercase mb-1">
                        Loại phòng
                      </p>
                      <p className="text-sm font-extrabold text-text">
                        {roomData.capacity || "N/A"} người
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-text-muted uppercase mb-1">
                        Đang ở
                      </p>
                      <p className="text-sm font-extrabold text-text flex items-center gap-1">
                        <Users size={14} strokeWidth={2.5} />
                        {roomData.currentOccupancy || 0}/
                        {roomData.capacity || 0}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t-2 border-line-strong">
                    <p className="text-xs font-extrabold text-text-muted uppercase mb-1">
                      Giá phòng
                    </p>
                    <p className="text-lg font-black text-text">
                      {formatCurrency(roomData.pricePerMonth || 0)}/tháng
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Card 2: Hợp đồng */}
              <motion.div
                variants={itemVariants}
                className={`${cardBase} p-6 hover:shadow-[8px_8px_0_#141413] hover:-translate-y-1 transition-all duration-300`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="size-10 rounded-sm bg-success border-3 border-line-strong flex items-center justify-center shadow-[2px_2px_0_#141413]">
                    <FileText
                      size={20}
                      className="text-text"
                      strokeWidth={2.5}
                    />
                  </div>
                  <h2 className="text-lg font-black text-text">Hợp đồng</h2>
                </div>

                {contractData ? (
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-extrabold text-text-muted uppercase mb-1">
                        Mã hợp đồng
                      </p>
                      <p className="text-base font-extrabold text-text">
                        #{contractData.contractId}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs font-extrabold text-text-muted uppercase mb-1">
                          Ngày bắt đầu
                        </p>
                        <p className="text-sm font-extrabold text-text flex items-center gap-1">
                          <Calendar size={14} strokeWidth={2.5} />
                          {formatDate(contractData.startDate)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-text-muted uppercase mb-1">
                          Ngày kết thúc
                        </p>
                        <p className="text-sm font-extrabold text-text flex items-center gap-1">
                          <Calendar size={14} strokeWidth={2.5} />
                          {formatDate(contractData.endDate)}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-extrabold text-text-muted uppercase mb-1">
                        Còn lại
                      </p>
                      <p className="text-2xl font-black text-text">
                        {getDaysRemaining(contractData.endDate)} ngày
                      </p>
                    </div>

                    <div className="pt-3 border-t-2 border-line-strong">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm border-2 border-line-strong font-extrabold text-xs ${
                          contractData.status === "ACTIVE"
                            ? "bg-success-light text-text"
                            : "bg-warning-light text-text"
                        }`}
                      >
                        {contractData.status === "ACTIVE"
                          ? "Đang hoạt động"
                          : contractData.status}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle
                      size={32}
                      className="text-text-muted mx-auto mb-2"
                      strokeWidth={2}
                    />
                    <p className="text-sm font-bold text-text-muted">
                      Chưa có hợp đồng
                    </p>
                  </div>
                )}
              </motion.div>

              {/* Card 3: Hóa đơn gần nhất */}
              <motion.div
                variants={itemVariants}
                className={`${cardBase} p-6 hover:shadow-[8px_8px_0_#141413] hover:-translate-y-1 transition-all duration-300`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="size-10 rounded-sm bg-warning border-3 border-line-strong flex items-center justify-center shadow-[2px_2px_0_#141413]">
                    <DollarSign
                      size={20}
                      className="text-text"
                      strokeWidth={2.5}
                    />
                  </div>
                  <h2 className="text-lg font-black text-text">
                    Hóa đơn gần nhất
                  </h2>
                </div>

                {invoiceData ? (
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-extrabold text-text-muted uppercase mb-1">
                        Loại hóa đơn
                      </p>
                      <p className="text-base font-extrabold text-text">
                        {invoiceData.invoiceType === "MONTHLY_RENT" ||
                        invoiceData.invoiceType === "ROOM_FEE"
                          ? "Tiền phòng tháng"
                          : invoiceData.invoiceType}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-extrabold text-text-muted uppercase mb-1">
                        Số tiền
                      </p>
                      <p className="text-2xl font-black text-text">
                        {formatCurrency(invoiceData.totalAmount)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-extrabold text-text-muted uppercase mb-1">
                        Hạn thanh toán
                      </p>
                      <p className="text-sm font-extrabold text-text flex items-center gap-1">
                        <Clock size={14} strokeWidth={2.5} />
                        {formatDate(invoiceData.dueDate)}
                      </p>
                    </div>

                    <div className="pt-3 border-t-2 border-line-strong space-y-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm border-2 border-line-strong font-extrabold text-xs ${
                          invoiceData.status === "UNPAID"
                            ? "bg-error-light text-text"
                            : "bg-warning-light text-text"
                        }`}
                      >
                        {invoiceData.status === "UNPAID"
                          ? "Chưa thanh toán"
                          : invoiceData.status}
                      </span>

                      {invoiceData.status === "UNPAID" && (
                        <Link
                          to={`/student/invoices/${invoiceData.invoiceId}`}
                          className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-primary border-3 border-line-strong rounded-sm font-extrabold text-xs text-text shadow-[2px_2px_0_#141413] hover:shadow-[3px_3px_0_#141413] hover:-translate-0.5 active:translate-0.5 active:shadow-none transition-all"
                        >
                          <CreditCard size={14} strokeWidth={2.5} />
                          Thanh toán ngay
                        </Link>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle
                      size={32}
                      className="text-text-muted mx-auto mb-2"
                      strokeWidth={2}
                    />
                    <p className="text-sm font-bold text-text-muted">
                      Không có hóa đơn chưa thanh toán
                    </p>
                  </div>
                )}
              </motion.div>
            </motion.div>

            {/* Quick Actions Section */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className={`${cardBase} p-6`}
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">⚡</span>
                <h2 className="text-xl font-black text-text">Tác vụ nhanh</h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {quickActions.map(({ name, path, icon: Icon, bg }) => (
                  <Link
                    key={path}
                    to={path}
                    className="flex flex-col items-center justify-center p-4 bg-surface border-3 border-line-strong rounded-sm shadow-[3px_3px_0_#141413] hover:shadow-[5px_5px_0_#141413] hover:-translate-0.5 active:translate-0.5 active:shadow-none transition-all duration-200 text-center group cursor-pointer"
                  >
                    <div
                      className={`size-11 rounded-sm ${bg} border-2 border-line-strong flex items-center justify-center mb-2 shadow-[2px_2px_0_#141413] group-hover:scale-105 transition-transform`}
                    >
                      <Icon size={20} className="text-text" strokeWidth={2.5} />
                    </div>
                    <span className="text-xs font-extrabold text-text">
                      {name}
                    </span>
                  </Link>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </div>
    </Workspace>
  );
}
