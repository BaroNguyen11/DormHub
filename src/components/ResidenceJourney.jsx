import { Check } from "lucide-react";
import useStudentRoom from "../hooks/useStudentRoom";

const steps = ["Đăng ký phòng", "Duyệt đơn", "Thanh toán cọc", "Chọn lịch nhận phòng", "Chờ nhận phòng"];

export default function ResidenceJourney() {
  const { journey } = useStudentRoom();
  const stage = journey?.progressStep;
  if (journey?.registrationStage === "resident") return null;
  return <nav aria-label="Tiến trình đăng ký và nhận phòng" className="mb-6 rounded-sm border-4 border-line-strong bg-surface p-4 shadow-[6px_6px_0_#141413] sm:p-6">
    {stage == null ? <p role="status" className="text-sm text-text-muted">Chưa thể tải tiến trình nhận phòng. Vui lòng thử lại sau.</p> :
      <ol className="grid grid-cols-2 items-start gap-x-3 gap-y-4 sm:grid-cols-3 xl:grid-cols-5">
        {steps.map((label, index) => <li key={label} aria-current={stage === index ? "step" : undefined} className="flex min-w-0 items-center gap-2 py-1">
          <span className={`grid size-9 shrink-0 place-items-center rounded-sm border-2 border-line-strong text-xs font-black ${index < stage ? "bg-warning text-black shadow-[2px_2px_0_#141413]" : index === stage ? "bg-primary text-black shadow-[2px_2px_0_#141413] -translate-y-0.5" : "bg-surface-2 text-text-muted"}`}>
            {index < stage ? <Check size={18} aria-label="Hoàn thành" /> : index + 1}
          </span><span className={`min-w-0 flex-1 text-xs font-extrabold leading-snug sm:text-sm ${index === stage ? "text-text underline decoration-3 decoration-primary underline-offset-4" : index > stage ? "text-text-muted" : "text-text"}`}>{label}</span>
          {index < steps.length - 1 && <span aria-hidden="true" className="hidden h-1 w-3 shrink-0 rounded-sm bg-line-strong/20 xl:block" />}
        </li>)}
      </ol>}
  </nav>;
}
