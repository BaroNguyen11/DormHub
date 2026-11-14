
import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { STATUS_LABELS } from "../../constants/status";

// Mapping nhãn Việt hóa mặc định cho các giá trị Tiếng Anh
const OPTION_LABELS = {
  LOW: "🟢 Thấp (Low)",
  MEDIUM: "🟡 Trung bình (Medium)",
  HIGH: "🟠 Cao (High)",
  URGENT: "🔴 Khẩn cấp (Urgent)",
  CASH: "💵 Tiền mặt",
  BANK_TRANSFER: "🏦 Chuyển khoản ngân hàng",
  ...STATUS_LABELS, // Tự động kết hợp cả danh sách STATUS_LABELS
};

export function CustomSelect({
  value,
  onChange,
  options = [],
  placeholder = "Chọn...",
  required,
  disabled = false,
  className,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Chuẩn hóa danh sách options (hỗ trợ cả Array String ["A", "B"] lẫn Array Object [{ value: "A", label: "Nhãn A" }])
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === "object" && opt !== null) return opt;
    return {
      value: opt,
      label: OPTION_LABELS[opt] || opt,
    };
  });

  // Tìm label đang được chọn
  const selectedItem = normalizedOptions.find((item) => item.value === value);
  const displayValue = selectedItem
    ? selectedItem.label
    : value
    ? OPTION_LABELS[value] || value
    : placeholder;

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative w-full ${className || ""}`} ref={dropdownRef}>
      <input type="hidden" value={value || ""} required={required} />

      {/* Nút bấm Kích hoạt Dropdown */}
      <button
        type="button"
        disabled={disabled}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className="w-full flex items-center justify-between border-3 border-line-strong rounded-sm px-4 py-2.5 text-sm! font-extrabold text-text bg-surface shadow-[3px_3px_0_#141413] hover:shadow-[4px_4px_0_#141413] focus:shadow-[4px_4px_0_#141413] outline-none! transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span
          className={
            value !== "" && value !== null && value !== undefined
              ? "text-text"
              : "text-text-muted/60 font-semibold"
          }
        >
          {displayValue}
        </span>
        <ChevronDown
          size={18}
          strokeWidth={2.5}
          className={`text-text shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Popover danh sách Lựa chọn */}
      {isOpen && !disabled && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 bg-surface border-3 border-line-strong rounded-sm shadow-[4px_4px_0_#141413] py-1 max-h-60 overflow-y-auto">
          {normalizedOptions.map((opt) => {
            const isSelected = value === opt.value;

            return (
              <div
                key={String(opt.value)}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onChange(opt.value);
                  setIsOpen(false); // Tự động đóng menu sau khi chọn
                }}
                className={`flex items-center justify-between px-4 py-2 text-xs! font-extrabold cursor-pointer transition-colors ${
                  isSelected
                    ? "bg-primary text-black"
                    : "hover:bg-warning hover:text-text text-text"
                }`}
              >
                <span>{opt.label}</span>
                {isSelected && (
                  <Check size={16} strokeWidth={3} className="text-text shrink-0 ml-2" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
