import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Menu,
  LogOut,
  ArrowLeft,
  Building2,
  Receipt,
  ShieldCheck,
  Zap,
  ChevronRight,
  Bell,
} from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import useAuth from "../hooks/useAuth";
import useStudentRoom from "../hooks/useStudentRoom";
import { nav } from "../constants/screenConfig";
import { isDemoSession } from "../services/demo.service";
import ThemeToggleSwitch from "./ThemeToggleSwitch";
import { resources } from "../services/resource.service";
import { api } from "../api/apiClient";

export default function Workspace({ group, title, children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const { hasRoom } = useStudentRoom();
  useEffect(() => {
    if (!["student", "manager"].includes(group)) return undefined;
    let active = true;
    const loadCount = async () => {
      try {
        const result = await api("/notifications/unread-count", { notify: false });
        if (active)
          setUnreadCount(
            Number(result?.unreadCount ?? result?.count ?? result ?? 0),
          );
      } catch {
        /* Keep the header usable if notifications are temporarily unavailable. */
      }
    };
    loadCount();
    const timer = setInterval(loadCount, 60_000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [group]);

  async function toggleNotifications() {
    const nextOpen = !notificationOpen;
    setNotificationOpen(nextOpen);
    if (!nextOpen) return;
    setNotificationsLoading(true);
    try {
      const result = await resources.list("/notifications", {
        page: 0,
        size: 5,
      });
      setNotifications(
        Array.isArray(result) ? result : result?.content || result?.items || [],
      );
    } catch {
      // API client reports request failures globally.
    } finally {
      setNotificationsLoading(false);
    }
  }

  async function markAllNotificationsRead() {
    try {
      await api("/notifications/read-all", { method: "PATCH" });
      setNotifications((items) =>
        items.map((item) => ({ ...item, isRead: true })),
      );
      setUnreadCount(0);
    } catch {
      // API client reports request failures globally.
    }
  }

  function handleNotificationClick(item) {
    const id = item.id ?? item.notificationId;
    setNotificationOpen(false);
    if (!item.isRead && id != null) {
      setNotifications((items) =>
        items.map((row) =>
          String(row.id ?? row.notificationId) === String(id)
            ? { ...row, isRead: true }
            : row,
        ),
      );
      setUnreadCount((count) => Math.max(0, count - 1));
      api(`/notifications/${encodeURIComponent(id)}/read`, {
        method: "PATCH",
        successNotify: false,
      }).catch(() => {
        // API client reports request failures globally.
      });
    }

    if (group === "student") {
      const type = String(item.type || item.targetType || "").toUpperCase();
      const text = `${type} ${item.title || ""} ${item.body || item.message || ""}`.toLowerCase();

      // 1. Hóa đơn
      if (
        type.includes("INVOICE") ||
        type.includes("PAYMENT") ||
        text.includes("hóa đơn") ||
        text.includes("thanh toán") ||
        text.includes("tiền phòng") ||
        text.includes("tiền điện") ||
        text.includes("tiền nước")
      ) {
        navigate("/student/invoices");
        return;
      }

      // 2. Hợp đồng / đăng ký phòng
      if (
        type.includes("CONTRACT") ||
        type.includes("ROOM") ||
        type.includes("APPLICATION") ||
        type.includes("CHECKIN") ||
        type.includes("CHECKOUT") ||
        type.includes("RENEWAL") ||
        type.includes("TRANSFER") ||
        text.includes("hợp đồng") ||
        text.includes("đăng ký phòng") ||
        text.includes("chuyển phòng") ||
        text.includes("gia hạn")
      ) {
        navigate("/student/room-contract");
        return;
      }

      // 3. Sửa chữa / bảo trì
      if (
        type.includes("MAINTENANCE") ||
        text.includes("bảo trì") ||
        text.includes("sửa chữa") ||
        text.includes("báo hỏng")
      ) {
        navigate("/student/maintenance");
        return;
      }

      // 4. Mặc định (thông báo chung từ Manager)
      navigate(`/student/notifications?id=${encodeURIComponent(id)}`);
      return;
    }

    // Luồng Manager
    const type = String(item.type || item.targetType || "GENERAL").toUpperCase();
    const targetId = item.targetId ?? item.entityId ?? item.referenceId;
    let target;

    if (type.includes("MAINTENANCE")) {
      target = targetId == null
        ? "/manager/maintenance"
        : `/manager/maintenance/${encodeURIComponent(targetId)}`;
    } else if (type.includes("INVOICE") || type.includes("PAYMENT")) {
      target = `/manager/finance${targetId == null ? "" : `?id=${encodeURIComponent(targetId)}`}`;
    } else if (type.includes("CONTRACT") || type.includes("ROOM")) {
      target = "/manager/contracts";
    } else if (type.includes("APPLICATION")) {
      target = targetId == null
        ? "/manager/students?tab=applications"
        : `/manager/applications/${encodeURIComponent(targetId)}`;
    }

    target = item.targetUrl || target;
    if (target) navigate(target);
  }
  // Sinh viên chưa có phòng chỉ thấy các chức năng tìm phòng / đăng ký
  const noRoom = group === "student" && !hasRoom;
  const navItems = nav[noRoom ? "studentNoRoom" : group];
  if (group === "guest")
    return (
      <div className="min-h-screen bg-bg">
        <header className="h-18.5 border-b-4 border-(--color-line) bg-surface flex items-center justify-between px-[clamp(20px,5vw,72px)] gap-5 shadow-(--shadow-sm)">
          <Link
            className="inline-flex items-center gap-1 font-(family-name:--font-family-display) font-extrabold text-xl tracking-tight text-(--color-text) whitespace-nowrap"
            to="/"
          >
            <img src="/logo.png" alt="DormHub Logo" className="w-20 h-20" />
            DormHub
          </Link>
          <nav className="flex gap-8 text-sm text-(--color-text-muted) font-bold">
            {nav.guest.map(([name, path]) => (
              <NavLink
                key={path}
                to={path}
                end
                className="[&.active]:text-(--color-primary)! hover:text-(--color-primary) transition-colors"
              >
                {name}
              </NavLink>
            ))}
          </nav>
          <div className="flex gap-3">
            <>
              <Link
                className="border-3 border-(--color-line) bg-surface rounded-sm h-10 px-5 py-2 inline-flex gap-2 items-center justify-center font-bold text-sm whitespace-nowrap text-(--color-text) hover:bg-surface hover:border-line-strong shadow-[3px_3px_0_#141413] hover:shadow-[5px_5px_0_#141413] hover:-translate-0.5 transition-all duration-200 active:translate-0.5 active:shadow-none"
                to="/login"
              >
                Đăng nhập
              </Link>
              <Link
                className="border-3 border-line-strong bg-(--color-primary)  rounded-sm h-10 px-5 py-2 inline-flex gap-2 items-center justify-center font-bold text-sm whitespace-nowrap shadow-[3px_3px_0_#141413] hover:shadow-[5px_5px_0_#141413] hover:-translate-0.5  transition-all duration-200 active:translate-0.5 active:shadow-none"
                to="/verify-email"
              >
                Kích hoạt tài khoản
              </Link>
            </>
          </div>
        </header>
        {children}
        <footer className="py-8 px-[clamp(20px,5vw,72px)] border-t-4 border-(--color-line) bg-surface text-(--color-text-muted) text-sm font-semibold">
          DormHub · Không gian sống sinh viên
        </footer>
      </div>
    );
  if (group === "auth")
    return (
      <div className="min-h-screen grid lg:grid-cols-12 bg-surface">
        {/* Cột trái - Hero & Branding (Chỉ hiện trên LG screen) */}
        <div className="hidden lg:col-span-5 lg:flex bg-primary-light px-10 xl:px-14 py-10 flex-col justify-between border-r-4 border-line-strong relative overflow-hidden">
          {/* Pattern khối hình trang trí nền */}
          <div className="absolute -top-10 -left-10 w-40 h-40 border-4 border-primary/30 rotate-12 pointer-events-none" />
          <div className="absolute bottom-10 -right-10 w-48 h-48 border-4 border-warning/40 -rotate-12 pointer-events-none" />

          {/* Logo */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-extrabold px-4 py-2.5 bg-surface text-text rounded-sm border-2 border-line-strong shadow-[3px_3px_0_#141413] hover:shadow-[5px_5px_0_#141413] hover:-translate-0.5 active:translate-0.5 active:shadow-none transition-all w-fit z-10"
          >
            <ArrowLeft size={16} strokeWidth={2.5} />
            Quay lại trang chủ
          </Link>

          {/* Nội dung giới thiệu */}
          <div className="my-auto py-6 z-10">
            <div className="inline-block px-3 py-1 mb-4 bg-warning text-text text-xs font-extrabold uppercase tracking-widest rounded-md border-2 border-line-strong shadow-[3px_3px_0_#141413]">
              Hệ thống nội trú
            </div>

            <h1 className="text-3xl xl:text-4xl leading-tight tracking-tight font-extrabold text-text mb-5">
              Không gian sống thuận tiện cho{" "}
              <span className="text-primary">hành trình học tập.</span>
            </h1>

            <p className="text-base leading-relaxed text-text-muted font-semibold mb-8">
              Kích hoạt tài khoản do nhà trường cấp, theo dõi hợp đồng, hóa đơn
              và yêu cầu hỗ trợ ở một nơi.
            </p>

            {/* Dải điểm nhấn (Tránh cảm giác trống trải) */}
            <div className="space-y-3.5 pt-6 border-t-2 border-line/10">
              <div className="flex items-center gap-3 text-xs font-extrabold text-text">
                <div className="size-7 rounded-sm bg-surface border-2 border-line-strong flex items-center justify-center shadow-[2px_2px_0_#141413] shrink-0">
                  <Zap size={14} className="text-text" />
                </div>
                <span>Kích hoạt tài khoản nhanh chóng trong 30s</span>
              </div>

              <div className="flex items-center gap-3 text-xs font-extrabold text-text">
                <div className="size-7 rounded-sm bg-surface border-2 border-line-strong flex items-center justify-center shadow-[2px_2px_0_#141413] shrink-0">
                  <Receipt size={14} className="text-text" />
                </div>
                <span>Tra cứu hợp đồng & hóa đơn minh bạch</span>
              </div>

              <div className="flex items-center gap-3 text-xs font-extrabold text-text">
                <div className="size-7 rounded-sm bg-surface border-2 border-line-strong flex items-center justify-center shadow-[2px_2px_0_#141413] shrink-0">
                  <ShieldCheck size={14} className="text-text" />
                </div>
                <span>Bảo mật thông tin sinh viên tuyệt đối</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cột phải - Khung Form ({children}) */}
        <main className="lg:col-span-7 grid place-items-center justify-center px-6 sm:px-12 py-12 bg-surface min-h-screen lg:min-h-0">
          <div className="w-full ">{children}</div>
        </main>
      </div>
    );
  return (
    <div className="min-h-screen flex bg-bg text-text">
      {/* 1. SIDEBAR NAVIGATION */}
      <motion.aside
        initial={false}
        animate={{
          x: open
            ? 0
            : typeof window !== "undefined" && window.innerWidth <= 768
              ? -280
              : 0,
        }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className={`w-64 shrink-0 bg-bg border-r-4 border-line-strong px-4 py-6 flex flex-col sticky top-0 h-screen overflow-y-auto z-30 ${
          open
            ? "fixed inset-y-0 left-0 shadow-[8px_0_0_#141413]"
            : "max-md:fixed max-md:inset-y-0 max-md:-left-72"
        }`}
      >
        {/* Brand Logo */}
        <Link
          className="inline-flex items-center gap-3 px-3 pb-3 mb-2 border-b-4 border-line-strong group"
          to={`/${group}`}
          onClick={() => setOpen(false)}
        >
          <img
            src="/logo.png"
            alt="DormHub Logo"
            className="size-15 object-contain p-0"
          />
          <span className="font-extrabold text-2xl text-text tracking-tight">
            DormHub
          </span>
        </Link>

        {/* Section Tag */}
        <div className="text-[11px] tracking-widest text-text-muted font-extrabold px-3 py-4 uppercase">
          {group === "student"
            ? noRoom
              ? "Tìm phòng nội trú"
              : "Không gian sinh viên"
            : "Trung tâm quản lý"}
        </div>

        {/* Menu Items */}
        <nav className="flex flex-col gap-2">
          {navItems?.map(([name, path, Icon]) => (
            <NavLink key={path} to={path} end onClick={() => setOpen(false)}>
              {({ isActive }) => (
                <div
                  className={`text-sm rounded-sm px-4 py-2 font-extrabold transition-all duration-200 flex items-center gap-3 ${
                    isActive
                      ? "bg-primary text-black border-3 border-line-strong shadow-[4px_4px_0_#141413] translate-x-1"
                      : "text-text-muted hover:text-text hover:bg-surface border-3 border-transparent hover:border-line-strong hover:shadow-[3px_3px_0_#141413]"
                  }`}
                >
                  {Icon && <Icon size={18} strokeWidth={2.5} />}
                  <span>{name}</span>
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Profile Card (Góc dưới Sidebar) */}
        <div className="mt-auto border-t-4 border-line-strong pt-4 px-2 flex gap-3 items-center min-w-0">
          <div className="size-10 shrink-0 rounded-full bg-warning text-black grid place-items-center text-sm font-extrabold border-3 border-line-strong shadow-[2px_2px_0_#141413]">
            {(user?.fullName || user?.name || "U").slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <strong className="block text-xs font-extrabold whitespace-nowrap overflow-hidden text-ellipsis text-text">
              {user?.fullName || user?.name || user?.email || "Tài khoản"}
            </strong>
            <span className="inline-block text-[10px] bg-primary-light text-text px-1.5 py-0.5 rounded border border-line-strong uppercase tracking-wider font-extrabold mt-0.5">
              {group}
            </span>
          </div>
        </div>
      </motion.aside>

      {/* Backdrop mờ khi mở Menu trên Mobile */}
      <AnimatePresence>
        {open && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-text/50 backdrop-blur-xs z-20 md:hidden"
            onClick={() => setOpen(false)}
            aria-label="Đóng menu"
          />
        )}
      </AnimatePresence>

      {/* 2. MAIN CONTENT AREA */}
      <div className="min-w-0 flex-1 flex flex-col bg-surface">
        {/* Header Bar */}
        <header className="h-16 border-b-4 border-line-strong bg-surface flex items-center justify-between px-6 lg:px-10 gap-4 shadow-[0_4px_0_#141413] z-10 sticky top-0">
          {/* Left Breadcrumbs */}
          <div className="flex items-center gap-2 text-text-muted text-xs font-bold">
            <button
              className="md:hidden size-9 rounded-sm bg-surface border-2 border-line-strong inline-grid place-items-center hover:bg-warning transition-colors shadow-[2px_2px_0_#141413]"
              onClick={() => setOpen(true)}
              aria-label="Mở menu"
            >
              <Menu size={18} className="text-text" />
            </button>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-text-muted">
              <Building2 size={15} />
              <span>{group === "student" ? "Sinh viên" : "Quản lý"}</span>
            </span>
            <ChevronRight
              size={14}
              className="hidden sm:block text-text-muted"
            />
            <strong className="text-text font-extrabold text-sm sm:text-base">
              {title}
            </strong>
          </div>

          {/* Right User Actions */}
          <div className="flex items-center gap-3">
            {["student", "manager"].includes(group) && (
              <div className="relative">
                <button
                  onClick={toggleNotifications}
                  className="relative size-10 rounded-full bg-surface border-3 border-line-strong grid place-items-center shadow-[1px_1px_0_#141413] hover:shadow-[2px_2px_0_#141413] hover:-translate-0.5 active:shadow-none active:translate-0 outline-none! transition-all"
                  title="Thông báo"
                  aria-label="Thông báo"
                  aria-expanded={notificationOpen}
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute -right-2 -top-2 min-w-5 h-5 px-1 grid place-items-center rounded-sm border-2 border-line-strong bg-error text-white text-[10px] font-black shadow-[1px_1px_0_#141413]">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>
                {notificationOpen && (
                  <div className="absolute right-0 top-12 z-50 w-[min(22rem,calc(100vw-2rem))] bg-surface border-3 border-line-strong rounded-sm p-3 shadow-[4px_4px_0_#141413]">
                    <div className="flex items-center justify-between gap-3 border-b-2 border-line-strong pb-2 mb-2">
                      <strong className="font-black">Thông báo</strong>
                      <button
                        onClick={markAllNotificationsRead}
                        disabled={!unreadCount}
                        className="text-xs! font-bold! underline disabled:opacity-50 outline-none! transition-all"
                      >
                        Đánh dấu tất cả đã đọc
                      </button>
                    </div>
                    {notificationsLoading ? (
                      <p className="p-3 text-sm font-bold">Đang tải…</p>
                    ) : notifications.length ? (
                      <ul className="max-h-96 overflow-y-auto space-y-2">
                        {notifications.map((item) => (
                          <li key={item.id ?? item.notificationId}>
                            <button
                              onClick={() => handleNotificationClick(item)}
                              className={`w-full text-left p-3 rounded-sm border-2 border-line-strong outline-none! transition-all ${item.isRead ? "bg-surface-2 text-text-muted" : "bg-primary-light text-text shadow-[2px_2px_0_#141413]"}`}
                            >
                              <span className="flex items-start justify-between gap-2">
                                <strong className="text-sm font-extrabold">
                                  {item.title || "Thông báo"}
                                </strong>
                                {!item.isRead && (
                                  <span
                                    className="mt-1 size-2 shrink-0 rounded-full bg-primary"
                                    aria-label="Chưa đọc"
                                  />
                                )}
                              </span>
                              <span className="block mt-1 text-xs">
                                {item.body || item.message || ""}
                              </span>
                              {item.createdAt && (
                                <time className="block mt-2 text-[10px] opacity-70">
                                  {new Date(item.createdAt).toLocaleString(
                                    "vi-VN",
                                  )}
                                </time>
                              )}
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="p-3 text-sm font-bold text-text-muted">
                        Chưa có thông báo.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
            <ThemeToggleSwitch />
            {/* Tên User */}
            <span className="font-extrabold text-text hidden md:block text-sm px-2">
              {user?.fullName || user?.email}
            </span>

            {/* Đăng xuất Button */}
            <button
              className="size-9 rounded-sm bg-error text-white border-2 border-line-strong grid place-items-center shadow-[1px_1px_0_#141413] hover:shadow-[2px_2px_0_#141413]  hover:-translate-px active:translate-px active:shadow-none transition-all"
              onClick={async () => {
                try {
                  await logout();
                } catch {
                  // Xóa session ở client ngay cả khi Backend lỗi
                } finally {
                  navigate("/", { replace: true });
                }
              }}
              title="Đăng xuất"
              aria-label="Đăng xuất"
            >
              <LogOut size={16} strokeWidth={2.5} />
            </button>
          </div>
        </header>

        {/* Demo Mode Banner */}
        {isDemoSession() && (
          <div className="py-2.5 px-6 bg-warning text-text border-b-4 border-line-strong text-xs font-extrabold text-center shadow-[0_2px_0_#141413] flex items-center justify-center gap-2">
            <span>⚠️ CHẾ ĐỘ XEM THỬ:</span>
            <span className="font-semibold">
              Dữ liệu lưu tạm thời trong phiên trình duyệt
            </span>
          </div>
        )}

        {/* Content Body */}
        <main className="w-full px-6 lg:px-12 py-10 pb-16 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
