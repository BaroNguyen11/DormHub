// ====================================
// DANH SÁCH YÊU CẦU SỬA CHỮA - Dùng chung Student & Manager
// ====================================
// Student: Xem yêu cầu của mình
// Manager: Xem tất cả yêu cầu

import useAuth from '../../hooks/useAuth';
import { screens } from '../../constants/screenConfig';
import Screen from '../../components/Screen';

export default function MaintenanceList() {
  const { role } = useAuth();
  
  const path = role === 'STUDENT' 
    ? '/student/maintenance' 
    : '/manager/maintenance';
  const config = screens[path];
  
  return <Screen config={config} />;
}
