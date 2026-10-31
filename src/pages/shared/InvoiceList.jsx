// ====================================
// DANH SÁCH HÓA ĐƠN - Dùng chung Student & Manager
// ====================================
// Page này hiển thị danh sách hóa đơn
// - Student: chỉ xem hóa đơn của mình
// - Manager: xem tất cả hóa đơn

import useAuth from '../../hooks/useAuth';
import { screens } from '../../constants/screenConfig';
import Screen from '../../components/Screen';

export default function InvoiceList() {
  const { role } = useAuth();
  
  // Lấy config tùy theo role
  // Student: /student/invoices -> config có resource="/invoices/me"
  // Manager: /manager/invoices -> config có resource="/invoices"
  const path = role === 'STUDENT' ? '/student/invoices' : '/manager/invoices';
  const config = screens[path];
  
  return <Screen config={config} />;
}
