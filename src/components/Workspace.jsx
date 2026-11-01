import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, Bell, LogOut, ArrowLeft, Building2 } from "lucide-react";
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
            className="inline-flex items-center gap-2.5 font-(family-name:--font-family-display) font-extrabold text-xl tracking-tight text-(--color-text) whitespace-nowrap"
            to="/"
          >
            <div
              className="w-9 h-9 rounded-md bg-linear-to-br from-(--color-primary) to-primary-hover text-white inline-grid place-items-center shadow-[var(-
            -shadow-md)] border-3 border-line-strong"
            >
              <Building2 size={20} />
            </div>
            DormHub
          </Link>
          <nav className="flex gap-8 text-sm text-(--color-text-muted) font-bold">
            {nav.guest.map(([name, path]) => (
              <NavLink
                key={path}
                to={path}
                end
                className="[&.active]:text-(--color-primary) hover:text-(--color-primary) transition-colors"
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
      <div className="min-h-screen grid grid-cols-[44%_56%] bg-white">
        <div className="bg-(--color-primary-light) px-[clamp(28px,5vw,72px)] py-12 flex flex-col justify-between border-r-4 border-(--color-primary) shadow-(--shadow-lg)">
          <Link
            className="inline-flex items-center gap-2.5 font-(family-name:--font-family-display) font-extrabold text-xl tracking-tight text-(--color-text) whitespace-nowrap"
            to="/"
          >
            <div className="w-9 h-9 rounded-md bg-linear-to-br from-(--color-primary) to-primary-hover text-white inline-grid place-items-center shadow-(--shadow-sm) border-3 border-line-strong">
              <Building2 size={20} />
            </div>
            DormHub
          </Link>
          <div>
            <p className="text-xs font-extrabold tracking-[0.15em] text-(--color-primary) uppercase mb-4 px-3 py-1 bg-white/60 rounded-sm inline-block border-2 border-(--color-primary)">
              DORMHUB / STUDENT LIVING
            </p>
            <h1 className="text-[clamp(32px,3.4vw,52px)] leading-[1.15] tracking-tight font-(family-name:--font-family-display) font-extrabold text-(--color-text) mb-6">
              Không gian sống thuận tiện cho hành trình học tập.
            </h1>
            <p className="text-base leading-[1.8] text-(--color-text-muted) max-w-120 font-medium">
              Kích hoạt tài khoản do nhà trường cấp, theo dõi hợp đồng, hóa đơn
              và yêu cầu hỗ trợ ở một nơi.
            </p>
          </div>
          <Link
            to="/"
            className="flex items-center gap-2  text-sm font-bold shadow-(--shadow-sm) hover:shadow-(--shadow-md) hover:-translate-0.5 transition-all px-4 py-2 bg-white/60 rounded-sm border-3 border-(--color-line) w-fit active:translate-0.5 active:shadow-none"
          >
            <ArrowLeft size={16} /> Quay lại trang chủ
          </Link>
        </div>
        <main className="grid place-items-center px-8 py-16 bg-surface">
          {children}
        </main>
      </div>
    );
  return (
    <div className="min-h-screen flex">
      <motion.aside
        initial={false}
        animate={{ x: open ? 0 : window.innerWidth <= 760 ? -280 : 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className={`w-64 flex-none bg-[var(--color-bg)] border-r-4 border-[var(--color-line)] px-4 py-6 pb-4 flex flex-col sticky top-0 h-screen overflow-y-auto z-20 shadow-[var(--shadow-lg)] ${open ? "!fixed left-0" : "max-[760px]:fixed max-[760px]:-left-[250px]"}`}
      >
        {/* Logo */}
        <Link
          className="inline-flex items-center gap-2.5 px-3 pb-8 mb-2 border-b-3 border-[var(--color-line)]"
          to={`/${group}`}
          onClick={() => setOpen(false)}
        >
          <div className="w-9 h-9 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-hover)] rounded-[var(--radius-md)] flex items-center justify-center shadow-[var(--shadow-md)] border-3 border-[var(--color-line-strong)]">
            <Building2 size={20} className="text-white" />
          </div>
          <span className="font-[family-name:var(--font-family-display)] font-extrabold text-xl text-[var(--color-text)]">
            DormHub
          </span>
        </Link>

        {/* Section Label */}
        <div className="text-[10px] tracking-[0.15em] text-[var(--color-text-muted)] font-extrabold px-3 py-4 pb-3 uppercase">
          {group === "student" ? "Không gian sinh viên" : "Trung tâm quản lý"}
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1">
          {nav[group].map(([name, path]) => (
            <NavLink key={path} to={path} end onClick={() => setOpen(false)}>
              {({ isActive }) => (
                <div
                  className={`text-sm rounded-[var(--radius-md)] px-4 py-3 font-bold transition-all duration-300 ${
                    isActive
                      ? "bg-[var(--color-primary)] text-white shadow-[var(--shadow-md)] border-3 border-[var(--color-line-strong)]"
                      : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] border-3 border-transparent hover:border-[var(--color-line)]"
                  }`}
                >
                  {name}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Profile */}
        <div className="mt-auto border-t-3 border-[var(--color-line)] pt-4 px-2 pb-0.5 flex gap-3 items-center min-w-0">
          <div className="w-11 h-11 flex-none rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-hover)] text-white grid place-items-center text-sm font-extrabold shadow-[var(--shadow-md)] border-3 border-[var(--color-line-strong)]">
            {(user?.fullName || user?.name || "U").slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0">
            <strong className="block text-xs font-bold whitespace-nowrap overflow-hidden text-ellipsis text-[var(--color-text)]">
              {user?.fullName || user?.name || user?.email || "Tài khoản"}
            </strong>
            <small className="block text-[10px] text-[var(--color-text-muted)] mt-0.5 uppercase tracking-wider font-bold">
              {group}
            </small>
          </div>
        </div>
      </motion.aside>
      <AnimatePresence>
        {open && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 border-0 bg-[oklch(0.2_0.02_260/0.4)] z-[19]"
            onClick={() => setOpen(false)}
            aria-label="Đóng menu"
          />
        )}
      </AnimatePresence>
      <div className="min-w-0 flex-1 bg-[var(--color-surface)]">
        <header className="h-[66px] border-b-4 border-[var(--color-line)] bg-white flex items-center justify-between px-[clamp(20px,3vw,40px)] gap-4 shadow-[var(--shadow-sm)]">
          <div className="flex items-center gap-3 text-[var(--color-text-muted)] text-xs">
            <button
              className="border-0 bg-transparent text-[var(--color-text-muted)] w-9 h-9 rounded-[var(--radius-md)] inline-grid place-items-center hover:bg-[var(--color-surface)] hidden max-[760px]:inline-grid"
              onClick={() => setOpen(true)}
              aria-label="Mở menu"
            >
              <Menu size={20} />
            </button>
            <Building2 size={16} />
            <span className="font-bold">
              {group === "student" ? "Sinh viên" : "Quản lý"}
            </span>
            <span>/</span>
            <strong className="text-[var(--color-text)] font-extrabold">
              {title}
            </strong>
          </div>
          <div className="flex items-center gap-3 text-[var(--color-text-muted)]">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to={
                  group === "student"
                    ? "/student/notifications"
                    : "/manager/notifications"
                }
                className="border-0 bg-transparent text-[var(--color-text-muted)] w-9 h-9 rounded-[var(--radius-md)] inline-grid place-items-center hover:bg-[var(--color-surface)] hover:shadow-[var(--shadow-sm)] transition-all"
                aria-label="Thông báo"
              >
                <Bell size={18} />
              </Link>
            </motion.div>
            <span className="font-bold text-[var(--color-text)] max-[760px]:hidden text-sm">
              {user?.fullName || user?.email}
            </span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="border-0 bg-transparent text-[var(--color-text-muted)] w-9 h-9 rounded-[var(--radius-md)] inline-grid place-items-center hover:bg-[var(--color-surface)] hover:shadow-[var(--shadow-sm)] transition-all"
              onClick={async () => {
                try {
                  await logout();
                } catch {
                  // Clear the local UI session even if the backend is unreachable.
                } finally {
                  navigate("/login", { replace: true });
                }
              }}
              title="Đăng xuất"
              aria-label="Đăng xuất"
            >
              <LogOut size={18} />
            </motion.button>
          </div>
        </header>
        {isDemoSession() && (
          <div className="py-3 px-6 bg-[var(--color-warning)] text-white border-b-4 border-[var(--color-line-strong)] text-xs font-bold text-center shadow-[var(--shadow-sm)]">
            Chế độ xem thử · Dữ liệu lưu trong phiên trình duyệt · Không gửi đến
            backend hoặc thực hiện thanh toán thật
          </div>
        )}
        <main className="max-w-[1500px] mx-auto px-[clamp(20px,3vw,48px)] py-12 pb-16">
          {children}
        </main>
      </div>
    </div>
  );
}
