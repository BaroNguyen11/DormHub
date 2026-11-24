// ====================================
// APPLICATION SCREEN - Màn hình đăng ký nội trú (Neo-Brutalism)
// ====================================
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  RefreshCw,
  UserCheck,
  BedDouble,
  ShieldCheck,
  FileText,
} from "lucide-react";
import { asList } from "../../api/apiClient";
import { resources } from "../../services/resource.service";
import { money } from "../../utils/format";
import { Notice, Loading, Empty, Heading } from "./UIComponents";
import { useLoad } from "./useLoad";
import usePermissions from "../../hooks/usePermissions";
import useAuth from "../../hooks/useAuth";
import { DialogShell } from "../RequestDialogs";

const getCachedStudentProfile = (user) =>
  user?.studentProfile ||
  user?.student ||
  user?.profile ||
  (user?.studentCode || user?.gender || user?.dateOfBirth || user?.address
    ? user
    : null);

const getRoomMonthlyPrice = (room) =>
  room?.pricePerMonth ?? room?.monthlyPrice ?? room?.price;

const ROOM_TYPES = {
  SINGLE: "Phòng đơn",
  DOUBLE: "Phòng đôi",
  QUAD: "Phòng 4 người",
  SIX_BED: "Phòng 6 người",
  EIGHT_BED: "Phòng 8 người",
};

const isProfileComplete = (profile) =>
  Boolean(
    profile?.studentCode &&
      profile?.gender &&
      profile?.dateOfBirth &&
      profile?.address &&
      /^[0-9]{12}$/.test(profile?.cic || ""),
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
  const preselectedRoomId = searchParams.get("roomId");
  const [step, setStep] = useState(0);
  const [values, setValues] = useState(() => {
    const roomId = Number(preselectedRoomId);
    return { roomId: Number.isSafeInteger(roomId) && roomId > 0 ? roomId : null };
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState(null);
  const [draftLoading, setDraftLoading] = useState(Boolean(values.roomId));
  const [draftError, setDraftError] = useState("");
  const [draftOpen, setDraftOpen] = useState(false);
  const [draftViewed, setDraftViewed] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const { user } = useAuth();

  // Check if student already has a room
  const { hasActiveRoom, checkingRoom } = usePermissions();

  // Reuse profile details already present on the authenticated account.
  const [profile, setProfile] = useState(getCachedStudentProfile(user));
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Fetch the current profile; cached auth data may predate the CCCD update.
  useEffect(() => {
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
  const { data: rooms, error: roomsError, loading } = useLoad("/student/rooms-available");

  const roomList = asList(rooms);
  const selectedRoom = (draft?.room?.id === values.roomId ? draft.room : null)
    || roomList.find((r) => r.id === values.roomId);

  // Check if profile is complete
  const profileComplete = isProfileComplete(profile);

  const steps = [
    "Thông tin SV",
    "Chọn nguyện vọng",
    "Kiểm tra & Gửi",
  ];

  const change = (key, value) => {
    if (key === "roomId") {
      setDraft(null);
      setDraftError("");
      setDraftLoading(Boolean(value));
      setDraftViewed(false);
      setTermsAccepted(false);
      setDraftOpen(false);
    }
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    if (!values.roomId) return undefined;
    let active = true;
    resources.list(`/student/rooms-available/${values.roomId}/contract-draft`)
      .then((result) => { if (active) setDraft(result); })
      .catch(() => { if (active) setDraftError("Không thể tải hợp đồng dự thảo. Vui lòng thử lại sau."); })
      .finally(() => { if (active) setDraftLoading(false); });
    return () => { active = false; };
  }, [values.roomId]);

  async function next(e) {
    e.preventDefault();

    if (step < 2) {
      if (step === 1 && (!selectedRoom || !selectedRoom.isAvailable)) {
        setError("Vui lòng chọn phòng có thể đăng ký.");
        return;
      }
      setError("");
      setStep(step + 1);
      return;
    }

    if (!selectedRoom || !draft || !draft.room?.isAvailable || draft.room?.id !== selectedRoom.id || !draftViewed || !termsAccepted) {
      setError("Vui lòng xem và đồng ý với hợp đồng dự thảo trước khi gửi đơn.");
      return;
    }

    setBusy(true);
    setError("");

    try {
      const payload = {
        roomId: values.roomId,
        note: values.note || undefined,
        contractAccepted: termsAccepted,
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
          description="Bạn cần hoàn thiện thông tin hồ sơ (mã sinh viên, giới tính, ngày sinh, địa chỉ và CCCD 12 chữ số) trước khi đăng ký nội trú."
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
                  Có {roomList.length} phòng phù hợp trong danh sách
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
              ) : roomsError ? (
                <Notice error="Không thể tải danh sách phòng. Vui lòng thử lại sau." />
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
              <div className="mb-6 p-4 bg-primary/10 border-2 border-primary rounded-sm">
                <p className="text-sm font-bold text-text">
                  Hãy xem toàn bộ hợp đồng dự thảo và xác nhận điều khoản trước khi gửi đơn.
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
                        : "—"}
                    </strong>
                  </div>

                  <div>
                    <span className="block text-xs font-extrabold text-text-muted uppercase">
                      Tòa nhà:
                    </span>
                    <strong className="text-base font-black text-text">
                      {selectedRoom?.buildingName || "—"}
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
              <div className="space-y-3 border-t-3 border-line-strong pt-5">
                <button
                  type="button"
                  disabled={draftLoading || !draft || draft.room?.id !== values.roomId}
                  onClick={() => {
                    setDraftOpen(true);
                    setDraftViewed(true);
                  }}
                  className="inline-flex items-center gap-2 border-3 border-line-strong rounded-sm bg-secondary px-4 py-2.5 text-sm font-black text-text shadow-[3px_3px_0_#141413] disabled:opacity-50"
                >
                  <FileText size={18} />
                  {draftLoading ? "Đang tải hợp đồng..." : "Xem hợp đồng dự thảo"}
                </button>
                {draftError && <Notice error={draftError} />}
                <label className="flex items-start gap-3 text-sm font-bold text-text">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    disabled={!draftViewed || draftLoading || !draft}
                    onChange={(event) => setTermsAccepted(event.target.checked)}
                    className="mt-1 size-5 accent-black"
                  />
                  Tôi đã đọc và đồng ý với các điều khoản trong hợp đồng dự thảo của phòng đã chọn.
                </label>
                <p className="text-xs font-semibold text-text-muted">
                  Đây là bản dự thảo; ngày thuê cụ thể được xác định khi quản lý duyệt đơn.
                </p>
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
              disabled={busy || (step === 1 && (!selectedRoom || !selectedRoom.isAvailable)) || (step === 2 && (draftLoading || !draftViewed || !termsAccepted || !draft?.room?.isAvailable || draft?.room?.id !== values.roomId))}
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
      {draftOpen && draft && (
        <DialogShell
          icon={FileText}
          title="Hợp đồng dự thảo"
          subtitle="Bản xem trước trước khi gửi đơn đăng ký"
          onClose={() => setDraftOpen(false)}
        >
          <div role="document" className="max-h-[70vh] space-y-5 overflow-y-auto pr-2 text-sm text-text">
            <div className="text-center">
              <p className="font-black uppercase">Cộng hòa xã hội chủ nghĩa Việt Nam</p>
              <p className="font-bold">Độc lập - Tự do - Hạnh phúc</p>
              <h3 className="mt-4 text-lg font-black uppercase">{draft.title}</h3>
              <p className="font-black text-warning">HỢP ĐỒNG DỰ THẢO — CHƯA PHÁT HÀNH</p>
            </div>
            <section>
              <h4 className="font-black uppercase">Bên A: Đơn vị quản lý ký túc xá (Bên cho thuê)</h4>
              <p>Tên đơn vị: {draft.landlord?.name}</p>
              <p>Người đại diện: {draft.landlord?.representative}</p>
              <p>Chức vụ: {draft.landlord?.position}</p>
              <p>Địa chỉ: {draft.landlord?.address}</p>
              <p>Số điện thoại: {draft.landlord?.phone}</p>
              <p>Email: {draft.landlord?.email}</p>
            </section>
            <section className="space-y-1">
              <h4 className="font-black uppercase">Bên B: Sinh viên (Bên thuê)</h4>
              <p>Họ và tên: {draft.student?.fullName || "Chưa cập nhật"}</p>
              <p>Mã sinh viên: {draft.student?.studentCode || "Chưa cập nhật"}</p>
              <p>CCCD: {draft.student?.cic || "Chưa cập nhật"}</p>
              <p>Giới tính: {draft.student?.gender === "MALE" ? "Nam" : draft.student?.gender === "FEMALE" ? "Nữ" : "Chưa cập nhật"}</p>
              <p>Ngày sinh: {draft.student?.dateOfBirth || "Chưa cập nhật"}</p>
              <p>Điện thoại: {draft.student?.phone || "Chưa cập nhật"}</p>
              <p>Địa chỉ: {draft.student?.address || "Chưa cập nhật"}</p>
              <p>Email: {draft.student?.email || "Chưa cập nhật"}</p>
            </section>
            <section className="space-y-1 border-y-2 border-line-strong py-3">
              <h4 className="font-black uppercase">Thông tin chỗ ở và giá thuê dự kiến</h4>
              <p>Tòa nhà: {draft.room?.buildingName || "—"} ({draft.room?.buildingCode || "—"}) · Địa chỉ: {draft.room?.buildingAddress || "—"}</p>
              <p>Phòng: {draft.room?.roomNumber || "—"} · Tầng: {draft.room?.floor ?? "—"}</p>
              <p>Loại phòng: {ROOM_TYPES[draft.room?.roomType] || "—"} · Sức chứa: {draft.room?.capacity ?? "—"} sinh viên</p>
              <p>Thời hạn: {draft.durationMonths} tháng; ngày bắt đầu và kết thúc xác định khi quản lý duyệt đơn.</p>
              <p>Tiền thuê: {money(draft.monthlyRent)} / tháng</p>
              <p>Tiền đặt cọc: {money(draft.depositAmount)}</p>
            </section>
            <p>{draft.introduction}</p>
            {draft.sections?.map((section) => (
              <section key={section.heading} className="space-y-2">
                <h4 className="font-black">{section.heading}</h4>
                {section.paragraphs?.map((paragraph) => <p key={paragraph} className="leading-relaxed">{paragraph}</p>)}
              </section>
            ))}
            <p className="border-t-2 border-line-strong pt-3 text-xs font-bold">{draft.signatureNote}</p>
          </div>
        </DialogShell>
      )}
    </div>
  );
}
