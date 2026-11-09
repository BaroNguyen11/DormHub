import { Link } from "react-router-dom";
import {
  RefreshCw,
  Users,
  Home,
  FileText,
  Wrench,
  DollarSign,
  Building2,
  Receipt,
  UserPlus,
  Bell,
} from "lucide-react";
import { motion } from "motion/react";
import { FIELD_LABELS } from "./constants";
import { Notice, Loading, Heading } from "./UIComponents";
import { useLoad } from "./useLoad";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import { useEffect, useState } from "react";
import { resources } from "../../services/resource.service";

// Mapping cấu hình Icon & Bảng màu Neo-Brutalism cho dashboard metrics
const METRIC_CONFIG = {
  totalStudents: { icon: Users, bg: "bg-primary", light: "bg-primary-light" },
  totalRooms: { icon: Home, bg: "bg-success", light: "bg-success-light" },
  occupiedRooms: { icon: Home, bg: "bg-warning", light: "bg-warning-light" },
  pendingApplications: {
    icon: FileText,
    bg: "bg-accent",
    light: "bg-accent-light",
  },
  openMaintenance: {
    icon: Wrench,
    bg: "bg-error",
    light: "bg-error-light",
  },
  unpaidInvoices: {
    icon: DollarSign,
    bg: "bg-warning",
    light: "bg-warning-light",
  },
};

const cardBase =
  "bg-surface border-4 border-line-strong rounded-sm shadow-[5px_5px_0_#141413]";

export default function DashboardScreen({ config }) {
  // Load dashboard data từ API
  const { data, error, loading, reload } = useLoad(
    config.group === "manager" ? "/manager/dashboard/summary" : config.resource,
    {},
  );

  // Lấy tối đa 6 metrics từ API (hoặc 4 nếu ít hơn)
  const list = Object.entries(data || {})
    .filter(([, value]) => typeof value === "number")
    .slice(0, 6);

  if (config.group === "manager") {
    return (
      <ManagerAnalytics
        data={data || {}}
        loading={loading}
        error={error}
        reload={reload}
      />
    );
  }

  // Shortcuts theo vai trò
  const shortcuts =
    config.group === "student"
      ? [
          {
            name: "Chỗ ở của tôi",
            path: "/student/residence",
            icon: Home,
            bg: "bg-primary",
          },
          {
            name: "Hợp đồng",
            path: "/student/residence",
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
            path: "/manager/students",
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
            path: "/manager/finance",
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
          className="inline-flex items-center gap-2 px-4 py-2 bg-surface border-3 border-line-strong rounded-sm font-extrabold text-sm! text-text shadow-[3px_3px_0_#141413] hover:shadow-[5px_5px_0_#141413] hover:-translate-0.5 active:translate-0.5 active:shadow-none transition-all cursor-pointer shrink-0"
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
          {/* METRICS GRID */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {list.length ? (
              list.map(([key, value]) => {
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
                        className={`size-12 rounded-sm ${itemConfig.bg} border-3 border-line-strong flex items-center justify-center shadow-[2px_2px_0_#141413]`}
                      >
                        <Icon
                          size={24}
                          className="text-[#000000]"
                          strokeWidth={2.5}
                        />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xs font-extrabold text-text-muted uppercase tracking-wider mb-1">
                        {FIELD_LABELS[key] || key.replace(/([A-Z])/g, " $1")}
                      </h3>
                      <p className="text-3xl font-black text-text tracking-tight">
                        {new Intl.NumberFormat("vi-VN").format(value)}
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

          {/* SHORTCUTS */}
          <div className={`${cardBase} p-6 sm:p-8`}>
            <div className="flex items-center gap-2 mb-6">
              <span className="text-xl">🚀</span>
              <h2 className="text-xl font-extrabold text-text">Tác vụ nhanh</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {shortcuts.map(({ name, path, icon: Icon, bg }) => (
                <Link
                  key={path}
                  to={path}
                  className="flex flex-col items-center justify-center p-4 bg-surface border-3 border-line-strong rounded-sm shadow-[3px_3px_0_#141413] hover:shadow-[6px_6px_0_#141413] hover:-translate-y-1 active:translate-y-0 active:shadow-none transition-all duration-200 text-center group"
                >
                  <div
                    className={`size-11 rounded-sm ${bg} border-2 border-line-strong flex items-center justify-center mb-2 shadow-[2px_2px_0_#141413] group-hover:scale-110 transition-transform`}
                  >
                    <Icon size={22} className="text-text" strokeWidth={2.5} />
                  </div>
                  <span className="text-xs font-extrabold text-text">
                    {name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const chartTooltip = {
  contentStyle: {
    border: "3px solid var(--color-line-strong)",
    borderRadius: "2px",
    boxShadow: "3px 3px 0 #141413",
    background: "var(--color-surface)",
    fontWeight: 800,
  },
  itemStyle: { transition: "all 200ms" },
};

function ManagerAnalytics({ data, loading, error, reload }) {
  const [applications, setApplications] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [invoiceDataAvailable, setInvoiceDataAvailable] = useState(false);
  useEffect(() => {
    let active = true;
    Promise.allSettled([
      resources.list("/manager/dorm-applications", { page: 0, size: 100 }),
      resources.list("/manager/maintenance", { page: 0, size: 100 }),
      resources.list("/invoices", { page: 0, size: 500 }),
    ]).then(([appsResult, issuesResult, invoicesResult]) => {
      if (!active) return;
      const apps = appsResult.status === "fulfilled" ? appsResult.value : [];
      const issues =
        issuesResult.status === "fulfilled" ? issuesResult.value : [];
      const invoiceRows =
        invoicesResult.status === "fulfilled" ? invoicesResult.value : [];
      const newest = (rows) =>
        [...rows]
          .sort(
            (a, b) =>
              new Date(b.createdAt || b.requestedAt || 0) -
              new Date(a.createdAt || a.requestedAt || 0),
          )
          .slice(0, 3);
      setApplications(
        newest(Array.isArray(apps) ? apps : apps?.content || apps?.items || []),
      );
      setMaintenance(
        newest(
          Array.isArray(issues)
            ? issues
            : issues?.content || issues?.items || [],
        ),
      );
      setInvoices(
        Array.isArray(invoiceRows)
          ? invoiceRows
          : invoiceRows?.content || invoiceRows?.items || [],
      );
      setInvoiceDataAvailable(invoicesResult.status === "fulfilled");
    });
    return () => {
      active = false;
    };
  }, []);
  const totalRooms = Number(data.totalRooms || 0);
  const occupied = Number(data.occupiedRooms || 0);
  const maintenanceRooms = Number(
    data.maintenanceRooms || data.roomsInMaintenance || 0,
  );
  const available = Number(
    data.availableRooms ??
      data.vacantRooms ??
      Math.max(0, totalRooms - occupied - maintenanceRooms),
  );
  const occupancy = totalRooms ? Math.round((occupied / totalRooms) * 100) : 0;
  const monthKeys = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() - (5 - i));
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  });
  const invoiceMonthly = monthKeys.map((month) => {
    const rows = invoices.filter(
      (invoice) =>
        String(
          invoice.billingMonth || invoice.issueDate || invoice.createdAt || "",
        ).slice(0, 7) === month,
    );
    const issued = rows.reduce(
      (sum, invoice) =>
        sum + Number(invoice.totalAmount ?? invoice.amount ?? 0),
      0,
    );
    const collected = rows
      .filter(
        (invoice) => String(invoice.status || "").toUpperCase() === "PAID",
      )
      .reduce(
        (sum, invoice) =>
          sum + Number(invoice.totalAmount ?? invoice.amount ?? 0),
        0,
      );
    return { month, issued, collected };
  });
  const currentMonthInvoiceTotal = invoiceMonthly.at(-1)?.issued || 0;
  const revenue = Number(
    data.currentMonthRevenue ??
      (typeof data.monthlyRevenue === "number"
        ? data.monthlyRevenue
        : currentMonthInvoiceTotal),
  );
  const metrics = [
    {
      label: "Tỷ lệ lấp đầy phòng",
      value: `${occupancy}%`,
      progress: occupancy,
      icon: Building2,
      bar: "bg-success",
    },
    {
      label: "Doanh thu tháng này",
      value: new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
      }).format(revenue),
      progress: revenue ? 100 : 0,
      icon: Receipt,
      bar: "bg-primary",
    },
    {
      label: "Đơn đăng ký chờ duyệt",
      value: data.pendingApplications ?? 0,
      progress: Number(data.pendingApplications || 0) ? 100 : 0,
      icon: UserPlus,
      badge: "bg-warning",
      bar: "bg-warning",
    },
    {
      label: "Báo hỏng chưa xử lý",
      value: data.openMaintenance ?? 0,
      progress: Number(data.openMaintenance || 0) ? 100 : 0,
      icon: Wrench,
      badge: "bg-error",
      bar: "bg-error",
    },
  ];
  const roomData = [
    { name: "Đang ở", value: occupied, color: "#8ee3a1" },
    { name: "Còn trống", value: available, color: "#ffd166" },
    { name: "Bảo trì", value: maintenanceRooms, color: "#ff6b6b" },
  ];
  const monthly =
    data.monthlyRevenue || data.monthlyStats || data.revenueByMonth || [];
  const monthlyDataFromSummary = Array.isArray(monthly)
    ? monthly.slice(-6).map((item) => ({
        month: item.month || item.label || item.billingMonth,
        issued: Number(
          item.issuedAmount ?? item.totalInvoiced ?? item.invoiceAmount ?? 0,
        ),
        collected: Number(
          item.collectedAmount ?? item.paidAmount ?? item.receivedAmount ?? 0,
        ),
      }))
    : [];
  const monthlyData = monthlyDataFromSummary.length
    ? monthlyDataFromSummary
    : invoiceDataAvailable
      ? invoiceMonthly
      : [];
  const revenueChartData = monthlyData.map((item) => ({
    ...item,
    month: /^\d{4}-\d{2}$/.test(item.month || "")
      ? `Thg ${Number(item.month.slice(5))}`
      : item.month,
    uncollected: Math.max(0, item.issued - item.collected),
  }));
  const quickActions = [
    [
      "+ Tạo tài khoản SV",
      "/manager/students?tab=create",
      UserPlus,
      "bg-primary",
    ],
    [
      "Duyệt đơn đăng ký",
      "/manager/students?tab=applications",
      FileText,
      "bg-warning",
    ],
    [
      "Tạo hóa đơn tháng",
      "/manager/finance?tab=invoices",
      Receipt,
      "bg-success",
    ],
    ["Xử lý báo hỏng", "/manager/maintenance?tab=tickets", Wrench, "bg-error"],
    [
      "Gửi thông báo chung",
      "/manager/maintenance?tab=announcements",
      Bell,
      "bg-accent",
    ],
  ];
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-black">Tổng quan quản lý</h1>
        <button
          onClick={reload}
          className="flex items-center gap-2 text-sm! px-4 font-medium  py-2 border-3 border-line-strong rounded-sm bg-surface shadow-[2px_2px_0_#141413] hover:shadow-[3px_3px_0_#141413] hover:-translate-0.5 active:translate-0.5 active:shadow-none outline-none! transition-all"
        >
          <RefreshCw />
          Tải lại
        </button>
      </div>
      {error && (
        <div className="border-3 border-line-strong bg-error-light p-4 rounded-sm font-bold">
          {error}
        </div>
      )}
      {loading ? (
        <Loading />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {metrics.map(
              ({ label, value, progress, icon: Icon, badge, bar }) => (
                <article
                  key={label}
                  className="bg-surface border-3 border-line-strong rounded-md p-4 shadow-[4px_4px_0_#141413] transition-all"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-extrabold text-text-muted">
                      {label}
                    </p>
                    <span
                      className={`grid size-9 place-items-center rounded-sm border-2 border-line-strong shadow-[2px_2px_0_#141413] ${badge || "bg-surface-2"}`}
                    >
                      <Icon size={19} />
                    </span>
                  </div>
                  <p className="mt-2 text-2xl font-black text-text">{value}</p>
                  <div className="mt-4 h-3 border-2 border-line-strong bg-surface-3">
                    <div
                      className={`h-full ${bar} transition-all`}
                      style={{
                        width: `${Math.max(0, Math.min(progress, 100))}%`,
                      }}
                    />
                  </div>
                </article>
              ),
            )}
          </div>
          <section className="bg-surface border-3 border-line-strong rounded-md p-5 shadow-[4px_4px_0_#141413]">
            <h2 className="font-black text-lg mb-4">Tác vụ nhanh</h2>
            <div className="flex flex-wrap gap-4">
              {quickActions.map(([label, to, Icon, color]) => (
                <Link
                  key={to}
                  to={to}
                  className={`inline-flex items-center gap-2 border-3 border-line-strong rounded-sm px-4 py-3 ${color} font-black text-sm shadow-[2px_2px_0_#141413] hover:shadow-[3px_3px_0_#141413] hover:-translate-0.5 active:translate-0.5 active:shadow-none transition-all cursor-pointer outline-none!`}
                >
                  <Icon size={18} />
                  {label}
                </Link>
              ))}
            </div>
          </section>
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
            <section className="xl:col-span-3 bg-surface border-3 border-line-strong rounded-md p-5 shadow-[4px_4px_0_#141413] transition-all">
              <h2 className="font-black text-lg mb-4">
                Doanh thu 6 tháng gần nhất
              </h2>
              {revenueChartData.length ? (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis
                        tickFormatter={(value) =>
                          `${(value / 1_000_000).toFixed(0)}m`
                        }
                      />
                      <Tooltip
                        {...chartTooltip}
                        formatter={(value) =>
                          `${(Number(value) / 1_000_000).toFixed(1)} triệu VNĐ`
                        }
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="issued"
                        name="Doanh thu"
                        stroke="#22c55e"
                        fill="#22c55e"
                        fillOpacity={0.2}
                        strokeWidth={3}
                        dot={{ r: 5 }}
                      />
                      <Area
                        type="monotone"
                        dataKey="uncollected"
                        name="Chưa thu"
                        stroke="#eab308"
                        fill="#eab308"
                        fillOpacity={0.2}
                        strokeWidth={3}
                        dot={{ r: 5 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-72 grid place-items-center text-center font-bold text-text-muted">
                  Máy chủ chưa cung cấp dữ liệu doanh thu theo tháng.
                </div>
              )}
            </section>
            <section className="xl:col-span-2 bg-surface border-3 border-line-strong rounded-md p-5 shadow-[4px_4px_0_#141413] transition-all">
              <h2 className="font-black text-lg mb-4">Trạng thái phòng</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={roomData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={48}
                      outerRadius={92}
                      stroke="#141413"
                      strokeWidth={3}
                      label
                    >
                      {roomData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip {...chartTooltip} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>
          <section className="grid lg:grid-cols-2 gap-6">
            <FeedCard
              title="Đơn đăng ký phòng mới nhất"
              empty="Chưa có đơn đăng ký mới."
              items={applications}
              render={(item) => (
                <>
                  <strong>
                    {item.studentName ||
                      item.fullName ||
                      item.student?.fullName ||
                      "Sinh viên"}
                  </strong>
                  <span className="block text-xs text-text-muted">
                    Phòng{" "}
                    {item.requestedRoomNumber || item.roomNumber || "Chưa chọn"}{" "}
                    · {item.status || "Mới"}
                  </span>
                </>
              )}
            />
            <FeedCard
              title="Báo hỏng cần xử lý"
              empty="Chưa có yêu cầu báo hỏng."
              items={maintenance}
              render={(item) => (
                <>
                  <strong>
                    {item.title || item.description || "Yêu cầu sửa chữa"}
                  </strong>
                  <span className="block text-xs text-text-muted">
                    {item.studentName || item.fullName || "Sinh viên"} ·{" "}
                    {item.status || "Mới"}
                  </span>
                </>
              )}
            />
          </section>
        </>
      )}
    </div>
  );
}

function FeedCard({ title, empty, items, render }) {
  return (
    <section className="bg-surface border-3 border-line-strong rounded-md p-5 shadow-[4px_4px_0_#141413]">
      <h2 className="text-lg font-black mb-3">{title}</h2>
      {items.length ? (
        <ul className="space-y-2">
          {items.slice(0, 3).map((item, index) => (
            <li
              key={item.id ?? item.applicationId ?? item.maintenanceId ?? index}
              className="p-3 border-2 border-line-strong rounded-sm bg-surface-2"
            >
              {render(item)}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm font-bold text-text-muted">{empty}</p>
      )}
    </section>
  );
}
