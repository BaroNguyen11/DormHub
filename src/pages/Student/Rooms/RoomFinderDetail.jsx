import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Building2, Users, DollarSign, Maximize2, Layers, Wind, Wifi, Droplet, MapPin, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { resources } from "../../../services/resource.service";
import { StatusBadge } from "../../../components/ui";
import { errorMessage } from "../../../utils/errorHandler";
import StudentLayout from "../../../layouts/StudentLayout";

function RoomDetailContent() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);

  // DEBUG: Log khi component mount và khi id thay đổi
  useEffect(() => {
    console.log("🏠 RoomFinderDetail mounted/updated:", {
      id,
      idType: typeof id,
      pathname: window.location.pathname,
      search: window.location.search,
    });
  }, [id]);

  useEffect(() => {
    async function fetchRoom() {
      console.log("📡 Fetching room details for id:", id);
      
      if (!id) {
        console.error("❌ Room ID is undefined! Not fetching.");
        setError("Không tìm thấy mã phòng");
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError("");
      try {
        // Student endpoint
        console.log("📤 GET /student/rooms-available/" + id);
        const data = await resources.get("/student/rooms-available", id);
        console.log("✅ Room data received:", data);
        setRoom(data);
      } catch (err) {
        console.error("❌ Failed to fetch room:", err);
        setError(errorMessage(err));
      } finally {
        setLoading(false);
      }
    }
    fetchRoom();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-12 bg-surface-3 rounded-sm animate-pulse"></div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <div className="h-96 bg-surface-3 rounded-sm animate-pulse"></div>
            <div className="h-64 bg-surface-3 rounded-sm animate-pulse"></div>
          </div>
          <div className="lg:col-span-4">
            <div className="h-96 bg-surface-3 rounded-sm animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-surface border-3 border-line-strong rounded-sm font-bold hover:shadow-[3px_3px_0_#141413] transition-all"
        >
          <ArrowLeft size={18} strokeWidth={2.5} />
          Quay lại
        </button>
        <div className="bg-error-light border-3 border-error rounded-sm p-8 text-center">
          <h3 className="text-xl font-black text-error mb-2">Lỗi tải dữ liệu</h3>
          <p className="text-sm text-text-muted">{error || "Không tìm thấy phòng"}</p>
        </div>
      </div>
    );
  }

  // Mock images if not provided
  const images = room.images?.length > 0 
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
  ].filter(a => a.available);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-surface text-text font-extrabold text-sm rounded-sm border-3 border-line-strong shadow-[3px_3px_0_#141413] hover:shadow-[5px_5px_0_#141413] hover:-translate-y-0.5 transition-all"
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
          <div className="bg-surface border-4 border-line-strong rounded-sm overflow-hidden shadow-[6px_6px_0_#141413]">
            {/* Main Image */}
            <div className="relative h-96 bg-surface-3">
              <img
                src={images[selectedImage]}
                alt={`Phòng ${room.roomNumber}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1200&h=800&fit=crop";
                }}
              />
              {/* Status Badge Overlay */}
              <div className="absolute top-4 right-4">
                <StatusBadge status={room.status} className="text-sm px-4 py-2" />
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
                      className={`flex-shrink-0 w-20 h-20 rounded-sm border-3 overflow-hidden transition-all ${
                        selectedImage === idx
                          ? "border-primary shadow-[3px_3px_0_#141413]"
                          : "border-line-strong opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img src={img} alt={`Ảnh ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Room Info Card */}
          <div className="bg-surface border-4 border-line-strong rounded-sm p-8 shadow-[6px_6px_0_#141413]">
            {/* Header */}
            <div className="flex items-start justify-between mb-6 pb-6 border-b-3 border-line-strong">
              <div>
                <h1 className="text-3xl font-black text-text mb-2">
                  Phòng {room.roomNumber}
                </h1>
                <div className="flex items-center gap-2 text-text-muted">
                  <Building2 size={18} strokeWidth={2.5} />
                  <span className="font-bold">{room.buildingName}</span>
                </div>
              </div>
            </div>

            {/* Specs Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
              {/* Capacity */}
              <div className="space-y-2">
                <div className="size-12 rounded-sm bg-primary/10 border-2 border-line-strong flex items-center justify-center">
                  <Users size={20} className="text-primary" strokeWidth={2.5} />
                </div>
                <p className="text-xs font-bold text-text-muted uppercase">Sức chứa</p>
                <p className="text-xl font-black text-text">
                  {room.currentOccupancy || 0}/{room.capacity || 0}
                </p>
              </div>

              {/* Price */}
              <div className="space-y-2">
                <div className="size-12 rounded-sm bg-success/10 border-2 border-line-strong flex items-center justify-center">
                  <DollarSign size={20} className="text-success" strokeWidth={2.5} />
                </div>
                <p className="text-xs font-bold text-text-muted uppercase">Giá/tháng</p>
                <p className="text-xl font-black text-text">
                  {room.pricePerMonth?.toLocaleString("vi-VN")}đ
                </p>
              </div>

              {/* Floor */}
              <div className="space-y-2">
                <div className="size-12 rounded-sm bg-warning/10 border-2 border-line-strong flex items-center justify-center">
                  <Layers size={20} className="text-warning" strokeWidth={2.5} />
                </div>
                <p className="text-xs font-bold text-text-muted uppercase">Tầng</p>
                <p className="text-xl font-black text-text">
                  {room.floor || "N/A"}
                </p>
              </div>

              {/* Area */}
              <div className="space-y-2">
                <div className="size-12 rounded-sm bg-accent/10 border-2 border-line-strong flex items-center justify-center">
                  <Maximize2 size={20} className="text-accent" strokeWidth={2.5} />
                </div>
                <p className="text-xs font-bold text-text-muted uppercase">Diện tích</p>
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
                    <div key={idx} className="flex items-center gap-3 p-3 bg-surface-2 border-2 border-line-strong rounded-sm">
                      <div className="size-10 rounded-sm bg-success/10 border-2 border-line-strong flex items-center justify-center flex-shrink-0">
                        <Icon size={18} className="text-success" strokeWidth={2.5} />
                      </div>
                      <span className="text-sm font-bold text-text">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <h3 className="text-lg font-black text-text mb-3">Mô tả</h3>
              <p className="text-sm text-text-muted leading-relaxed">
                {room.description || "Phòng ký túc xá hiện đại, đầy đủ tiện nghi, an ninh 24/7. Vị trí thuận lợi gần khu vực học tập và sinh hoạt chung."}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column - Action Card Sticky (4 cols) */}
        <div className="lg:col-span-4">
          <div className="bg-surface border-4 border-line-strong rounded-sm p-6 shadow-[6px_6px_0_#141413] sticky top-6">
            {/* Price Highlight */}
            <div className="mb-6 pb-6 border-b-3 border-line-strong">
              <p className="text-sm font-bold text-text-muted uppercase mb-2">Giá thuê</p>
              <p className="text-4xl font-black text-primary">
                {room.pricePerMonth?.toLocaleString("vi-VN")}đ
              </p>
              <p className="text-sm font-bold text-text-muted mt-1">/ tháng</p>
            </div>

            {/* Quick Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between py-2">
                <span className="text-sm font-bold text-text-muted">Trạng thái</span>
                <StatusBadge status={room.status} />
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm font-bold text-text-muted">Loại phòng</span>
                <span className="text-sm font-black text-text">{room.roomType || "Tiêu chuẩn"}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm font-bold text-text-muted">Chỗ trống</span>
                <span className="text-sm font-black text-text">
                  {(room.capacity - room.currentOccupancy) || 0} chỗ
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => navigate(`/student/applications/new?roomId=${room.id}`)}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-primary text-black font-extrabold text-base rounded-sm border-3 border-line-strong shadow-[4px_4px_0_#141413] hover:shadow-[6px_6px_0_#141413] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none transition-all"
              >
                <CheckCircle2 size={20} strokeWidth={2.5} />
                Đăng ký phòng này
              </button>
              
              <button
                onClick={() => navigate(-1)}
                className="w-full px-6 py-3 bg-surface-3 text-text font-bold text-sm rounded-sm border-3 border-line-strong hover:shadow-[3px_3px_0_#141413] transition-all"
              >
                Quay lại danh sách
              </button>
            </div>

            {/* Help Text */}
            <p className="text-xs text-text-muted mt-6 text-center leading-relaxed">
              Chọn phòng phù hợp và gửi đơn đăng ký nội trú
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Export với StudentLayout wrapper
export default function RoomFinderDetailPage() {
  return (
    <StudentLayout title="Chi tiết phòng">
      <RoomDetailContent />
    </StudentLayout>
  );
}
