import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, Bell, LogOut, ArrowLeft, Building2 } from "lucide-react";
import { useState } from "react";
import useAuth from "../hooks/useAuth";
import { nav } from "../constants/screenConfig";
import { isDemoSession } from "../services/demo.service";

export default function Workspace({ group, title, children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  if (group === "guest")
    return (
      <div className="guest-shell">
        <header className="guest-header">
          <Link className="brand" to="/">
            <span className="brand-mark">dH</span> DormHub.
          </Link>
          <nav>
            {nav.guest.map(([name, path]) => (
              <NavLink key={path} to={path} end>
                {name}
              </NavLink>
            ))}
          </nav>
          <div className="header-actions">
            <Link className="button subtle" to="/login">
              Đăng nhập
            </Link>
            <Link className="button primary" to="/verify-email">
              Kích hoạt tài khoản
            </Link>
          </div>
        </header>
        {children}
        <footer className="footer">DormHub · Không gian sống sinh viên</footer>
      </div>
    );
  if (group === "auth")
    return (
      <div className="auth-shell">
        <div className="auth-intro">
          <Link className="brand" to="/">
            <span className="brand-mark">dH</span> DormHub.
          </Link>
          <div>
            <p className="eyebrow">DORMHUB / STUDENT LIVING</p>
            <h1>Không gian sống thuận tiện cho hành trình học tập.</h1>
            <p>
              Kích hoạt tài khoản do nhà trường cấp, theo dõi hợp đồng, hóa đơn
              và yêu cầu hỗ trợ ở một nơi.
            </p>
          </div>
          <Link to="/" className="back-link">
            <ArrowLeft size={16} /> Quay lại trang chủ
          </Link>
        </div>
        <main className="auth-main">{children}</main>
      </div>
    );
  return (
    <div className="workspace">
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <Link className="brand" to={`/${group}`} onClick={() => setOpen(false)}>
          <span className="brand-mark">dH</span> DormHub.
        </Link>
        <div className="nav-caption">
          {group === "student" ? "KHÔNG GIAN SINH VIÊN" : "TRUNG TÂM QUẢN LÝ"}
        </div>
        <nav className="side-nav">
          {nav[group].map(([name, path]) => (
            <NavLink key={path} to={path} end onClick={() => setOpen(false)}>
              {name}
            </NavLink>
          ))}
        </nav>
        <div className="side-account">
          <div className="avatar">
            {(user?.fullName || user?.name || "U").slice(0, 1).toUpperCase()}
          </div>
          <div>
            <strong>
              {user?.fullName || user?.name || user?.email || "Tài khoản"}
            </strong>
            <small>{group.toUpperCase()}</small>
          </div>
        </div>
      </aside>
      {open && (
        <button
          className="sidebar-backdrop"
          onClick={() => setOpen(false)}
          aria-label="Đóng menu"
        />
      )}
      <div className="workspace-main">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-button mobile-menu"
              onClick={() => setOpen(true)}
              aria-label="Mở menu"
            >
              <Menu size={19} />
            </button>
            <Building2 size={16} />
            <span>{group === "student" ? "Sinh viên" : "Quản lý"}</span>
            <span>/</span>
            <strong>{title}</strong>
          </div>
          <div className="top-actions">
            <Link
              to={group === "student" ? "/student/notifications" : "/manager/notifications"}
              className="icon-button"
              aria-label="Thông báo"
            >
              <Bell size={18} />
            </Link>
            <span className="top-name">{user?.fullName || user?.email}</span>
            <button
              className="icon-button"
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
            </button>
          </div>
        </header>
        {isDemoSession() && (
          <div className="demo-banner">
            Chế độ xem thử · Dữ liệu lưu trong phiên trình duyệt · Không gửi đến
            backend hoặc thực hiện thanh toán thật
          </div>
        )}
        <main className="content">{children}</main>
      </div>
    </div>
  );
}
