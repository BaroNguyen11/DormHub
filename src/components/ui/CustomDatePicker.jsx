import { useState, useRef, useEffect } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

export function CustomDatePicker({ value, onChange, min, required }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(
    value ? new Date(value) : new Date()
  );
  const dropdownRef = useRef(null);

  // Đóng popup khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  // Số ngày trong tháng & ngày bắt đầu tuần
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const handleSelectDay = (day) => {
    const formattedMonth = String(month + 1).padStart(2, "0");
    const formattedDay = String(day).padStart(2, "0");
    const dateStr = `${year}-${formattedMonth}-${formattedDay}`;

    onChange(dateStr);
    setIsOpen(false); // Đóng popup sau khi chọn
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <input type="hidden" value={value || ""} required={required} />

      {/* Nút bấm hiển thị ngày đã chọn */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className="w-full flex items-center justify-between border-3 border-line-strong rounded-sm px-4 py-3 text-sm font-black text-text bg-surface shadow-[2px_2px_0_#141413] hover:shadow-[4px_4px_0_#141413] focus:shadow-[4px_4px_0_#141413] outline-none transition-all cursor-pointer"
      >
        <span className={value ? "text-text" : "text-text-muted/60 font-semibold"}>
          {value
            ? new Date(value).toLocaleDateString("vi-VN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })
            : "dd/mm/yyyy"}
        </span>
        <CalendarIcon size={18} strokeWidth={2.5} className="text-text shrink-0" />
      </button>

      {/* POPUP LỊCH CHUẨN NEO-BRUTALISM (Thay thế hoàn toàn popup mặc định) */}
      {isOpen && (
        <div className="absolute left-0 top-[calc(100%+6px)] z-50 w-72 bg-surface border-3 border-line-strong rounded-sm shadow-[4px_4px_0_#141413] p-4 animate-in fade-in zoom-in-95 duration-150">
          {/* Header Tháng / Năm & Nút chuyển */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b-3 border-line-strong">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentMonth(new Date(year, month - 1, 1));
              }}
              className="size-8 bg-surface-2 rounded-sm border-2 border-line-strong flex items-center justify-center hover:bg-warning cursor-pointer shadow-[1.5px_1.5px_0_#141413]"
            >
              <ChevronLeft size={16} strokeWidth={2.5} />
            </button>

            <span className="text-sm font-black text-text">
              Tháng {month + 1} / {year}
            </span>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentMonth(new Date(year, month + 1, 1));
              }}
              className="size-8 bg-surface-2 rounded-sm border-2 border-line-strong flex items-center justify-center hover:bg-warning cursor-pointer shadow-[1.5px_1.5px_0_#141413]"
            >
              <ChevronRight size={16} strokeWidth={2.5} />
            </button>
          </div>

          {/* Tiêu đề Thứ trong tuần */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-black text-text-muted mb-2">
            <span>CN</span>
            <span>T2</span>
            <span>T3</span>
            <span>T4</span>
            <span>T5</span>
            <span>T6</span>
            <span>T7</span>
          </div>

          {/* Bảng Ô Số Ngày */}
          <div className="grid grid-cols-7 gap-1">
            {/* Khoảng trống đầu tháng */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {/* Các ngày trong tháng */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const formattedMonth = String(month + 1).padStart(2, "0");
              const formattedDay = String(day).padStart(2, "0");
              const dateStr = `${year}-${formattedMonth}-${formattedDay}`;

              const isSelected = value === dateStr;
              const isDisabled = min && dateStr < min;

              return (
                <button
                  key={day}
                  type="button"
                  disabled={isDisabled}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectDay(day);
                  }}
                  className={`size-8 rounded-sm text-xs font-black flex items-center justify-center transition-all cursor-pointer ${
                    isSelected
                      ? "bg-primary text-black border-2 border-line-strong shadow-[2px_2px_0_#141413]"
                      : isDisabled
                      ? "opacity-30 cursor-not-allowed text-text-muted"
                      : "hover:bg-warning hover:border-2 hover:border-line-strong text-text"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}