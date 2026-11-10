import { useState, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Search,
  Home,
  Users,
  DollarSign,
  Building2,
  Wind,
  Wifi,
  Droplet,
  X,
} from "lucide-react";
import { useLoad } from "../../../components/Screen/useLoad";
import { StatusBadge } from "../../../components/ui";
import { CustomSelect } from "../../../components/ui/CustomSelect";
import GuestLayout from "../../../layouts/GuestLayout";

function RoomList() {
  const location = useLocation();

  // Filter states
  const [search, setSearch] = useState("");
  const [buildingFilter, setBuildingFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [roomTypeFilter, setRoomTypeFilter] = useState("");

  // Fetch rooms data
  const { data: rawData, error, loading } = useLoad("/rooms/available", {});

  // Normalize data to array
  const rooms = useMemo(() => {
    return Array.isArray(rawData)
      ? rawData
      : rawData?.content || rawData?.items || [];
  }, [rawData]);

  // Extract unique filter options cho CustomSelect
  const { buildingOptions, statusOptions, roomTypeOptions } = useMemo(() => {
    const rawBuildings = [...new Set(rooms.map((r) => r.buildingName).filter(Boolean))];
    const rawStatuses = [...new Set(rooms.map((r) => r.status).filter(Boolean))];
    const rawTypes = [...new Set(rooms.map((r) => r.roomType).filter(Boolean))];

    return {
      buildingOptions: [
        { value: "", label: "Tất cả tòa nhà" },
        ...rawBuildings.map((b) => ({ value: b, label: b })),
      ],
      statusOptions: [
        { value: "", label: "Tất cả trạng thái" },
        ...rawStatuses.map((s) => ({ value: s, label: s })),
      ],
      roomTypeOptions: [
        { value: "", label: "Tất cả loại phòng" },
        ...rawTypes.map((t) => ({ value: t, label: t })),
      ],
    };
  }, [rooms]);

  // Client-side filtering
  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const matchSearch =
        !search ||
        room.roomNumber?.toLowerCase().includes(search.toLowerCase()) ||
        room.buildingName?.toLowerCase().includes(search.toLowerCase());

      const matchBuilding =
        !buildingFilter || room.buildingName === buildingFilter;
      const matchStatus = !statusFilter || room.status === statusFilter;
      const matchRoomType =
        !roomTypeFilter || room.roomType === roomTypeFilter;

      return matchSearch && matchBuilding && matchStatus && matchRoomType;
    });
  }, [rooms, search, buildingFilter, statusFilter, roomTypeFilter]);

  const resetFilters = () => {
    setSearch("");
    setBuildingFilter("");
    setStatusFilter("");
    setRoomTypeFilter("");
  };

  const hasActiveFilters = Boolean(
    search || buildingFilter || statusFilter || roomTypeFilter
  );

  return (
    <div className="space-y-6 m-6">
      {/* Filters Section */}
      <div className="bg-surface border-4 border-line-strong rounded-md p-5 shadow-[6px_6px_0_#141413] space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          {/* Search Bar */}
          <div>
            <label className="block text-xs font-extrabold text-text-muted uppercase mb-1.5">
              Tìm kiếm
            </label>
            <div className="relative">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
                size={18}
                strokeWidth={2.5}
              />
              <input
                type="text"
                placeholder="Tìm mã phòng, tòa..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border-3 border-line-strong rounded-sm text-sm! font-extrabold text-text bg-surface shadow-[2px_2px_0_#141413] focus:shadow-[4px_4px_0_#141413] outline-none! transition-all"
              />
            </div>
          </div>

          {/* Building Filter với CustomSelect */}
          <div>
            <label className="block text-xs font-extrabold text-text-muted uppercase mb-1.5">
              Tòa nhà
            </label>
            <CustomSelect
              value={buildingFilter}
              onChange={setBuildingFilter}
              options={buildingOptions}
              placeholder="Tất cả tòa nhà"
            />
          </div>

          {/* Room Type Filter với CustomSelect */}
          <div>
            <label className="block text-xs font-extrabold text-text-muted uppercase mb-1.5">
              Loại phòng
            </label>
            <CustomSelect
              value={roomTypeFilter}
              onChange={setRoomTypeFilter}
              options={roomTypeOptions}
              placeholder="Tất cả loại phòng"
            />
          </div>

          {/* Status Filter với CustomSelect */}
          <div>
            <label className="block text-xs font-extrabold text-text-muted uppercase mb-1.5">
              Trạng thái
            </label>
            <CustomSelect
              value={statusFilter}
              onChange={setStatusFilter}
              options={statusOptions}
              placeholder="Tất cả trạng thái"
            />
          </div>
        </div>

        {/* Reset Button */}
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-3 text-text font-extrabold! text-xs! rounded-sm border-2 border-line-strong shadow-[2px_2px_0_#141413] hover:shadow-[3px_3px_0_#141413] transition-all cursor-pointer"
          >
            <X size={14} strokeWidth={2.5} />
            Xóa bộ lọc
          </button>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-error-light border-3 border-error rounded-md p-4">
          <p className="text-sm font-bold text-error">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-surface border-4 border-line-strong rounded-md overflow-hidden shadow-[6px_6px_0_#141413] animate-pulse"
            >
              <div className="h-48 bg-surface-3"></div>
              <div className="p-6 space-y-3">
                <div className="h-6 bg-surface-3 rounded-sm"></div>
                <div className="h-4 bg-surface-3 rounded-sm w-2/3"></div>
                <div className="h-4 bg-surface-3 rounded-sm w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredRooms.length === 0 && (
        <div className="bg-surface border-4 border-line-strong rounded-md p-12 text-center shadow-[6px_6px_0_#141413]">
          <Home
            size={64}
            className="mx-auto text-text-subtle mb-4"
            strokeWidth={2}
          />
          <h3 className="text-xl font-black text-text mb-2">
            Không tìm thấy phòng
          </h3>
          <p className="text-sm text-text-muted font-bold">
            {hasActiveFilters
              ? "Thử điều chỉnh bộ lọc để xem thêm kết quả"
              : "Hiện tại chưa có phòng nào khả dụng"}
          </p>
        </div>
      )}

      {/* Room Grid */}
      {!loading && filteredRooms.length > 0 && (
        <>
          <p className="text-sm font-extrabold text-text-muted">
            Tìm thấy {filteredRooms.length} phòng
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => (
              <RoomCard key={room.id} room={room} location={location} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Room Card Component
function RoomCard({ room, location }) {
  const navigate = useNavigate();

  const imageUrl =
    room.imageUrl ||
    "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&h=600&fit=crop";

  const amenities = [
    room.hasAC && { icon: Wind, label: "AC" },
    room.hasWifi && { icon: Wifi, label: "WiFi" },
    room.hasPrivateBathroom && { icon: Droplet, label: "WC riêng" },
  ].filter(Boolean);

  return (
    <div className="bg-surface border-4 border-line-strong rounded-md overflow-hidden shadow-[6px_6px_0_#141413] hover:shadow-[8px_8px_0_#141413] hover:-translate-y-1 transition-all duration-200 group">
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden bg-surface-3">
        <img
          src={imageUrl}
          alt={room.roomNumber}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src =
              "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&h=600&fit=crop";
          }}
        />
        <div className="absolute top-3 right-3">
          <StatusBadge status={room.status} />
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 space-y-4">
        {/* Header */}
        <div>
          <h3 className="text-xl font-black text-text mb-1">
            Phòng {room.roomNumber}
          </h3>
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <Building2 size={14} strokeWidth={2.5} />
            <span className="font-bold">{room.buildingName}</span>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-sm bg-primary/10 border-2 border-line-strong flex items-center justify-center">
              <Users size={14} className="text-primary" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-text-muted uppercase">
                Sức chứa
              </p>
              <p className="text-sm font-black text-text">
                {room.currentOccupancy || 0}/{room.capacity || 0}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="size-8 rounded-sm bg-success/10 border-2 border-line-strong flex items-center justify-center">
              <DollarSign size={14} className="text-success" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-text-muted uppercase">
                Giá/tháng
              </p>
              <p className="text-sm font-black text-text">
                {room.pricePerMonth?.toLocaleString("vi-VN") || "N/A"}đ
              </p>
            </div>
          </div>
        </div>

        {/* Amenities */}
        {amenities.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t-2 border-line-strong/20">
            {amenities.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-1 px-2 py-1 bg-surface-3 rounded-sm border border-line-strong"
              >
                <Icon size={12} strokeWidth={2.5} />
                <span className="text-[10px] font-bold">{label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons (Bo góc rounded-sm chuẩn Workspace) */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => navigate(`/rooms/${room.id}`)}
            className="px-4 py-2.5 bg-surface-3 text-text font-extrabold! text-sm! rounded-sm border-3 border-line-strong shadow-[3px_3px_0_#141413] hover:shadow-[5px_5px_0_#141413] hover:-translate-0.5 active:translate-0.5 active:shadow-none transition-all cursor-pointer"
          >
            Xem chi tiết
          </button>
          <Link
            to={`/login?redirect=${encodeURIComponent(location.pathname)}`}
            className="px-4 py-2.5 bg-primary text-black font-extrabold! text-sm! rounded-sm border-3 border-line-strong shadow-[3px_3px_0_#141413] hover:shadow-[5px_5px_0_#141413] hover:-translate-0.5 active:translate-0.5 active:shadow-none transition-all text-center"
          >
            Đăng ký
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RoomListPage() {
  return (
    <GuestLayout title="Tìm phòng ký túc xá">
      <RoomList />
    </GuestLayout>
  );
}