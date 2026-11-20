// ====================================
// FORMATTERS - Format dữ liệu hiển thị
// ====================================
// File này chứa các hàm format money, date, status...
// Mục đích: Chuyển đổi dữ liệu thô từ API thành dạng dễ đọc cho người dùng

import { date, money } from "../../utils/format";
import { STATUS_LABELS } from "../../constants/status";
import { FIELD_CONFIGS, getStatusColor } from "./constants";

/**
 * Nhãn hiển thị cho loại thiết bị/hư hỏng (mã enum từ FIELD_CONFIGS.type).
 * Trước đây formatValue("type", "AIR_CONDITIONER") trả về mã thô.
 */
export const TYPE_LABELS = Object.freeze(
  Object.fromEntries(
    (FIELD_CONFIGS.type?.options || []).map((option) => [option.value, option.label]),
  ),
);

/**
 * Kiểm tra xem field có phải là ngày tháng không
 * @param {string} fieldName - Tên field (vd: "createdAt", "startDate")
 * @returns {boolean} - true nếu là field date
 * 
 * Logic: Field kết thúc bằng "At" hoặc "Date" -> là date
 * Ví dụ: createdAt, startDate, endDate, dueDate
 */
function isDateField(fieldName) {
  return /(At|Date)$/.test(fieldName);
}

/**
 * Kiểm tra xem field có phải là tiền không
 * @param {string} fieldName - Tên field (vd: "totalAmount", "monthlyPrice", "pricePerMonth")
 * @returns {boolean} - true nếu là field money
 *
 * Logic: Field kết thúc bằng Amount / Price / Fee / PerMonth / Rent / Deposit -> là money
 * Ví dụ: totalAmount, monthlyPrice, pricePerMonth, monthlyRent, depositAmount
 */
function isMoneyField(fieldName) {
  return /(amount|price|fee|perMonth|rent|deposit)$/i.test(fieldName);
}

/**
 * Format giá trị để hiển thị đẹp trên UI
 * @param {string} fieldName - Tên field (vd: "totalAmount", "createdAt", "status")
 * @param {any} value - Giá trị cần format
 * @returns {React.ReactNode} - Giá trị đã format (có thể là string hoặc JSX)
 * 
 * Các trường hợp xử lý:
 * 1. Null/empty -> hiện dấu gạch ngang "—"
 * 2. Status -> hiện badge màu
 * 3. Boolean -> "Có" hoặc "Chưa"
 * 4. Money -> format số tiền (VD: "1.000.000 ₫")
 * 5. Date -> format ngày tháng (VD: "31/10/2026")
 * 6. Array -> nối các phần tử bằng dấu phẩy
 * 7. Object -> lấy name hoặc id
 * 8. Default -> convert sang string
 */
export function formatValue(fieldName, value) {
  if (value == null || (typeof value === "string" && (!value.trim() || value.trim() === "-" || value.trim() === "—"))) {
    return <span className="font-semibold text-text-muted">Chưa cập nhật</span>;
  }
  if (fieldName === "accountStatus") {
    return value === "NO_ACCOUNT"
      ? "Chưa có tài khoản"
      : value === "ACTIVE"
        ? "Đã có tài khoản"
        : value === "LOCKED"
          ? "Đã có tài khoản (Đã khóa)"
          : value === "PENDING_VERIFICATION"
            ? "Đã có tài khoản (Chờ xác thực)"
          : <span className="font-semibold text-text-muted">Chưa cập nhật</span>;
  }

  if (fieldName === "gender" || fieldName === "genderRestriction") {
    return value === "MALE" ? "Nam" : value === "FEMALE" ? "Nữ" : String(value);
  }

  if (fieldName === "roomType") {
    return ({ SINGLE: "Phòng đơn", DOUBLE: "Phòng đôi", QUAD: "Phòng 4 người", SIX_BED: "Phòng 6 người", EIGHT_BED: "Phòng 8 người" })[value] || value;
  }

  // Loại hư hỏng trong báo hỏng (FAN, AIR_CONDITIONER, PLUMBING...) -> nhãn tiếng Việt
  if (fieldName === "type") {
    return TYPE_LABELS[String(value).toUpperCase()] || value;
  }

  if (["invoiceType", "itemType", "depositStatus", "assignmentStatus", "contractStatus", "transferType", "method", "priority"].includes(fieldName)) {
    const normalizedValue = typeof value === "string" ? value.toUpperCase() : value;
    return STATUS_LABELS[normalizedValue] || value;
  }

  // Kỳ hóa đơn "YYYY-MM" -> "Tháng MM/YYYY" cho dễ đọc
  if (fieldName === "billingMonth" && /^\d{4}-\d{2}$/.test(String(value))) {
    const [year, month] = String(value).split("-");
    return `Tháng ${month}/${year}`;
  }

  // 2. Xử lý status -> hiển thị badge với màu tương ứng
  if (fieldName === "status") {
    return (
      <span className={`status ${getStatusColor(value)}`}>
        {STATUS_LABELS[value] || value}
      </span>
    );
  }

  // 3. Xử lý boolean -> "Có" hoặc "Chưa"
  if (typeof value === "boolean") {
    return value ? "Có" : "Chưa";
  }

  // 4. Xử lý money -> format số tiền
  if (isMoneyField(fieldName)) {
    return money(value);
  }

  // 5. Xử lý date -> format ngày tháng
  if (isDateField(fieldName)) {
    return date(value);
  }

  // 6. Xử lý array -> nối bằng dấu phẩy
  // Ví dụ: [room1, room2, room3] -> "room1, room2, room3"
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "object" ? item.name || item.id : item))
      .join(", ");
  }

  // 7. Xử lý object -> lấy name hoặc id
  // Ví dụ: {id: 1, name: "Phòng A"} -> "Phòng A"
  if (typeof value === "object") {
    return value.name || value.fullName || value.id || JSON.stringify(value);
  }

  // 8. Default: convert sang string
  return String(value);
}

/**
 * Lấy giá trị từ object lồng nhau (nested object)
 * @param {object} row - Object chứa data (vd: invoice, contract...)
 * @param {string} fieldName - Tên field cần lấy
 * @returns {any} - Giá trị của field
 * 
 * Ví dụ:
 * - row = { roomNumber: "A101", room: { buildingName: "Tòa A" } }
 * - getNestedValue(row, "roomNumber") -> "A101"
 * - getNestedValue(row, "buildingName") -> "Tòa A" (lấy từ row.room.buildingName)
 * 
 * Logic tìm kiếm theo thứ tự:
 * 1. row[fieldName] - tìm ở level đầu tiên
 * 2. row.room[fieldName] - tìm trong object room
 * 3. row.student[fieldName] - tìm trong object student
 * 4. row.building[fieldName] - tìm trong object building
 */
export function getNestedValue(row, fieldName) {
  return (
    row?.[fieldName] ?? 
    row?.room?.[fieldName] ?? 
    row?.student?.[fieldName] ?? 
    row?.building?.[fieldName]
  );
}
