// ====================================
// APPLICATION SCREEN - Màn hình đăng ký nội trú (Neo-Brutalism)
// ====================================
import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  RefreshCw,
  UserCheck,
  BedDouble,
  ShieldCheck,
} from "lucide-react";
import { asList } from "../../api/apiClient";
import { resources } from "../../services/resource.service";
import { money } from "../../utils/format";
import { Notice, Loading, Empty, Heading } from "./UIComponents";
import { useLoad } from "./useLoad";
import usePermissions from "../../hooks/usePermissions";
import useAuth from "../../hooks/useAuth";

const getCachedStudentProfile = (user) =>
  user?.studentProfile ||
  user?.student ||
  user?.profile ||
  (user?.studentCode || user?.gender || user?.dateOfBirth || user?.address
    ? user
    : null);

const getRoomMonthlyPrice = (room) =>
  room?.pricePerMonth ?? room?.monthlyPrice ?? room?.price;

const isProfileComplete = (profile) =>
  Boolean(
    profile?.studentCode &&
      profile?.gender &&
      profile?.dateOfBirth &&
      profile?.address,
  );

const sameProfile = (left, right) => {
  if (left === right) return true;
  if (!left || !right || typeof left !== "object" || typeof right !== "object") {
    return false;
  }
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);
  return (
    leftKeys.length === rightKeys.length &&
    leftKeys.every((key) => Object.is(left[key], right[key]))
  );
};

/**
 * Component ApplicationScreen - Form đăng ký nội trú 3 bước
 */
export default function ApplicationScreen({ config }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(0);
  const [values, setValues] = useState({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const { user } = useAuth();

  // Check if student already has a room
  const { hasActiveRoom, checkingRoom } = usePermissions();

  // Reuse profile details already present on the authenticated account.
  const initialProfileRef = useRef(getCachedStudentProfile(user));
  const [profile, setProfile] = useState(initialProfileRef.current);
  const [loadingProfile, setLoadingProfile] = useState(
    !initialProfileRef.current,
  );

  // Fetch the profile once only when AuthContext does not already contain it.
  useEffect(() => {
    if (initialProfileRef.current) return undefined;

    let active = true;
    async function fetchProfile() {
      try {
        const result = await resources.list("/student/profile", {});
        if (active) {
          setProfile((current) =>
            sameProfile(current, result) ? current : result,
          );
        }
      } catch {
        // API client reports request failures globally.
      } finally {
        if (active) setLoadingProfile(false);
      }
    }
    void fetchProfile();

    return () => {
      active = false;
    };
  }, []);

  // Load danh sách phòng còn trống theo giới tính của sinh viên đang đăng nhập
  const { data: rooms, loading } = useLoad("/student/rooms-available", {
    size: 100,
  });

  // Get roomId from URL query parameter
  const preselectedRoomId = searchParams.get("roomId");

  const roomList = asList(rooms);
  const selectedRoom = roomList.find((r) => r.id === values.roomId);

  // Check if profile is complete
  const profileComplete = isProfileComplete(profile);

  const steps = [
    "Thông tin SV",
    "Chọn nguyện vọng",
    "Kiểm tra & Gửi",
  ];

  const change = (key, value) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  // Pre-fill roomId from URL on mount
  useEffect(() => {
    if (preselectedRoomId && !values.roomId) {
      change("roomId", parseInt(preselectedRoomId, 10));
    }
  }, [preselectedRoomId, values.roomId]);

  async function next(e) {
    e.preventDefault();

    if (step < 2) {
      setStep(step + 1);
      return;
    }

    setBusy(true);
    setError("");

    try {
      // Only send roomId and note to backend
      const payload = {
        roomId: values.roomId,
        note: values.note || undefined,
      };
      const result = await resources.create(
        "/student/dorm-applications",
        payload,
      );
      navigate(`/student/applications/${result?.id}`, { replace: true });
    } catch {
      // API client reports request failures globally.
    } finally {
      setBusy(false);
    }
  }

  // Show loading while checking room status or profile
  if (checkingRoom || loadingProfile) {
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

  // Show warning if profile is incomplete
  if (!profileComplete) {
    return (
      <div className="space-y-6">
        <Heading config={config} />
        <Notice
          type="warning"
          message="Hồ sơ cá nhân chưa đầy đủ"
          description="Bạn cần hoàn thiện thông tin hồ sơ (mã sinh viên, giới tính, ngày sinh, địa chỉ) trước khi đăng ký nội trú."
        />
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/student/profile")}
            className="border-3 border-line-strong bg-primary rounded-sm h-11 px-6 py-2 inline-flex gap-2 items-center justify-center font-bold text-sm whitespace-nowrap shadow-[3px_3px_0_#141413] hover:shadow-[5px_5px_0_#141413] hover:-translate-y-0.5 transition-all duration-200 active:translate-y-0 active:shadow-none"
          >
            Đến trang Hồ sơ
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
      <div className="bg-surface border-4 border-line-strong rounded-sm p-4 sm:p-6 shadow-[6px_6px_0_#141413]">
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
                  className={`size-9  rounded-sm border-2 border-line-strong flex items-center justify-center text-xs! font-black shrink-0 transition-all ${
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
                  <div className="flex-1 h-1 bg-line-strong/20 mx-2 rounded-sm hidden md:block" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Notice hiển thị lỗi nếu có */}
      <Notice error={error} />

      {/* Main Card Nội Dung Form */}
      <div className="bg-surface border-4 border-line-strong rounded-sm p-6 sm:p-8 shadow-[6px_6px_0_#141413]">
        <form onSubmit={next} className="space-y-8">
          {/* BƯỚC 0: Xác nhận thông tin tài khoản */}
          {step === 0 && (
            <div className="p-6 rounded-sm bg-primary-light border-3 border-line-strong shadow-[4px_4px_0_#141413] space-y-4">
              <div className="flex items-center gap-3">
                <div className="size-11 rounded-sm bg-primary border-2 border-line-strong flex items-center justify-center shadow-[2px_2px_0_#141413] shrink-0">
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

              {/* Hiển thị thông tin phòng đã chọn từ URL nếu có */}
              {preselectedRoomId && selectedRoom && (
                <div className="p-4 rounded-sm bg-primary-light border-3 border-line-strong shadow-[3px_3px_0_#141413] mb-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="text-xs font-extrabold text-text-muted uppercase mb-1">
                        Phòng đã chọn từ danh sách
                      </div>
                      <div className="text-base font-black text-text">
                        Phòng {selectedRoom.roomNumber || selectedRoom.name} -{" "}
                        {selectedRoom.buildingName ||
                          selectedRoom.building?.name}
                      </div>
                      <div className="text-xs font-bold text-text-muted mt-1">
                        {money(getRoomMonthlyPrice(selectedRoom))} / tháng •{" "}
                        {selectedRoom.availableSlots ?? 0} chỗ trống
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => change("roomId", null)}
                      className="text-xs font-bold text-text-muted hover:text-text underline"
                    >
                      Đổi phòng khác
                    </button>
                  </div>
                </div>
              )}

              {loading ? (
                <Loading />
              ) : roomList.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {roomList.map((room) => {
                    const isSelected = values.roomId === room.id;

                    return (
                      <label
                        key={room.id}
                        className={`p-5 rounded-sm border-3 border-line-strong cursor-pointer transition-all flex flex-col justify-between gap-3 ${
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

                          <span className="px-2.5 py-1 bg-warning text-black text-xs font-black rounded-sm border-2 border-line-strong shadow-[1.5px_1.5px_0_#141413]">
                            {room.availableSlots ?? 0} chỗ trống
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t-2 border-line-strong/20">
                          <span className="text-xs font-extrabold text-text-muted">
                            Giá thuê tháng:
                          </span>
                          <span className="text-base font-black text-text">
                            {money(getRoomMonthlyPrice(room))} / tháng
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <Empty text="Hiện tại chưa có phòng trống để đăng ký." />
              )}

              {/* Ghi chú bổ sung */}
              <div className="mt-6">
                <div className="flex items-center justify-between text-sm font-extrabold text-text mb-2">
                  <span>Ghi chú bổ sung</span>
                  <span className="text-xs font-semibold text-text-muted">
                    (Không bắt buộc)
                  </span>
                </div>
                <textarea
                  value={values.note ?? ""}
                  onChange={(e) => change("note", e.target.value)}
                  rows={4}
                  placeholder="Nhập mong muốn hoặc ghi chú cho ban quản lý..."
                  className="w-full border-3 border-line-strong rounded-sm px-4 py-3 text-sm font-bold text-text bg-surface shadow-[2px_2px_0_#141413] focus:shadow-[4px_4px_0_#141413] outline-none resize-none transition-all placeholder:font-medium placeholder:text-text-muted/60"
                />
              </div>
            </div>
          )}

          {/* BƯỚC 2: Kiểm tra thông tin & Gửi hồ sơ */}
          {step === 2 && (
            <div className="space-y-6">
              {/* Static info box about contract terms */}
              <div className="mb-6 p-4 bg-primary/10 border-2 border-primary rounded-sm">
                <p className="text-sm font-bold text-text">
                  ℹ️ Hợp đồng 12 tháng tính từ ngày đơn được duyệt. Tiền cọc = 1 tháng tiền phòng.
                </p>
              </div>

              <div className="flex items-center gap-2 pb-2 border-b-3 border-line-strong">
                <ShieldCheck size={20} className="text-text" />
                <h3 className="text-base font-black text-text">
                  Xác nhận thông tin đăng ký nội trú
                </h3>
              </div>

              <div className="p-6 rounded-sm bg-surface-2 border-3 border-line-strong shadow-[4px_4px_0_#141413] space-y-4">
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
                      {selectedRoom ? money(getRoomMonthlyPrice(selectedRoom)) : "---"}
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
              ) : step === 2 ? (
                <Check size={18} strokeWidth={2.5} />
              ) : (
                <ArrowRight size={18} strokeWidth={2.5} />
              )}
              <span>
                {busy
                  ? "Đang gửi..."
                  : step === 2
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
