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
  const refreshRequestRef = useRef(null);

  const refresh = useCallback(async () => {
    if (refreshRequestRef.current) return refreshRequestRef.current;

    const request = (async () => {
      try {
        // Backend trả về Page<RoomAssignmentResponse> tại /student/room-assignments
        // (endpoint cũ /room-assignments/me đã bị xoá → 404).
        const data = await api('/student/room-assignments', {
          method: 'GET',
          // Backend default page=0, size=20 — đủ để biết SV có đang ở phòng nào không.
        });
        const items = Array.isArray(data)
          ? data
          : data?.content || data?.items || [];
        const assigned = items.some((a) =>
          ['ASSIGNED', 'CHECKED_IN'].includes(
            String(a?.assignmentStatus || a?.status || '').toUpperCase(),
          ),
        );
        hasRoomRef.current = assigned;
        setHasRoom(assigned);
      } catch {
        // 404 / 403 / mạng: coi như chưa có phòng để SV vẫn vào được Tìm phòng.
        hasRoomRef.current = false;
        setHasRoom(false);
      } finally {
        setLoading(false);
      }
    })();
    refreshRequestRef.current = request;
    try {
      await request;
    } finally {
      if (refreshRequestRef.current === request) {
        refreshRequestRef.current = null;
      }
    }
  }, []);

  // Tải lần đầu; sinh viên chưa có phòng được kiểm tra lại mỗi khi chuyển trang
  // (để vừa được duyệt đơn là vào được trang chính ngay).
  useEffect(() => {
    if (!hasRoomRef.current) void refresh();
  }, [pathname, refresh]);

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
