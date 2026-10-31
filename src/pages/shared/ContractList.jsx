// ====================================
// DANH SÁCH HỢP ĐỒNG - Dùng chung Student & Manager
// ====================================

import useAuth from '../../hooks/useAuth';
import { screens } from '../../constants/screenConfig';
import Screen from '../../components/Screen';

export default function ContractList() {
  const { role } = useAuth();
  
  // Student: xem hợp đồng của mình
  // Manager: xem tất cả hợp đồng
  const path = role === 'STUDENT' ? '/student/contracts' : '/manager/contracts';
  const config = screens[path];
  
  return <Screen config={config} />;
}
