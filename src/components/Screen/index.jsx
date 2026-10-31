// ====================================
// SCREEN COMPONENT - Router chính
// ====================================
// File này là entry point, routing tới các screens tương ứng
// Mục đích: Giữ logic đơn giản, delegate việc render cho các screens con

import { useLocation } from "react-router-dom";
import GuestLayout from "../../layouts/GuestLayout";
import StudentLayout from "../../layouts/StudentLayout";
import ManagerLayout from "../../layouts/ManagerLayout";
import HomeScreen from "./HomeScreen";
import ListScreen from "./ListScreen";
import DetailScreen from "./DetailScreen";
import FormScreen from "./FormScreen";
import DashboardScreen from "./DashboardScreen";
import ProfileScreen from "./ProfileScreen";
import ApplicationScreen from "./ApplicationScreen";
import ChatScreen from "./ChatScreen";
import PaymentResult from "./PaymentResult";

/**
 * Component Screen - Router cho tất cả màn hình
 * @param {object} props
 * @param {object} props.config - Cấu hình màn hình
 * 
 * Config structure:
 * {
 *   type: "list",  // Loại màn hình: home, list, detail, form, dashboard...
 *   group: "student",  // Nhóm user: guest, student, manager
 *   title: "Danh sách phòng",  // Tiêu đề màn hình
 *   resource: "/rooms",  // API endpoint
 *   columns: ["id", "name", "status"],  // Cột hiển thị (cho list screen)
 *   fields: ["name", "capacity"],  // Fields hiển thị (cho form screen)
 *   // ... các config khác tùy theo type
 * }
 * 
 * Dựa vào config.type, component này sẽ render đúng screen tương ứng
 */
export default function Screen({ config }) {
  const location = useLocation();
  
  // Router: chọn screen component dựa vào config.type
  let content;
  
  switch (config.type) {
    case "home":
      content = <HomeScreen />;
      break;
      
    case "list":
      content = <ListScreen config={config} />;
      break;
      
    case "detail":
      content = <DetailScreen config={config} />;
      break;
      
    case "form":
      content = <FormScreen config={config} />;
      break;
      
    case "dashboard":
      content = <DashboardScreen config={config} />;
      break;
      
    case "profile":
      content = <ProfileScreen config={config} />;
      break;
      
    case "application":
      content = <ApplicationScreen config={config} />;
      break;
      
    case "chat":
      content = <ChatScreen config={config} />;
      break;
      
    case "payment-result":
      content = <PaymentResult />;
      break;
      
    default:
      // Fallback: type không hợp lệ
      content = (
        <div className="panel">
          ❌ Unknown screen type: {config.type}
        </div>
      );
  }
  
  // Chọn layout dựa vào config.group
  const Layout =
    config.group === "guest"
      ? GuestLayout
      : config.group === "student"
        ? StudentLayout
        : ManagerLayout;
  
  return (
    <Layout title={config.title}>
      {/* Hiển thị success message từ navigation state (nếu có) */}
      {location.state?.success && (
        <div className="notice success">{location.state.success}</div>
      )}
      
      {/* Render screen content */}
      {content}
    </Layout>
  );
}
