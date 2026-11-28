import useStudentRoom from "./useStudentRoom";

export default function useCurrentStay() {
  const { journey, loading, requestsError } = useStudentRoom();
  const assignment = journey?.hasRoom ? journey.assignment : null;
  return {
    room: assignment?.room || assignment || null,
    contract: assignment ? journey.contract : null,
    loading,
    error: requestsError ? "Không thể tải thông tin cư trú. Vui lòng thử lại sau." : "",
  };
}

