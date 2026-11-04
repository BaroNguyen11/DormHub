// ====================================
// APPLICATION SCREEN - Màn hình đăng ký nội trú (Neo-Brutalism)
// ====================================
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  RefreshCw,
  UserCheck,
  Home,
  Calendar,
  FileText,
  BedDouble,
  ShieldCheck,
} from "lucide-react";
import { asList } from "../../api/apiClient";
import { resources } from "../../services/resource.service";
import { errorMessage } from "../../utils/errorHandler";
import { money } from "../../utils/format";
import { FIELD_CONFIGS } from "./constants";
import { Notice, Loading, Empty, Heading } from "./UIComponents";
import { useLoad } from "./useLoad";
import { CustomDatePicker } from "../ui/CustomDatePicker";
import usePermissions from "../../hooks/usePermissions";

/**
 * Component FormFields - Render ô nhập dữ liệu ngày & ghi chú
 */
function FormFields({ names, values, onChange }) {
  const FIELD_LABELS = {
    expectedCheckInDate: "Ngày nhận phòng dự kiến",
    note: "Ghi chú bổ sung",
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {names.map((key) => {
        const meta = FIELD_CONFIGS[key] || {};
        const isNote = key === "note";

        return (
          <div
            className={`flex flex-col gap-2 ${
              meta.tag === "textarea" || isNote ? "md:col-span-2" : ""
            }`}
            key={key}
          >
            <div className="flex items-center justify-between text-sm font-extrabold text-text">
              <span>{FIELD_LABELS[key] || key}</span>
              {isNote && (
                <span className="text-xs font-semibold text-text-muted">
                  (Không bắt buộc)
                </span>
              )}
            </div>

            {meta.tag === "textarea" || isNote ? (
              <textarea
                value={values[key] ?? ""}
                onChange={(e) => onChange(key, e.target.value)}
                rows={4}
                placeholder="Nhập mong muốn hoặc ghi chú cho ban quản lý..."
                className="w-full border-3 border-line-strong rounded-sm px-4 py-3 text-sm font-bold text-text bg-surface shadow-[2px_2px_0_#141413] focus:shadow-[4px_4px_0_#141413]  outline-none! resize-none transition-all placeholder:font-medium placeholder:text-text-muted/60"
              />
            ) : (
              <CustomDatePicker
                value={values[key] ?? ""}
                required
                min={meta.min || new Date().toISOString().split("T")[0]}
                onChange={(val) => onChange(key, val)}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Component ApplicationScreen - Form đăng ký nội trú 4 bước
 */
export default function ApplicationScreen({ config }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [values, setValues] = useState({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Check if student already has a room
  const { canRegisterForRoom, hasActiveRoom, checkingRoom } = usePermissions();

  // Load danh sách phòng còn trống
  const { data: rooms, loading } = useLoad("/rooms", {
    availableOnly: true,
    size: 100,
  });

  const roomList = asList(rooms);
  const selectedRoom = roomList.find((r) => r.id === values.roomId);

  const steps = [
    "Thông tin SV",
    "Chọn nguyện vọng",
    "Thời gian",
    "Kiểm tra & Gửi",
  ];

  const change = (key, value) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  async function next(e) {
    e.preventDefault();

    if (step < 3) {
      setStep(step + 1);
      return;
    }

    setBusy(true);
    setError("");

    try {
      const result = await resources.create("/applications", values);
      navigate(`/student/applications/${result?.id}`, { replace: true });
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  // Show loading while checking room status
  if (checkingRoom) {
    return (
      <div className="space-y-6">
        <Heading config={config} />
        <Loading />
      </div>
    );
  }

  // Show warning if student already has a room
  if (hasActiveRoom) {
    return (
      <div className="space-y-6">
        <Heading config={config} />
        <Notice
          type="warning"
          message="Bạn đã được phân phòng"
          description="Bạn hiện đang có phòng ở KTX. Vui lòng kiểm tra thông tin phòng tại mục 'Chỗ ở của tôi'. Nếu muốn chuyển phòng, vui lòng liên hệ ban quản lý."
        />
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/student/residence")}
            className="border-3 border-line-strong bg-primary rounded-sm h-11 px-6 py-2 inline-flex gap-2 items-center justify-center font-bold text-sm whitespace-nowrap shadow-[3px_3px_0_#141413] hover:shadow-[5px_5px_0_#141413] hover:-translate-y-0.5 transition-all duration-200 active:translate-y-0 active:shadow-none"
          >
            Xem thông tin phòng của tôi
          </button>
          <button
            onClick={() => navigate("/student")}
            className="border-3 border-line bg-surface rounded-sm h-11 px-6 py-2 inline-flex gap-2 items-center justify-center font-bold text-sm whitespace-nowrap text-text hover:bg-surface shadow-[3px_3px_0_#141413] hover:shadow-[5px_5px_0_#141413] hover:-translate-y-0.5 transition-all duration-200 active:translate-y-0 active:shadow-none"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Heading tiêu đề trang */}
      <Heading config={config} />

      {/* Stepper - Dải 4 bước Neo-Brutalism */}
      <div className="bg-surface border-4 border-line-strong rounded-2xl p-4 sm:p-6 shadow-[6px_6px_0_#141413]">
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2 sm:pb-0">
          {steps.map((name, i) => {
            const isCurrent = i === step;
            const isCompleted = i < step;

            return (
              <div
                key={name}
                className="flex items-center gap-2.5 flex-1 min-w-30 last:flex-none py-1"
              >
                {/* Badge Số Thứ Tự */}
                <div
                  className={`size-9  rounded-xl border-2 border-line-strong flex items-center justify-center text-xs! font-black shrink-0 transition-all ${
                    isCurrent
                      ? "bg-primary text-black shadow-[2px_2px_0_#141413] -translate-y-0.5"
                      : isCompleted
                        ? "bg-warning text-black shadow-[2px_2px_0_#141413]"
                        : "bg-surface-2 text-text-muted"
                  }`}
                >
                  {isCompleted ? <Check size={16} strokeWidth={3} /> : i + 1}
                </div>

                {/* Nhãn Tên Bước */}
                <span
                  className={`text-xs sm:text-sm font-extrabold whitespace-nowrap ${
                    isCurrent
                      ? "text-text underline decoration-3 decoration-primary underline-offset-4"
                      : isCompleted
                        ? "text-text"
                        : "text-text-muted"
                  }`}
                >
                  {name}
                </span>

                {/* Đường nối giữa các bước */}
                {i < steps.length - 1 && (
                  <div className="flex-1 h-1 bg-line-strong/20 mx-2 rounded-full hidden md:block" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Notice hiển thị lỗi nếu có */}
      <Notice error={error} />

      {/* Main Card Nội Dung Form */}
      <div className="bg-surface border-4 border-line-strong rounded-2xl p-6 sm:p-8 shadow-[6px_6px_0_#141413]">
        <form onSubmit={next} className="space-y-8">
          {/* BƯỚC 0: Xác nhận thông tin tài khoản */}
          {step === 0 && (
            <div className="p-6 rounded-2xl bg-primary-light border-3 border-line-strong shadow-[4px_4px_0_#141413] space-y-4">
              <div className="flex items-center gap-3">
                <div className="size-11 rounded-xl bg-primary border-2 border-line-strong flex items-center justify-center shadow-[2px_2px_0_#141413] shrink-0">
                  <UserCheck
                    size={22}
                    className="text-text"
                    strokeWidth={2.5}
                  />
                </div>
                <div>
                  <h3 className="text-base font-black text-text">
                    Tài khoản sinh viên hợp lệ
                  </h3>
                  <p className="text-xs font-bold text-text-muted">
                    Hệ thống tự động liên kết mã sinh viên đang đăng nhập vào
                    đơn đăng ký.
                  </p>
                </div>
              </div>
              <p className="text-xs font-semibold text-text leading-relaxed border-t-2 border-line-strong/20 pt-3 m-0">
                Hãy đảm bảo thông tin số điện thoại và địa chỉ trong trang{" "}
                <strong>Hồ sơ cá nhân</strong> của bạn đã chuẩn xác trước khi
                tiếp tục gửi nguyện vọng.
              </p>
            </div>
          )}

          {/* BƯỚC 1: Chọn nguyện vọng phòng */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2">
                <h3 className="text-sm font-black text-text uppercase tracking-wider flex items-center gap-2">
                  <BedDouble size={18} /> Chọn phòng còn trống
                </h3>
                <span className="text-xs font-extrabold text-text-muted">
                  Tìm thấy {roomList.length} phòng khả dụng
                </span>
              </div>

              {loading ? (
                <Loading />
              ) : roomList.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {roomList.map((room) => {
                    const isSelected = values.roomId === room.id;

                    return (
                      <label
                        key={room.id}
                        className={`p-5 rounded-2xl border-3 border-line-strong cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                          isSelected
                            ? "bg-primary-light border-line-strong shadow-[5px_5px_0_#141413] -translate-y-1 ring-2 ring-line-strong"
                            : "bg-surface hover:bg-surface-2 shadow-[3px_3px_0_#141413] hover:shadow-[5px_5px_0_#141413] hover:-translate-y-0.5"
                        }`}
                      >
                        <input
                          type="radio"
                          name="roomId"
                          required
                          value={room.id}
                          checked={isSelected}
                          onChange={() => change("roomId", room.id)}
                          className="sr-only"
                        />

                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <strong className="block text-base font-black text-text">
                              Phòng {room.roomNumber || room.name}
                            </strong>
                            <span className="text-xs font-bold text-text-muted">
                              {room.buildingName ||
                                room.building?.name ||
                                "Khu nội trú"}
                            </span>
                          </div>

                          <span className="px-2.5 py-1 bg-warning text-black text-xs font-black rounded-lg border-2 border-line-strong shadow-[1.5px_1.5px_0_#141413]">
                            {room.availableSlots ?? 0} chỗ trống
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t-2 border-line-strong/20">
                          <span className="text-xs font-extrabold text-text-muted">
                            Giá thuê tháng:
                          </span>
                          <span className="text-base font-black text-text">
                            {money(room.monthlyPrice)} / tháng
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <Empty text="Hiện tại chưa có phòng trống để đăng ký." />
              )}
            </div>
          )}

          {/* BƯỚC 2: Chọn ngày nhận phòng & Ghi chú */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2">
                <Calendar size={18} className="text-text" />
                <h3 className="text-sm font-black text-text uppercase tracking-wider">
                  Thời gian & Ghi chú bổ sung
                </h3>
              </div>

              <FormFields
                names={["expectedCheckInDate", "note"]}
                values={values}
                onChange={change}
              />
            </div>
          )}

          {/* BƯỚC 3: Kiểm tra thông tin & Gửi hồ sơ */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-2 border-b-3 border-line-strong">
                <ShieldCheck size={20} className="text-text" />
                <h3 className="text-base font-black text-text">
                  Xác nhận thông tin đăng ký nội trú
                </h3>
              </div>

              <div className="p-6 rounded-2xl bg-surface-2 border-3 border-line-strong shadow-[4px_4px_0_#141413] space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="block text-xs font-extrabold text-text-muted uppercase">
                      Phòng đã chọn:
                    </span>
                    <strong className="text-base font-black text-text">
                      {selectedRoom
                        ? `Phòng ${selectedRoom.roomNumber || selectedRoom.name}`
                        : values.roomId}
                    </strong>
                  </div>

                  <div>
                    <span className="block text-xs font-extrabold text-text-muted uppercase">
                      Tòa nhà:
                    </span>
                    <strong className="text-base font-black text-text">
                      {selectedRoom?.buildingName ||
                        selectedRoom?.building?.name ||
                        "Khu A"}
                    </strong>
                  </div>

                  <div>
                    <span className="block text-xs font-extrabold text-text-muted uppercase">
                      Giá thuê niêm yết:
                    </span>
                    <strong className="text-base font-black text-text">
                      {selectedRoom ? money(selectedRoom.monthlyPrice) : "---"}
                    </strong>
                  </div>

                  <div>
                    <span className="block text-xs font-extrabold text-text-muted uppercase">
                      Ngày nhận phòng dự kiến:
                    </span>
                    <strong className="text-base font-black text-text">
                      {values.expectedCheckInDate || "Chưa chọn"}
                    </strong>
                  </div>
                </div>

                {values.note && (
                  <div className="pt-3 border-t-2 border-line-strong/20">
                    <span className="block text-xs font-extrabold text-text-muted uppercase">
                      Ghi chú bổ sung:
                    </span>
                    <p className="text-sm! font-bold text-text m-0 mt-1">
                      {values.note}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Cụm Nút Điều Hướng (Hủy/Quay lại & Tiếp tục/Gửi) */}
          <div className="flex items-center justify-between gap-4 pt-6 border-t-3 border-line-strong">
            {step > 0 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="inline-flex items-center gap-2 px-5 py-2 bg-surface text-text font-extrabold text-sm rounded-sm border-3 border-line-strong shadow-[3px_3px_0_#141413] hover:shadow-[5px_5px_0_#141413] hover:-translate-0.5 active:translate-0.5 active:shadow-none transition-all cursor-pointer"
              >
                <ArrowLeft size={18} strokeWidth={2.5} />
                <span>Quay lại</span>
              </button>
            ) : (
              <div />
            )}

            <button
              type="submit"
              disabled={busy || (step === 1 && !values.roomId)}
              className="inline-flex items-center gap-2 px-6 py-2 bg-primary text-text font-extrabold text-sm rounded-sm border-3 border-line-strong shadow-[3px_3px_0_#141413] hover:shadow-[5px_5px_0_#141413] hover:-translate-0.5 active:translate-0.5 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none transition-all cursor-pointer"
            >
              {busy ? (
                <RefreshCw
                  size={18}
                  strokeWidth={2.5}
                  className="animate-spin"
                />
              ) : step === 3 ? (
                <Check size={18} strokeWidth={2.5} />
              ) : (
                <ArrowRight size={18} strokeWidth={2.5} />
              )}
              <span>
                {busy
                  ? "Đang gửi..."
                  : step === 3
                    ? "Gửi hồ sơ đăng ký"
                    : "Tiếp tục"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
