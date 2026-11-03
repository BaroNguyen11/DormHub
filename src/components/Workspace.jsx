import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Menu,
  Bell,
  LogOut,
  ArrowLeft,
  Building2,
  Receipt,
  ShieldCheck,
  Zap,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import useAuth from "../hooks/useAuth";
import { nav } from "../constants/screenConfig";
import { isDemoSession } from "../services/demo.service";

export default function Workspace({ group, title, children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  if (group === "guest")
    return (
      <div className="min-h-screen bg-bg">
        <header className="h-18.5 border-b-4 border-(--color-line) bg-white flex items-center justify-between px-[clamp(20px,5vw,72px)] gap-5 shadow-(--shadow-sm)">
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
            <Link
              className="border-3 border-(--color-line) bg-white rounded-sm h-10 px-5 py-2 inline-flex gap-2 items-center justify-center font-bold text-sm whitespace-nowrap text-(--color-text) hover:bg-surface hover:border-line-strong hover:shadow-(--shadow-md) shadow-(--shadow-sm) hover:-translate-y-0.5 hover:-translate-x-0.5 transition-all duration-200 active:translate-0.5 active:shadow-none"
              to="/login"
            >
              Đăng nhập
            </Link>
            <Link
              className="border-3 border-line-strong bg-(--color-primary)  rounded-sm h-10 px-5 py-2 inline-flex gap-2 items-center justify-center font-bold text-sm whitespace-nowrap shadow-(--shadow-sm)  hover:shadow-(--shadow-md) hover:-translate-y-0.5 hover:-translate-x-0.5 transition-all duration-200 active:translate-0.5 active:shadow-none"
              to="/verify-email"
            >
              Kích hoạt tài khoản
            </Link>
          </div>
        </header>
        {children}
        <footer className="py-8 px-[clamp(20px,5vw,72px)] border-t-4 border-(--color-line) bg-white text-(--color-text-muted) text-sm font-semibold">
          DormHub · Không gian sống sinh viên
        </footer>
      </div>
    );
  if (group === "auth")
    return (
      <div className="min-h-screen grid lg:grid-cols-12 bg-white">
        {/* Cột trái - Hero & Branding (Chỉ hiện trên LG screen) */}
        <div className="hidden lg:col-span-5 lg:flex bg-[#e0f7ff] px-10 xl:px-14 py-10 flex-col justify-between border-r-4 border-line-strong relative overflow-hidden">
          {/* Pattern khối hình trang trí nền */}
          <div className="absolute -top-10 -left-10 w-40 h-40 border-4 border-primary/30 rotate-12 pointer-events-none" />
          <div className="absolute bottom-10 -right-10 w-48 h-48 border-4 border-warning/40 -rotate-12 pointer-events-none" />

          {/* Logo */}
          <Link
            className="inline-flex items-center gap-3 font-extrabold text-2xl tracking-tight text-text whitespace-nowrap z-10"
            to="/"
          >
            <img
              src="/logo.png"
              alt="DormHub Logo"
              className="size-13 object-contain"
            />
            <span>DormHub</span>
          </Link>

          {/* Nội dung giới thiệu */}
          <div className="my-auto py-6 z-10">
            <div className="inline-block px-3 py-1 mb-4 bg-warning text-black text-xs font-extrabold uppercase tracking-widest rounded-md border-2 border-line-strong shadow-[3px_3px_0_#141413]">
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
            <div className="space-y-3.5 pt-6 border-t-2 border-black/10">
              <div className="flex items-center gap-3 text-xs font-extrabold text-black">
                <div className="size-7 rounded-lg bg-white border-2 border-line-strong flex items-center justify-center shadow-[2px_2px_0_#141413] shrink-0">
                  <Zap size={14} className="text-black" />
                </div>
                <span>Kích hoạt tài khoản nhanh chóng trong 30s</span>
              </div>

              <div className="flex items-center gap-3 text-xs font-extrabold text-black">
                <div className="size-7 rounded-lg bg-white border-2 border-line-strong flex items-center justify-center shadow-[2px_2px_0_#141413] shrink-0">
                  <Receipt size={14} className="text-black" />
                </div>
                <span>Tra cứu hợp đồng & hóa đơn minh bạch</span>
              </div>

              <div className="flex items-center gap-3 text-xs font-extrabold text-black">
                <div className="size-7 rounded-lg bg-white border-2 border-line-strong flex items-center justify-center shadow-[2px_2px_0_#141413] shrink-0">
                  <ShieldCheck size={14} className="text-black" />
                </div>
                <span>Bảo mật thông tin sinh viên tuyệt đối</span>
              </div>
            </div>
          </div>

          {/* Nút quay lại trang chủ chuẩn Neo-Brutalism */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-extrabold px-4 py-2.5 bg-white text-black rounded-sm border-2 border-line-strong shadow-[3px_3px_0_#141413] hover:shadow-[5px_5px_0_#141413] hover:-translate-0.5 active:translate-0.5 active:shadow-none transition-all w-fit z-10"
          >
            <ArrowLeft size={16} strokeWidth={2.5} />
            Quay lại trang chủ
          </Link>
        </div>

        {/* Cột phải - Khung Form ({children}) */}
        <main className="lg:col-span-7 grid place-items-center justify-center px-6 sm:px-12 py-12 bg-surface min-h-screen lg:min-h-0">
          <div className="w-full ">{children}</div>
        </main>
      </div>
    );
  return (
    // <div className="min-h-screen flex">
    //   <motion.aside
    //     initial={false}
    //     animate={{ x: open ? 0 : window.innerWidth <= 760 ? -280 : 0 }}
    //     transition={{ type: "spring", damping: 25, stiffness: 200 }}
    //     className={`w-64 flex-none bg-bg border-r-4 border-(--color-line) px-4 py-6 pb-4 flex flex-col sticky top-0 h-screen overflow-y-auto z-20 shadow-(--shadow-lg) ${open ? "fixed! left-0" : "max-[760px]:fixed max-[760px]:-left-62.5"}`}
    //   >
    //     {/* Logo */}
    //     <Link
    //       className="inline-flex items-center gap-2.5 px-3 pb-8 mb-2 border-b-3 border-(--color-line)"
    //       to={`/${group}`}
    //       onClick={() => setOpen(false)}
    //     >
    //       <div className="w-9 h-9 bg-linear-to-br from-(--color-primary) to-primary-hover rounded-md flex items-center justify-center shadow-(--shadow-md) border-3 border-line-strong">
    //         <Building2 size={20} className="text-white" />
    //       </div>
    //       <span className="font-(family-name:--font-family-display) font-extrabold text-xl text-(--color-text)">
    //         DormHub
    //       </span>
    //     </Link>

    //     {/* Section Label */}
    //     <div className="text-[10px] tracking-[0.15em] text-(--color-text-muted) font-extrabold px-3 py-4 pb-3 uppercase">
    //       {group === "student" ? "Không gian sinh viên" : "Trung tâm quản lý"}
    //     </div>

    //     {/* Navigation */}
    //     <nav className="flex flex-col gap-1">
    //       {nav[group].map(([name, path]) => (
    //         <NavLink key={path} to={path} end onClick={() => setOpen(false)}>
    //           {({ isActive }) => (
    //             <div
    //               className={`text-sm rounded-md px-4 py-3 font-bold transition-all duration-300 ${
    //                 isActive
    //                   ? "bg-(--color-primary) text-white shadow-(--shadow-md) border-3 border-line-strong"
    //                   : "text-(--color-text-muted) hover:bg-surface border-3 border-transparent hover:border-(--color-line)"
    //               }`}
    //             >
    //               {name}
    //             </div>
    //           )}
    //         </NavLink>
    //       ))}
    //     </nav>

    //     {/* User Profile */}
    //     <div className="mt-auto border-t-3 border-(--color-line) pt-4 px-2 pb-0.5 flex gap-3 items-center min-w-0">
    //       <div className="w-11 h-11 flex-none rounded-full bg-linear-to-br from-(--color-primary) to-primary-hover   text-white grid place-items-center text-sm font-extrabold shadow-(--shadow-md) border-3 border-line-strong">
    //         {(user?.fullName || user?.name || "U").slice(0, 1).toUpperCase()}
    //       </div>
    //       <div className="min-w-0">
    //         <strong className="block text-xs font-bold whitespace-nowrap overflow-hidden text-ellipsis text-(--color-text)">
    //           {user?.fullName || user?.name || user?.email || "Tài khoản"}
    //         </strong>
    //         <small className="block text-[10px] text-(--color-text-muted) mt-0.5 uppercase tracking-wider font-bold">
    //           {group}
    //         </small>
    //       </div>
    //     </div>
    //   </motion.aside>
    //   <AnimatePresence>
    //     {open && (
    //       <motion.button
    //         initial={{ opacity: 0 }}
    //         animate={{ opacity: 1 }}
    //         exit={{ opacity: 0 }}
    //         className="fixed inset-0 border-0 bg-[oklch(0.2_0.02_260/0.4)] z-[19]"
    //         onClick={() => setOpen(false)}
    //         aria-label="Đóng menu"
    //       />
    //     )}
    //   </AnimatePresence>
    //   <div className="min-w-0 flex-1 bg-[var(--color-surface)]">
    //     <header className="h-[66px] border-b-4 border-[var(--color-line)] bg-white flex items-center justify-between px-[clamp(20px,3vw,40px)] gap-4 shadow-[var(--shadow-sm)]">
    //       <div className="flex items-center gap-3 text-[var(--color-text-muted)] text-xs">
    //         <button
    //           className="border-0 bg-transparent text-[var(--color-text-muted)] w-9 h-9 rounded-[var(--radius-md)] inline-grid place-items-center hover:bg-[var(--color-surface)] hidden max-[760px]:inline-grid"
    //           onClick={() => setOpen(true)}
    //           aria-label="Mở menu"
    //         >
    //           <Menu size={20} />
    //         </button>
    //         <Building2 size={16} />
    //         <span className="font-bold">
    //           {group === "student" ? "Sinh viên" : "Quản lý"}
    //         </span>
    //         <span>/</span>
    //         <strong className="text-[var(--color-text)] font-extrabold">
    //           {title}
    //         </strong>
    //       </div>
    //       <div className="flex items-center gap-3 text-[var(--color-text-muted)]">
    //         <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
    //           <Link
    //             to={
    //               group === "student"
    //                 ? "/student/notifications"
    //                 : "/manager/notifications"
    //             }
    //             className="border-0 bg-transparent text-[var(--color-text-muted)] w-9 h-9 rounded-[var(--radius-md)] inline-grid place-items-center hover:bg-[var(--color-surface)] hover:shadow-[var(--shadow-sm)] transition-all"
    //             aria-label="Thông báo"
    //           >
    //             <Bell size={18} />
    //           </Link>
    //         </motion.div>
    //         <span className="font-bold text-[var(--color-text)] max-[760px]:hidden text-sm">
    //           {user?.fullName || user?.email}
    //         </span>
    //         <motion.button
    //           whileHover={{ scale: 1.05 }}
    //           whileTap={{ scale: 0.95 }}
    //           className="border-0 bg-transparent text-[var(--color-text-muted)] w-9 h-9 rounded-[var(--radius-md)] inline-grid place-items-center hover:bg-[var(--color-surface)] hover:shadow-[var(--shadow-sm)] transition-all"
    //           onClick={async () => {
    //             try {
    //               await logout();
    //             } catch {
    //               // Clear the local UI session even if the backend is unreachable.
    //             } finally {
    //               navigate("/login", { replace: true });
    //             }
    //           }}
    //           title="Đăng xuất"
    //           aria-label="Đăng xuất"
    //         >
    //           <LogOut size={18} />
    //         </motion.button>
    //       </div>
    //     </header>
    //     {isDemoSession() && (
    //       <div className="py-3 px-6 bg-[var(--color-warning)] text-white border-b-4 border-[var(--color-line-strong)] text-xs font-bold text-center shadow-[var(--shadow-sm)]">
    //         Chế độ xem thử · Dữ liệu lưu trong phiên trình duyệt · Không gửi đến
    //         backend hoặc thực hiện thanh toán thật
    //       </div>
    //     )}
    //     <main className="max-w-[1500px] mx-auto px-[clamp(20px,3vw,48px)] py-12 pb-16">
    //       {children}
    //     </main>
    //   </div>
    // </div>
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
          {group === "student" ? "Không gian sinh viên" : "Trung tâm quản lý"}
        </div>

        {/* Menu Items */}
        <nav className="flex flex-col gap-2">
          {nav[group]?.map(([name, path, Icon]) => (
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
            <span className="inline-block text-[10px] bg-primary-light text-black px-1.5 py-0.5 rounded border border-line-strong uppercase tracking-wider font-extrabold mt-0.5">
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
            className="fixed inset-0 bg-black/50 backdrop-blur-xs z-20 md:hidden"
            onClick={() => setOpen(false)}
            aria-label="Đóng menu"
          />
        )}
      </AnimatePresence>

      {/* 2. MAIN CONTENT AREA */}
      <div className="min-w-0 flex-1 flex flex-col bg-surface">
        {/* Header Bar */}
        <header className="h-16 border-b-4 border-line-strong bg-white flex items-center justify-between px-6 lg:px-10 gap-4 shadow-[0_4px_0_#141413] z-10 sticky top-0">
          {/* Left Breadcrumbs */}
          <div className="flex items-center gap-2 text-text-muted text-xs font-bold">
            <button
              className="md:hidden size-9 rounded-lg bg-surface border-2 border-line-strong inline-grid place-items-center hover:bg-warning transition-colors shadow-[2px_2px_0_#141413]"
              onClick={() => setOpen(true)}
              aria-label="Mở menu"
            >
              <Menu size={18} className="text-black" />
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
            {/* Thông báo Button */}
            <Link
              to={
                group === "student"
                  ? "/student/notifications"
                  : "/manager/notifications"
              }
              className="size-9 rounded-lg bg-white border-2 border-line-strong grid place-items-center shadow-[2px_2px_0_#141413] hover:bg-primary-light hover:-translate-y-0.5 transition-all"
              aria-label="Thông báo"
            >
              <Bell size={18} className="text-black" />
            </Link>

            {/* Tên User */}
            <span className="font-extrabold text-text hidden md:block text-sm px-2">
              {user?.fullName || user?.email}
            </span>

            {/* Đăng xuất Button */}
            <button
              className="size-9 rounded-lg bg-accent text-white border-2 border-line-strong grid place-items-center shadow-[2px_2px_0_#141413] hover:bg-accent-hover hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all"
              onClick={async () => {
                try {
                  await logout();
                } catch {
                  // Xóa session ở client ngay cả khi Backend lỗi
                } finally {
                  navigate("/login", { replace: true });
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
          <div className="py-2.5 px-6 bg-warning text-black border-b-4 border-line-strong text-xs font-extrabold text-center shadow-[0_2px_0_#141413] flex items-center justify-center gap-2">
            <span>⚠️ CHẾ ĐỘ XEM THỬ:</span>
            <span className="font-semibold">
              Dữ liệu lưu tạm thời trong phiên trình duyệt
            </span>
          </div>
        )}

        {/* Content Body */}
        <main className="max-w-375 w-full mx-auto px-6 lg:px-12 py-10 pb-16 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
