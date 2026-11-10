import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  Users,
  DollarSign,
  Maximize2,
  Layers,
  Wind,
  Wifi,
  Droplet,
  MapPin,
  CheckCircle2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { resources } from "../../../services/resource.service";
import { StatusBadge } from "../../../components/ui";
import { errorMessage } from "../../../utils/errorHandler";
import GuestLayout from "../../../layouts/GuestLayout";

function RoomDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    let active = true;
    async function fetchRoom() {
      if (active) {
        setLoading(true);
        setError("");
      }
      try {
        const data = await resources.get("/rooms", id);
        if (active) setRoom(data);
      } catch (err) {
        if (active) setError(errorMessage(err));
      } finally {
        if (active) setLoading(false);
      }
    }
    void fetchRoom();
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6 m-6">
        <div className="h-10 w-32 bg-surface-3 border-3 border-line-strong rounded-sm animate-pulse"></div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <div className="h-96 bg-surface-3 border-4 border-line-strong rounded-md animate-pulse"></div>
            <div className="h-64 bg-surface-3 border-4 border-line-strong rounded-md animate-pulse"></div>
          </div>
          <div className="lg:col-span-4">
            <div className="h-96 bg-surface-3 border-4 border-line-strong rounded-md animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="space-y-6 m-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-surface text-text font-extrabold text-sm rounded-sm border-3 border-line-strong shadow-[3px_3px_0_#141413] hover:shadow-[5px_5px_0_#141413] hover:-translate-0.5 active:translate-0.5 active:shadow-none transition-all cursor-pointer"
        >
          <ArrowLeft size={18} strokeWidth={2.5} />
          Quay lại
        </button>
        <div className="bg-error-light border-3 border-error rounded-md p-8 text-center shadow-[4px_4px_0_#141413]">
          <h3 className="text-xl font-black text-error mb-2">Lỗi tải dữ liệu</h3>
          <p className="text-sm font-bold text-text-muted">
            {error || "Không tìm thấy phòng"}
          </p>
        </div>
      </div>
    );
  }

  const images =
    room.images?.length > 0
      ? room.images
      : [
          "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1200&h=800&fit=crop",
          "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1200&h=800&fit=crop",
          "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=1200&h=800&fit=crop",
        ];

  const amenities = [
    { icon: Wind, label: "Điều hòa", available: room.hasAC },
    { icon: Wifi, label: "WiFi miễn phí", available: room.hasWifi },
    { icon: Droplet, label: "WC riêng", available: room.hasPrivateBathroom },
    { icon: MapPin, label: "Ban công", available: room.hasBalcony },
  ].filter((a) => a.available);

  return (
    <div className="space-y-6 m-6">
      {/* Header Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-surface text-text font-extrabold! text-sm! rounded-sm border-3 border-line-strong shadow-[3px_3px_0_#141413] hover:shadow-[5px_5px_0_#141413] hover:-translate-0.5 active:translate-0.5 active:shadow-none transition-all cursor-pointer"
        >
          <ArrowLeft size={18} strokeWidth={2.5} />
          Quay lại
        </button>
      </div>

      {/* 2 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column - Main Content (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Image Gallery */}
          <div className="bg-surface border-4 border-line-strong rounded-md overflow-hidden shadow-[6px_6px_0_#141413]">
            {/* Main Image */}
            <div className="relative h-96 bg-surface-3">
              <img
                src={images[selectedImage]}
                alt={`Phòng ${room.roomNumber}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src =
                    "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1200&h=800&fit=crop";
                }}
              />
              {/* Status Badge Overlay */}
              <div className="absolute top-4 right-4">
                <StatusBadge status={room.status} />
              </div>
            </div>

            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="p-4 bg-surface-2 border-t-3 border-line-strong">
                <div className="flex gap-3 overflow-x-auto">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`shrink-0 w-20 h-20 rounded-sm border-3 overflow-hidden transition-all cursor-pointer ${
                        selectedImage === idx
                          ? "border-primary shadow-[3px_3px_0_#141413] -translate-y-0.5"
                          : "border-line-strong opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Ảnh ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Room Info Card */}
          <div className="bg-surface border-4 border-line-strong rounded-md p-8 shadow-[6px_6px_0_#141413]">
            {/* Header */}
            <div className="flex items-start justify-between mb-6 pb-6 border-b-3 border-line-strong">
              <div>
                <h1 className="text-3xl font-black text-text mb-2">
                  Phòng {room.roomNumber}
                </h1>
                <div className="flex items-center gap-2 text-text-muted">
                  <Building2 size={18} strokeWidth={2.5} />
                  <span className="font-extrabold">{room.buildingName}</span>
                </div>
              </div>
            </div>

            {/* Specs Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
              {/* Capacity */}
              <div className="space-y-2">
                <div className="size-12 rounded-sm bg-primary/10 border-2 border-line-strong flex items-center justify-center shadow-[2px_2px_0_#141413]">
                  <Users size={20} className="text-primary" strokeWidth={2.5} />
                </div>
                <p className="text-xs font-extrabold text-text-muted uppercase">
                  Sức chứa
                </p>
                <p className="text-xl font-black text-text">
                  {room.currentOccupancy || 0}/{room.capacity || 0}
                </p>
              </div>

              {/* Price */}
              <div className="space-y-2">
                <div className="size-12 rounded-sm bg-success/10 border-2 border-line-strong flex items-center justify-center shadow-[2px_2px_0_#141413]">
                  <DollarSign
                    size={20}
                    className="text-success"
                    strokeWidth={2.5}
                  />
                </div>
                <p className="text-xs font-extrabold text-text-muted uppercase">
                  Giá/tháng
                </p>
                <p className="text-xl font-black text-text">
                  {room.pricePerMonth?.toLocaleString("vi-VN")}đ
                </p>
              </div>

              {/* Floor */}
              <div className="space-y-2">
                <div className="size-12 rounded-sm bg-warning/10 border-2 border-line-strong flex items-center justify-center shadow-[2px_2px_0_#141413]">
                  <Layers
                    size={20}
                    className="text-warning"
                    strokeWidth={2.5}
                  />
                </div>
                <p className="text-xs font-extrabold text-text-muted uppercase">
                  Tầng
                </p>
                <p className="text-xl font-black text-text">
                  {room.floor || "N/A"}
                </p>
              </div>

              {/* Area */}
              <div className="space-y-2">
                <div className="size-12 rounded-sm bg-accent/10 border-2 border-line-strong flex items-center justify-center shadow-[2px_2px_0_#141413]">
                  <Maximize2
                    size={20}
                    className="text-accent"
                    strokeWidth={2.5}
                  />
                </div>
                <p className="text-xs font-extrabold text-text-muted uppercase">
                  Diện tích
                </p>
                <p className="text-xl font-black text-text">
                  {room.area || "N/A"}m²
                </p>
              </div>
            </div>

            {/* Amenities */}
            {amenities.length > 0 && (
              <div className="mb-6 pb-6 border-b-3 border-line-strong">
                <h3 className="text-lg font-black text-text mb-4">Tiện ích</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {amenities.map(({ icon: Icon, label }, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 p-3 bg-surface-2 border-2 border-line-strong rounded-sm shadow-[2px_2px_0_#141413]"
                    >
                      <div className="size-9 rounded-sm bg-success/10 border-2 border-line-strong flex items-center justify-center shrink-0">
                        <Icon
                          size={16}
                          className="text-success"
                          strokeWidth={2.5}
                        />
                      </div>
                      <span className="text-sm font-extrabold text-text">
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <h3 className="text-lg font-black text-text mb-3">Mô tả</h3>
              <p className="text-sm text-text-muted font-bold leading-relaxed">
                {room.description ||
                  "Phòng ký túc xá hiện đại, đầy đủ tiện nghi, an ninh 24/7. Vị trí thuận lợi gần khu vực học tập và sinh hoạt chung."}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column - Action Card Sticky (4 cols) */}
        <div className="lg:col-span-4">
          <div className="bg-surface border-4 border-line-strong rounded-md p-6 shadow-[6px_6px_0_#141413] sticky top-6">
            {/* Price Highlight */}
            <div className="mb-6 pb-6 border-b-3 border-line-strong">
              <p className="text-xs font-extrabold text-text-muted uppercase mb-1">
                Giá thuê
              </p>
              <p className="text-3xl font-black text-primary">
                {room.pricePerMonth?.toLocaleString("vi-VN")}đ
              </p>
              <p className="text-xs font-extrabold text-text-muted mt-0.5">
                / tháng
              </p>
            </div>

            {/* Quick Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between py-1.5">
                <span className="text-sm font-extrabold text-text-muted">
                  Trạng thái
                </span>
                <StatusBadge status={room.status} />
              </div>
              <div className="flex items-center justify-between py-1.5 border-t border-line-strong/20">
                <span className="text-sm font-extrabold text-text-muted">
                  Loại phòng
                </span>
                <span className="text-sm font-black text-text">
                  {room.roomType || "Tiêu chuẩn"}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-t border-line-strong/20">
                <span className="text-sm font-extrabold text-text-muted">
                  Chỗ trống
                </span>
                <span className="text-sm font-black text-text">
                  {Math.max(
                    0,
                    (room.capacity || 0) - (room.currentOccupancy || 0)
                  )}{" "}
                  chỗ
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Link
                to={`/login?redirect=${encodeURIComponent(location.pathname)}`}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-2 bg-primary text-black font-extrabold text-sm rounded-sm border-3 border-line-strong shadow-[3px_3px_0_#141413] hover:shadow-[5px_5px_0_#141413] hover:-translate-0.5 active:translate-0.5 active:shadow-none transition-all text-center"
              >
                <CheckCircle2 size={18} strokeWidth={2.5} />
                Đăng ký phòng này
              </Link>

              <button
                onClick={() => navigate(-1)}
                className="w-full px-6 py-2 bg-surface-3 text-text font-extrabold! text-sm! rounded-sm border-3 border-line-strong shadow-[3px_3px_0_#141413] hover:shadow-[5px_5px_0_#141413] hover:-translate-0.5 active:translate-0.5 active:shadow-none transition-all cursor-pointer"
              >
                Quay lại danh sách
              </button>
            </div>

            {/* Help Text */}
            <p className="text-xs font-bold text-text-muted mt-4 text-center leading-relaxed">
              Cần đăng nhập để đăng ký phòng ký túc xá
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RoomDetailPage() {
  return (
    <GuestLayout title="Chi tiết phòng">
      <RoomDetail />
    </GuestLayout>
  );
}
