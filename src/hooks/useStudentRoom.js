import { useContext } from 'react';
import { StudentRoomContext } from '../context/studentRoomContext';

const FALLBACK = { loading: false, hasRoom: true, hasAssignment: true, refresh: () => {} };

// Ngoài khu vực sinh viên (manager, guest) coi như "đã có phòng" để không ảnh hưởng.
export default function useStudentRoom() {
  return useContext(StudentRoomContext) ?? FALLBACK;
}
