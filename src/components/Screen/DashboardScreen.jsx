// ====================================
// DASHBOARD SCREEN - Màn hình tổng quan
// ====================================
// Hiển thị các số liệu thống kê và shortcuts
// Mục đích: Trang chủ cho student/manager sau khi đăng nhập

import { Link } from "react-router-dom";
import { ArrowRight, RefreshCw } from "lucide-react";
import { FIELD_LABELS } from "./constants";
import { Notice, Loading, Heading } from "./UIComponents";
import { useLoad } from "./useLoad";

/**
 * Component DashboardScreen - Màn hình dashboard
 * @param {object} props
 * @param {object} props.config - Cấu hình màn hình
 * 
 * Config structure:
 * {
 *   resource: "/students/dashboard",  // API endpoint trả về metrics
 *   group: "student",  // "student" hoặc "manager"
 * }
 * 
 * API response example:
 * {
 *   totalRooms: 50,
 *   occupiedRooms: 35,
 *   totalStudents: 120,
 *   pendingApplications: 5
 * }
 */
export default function DashboardScreen({ config }) {
  // Load dashboard data từ API
  const { data, error, loading, reload } = useLoad(config.resource, {});
  
  // Filter data: chỉ lấy các field có type = number hoặc string
  // Giới hạn 6 metrics để tránh quá nhiều
  const list = Object.entries(data || {})
    .filter(([, value]) => ["number", "string"].includes(typeof value))
    .slice(0, 6);
  
  // Shortcuts tùy theo group (student hoặc manager)
  const shortcuts =
    config.group === "student"
      ? [
          ["Tìm phòng", "/rooms"],
          ["Đăng ký nội trú", "/student/applications/new"],
          ["Hóa đơn", "/student/invoices"],
          ["Báo hỏng", "/student/maintenance"],
        ]
      : config.group === "manager"
        ? [
            ["Đơn chờ duyệt", "/manager/applications"],
            ["Quản lý phòng", "/manager/rooms"],
            ["Hóa đơn", "/manager/invoices"],
            ["Báo hỏng", "/manager/maintenance"],
          ]
        : [];
  
  return (
    <>
      {/* Heading với nút reload */}
      <Heading config={config}>
        <button className="button subtle" onClick={reload}>
          <RefreshCw size={16} /> Tải lại
        </button>
      </Heading>
      
      {/* Thông báo lỗi */}
      <Notice error={error} />
      
      {/* Hiển thị loading hoặc dashboard content */}
      {loading ? (
        <Loading />
      ) : (
        <>
          {/* Metric Grid - Hiển thị các số liệu */}
          <div className="metric-grid">
            {list.length ? (
              list.map(([key, value]) => (
                <div className="metric" key={key}>
                  {/* Label: lấy từ FIELD_LABELS hoặc format từ key */}
                  <span>
                    {FIELD_LABELS[key] || key.replace(/([A-Z])/g, " $1")}
                  </span>
                  
                  {/* Value: format số với dấu phẩy nếu là number */}
                  <strong>
                    {typeof value === "number"
                      ? new Intl.NumberFormat("vi-VN").format(value)
                      : value}
                  </strong>
                </div>
              ))
            ) : (
              // Nếu không có metrics
              <div className="panel" style={{ gridColumn: "1/-1" }}>
                Máy chủ chưa có số liệu tổng quan.
              </div>
            )}
          </div>
          
          {/* Section Title */}
          <div className="section-title">Truy cập nhanh</div>
          
          {/* Shortcut Grid - Các link truy cập nhanh */}
          <div className="shortcut-grid">
            {shortcuts.map(([name, path]) => (
              <Link className="shortcut" key={path} to={path}>
                <span>{name}</span>
                <ArrowRight size={18} />
              </Link>
            ))}
          </div>
        </>
      )}
    </>
  );
}
