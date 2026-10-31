// ====================================
// CHI TIẾT HỢP ĐỒNG - Dùng chung Student & Manager
// ====================================

import useAuth from '../../hooks/useAuth';
import { screens } from '../../constants/screenConfig';
import Screen from '../../components/Screen';

export default function ContractDetail() {
  const { role } = useAuth();
  
  const path = role === 'STUDENT' 
    ? '/student/contracts/:id' 
    : '/manager/contracts/:id';
  const config = screens[path];
  
  return <Screen config={config} />;
}
