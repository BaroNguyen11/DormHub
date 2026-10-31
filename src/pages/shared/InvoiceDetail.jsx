// ====================================
// CHI TIẾT HÓA ĐƠN - Dùng chung Student & Manager
// ====================================

import useAuth from '../../hooks/useAuth';
import { screens } from '../../constants/screenConfig';
import Screen from '../../components/Screen';

export default function InvoiceDetail() {
  const { role } = useAuth();
  
  // Lấy config tương ứng
  const path = role === 'STUDENT' 
    ? '/student/invoices/:id' 
    : '/manager/invoices/:id';
  const config = screens[path];
  
  return <Screen config={config} />;
}
