import useAuth from './useAuth';
import useStudentRoom from './useStudentRoom';

/**
 * usePermissions Hook
 * Trạng thái phòng lấy từ StudentRoomGate (một lần gọi API dùng chung cho cả khu vực sinh viên).
 */
export function usePermissions() {
  const { role, user } = useAuth();
  const { hasRoom, loading } = useStudentRoom();

  return {
    canRegisterForRoom: !hasRoom && role === 'STUDENT',
    hasActiveRoom: hasRoom,
    checkingRoom: loading,
    isGuest: !user,
    isStudent: role === 'STUDENT',
    isManager: role === 'MANAGER',
  };
}

export default usePermissions;
