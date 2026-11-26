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
 * - Chưa check-in -> xem đơn, thanh toán, hợp đồng và thông tin phân phòng.
 * - Đã check-in   -> vào đầy đủ các chức năng cư trú.
 */
export default function StudentRoomGate() {
  const { pathname } = useLocation();
  const [loading, setLoading] = useState(true);
  const [hasRoom, setHasRoom] = useState(false);
  const [hasAssignment, setHasAssignment] = useState(false);
  const [stagePath, setStagePath] = useState(STUDENT_NO_ROOM_HOME);
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
        const checkedIn = items.some((a) =>
          String(a?.assignmentStatus || a?.status || '').toUpperCase() === 'CHECKED_IN',
        );
        const assigned = items.some((a) =>
          ['ASSIGNED', 'CHECKED_IN'].includes(
            String(a?.assignmentStatus || a?.status || '').toUpperCase(),
          ),
        );
        setHasAssignment(assigned);
        if (assigned) {
          setStagePath('/student/residence');
        } else {
          const applications = await api('/student/dorm-applications?page=0&size=20', {
            method: 'GET', notify: false,
          });
          const applicationItems = applications?.content || [];
          const openApplication = applicationItems.find((item) =>
            ['PENDING', 'APPROVED'].includes(String(item?.status || '').toUpperCase()),
          );
          setStagePath(openApplication?.status === 'APPROVED' && openApplication.depositInvoiceId
            ? `/student/invoices/${openApplication.depositInvoiceId}`
            : openApplication ? '/student/applications' : STUDENT_NO_ROOM_HOME);
        }
        hasRoomRef.current = checkedIn;
        setHasRoom(checkedIn);
      } catch {
        // 404 / 403 / mạng: coi như chưa có phòng để SV vẫn vào được Tìm phòng.
        hasRoomRef.current = false;
        setHasRoom(false);
        setHasAssignment(false);
        setStagePath(STUDENT_NO_ROOM_HOME);
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
    () => ({ loading, hasRoom, hasAssignment, refresh }),
    [loading, hasRoom, hasAssignment, refresh],
  );

  if (loading) {
    return <div className="page-status">Đang kiểm tra thông tin phòng…</div>;
  }

  const residenceOnly = pathname === '/student/maintenance/new' ||
    /^\/student\/contracts\/[^/]+\/renewal$/.test(pathname) ||
    pathname.startsWith('/student/room-transfer-requests/') ||
    pathname.startsWith('/student/checkout-requests/');
  if (!hasRoom && residenceOnly) {
    return <Navigate to="/student/residence" replace />;
  }
  if (hasAssignment && pathname === '/student/applications/new') {
    return <Navigate to="/student/residence" replace />;
  }

  if (!hasRoom && !startsWithAny(pathname, STUDENT_NO_ROOM_ALLOWED)) {
    return <Navigate to={stagePath} replace />;
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
