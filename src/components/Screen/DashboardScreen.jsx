// ====================================
// DASHBOARD SCREEN - Neo-Brutalism with Charts
// ====================================
// Bold borders, strong shadows, neon colors, dashboard charts

import { Link } from "react-router-dom";
import { ArrowRight, RefreshCw, Users, Home, FileText, Wrench, DollarSign, CheckCircle, Calendar, Clock, AlertCircle } from "lucide-react";
import { motion } from "motion/react";
import { FIELD_LABELS } from "./constants";
import { Notice, Loading, Heading } from "./UIComponents";
import { useLoad } from "./useLoad";
import { Badge } from "../ui/badge";

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

// Map field names to icons and colors
const iconMap = {
  totalStudents: { icon: Users, color: 'primary' },
  totalRooms: { icon: Home, color: 'success' },
  occupiedRooms: { icon: Home, color: 'warning' },
  pendingApplications: { icon: FileText, color: 'accent' },
  maintenanceRequests: { icon: Wrench, color: 'error' },
  totalInvoices: { icon: DollarSign, color: 'primary' },
  paidInvoices: { icon: CheckCircle, color: 'success' },
  unpaidInvoices: { icon: FileText, color: 'warning' },
};

export default function DashboardScreen({ config }) {
  // Load dashboard data từ API
  const { data, error, loading, reload } = useLoad(config.resource, {});
  
  // Filter data: chỉ lấy các field có type = number hoặc string
  // Giới hạn 4 metrics để tránh quá nhiều
  const list = Object.entries(data || {})
    .filter(([, value]) => ["number", "string"].includes(typeof value))
    .slice(0, 4);
  
  // Mock chart data - Occupancy by month
  const chartData = [
    { month: 'T1', value: 65 },
    { month: 'T2', value: 72 },
    { month: 'T3', value: 68 },
    { month: 'T4', value: 85 },
    { month: 'T5', value: 92 },
    { month: 'T6', value: 88 },
  ];
  
  // Quick stats data
  const quickStats = [
    { icon: Clock, label: 'Đơn chưa xử lý', value: '24', color: 'warning' },
    { icon: AlertCircle, label: 'Yêu cầu khẩn', value: '3', color: 'error' },
    { icon: CheckCircle, label: 'Hoàn thành hôm nay', value: '12', color: 'success' },
    { icon: Calendar, label: 'Check-in hôm nay', value: '8', color: 'primary' },
  ];
  
  // Shortcuts tùy theo group (student hoặc manager)
  const shortcuts =
    config.group === "student"
      ? [
          { name: "Tìm phòng", path: "/rooms", icon: Home },
          { name: "Đăng ký nội trú", path: "/student/applications/new", icon: FileText },
          { name: "Hóa đơn", path: "/student/invoices", icon: DollarSign },
          { name: "Báo hỏng", path: "/student/maintenance", icon: Wrench },
        ]
      : config.group === "manager"
        ? [
            { name: "Đơn chờ duyệt", path: "/manager/applications", icon: FileText },
            { name: "Quản lý phòng", path: "/manager/rooms", icon: Home },
            { name: "Hóa đơn", path: "/manager/invoices", icon: DollarSign },
            { name: "Báo hỏng", path: "/manager/maintenance", icon: Wrench },
          ]
        : [];
  
  // Animation variants for staggered entrance
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };
  
  return (
    <>
      {/* Heading với nút reload */}
      <Heading config={config}>
        <button className="inline-flex items-center gap-2 px-4 py-2 border-3 border-[#333333] rounded-[var(--radius-md)] text-sm font-bold text-[#1a1a1a] hover:bg-[#f8f9fa] hover:border-[#00d2ff] hover:shadow-[4px_4px_0_rgba(0,0,0,0.2)] transition-all" onClick={reload}>
          <RefreshCw size={16} /> Tải lại
        </button>
      </Heading>
      
      {/* Thông báo lỗi */}
      <Notice error={error} />
      
      {/* Hiển thị loading hoặc dashboard content */}
      {loading ? (
        <Loading />
      ) : (
        <div className="space-y-8">
          {/* Metric Grid - Neo-Brutalism cards */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {list.length ? (
              list.map(([key, value], idx) => {
                const config = iconMap[key] || { icon: FileText, color: 'primary' };
                const Icon = config.icon;
                const colorVar = `--color-${config.color}`;
                return (
                  <motion.div 
                    variants={itemVariants}
                    key={key} 
                    className="bg-white border-3 border-[#00d2ff] rounded-[var(--radius-lg)] p-6 shadow-[4px_4px_0_rgba(0,0,0,0.25)] hover:shadow-[6px_6px_0_rgba(0,0,0,0.3)] hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-14 h-14 rounded-[var(--radius-md)] flex items-center justify-center shadow-md`} style={{ backgroundColor: `var(${colorVar})` }}>
                        <Icon size={28} className="text-white" />
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded-[var(--radius-sm)] border-2`} style={{ backgroundColor: `var(${colorVar}-light)`, color: `var(${colorVar})`, borderColor: `var(${colorVar})` }}>
                        +{(idx + 1) * 8}%
                      </span>
                    </div>
                    
                    {/* Label */}
                    <h3 className="text-sm font-bold text-[#6b7280] mb-2 uppercase tracking-wide">
                      {FIELD_LABELS[key] || key.replace(/([A-Z])/g, " $1")}
                    </h3>
                    
                    {/* Value - BOLD typography */}
                    <p className="text-3xl font-extrabold text-[#1a1a1a]">
                      {typeof value === "number"
                        ? new Intl.NumberFormat("vi-VN").format(value)
                        : value}
                    </p>
                  </motion.div>
                );
              })
            ) : (
              <div className="bg-white border-3 border-[#333333] rounded-[var(--radius-lg)] p-8 col-span-full text-center text-[#6b7280] font-bold shadow-[4px_4px_0_rgba(0,0,0,0.15)]">
                Máy chủ chưa có số liệu tổng quan.
              </div>
            )}
          </motion.div>
          
          {/* Charts Section - Bar Chart */}
          <div className="bg-white border-3 border-[#333333] rounded-[var(--radius-lg)] p-8 shadow-[4px_4px_0_rgba(0,0,0,0.2)]">
            <h2 className="text-2xl font-extrabold text-[#1a1a1a] mb-8">
              📊 Tỷ lệ occupancy theo tháng
            </h2>
            
            <div className="flex items-end justify-between h-64 gap-3">
              {chartData.map((data, i) => (
                <div key={i} className="flex flex-col items-center gap-3 flex-1 group">
                  <div className="w-full relative flex flex-col justify-end" style={{ height: '100%' }}>
                    {/* Bar */}
                    <div 
                      className="w-full bg-[#00d2ff] rounded-t-[var(--radius-md)] hover:bg-[#00ff88] transition-all duration-300 border-3 border-[#00d2ff] hover:border-[#00ff88] border-b-0 shadow-[3px_3px_0_rgba(0,0,0,0.25)] cursor-pointer relative"
                      style={{ height: `${data.value}%` }}
                    >
                      {/* Tooltip on hover */}
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[#1a1a1a] text-white px-3 py-2 rounded-[var(--radius-md)] text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap shadow-lg border-2 border-white">
                        {data.value}% occupancy
                      </div>
                    </div>
                  </div>
                  
                  {/* Label */}
                  <span className="text-sm font-bold text-[#1a1a1a] whitespace-nowrap">
                    {data.month}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="bg-white border-3 border-[#333333] rounded-[var(--radius-lg)] p-8 shadow-[4px_4px_0_rgba(0,0,0,0.2)]">
            <h2 className="text-2xl font-extrabold text-[#1a1a1a] mb-6">
              ⚡ Thông tin nhanh
            </h2>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickStats.map((item, i) => {
                const colorMap = {
                  warning: { bg: '#ffcc00', light: '#fffbe0' },
                  error: { bg: '#ff3366', light: '#ffe0e8' },
                  success: { bg: '#00ff88', light: '#e0f7e8' },
                  primary: { bg: '#00d2ff', light: '#e0f7ff' }
                };
                const colors = colorMap[item.color];
                return (
                  <div key={i} className="flex items-center justify-between p-4 border-3 rounded-[var(--radius-md)] shadow-[3px_3px_0_rgba(0,0,0,0.2)] hover:shadow-[4px_4px_0_rgba(0,0,0,0.3)] hover:-translate-y-0.5 transition-all duration-300" style={{ backgroundColor: colors.light, borderColor: colors.bg }}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-[var(--radius-sm)] flex items-center justify-center" style={{ backgroundColor: colors.bg }}>
                        <item.icon size={20} className="text-white" />
                      </div>
                      <span className="text-sm font-bold text-[#1a1a1a]">{item.label}</span>
                    </div>
                    <span className="text-2xl font-extrabold text-[#1a1a1a]">{item.value}</span>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Shortcut Grid - Neo-Brutalism */}
          <div className="bg-white border-3 border-[#333333] rounded-[var(--radius-lg)] p-8 shadow-[4px_4px_0_rgba(0,0,0,0.2)]">
            <h2 className="text-2xl font-extrabold text-[#1a1a1a] mb-6">
              🚀 Tác vụ nhanh
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {shortcuts.map(({ name, path, icon: Icon }) => (
                <Link 
                  key={path}
                  to={path}
                  className="flex flex-col items-center justify-center p-6 bg-white border-3 border-[#00d2ff] rounded-[var(--radius-md)] hover:bg-[#00d2ff] hover:text-white hover:shadow-[4px_4px_0_rgba(0,0,0,0.25)] hover:-translate-y-1 transition-all duration-300 group text-center"
                >
                  <Icon size={32} className="mb-3 group-hover:scale-110 transition-transform duration-300 text-[#00d2ff] group-hover:text-white" />
                  <span className="text-sm font-bold text-[#1a1a1a] group-hover:text-white">
                    {name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
