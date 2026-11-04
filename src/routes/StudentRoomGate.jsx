import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { api } from '../api/apiClient';
import { StudentRoomContext } from '../context/studentRoomContext';
import {
  STUDENT_HOUSED_BLOCKED,
  STUDENT_NO_ROOM_ALLOWED,
  STUDENT_NO_ROOM_HOME,
} from '../constants/screenConfig';
import { ROLE_HOME } from '../constants/roles';

const ENDED_STATUSES = ['CHECKED_OUT', 'CANCELLED', 'TERMINATED', 'ENDED'];

const startsWithAny = (pathname, prefixes) =>
  prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));

/**
 * Cổng chặn cho khu vực sinh viên:
 * - Chưa có phòng  -> chỉ được vào Tìm phòng / Đơn đăng ký / Hồ sơ.
 * - Đã có phòng    -> vào đầy đủ các chức năng, không cần tìm phòng nữa.
 */
export default function StudentRoomGate() {
  const { pathname } = useLocation();
  const [loading, setLoading] = useState(true);
  const [hasRoom, setHasRoom] = useState(false);
  const hasRoomRef = useRef(false);

  const refresh = useCallback(async () => {
    try {
      const data = await api('/room-assignments/me', { method: 'GET' });
      const assigned =
        !!(data?.roomNumber || data?.room) &&
        !ENDED_STATUSES.includes(String(data?.status || '').toUpperCase());
      hasRoomRef.current = assigned;
      setHasRoom(assigned);
    } catch (error) {
      // 404 = chưa có phòng. Lỗi khác (mạng, 5xx): giữ nguyên trạng thái cũ.
      if (error?.status === 404) {
        hasRoomRef.current = false;
        setHasRoom(false);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Tải lần đầu; sinh viên chưa có phòng được kiểm tra lại mỗi khi chuyển trang
  // (để vừa được duyệt đơn là vào được trang chính ngay).
  useEffect(() => {
    if (loading || !hasRoomRef.current) refresh();
  }, [pathname, loading, refresh]);

  const value = useMemo(
    () => ({ loading, hasRoom, refresh }),
    [loading, hasRoom, refresh],
  );

  if (loading) {
    return <div className="page-status">Đang kiểm tra thông tin phòng…</div>;
  }

  if (!hasRoom && !startsWithAny(pathname, STUDENT_NO_ROOM_ALLOWED)) {
    return <Navigate to={STUDENT_NO_ROOM_HOME} replace />;
  }

  if (hasRoom && startsWithAny(pathname, STUDENT_HOUSED_BLOCKED)) {
    return <Navigate to={ROLE_HOME.STUDENT} replace />;
  }

  return (
    <StudentRoomContext.Provider value={value}>
      <Outlet />
    </StudentRoomContext.Provider>
  );
}
