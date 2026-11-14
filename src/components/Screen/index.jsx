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
import { PaymentHistory, PaymentHistoryDetail } from "../../pages/Student/Payments/PaymentHistory";
import { ManagerNotificationHistory, ManagerNotificationDetail } from "../../pages/Manager/Notifications/ManagerNotificationHistory";


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

    case "payment-history":
      content = <PaymentHistory config={config} />;
      break;

    case "payment-history-detail":
      content = <PaymentHistoryDetail config={config} />;
      break;

    case "manager-notification-history":
      content = <ManagerNotificationHistory config={config} />;
      break;

    case "manager-notification-detail":
      content = <ManagerNotificationDetail config={config} />;
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
