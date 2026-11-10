import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Home, Users, DollarSign, Building2, Wind, Wifi, Droplet, X } from "lucide-react";
import { useLoad } from "../../../components/Screen/useLoad";
import { StatusBadge } from "../../../components/ui";
import { CustomSelect } from "../../../components/ui/CustomSelect";
import StudentLayout from "../../../layouts/StudentLayout";

function RoomFinderContent() {
  
  // Filter states
  const [search, setSearch] = useState("");
  const [buildingFilter, setBuildingFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [roomTypeFilter, setRoomTypeFilter] = useState("");

  // Fetch rooms data (student endpoint)
  const { data: rawData, error, loading } = useLoad("/student/rooms-available", {});
  
  // Normalize data to array
  const rooms = Array.isArray(rawData) 
    ? rawData 
    : rawData?.content || rawData?.items || [];

  // Client-side filtering
  const filteredRooms = rooms.filter((room) => {
    const matchSearch = !search || 
      room.roomNumber?.toLowerCase().includes(search.toLowerCase()) ||
      room.buildingName?.toLowerCase().includes(search.toLowerCase());
    
    const matchBuilding = !buildingFilter || room.buildingName === buildingFilter;
    const matchStatus = !statusFilter || room.status === statusFilter;
    const matchRoomType = !roomTypeFilter || room.roomType === roomTypeFilter;

    return matchSearch && matchBuilding && matchStatus && matchRoomType;
  });

  // Extract unique values for filters
  const buildings = [...new Set(rooms.map(r => r.buildingName).filter(Boolean))];
  const statuses = [...new Set(rooms.map(r => r.status).filter(Boolean))];
  const roomTypes = [...new Set(rooms.map(r => r.roomType).filter(Boolean))];

  // Reset filters
  const resetFilters = () => {
    setSearch("");
    setBuildingFilter("");
    setStatusFilter("");
    setRoomTypeFilter("");
  };

  const hasActiveFilters = search || buildingFilter || statusFilter || roomTypeFilter;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-text">Tìm phòng phù hợp</h1>
          <p className="text-sm text-text-muted mt-1">
            Chọn phòng theo giới tính và đăng ký nội trú
          </p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-surface border-4 border-line-strong rounded-sm p-6 shadow-[6px_6px_0_#141413]">
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={20} strokeWidth={2.5} />
          <input
            type="text"
            placeholder="Tìm theo mã phòng hoặc tòa nhà..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-3 border-line-strong rounded-sm font-bold text-sm outline-none! transition-all focus:ring-4 focus:ring-primary/20 bg-surface"
          />
        </div>

        {/* Filter Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Building Filter */}
          <div>
            <label className="block text-xs font-extrabold text-text-muted uppercase mb-2">
              Tòa nhà
            </label>
            <CustomSelect
              value={buildingFilter}
              onChange={setBuildingFilter}
              options={buildings}
              placeholder="Tất cả"
            />
          </div>

          {/* Room Type Filter */}
          <div>
            <label className="block text-xs font-extrabold text-text-muted uppercase mb-2">
              Loại phòng
            </label>
            <CustomSelect
              value={roomTypeFilter}
              onChange={setRoomTypeFilter}
              options={roomTypes}
              placeholder="Tất cả"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-xs font-extrabold text-text-muted uppercase mb-2">
              Trạng thái
            </label>
            <CustomSelect
              value={statusFilter}
              onChange={setStatusFilter}
              options={statuses}
              placeholder="Tất cả"
            />
          </div>
        </div>

        {/* Reset Button */}
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-surface-3 text-text font-bold! text-sm! rounded-sm border-2 border-line-strong hover:shadow-[2px_2px_0_#141413] transition-all"
          >
            <X size={16} strokeWidth={2.5} />
            Xóa bộ lọc
          </button>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-error-light border-3 border-error rounded-sm p-4">
          <p className="text-sm font-bold text-error">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-surface border-4 border-line-strong rounded-sm overflow-hidden shadow-[6px_6px_0_#141413] animate-pulse">
              <div className="h-48 bg-surface-3"></div>
              <div className="p-6 space-y-3">
                <div className="h-6 bg-surface-3 rounded"></div>
                <div className="h-4 bg-surface-3 rounded w-2/3"></div>
                <div className="h-4 bg-surface-3 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredRooms.length === 0 && (
        <div className="bg-surface border-4 border-line-strong rounded-sm p-12 text-center shadow-[6px_6px_0_#141413]">
          <Home size={64} className="mx-auto text-text-subtle mb-4" strokeWidth={2} />
          <h3 className="text-xl font-black text-text mb-2">Không tìm thấy phòng</h3>
          <p className="text-sm text-text-muted">
            {hasActiveFilters 
              ? "Thử điều chỉnh bộ lọc để xem thêm kết quả" 
              : "Hiện tại chưa có phòng nào phù hợp với giới tính của bạn"}
          </p>
        </div>
      )}

      {/* Room Grid */}
      {!loading && filteredRooms.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-text-muted">
              Tìm thấy {filteredRooms.length} phòng phù hợp
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => (
              <StudentRoomCard key={room.id} room={room} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Student Room Card Component
function StudentRoomCard({ room }) {
  const navigate = useNavigate();
  
  // Placeholder image if no image available
  const imageUrl = room.imageUrl || `https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&h=600&fit=crop`;

  return (
    <div className="bg-surface border-4 border-line-strong rounded-sm overflow-hidden shadow-[6px_6px_0_#141413] hover:shadow-[8px_8px_0_#141413] hover:-translate-y-1 transition-all duration-200 group">
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden bg-surface-3">
        <img
          src={imageUrl}
          alt={room.roomNumber}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&h=600&fit=crop";
          }}
        />
        {/* Status Badge Overlay */}
        <div className="absolute top-3 right-3">
          <StatusBadge status={room.status} />
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 space-y-4">
        {/* Room Header */}
        <div>
          <h3 className="text-xl font-black text-text mb-1">
            Phòng {room.roomNumber}
          </h3>
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <Building2 size={14} strokeWidth={2.5} />
            <span className="font-bold">{room.buildingName}</span>
          </div>
        </div>

        {/* Room Info Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Capacity */}
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-sm bg-primary/10 border-2 border-line-strong flex items-center justify-center">
              <Users size={14} className="text-primary" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-text-muted uppercase">Sức chứa</p>
              <p className="text-sm font-black text-text">
                {room.currentOccupancy || 0}/{room.capacity || 0}
              </p>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-sm bg-success/10 border-2 border-line-strong flex items-center justify-center">
              <DollarSign size={14} className="text-success" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-text-muted uppercase">Giá/tháng</p>
              <p className="text-sm font-black text-text">
                {room.pricePerMonth?.toLocaleString("vi-VN") || "N/A"}đ
              </p>
            </div>
          </div>
        </div>

        {/* Amenities (if available) */}
        {(room.hasAC || room.hasWifi || room.hasBalcony || room.hasPrivateBathroom) && (
          <div className="flex flex-wrap gap-2 pt-2 border-t-2 border-line-strong/20">
            {room.hasAC && (
              <div className="flex items-center gap-1 px-2 py-1 bg-surface-3 rounded-sm border border-line-strong">
                <Wind size={12} strokeWidth={2.5} />
                <span className="text-[10px] font-bold">AC</span>
              </div>
            )}
            {room.hasWifi && (
              <div className="flex items-center gap-1 px-2 py-1 bg-surface-3 rounded-sm border border-line-strong">
                <Wifi size={12} strokeWidth={2.5} />
                <span className="text-[10px] font-bold">WiFi</span>
              </div>
            )}
            {room.hasPrivateBathroom && (
              <div className="flex items-center gap-1 px-2 py-1 bg-surface-3 rounded-sm border border-line-strong">
                <Droplet size={12} strokeWidth={2.5} />
                <span className="text-[10px] font-bold">WC riêng</span>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => navigate(`/student/rooms/${room.id}`)}
            className="px-4 py-2 bg-surface-3 text-text font-extrabold! text-sm! rounded-sm border-3 border-line-strong shadow-[3px_3px_0_#141413] hover:shadow-[5px_5px_0_#141413] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none transition-all"
          >
            Xem chi tiết
          </button>
          <button
            onClick={() => navigate(`/student/applications/new?roomId=${room.id}`)}
            className="px-4 py-2 bg-primary text-black font-extrabold! text-sm! rounded-sm border-3 border-line-strong shadow-[3px_3px_0_#141413] hover:shadow-[5px_5px_0_#141413] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none transition-all text-center"
          >
            Đăng ký
          </button>
        </div>
      </div>
    </div>
  );
}

// Export với StudentLayout wrapper
export default function RoomFinderPage() {
  return (
    <StudentLayout title="Tìm phòng">
      <RoomFinderContent />
    </StudentLayout>
  );
}
