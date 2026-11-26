import { useEffect, useState } from "react";
import { resources } from "../services/resource.service";
import { errorMessage } from "../utils/errorHandler";

export default function useCurrentStay() {
  const [room, setRoom] = useState(null);
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [assignments, contracts] = await Promise.all([
          resources.list("/student/room-assignments", { page: 0, size: 20 }),
          resources.list("/student/contracts", { page: 0, size: 20 }),
        ]);
        if (!active) return;
        const current = (assignments?.content || []).find((item) =>
          String(item.assignmentStatus || item.status).toUpperCase() === "CHECKED_IN",
        );
        setRoom(current?.room || current || null);
        const list = contracts?.content || contracts?.items || [];
        const matched = list.find((item) => item.contractId === current?.contractId)
          || (current?.contractId ? await resources.get("/student/contracts", current.contractId) : null);
        if (active) setContract(matched);
      } catch (err) {
        if (active) setError(errorMessage(err));
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return { room, contract, loading, error };
}

