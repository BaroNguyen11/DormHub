import { useState, useRef, useEffect } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

const parseLocalDate = (value) => {
  if (!value) return null;
  const [year, month, day] = String(value)
    .slice(0, 10)
    .split("-")
    .map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
};

const formatDateValue = (value) => {
  const date = parseLocalDate(value);
  if (!date) return "";
  return `${String(date.getDate()).padStart(2, "0")}/${String(
    date.getMonth() + 1,
  ).padStart(2, "0")}/${date.getFullYear()}`;
};

function parseTypedDate(rawValue) {
  const raw = rawValue.trim();
  let year;
  let month;
  let day;
  const yearFirst = raw.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  const dayFirst = raw.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (yearFirst) {
    [, year, month, day] = yearFirst;
  } else if (dayFirst) {
    [, day, month, year] = dayFirst;
  } else {
    return null;
  }

  const parsed = new Date(Number(year), Number(month) - 1, Number(day));
  if (
    parsed.getFullYear() !== Number(year) ||
    parsed.getMonth() !== Number(month) - 1 ||
    parsed.getDate() !== Number(day)
  ) {
    return null;
  }
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function formatTypedInput(rawValue) {
  const raw = rawValue.slice(0, 10);
  const separatorMatch = raw.match(/[/-]/);
  const firstPart = separatorMatch ? raw.slice(0, separatorMatch.index) : "";
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  // Keep the first four digits untouched so `YYYY-MM-DD` can be typed naturally.
  // Once a separator is entered, its position determines the date order.
  const yearFirst = separatorMatch
    ? firstPart.length === 4
    : digits.length <= 4;

  if (yearFirst) {
    if (digits.length <= 4) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
    return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
  }
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export function CustomDatePicker({ value, onChange, min, max, required, className = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState(() => formatDateValue(value));
  const [currentMonth, setCurrentMonth] = useState(
    parseLocalDate(value) || new Date()
  );
  const dropdownRef = useRef(null);

  useEffect(() => {
    setDraft(formatDateValue(value));
  }, [value]);

  useEffect(() => {
    if (!value) return;
    const parsedValue = parseLocalDate(value);
    if (parsedValue && !Number.isNaN(parsedValue.getTime())) {
      setCurrentMonth(
        (current) =>
          current.getFullYear() === parsedValue.getFullYear() &&
          current.getMonth() === parsedValue.getMonth()
            ? current
            : new Date(parsedValue.getFullYear(), parsedValue.getMonth(), 1),
      );
    }
  }, [value]);

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
    setDraft(formatDateValue(dateStr));
    setIsOpen(false); // Đóng popup sau khi chọn
  };

  const commitTypedDate = (rawDate) => {
    const dateStr = parseTypedDate(rawDate);
    if (!dateStr || (min && dateStr < min) || (max && dateStr > max)) return;
    onChange(dateStr);
    setDraft(formatDateValue(dateStr));
    const parsed = parseLocalDate(dateStr);
    if (parsed) setCurrentMonth(new Date(parsed.getFullYear(), parsed.getMonth(), 1));
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className={`relative w-full ${className}`} ref={dropdownRef}>
      <input
        type="text"
        value={draft}
        required={required}
        inputMode="numeric"
        maxLength={10}
        placeholder="dd/mm/yyyy hoặc yyyy-mm-dd"
        aria-label="Ngày sinh"
        onChange={(event) => {
          const nextDraft = formatTypedInput(event.target.value);
          setDraft(nextDraft);
          commitTypedDate(nextDraft);
        }}
        onBlur={() => commitTypedDate(draft)}
        className="w-full h-12 border-3 border-line-strong bg-surface rounded-sm px-4 pr-11 text-sm font-bold text-text shadow-[3px_3px_0_#141413] focus:shadow-[4px_4px_0_#141413] outline-none! transition-all"
      />
      <button
        type="button"
        aria-label="Mở lịch"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-text hover:text-primary outline-none! transition-all cursor-pointer"
      >
        <CalendarIcon size={18} strokeWidth={2.5} />
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
              className="size-8 bg-surface-2 rounded-sm border-3 border-line-strong flex items-center justify-center hover:bg-warning cursor-pointer shadow-[3px_3px_0_#141413] outline-none! transition-all"
            >
              <ChevronLeft size={16} strokeWidth={2.5} />
            </button>

            <div className="flex items-center gap-2">
              <select
                aria-label="Chọn tháng"
                value={month}
                onChange={(event) =>
                  setCurrentMonth(new Date(year, Number(event.target.value), 1))
                }
                className="bg-surface border-2 border-line-strong rounded-xs px-2 py-1 font-bold text-xs shadow-[2px_2px_0_#141413] cursor-pointer outline-none!"
              >
                {Array.from({ length: 12 }, (_, index) => (
                  <option key={index} value={index}>Tháng {index + 1}</option>
                ))}
              </select>
              <select
                aria-label="Chọn năm"
                value={year}
                onChange={(event) =>
                  setCurrentMonth(new Date(Number(event.target.value), month, 1))
                }
                className="bg-surface border-2 border-line-strong rounded-xs px-2 py-1 font-bold text-xs shadow-[2px_2px_0_#141413] cursor-pointer outline-none!"
              >
                {Array.from({ length: currentYear - 1970 + 1 }, (_, index) => currentYear - index).map((itemYear) => (
                  <option key={itemYear} value={itemYear}>{itemYear}</option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentMonth(new Date(year, month + 1, 1));
              }}
              className="size-8 bg-surface-2 rounded-sm border-3 border-line-strong flex items-center justify-center hover:bg-warning cursor-pointer shadow-[3px_3px_0_#141413] outline-none! transition-all"
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
              const isDisabled = (min && dateStr < min) || (max && dateStr > max);

              return (
                <button
                  key={day}
                  type="button"
                  disabled={isDisabled}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectDay(day);
                  }}
                  className={`size-8 rounded-sm text-xs font-black flex items-center justify-center border-3 border-line-strong shadow-[3px_3px_0_#141413] outline-none! transition-all cursor-pointer ${
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
