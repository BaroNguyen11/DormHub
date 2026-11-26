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
import { studentJourney, loadJourneyPages } from '../utils/studentJourney';
import { getOpenResidenceRequest } from '../utils/residenceRequests';

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
  const [hasResidenceHistory, setHasResidenceHistory] = useState(false);
  const [registrationStage, setRegistrationStage] = useState('unknown');
  const [residenceRequest, setResidenceRequest] = useState(null);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [requestsError, setRequestsError] = useState(false);
  const [stagePath, setStagePath] = useState(STUDENT_NO_ROOM_HOME);
  const hasRoomRef = useRef(false);
  const refreshRequestRef = useRef(null);

  const refresh = useCallback(async () => {
    if (refreshRequestRef.current) return refreshRequestRef.current;

    const request = (async () => {
      try {
        // Backend trả về Page<RoomAssignmentResponse> tại /student/room-assignments
        // (endpoint cũ /room-assignments/me đã bị xoá → 404).
        const [assignments, contracts, applications] = await Promise.all([
          ...['/student/room-assignments', '/student/contracts', '/student/dorm-applications']
            .map((path) => loadJourneyPages((page, size) =>
              api(`${path}?page=${page}&size=${size}`, { notify: false }))),
        ]);
        const journey = studentJourney(assignments, contracts, applications);
        setHasAssignment(journey.hasAssignment);
        setHasResidenceHistory(journey.hasResidenceHistory);
        setStagePath(journey.stagePath);
        setRegistrationStage(journey.registrationStage);
        hasRoomRef.current = journey.hasRoom;
        setHasRoom(journey.hasRoom);
        try {
          setResidenceRequest(journey.hasRoom ? await getOpenResidenceRequest() : null);
          setRequestsError(false);
        } catch { setRequestsError(true); }
      } catch {
        // Keep the last verified stage; a failed lookup does not reopen room registration.
        setRequestsError(true);
      } finally {
        setLoading(false);
        setRequestsLoading(false);
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
    void refresh();
  }, [pathname, refresh]);

  useEffect(() => {
    const update = () => {
      // A mutation may finish while an older lookup is still in flight.
      const pending = refreshRequestRef.current;
      if (pending) void pending.then(() => refresh());
      else void refresh();
    };
    window.addEventListener('residence-updated', update);
    window.addEventListener('focus', update);
    const timer = window.setInterval(update, 30_000);
    return () => {
      window.removeEventListener('residence-updated', update);
      window.removeEventListener('focus', update);
      if (timer != null) window.clearInterval(timer);
    };
  }, [hasRoom, refresh]);

  const value = useMemo(
    () => ({ loading, hasRoom, hasAssignment, hasResidenceHistory, registrationStage, stagePath, refresh,
      residenceRequest, requestsLoading, requestsError }),
    [loading, hasRoom, hasAssignment, hasResidenceHistory, registrationStage, stagePath, refresh,
      residenceRequest, requestsLoading, requestsError],
  );

  if (loading) {
    return <div className="page-status">Đang kiểm tra thông tin phòng…</div>;
  }

  if (registrationStage !== 'search' && registrationStage !== 'unknown'
      && (pathname === '/student/applications/new' || startsWithAny(pathname, ['/student/rooms']))) {
    return <Navigate to={stagePath} replace />;
  }

  const residenceOnly = pathname === '/student/maintenance/new' ||
    /^\/student\/contracts\/[^/]+\/renewal$/.test(pathname) ||
    pathname === '/student/room-transfer-requests/new' ||
    pathname === '/student/checkout-requests/new';
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
