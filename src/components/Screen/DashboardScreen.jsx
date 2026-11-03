import { Link } from "react-router-dom";
import {
  RefreshCw,
  Users,
  Home,
  FileText,
  Wrench,
  DollarSign,
  CheckCircle,
  Calendar,
  Clock,
  AlertCircle,
  TrendingUp,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { FIELD_LABELS } from "./constants";
import { Notice, Loading, Heading } from "./UIComponents";
import { useLoad } from "./useLoad";

// Mapping cấu hình Icon & Bảng màu Neo-Brutalism
const METRIC_CONFIG = {
  totalStudents: { icon: Users, bg: "bg-primary", light: "bg-primary-light" },
  totalRooms: { icon: Home, bg: "bg-success", light: "bg-success-light" },
  occupiedRooms: { icon: Home, bg: "bg-warning", light: "bg-warning-light" },
  pendingApplications: {
    icon: FileText,
    bg: "bg-accent",
    light: "bg-accent-light",
  },
  maintenanceRequests: {
    icon: Wrench,
    bg: "bg-error",
    light: "bg-error-light",
  },
  totalInvoices: {
    icon: DollarSign,
    bg: "bg-primary",
    light: "bg-primary-light",
  },
  paidInvoices: {
    icon: CheckCircle,
    bg: "bg-success",
    light: "bg-success-light",
  },
  unpaidInvoices: {
    icon: FileText,
    bg: "bg-warning",
    light: "bg-warning-light",
  },
};

const cardBase =
  "bg-white border-4 border-line-strong rounded-2xl shadow-[5px_5px_0_#141413]";

export default function DashboardScreen({ config }) {
  // Load dashboard data từ API
  const { data, error, loading, reload } = useLoad(config.resource, {});

  // Lấy tối đa 4 metrics đầu tiên
  const list = Object.entries(data || {})
    .filter(([, value]) => ["number", "string"].includes(typeof value))
    .slice(0, 4);

  // Dữ liệu biểu đồ Tỷ lệ lấp đầy
  const chartData = [
    { month: "T1", value: 65 },
    { month: "T2", value: 72 },
    { month: "T3", value: 68 },
    { month: "T4", value: 85 },
    { month: "T5", value: 92 },
    { month: "T6", value: 88 },
  ];

  // Thông tin nhanh
  const quickStats = [
    {
      icon: Clock,
      label: "Đơn chưa xử lý",
      value: "24",
      bg: "bg-warning-light",
      badge: "bg-warning",
    },
    {
      icon: AlertCircle,
      label: "Yêu cầu khẩn",
      value: "3",
      bg: "bg-error-light",
      badge: "bg-error",
    },
    {
      icon: CheckCircle,
      label: "Hoàn thành hôm nay",
      value: "12",
      bg: "bg-success-light",
      badge: "bg-success",
    },
    {
      icon: Calendar,
      label: "Check-in hôm nay",
      value: "8",
      bg: "bg-primary-light",
      badge: "bg-primary",
    },
  ];

  // Shortcuts theo vai trò
  const shortcuts =
    config.group === "student"
      ? [
          { name: "Tìm phòng", path: "/rooms", icon: Home, bg: "bg-primary" },
          {
            name: "Đăng ký nội trú",
            path: "/student/applications/new",
            icon: FileText,
            bg: "bg-success",
          },
          {
            name: "Hóa đơn",
            path: "/student/invoices",
            icon: DollarSign,
            bg: "bg-warning",
          },
          {
            name: "Báo hỏng",
            path: "/student/maintenance",
            icon: Wrench,
            bg: "bg-accent",
          },
        ]
      : [
          {
            name: "Đơn chờ duyệt",
            path: "/manager/applications",
            icon: FileText,
            bg: "bg-primary",
          },
          {
            name: "Quản lý phòng",
            path: "/manager/rooms",
            icon: Home,
            bg: "bg-success",
          },
          {
            name: "Hóa đơn",
            path: "/manager/invoices",
            icon: DollarSign,
            bg: "bg-warning",
          },
          {
            name: "Báo hỏng",
            path: "/manager/maintenance",
            icon: Wrench,
            bg: "bg-accent",
          },
        ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="space-y-8">
      {/* Heading + Reload Button */}
      <div className="flex items-center justify-between gap-4">
        <Heading config={config} />
        <button
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border-3 border-line-strong rounded-sm font-extrabold text-sm! text-text shadow-[3px_3px_0_#141413] hover:shadow-[5px_5px_0_#141413] hover:-translate-0.5 active:translate-0.5 active:shadow-none transition-all cursor-pointer shrink-0"
          onClick={reload}
        >
          <RefreshCw
            size={15}
            strokeWidth={2.5}
            className={loading ? "animate-spin" : ""}
          />
          <span>Tải lại</span>
        </button>
      </div>

      <Notice error={error} />

      {loading ? (
        <Loading />
      ) : (
        <div className="space-y-8">
          {/* 1. METRICS GRID */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {list.length ? (
              list.map(([key, value], idx) => {
                const itemConfig = METRIC_CONFIG[key] || {
                  icon: FileText,
                  bg: "bg-primary",
                  light: "bg-primary-light",
                };
                const Icon = itemConfig.icon;

                return (
                  <motion.div
                    variants={itemVariants}
                    key={key}
                    className={`${cardBase} p-6 hover:shadow-[8px_8px_0_#141413] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className={`size-12 rounded-xl ${itemConfig.bg} border-3 border-line-strong flex items-center justify-center shadow-[2px_2px_0_#141413]`}
                      >
                        <Icon
                          size={24}
                          className="text-black"
                          strokeWidth={2.5}
                        />
                      </div>
                      <span className="inline-flex items-center gap-1 text-xs font-extrabold px-2.5 py-1 bg-warning text-black rounded-lg border-2 border-line-strong shadow-[2px_2px_0_#141413]">
                        <TrendingUp size={12} strokeWidth={3} />+{(idx + 1) * 8}
                        %
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xs font-extrabold text-text-muted uppercase tracking-wider mb-1">
                        {FIELD_LABELS[key] || key.replace(/([A-Z])/g, " $1")}
                      </h3>
                      <p className="text-3xl font-black text-text tracking-tight">
                        {typeof value === "number"
                          ? new Intl.NumberFormat("vi-VN").format(value)
                          : value}
                      </p>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div
                className={`${cardBase} p-8 col-span-full text-center text-text-muted font-extrabold`}
              >
                Máy chủ chưa có số liệu tổng quan.
              </div>
            )}
          </motion.div>

          {/* 2. BAR CHART SECTION */}
          <div className={`${cardBase} p-6 sm:p-8`}>
            <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
              <div>
                <div className="inline-block px-3 py-1 mb-2 bg-primary text-black text-xs font-extrabold uppercase tracking-widest rounded-md border-2 border-line-strong shadow-[2px_2px_0_#141413]">
                  THỐNG KÊ NỘI TRÚ
                </div>
                <h2 className="text-2xl font-extrabold text-text">
                  Tỷ lệ lấp đầy phòng theo tháng (%)
                </h2>
              </div>
              <div className="flex items-center gap-4 text-xs font-extrabold">
                <span className="flex items-center gap-1.5">
                  <span className="size-3 rounded-xs bg-primary border-2 border-line-strong" />
                  Đã ở
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-3 rounded-xs bg-warning border-2 border-line-strong" />
                  Mục tiêu (90%)
                </span>
              </div>
            </div>

            {/* Khung Biểu đồ Column */}
            <div className="flex items-end justify-between h-64 gap-2 sm:gap-4 pt-6 pb-2 px-2 border-b-4 border-line-strong">
              {chartData.map((d, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center gap-3 flex-1 h-full justify-end group"
                >
                  <div className="w-full h-full flex flex-col justify-end relative">
                    {/* Cột dữ liệu */}
                    <div
                      className="w-full bg-primary hover:bg-warning rounded-t-xl border-3 border-line-strong transition-all duration-200 cursor-pointer relative shadow-[3px_3px_0_#141413]"
                      style={{ height: `${d.value}%` }}
                    >
                      {/* Tooltip Popup */}
                      <div className="absolute -top-11 left-1/2 -translate-x-1/2 bg-black text-white px-2.5 py-1 rounded-lg text-xs font-extrabold opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap border-2 border-white pointer-events-none z-10 shadow-[2px_2px_0_#000]">
                        {d.value}% Occupancy
                      </div>
                    </div>
                  </div>

                  <span className="text-xs sm:text-sm font-extrabold text-text">
                    {d.month}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 3. QUICK STATS & SHORTCUTS GRID */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Quick Stats */}
            <div
              className={`${cardBase} p-6 sm:p-8 flex flex-col justify-between`}
            >
              <div className="flex items-center gap-2 mb-6">
                <Zap size={22} className="text-black fill-warning" />
                <h2 className="text-xl font-extrabold text-text">
                  Thông tin nhanh
                </h2>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {quickStats.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={i}
                      className={`flex items-center justify-between p-4 rounded-xl border-3 border-line-strong shadow-[3px_3px_0_#141413] ${item.bg}`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`size-9 rounded-lg ${item.badge} border-2 border-line-strong flex items-center justify-center shadow-[1.5px_1.5px_0_#141413]`}
                        >
                          <Icon
                            size={18}
                            className="text-black"
                            strokeWidth={2.5}
                          />
                        </div>
                        <span className="text-xs font-extrabold text-text">
                          {item.label}
                        </span>
                      </div>
                      <span className="text-xl font-black text-text">
                        {item.value}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Shortcuts */}
            <div
              className={`${cardBase} p-6 sm:p-8 flex flex-col justify-between`}
            >
              <div className="flex items-center gap-2 mb-6">
                <span className="text-xl">🚀</span>
                <h2 className="text-xl font-extrabold text-text">
                  Tác vụ nhanh
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {shortcuts.map(({ name, path, icon: Icon, bg }) => (
                  <Link
                    key={path}
                    to={path}
                    className="flex flex-col items-center justify-center p-4 bg-white border-3 border-line-strong rounded-xl shadow-[3px_3px_0_#141413] hover:shadow-[6px_6px_0_#141413] hover:-translate-y-1 active:translate-y-0 active:shadow-none transition-all duration-200 text-center group"
                  >
                    <div
                      className={`size-11 rounded-xl ${bg} border-2 border-line-strong flex items-center justify-center mb-2 shadow-[2px_2px_0_#141413] group-hover:scale-110 transition-transform`}
                    >
                      <Icon
                        size={22}
                        className="text-black"
                        strokeWidth={2.5}
                      />
                    </div>
                    <span className="text-xs font-extrabold text-text">
                      {name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
