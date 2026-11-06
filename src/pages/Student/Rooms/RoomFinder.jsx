import { useEffect, useMemo, useRef, useState } from 'react';
import { Building2, CircleAlert, LoaderCircle, Search, Sparkles } from 'lucide-react';
import StudentLayout from '../../../layouts/StudentLayout';
import { roomService } from '../../../services/room.service';
import { errorMessage } from '../../../utils/errorHandler';

const roomTypes = [['SINGLE', '1 người'], ['DOUBLE', '2 người'], ['QUAD', '4 người'], ['SIX_BED', '6 người'], ['EIGHT_BED', '8 người']];
const money = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });
const statusLabels = { AVAILABLE: 'Còn chỗ', MAINTENANCE: 'Đang bảo trì', RESERVED: 'Đã giữ chỗ', OCCUPIED: 'Đã đủ người' };
const statisticsOptions = [
  ['totalRooms', 'Tổng số phòng phù hợp'],
  ['averagePrice', 'Giá thuê trung bình'],
  ['priceRange', 'Giá thấp nhất và cao nhất'],
  ['roomsByType', 'Phân bố theo loại phòng'],
  ['roomsByBuilding', 'Phân bố theo tòa nhà'],
];
const fieldClass = 'w-full min-w-0 rounded-sm border-2 border-line-strong bg-surface px-3 py-2.5 text-sm font-semibold text-text outline-none focus:ring-2 focus:ring-primary';

export default function RoomFinder() {
  const [query, setQuery] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [buildingId, setBuildingId] = useState('');
  const [roomType, setRoomType] = useState('');
  const [buildings, setBuildings] = useState([]);
  const [buildingError, setBuildingError] = useState('');
  const [allRooms, setAllRooms] = useState(null);
  const [browseError, setBrowseError] = useState('');
  const [browseLoading, setBrowseLoading] = useState(true);
  const [mode, setMode] = useState('browse');
  const [results, setResults] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [selectedStatistics, setSelectedStatistics] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const activeRequest = useRef(null);

  const showStatistics = statisticsOptions.some(([key]) => selectedStatistics[key]);

  function invalidateAnalysis() {
    activeRequest.current?.abort();
    activeRequest.current = null;
    setLoading(false);
    setAnalysis(null);
  }

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    roomService.getStudentRooms(controller.signal)
      .then((data) => { if (mounted) setAllRooms(Array.isArray(data) ? data : []); })
      .catch((requestError) => {
        if (mounted && requestError.name !== 'AbortError') setBrowseError(errorMessage(requestError));
      })
      .finally(() => { if (mounted) setBrowseLoading(false); });
    roomService.getSearchBuildings()
      .then((data) => { if (mounted) setBuildings(Array.isArray(data) ? data : []); })
      .catch((requestError) => { if (mounted) setBuildingError(errorMessage(requestError)); });
    return () => { mounted = false; controller.abort(); activeRequest.current?.abort(); };
  }, []);

  const displayedResults = useMemo(() => {
    if (mode === 'semantic') return results;
    if (!allRooms) return null;
    return allRooms
      .filter((room) => maxPrice === '' || Number(room.pricePerMonth) <= Number(maxPrice))
      .filter((room) => buildingId === '' || room.buildingId === Number(buildingId))
      .filter((room) => roomType === '' || room.roomType === roomType)
      .map((room) => ({ room, similarityScore: null }));
  }, [allRooms, buildingId, maxPrice, mode, results, roomType]);

  async function searchRooms(event) {
    event.preventDefault();
    const searchText = query.trim();
    if (!searchText) {
      invalidateAnalysis();
      setError('');
      setMode('browse');
      return;
    }
    activeRequest.current?.abort();
    const controller = new AbortController();
    activeRequest.current = controller;
    setLoading(true);
    setError('');
    setResults(null);
    setAnalysis(null);
    setMode('semantic');
    const request = { query: searchText, limit: 20 };
    if (maxPrice !== '') request.maxPrice = Number(maxPrice);
    if (buildingId !== '') request.buildingId = Number(buildingId);
    if (roomType !== '') request.roomType = roomType;
    try {
      const data = await roomService.semanticSearchAnalysis(request, controller.signal);
      if (!controller.signal.aborted) {
        setAnalysis(data);
        setResults(Array.isArray(data?.rooms) ? data.rooms : []);
      }
    } catch (requestError) {
      if (requestError.name !== 'AbortError' && !controller.signal.aborted) setError(errorMessage(requestError));
    } finally {
      if (activeRequest.current === controller) { activeRequest.current = null; setLoading(false); }
    }
  }

  return (
    <StudentLayout title="Tìm phòng">
      <div className="mx-auto w-full max-w-6xl space-y-6 px-1 py-2 sm:px-3">
        <section className="rounded-sm border-3 border-line-strong bg-primary-light p-5 shadow-[5px_5px_0_#141413] sm:p-7">
          <div className="mb-3 inline-flex items-center gap-2 rounded-sm border-2 border-line-strong bg-warning px-3 py-1 text-xs font-black uppercase tracking-wide"><Sparkles size={16} /> Tìm kiếm ngữ nghĩa</div>
          <h1 className="text-2xl font-black text-text sm:text-3xl">Mô tả căn phòng bạn muốn ở</h1>
          <p className="mt-2 text-sm font-semibold text-text-muted">Xem toàn bộ phòng hiện có ngay bên dưới. Nhập nhu cầu bằng tiếng Việt để xếp phòng còn chỗ theo độ phù hợp, hoặc để trống và dùng các bộ lọc.</p>
          <form onSubmit={searchRooms} className="mt-5 space-y-4">
            <label className="block space-y-2">
              <span className="text-sm font-black text-text">Bạn đang tìm phòng như thế nào? (không bắt buộc)</span>
              <input className={fieldClass} type="search" value={query} onChange={(event) => {
                setQuery(event.target.value);
                invalidateAnalysis();
                if (!event.target.value.trim()) { setError(''); setMode('browse'); }
              }} placeholder="Ví dụ: Phòng yên tĩnh để học, gần khu sinh hoạt chung" maxLength={500} />
            </label>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <label className="block space-y-2"><span className="text-sm font-black text-text">Giá tối đa mỗi tháng</span><input className={fieldClass} type="number" min="0" step="1000" value={maxPrice} onChange={(event) => { setMaxPrice(event.target.value); invalidateAnalysis(); }} placeholder="Không giới hạn" /></label>
              <label className="block space-y-2"><span className="text-sm font-black text-text">Tòa nhà</span><select className={fieldClass} value={buildingId} onChange={(event) => { setBuildingId(event.target.value); invalidateAnalysis(); }}><option value="">Tất cả tòa nhà</option>{buildings.map((building) => <option key={building.id} value={building.id}>{building.name}</option>)}</select></label>
              <label className="block space-y-2 sm:col-span-2 lg:col-span-1"><span className="text-sm font-black text-text">Loại phòng</span><select className={fieldClass} value={roomType} onChange={(event) => { setRoomType(event.target.value); invalidateAnalysis(); }}><option value="">Tất cả loại phòng</option>{roomTypes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            </div>
            {query.trim() && <fieldset className="rounded-sm border-2 border-line-strong bg-surface p-4">
              <legend className="px-2 text-sm font-black text-text">Tùy chọn thống kê</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {statisticsOptions.map(([key, label]) => <label key={key} className="flex cursor-pointer items-start gap-2 text-sm font-semibold text-text">
                  <input type="checkbox" className="mt-0.5 h-4 w-4 accent-primary" checked={Boolean(selectedStatistics[key])} onChange={(event) => setSelectedStatistics((current) => ({ ...current, [key]: event.target.checked }))} />
                  <span>{label}</span>
                </label>)}
              </div>
            </fieldset>}
            {buildingError && <p role="alert" className="text-sm font-bold text-error">Không tải được danh sách tòa nhà: {buildingError}</p>}
            <button type="submit" disabled={loading} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-sm border-3 border-line-strong bg-primary px-5 py-2 font-black text-text shadow-[3px_3px_0_#141413] transition-transform hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60">{loading ? <LoaderCircle className="animate-spin" size={18} /> : <Search size={18} />}{loading ? 'Đang tìm phòng…' : query.trim() ? 'Tìm bằng AI' : 'Xem phòng theo bộ lọc'}</button>
          </form>
        </section>
        {error && <div role="alert" className="flex items-start gap-3 rounded-sm border-3 border-line-strong bg-error-light p-4 font-bold text-text"><CircleAlert size={20} className="shrink-0" /><span>{error}</span></div>}
        {mode === 'browse' && browseError && <div role="alert" className="flex items-start gap-3 rounded-sm border-3 border-line-strong bg-error-light p-4 font-bold text-text"><CircleAlert size={20} className="shrink-0" /><span>Không tải được danh sách phòng: {browseError}</span></div>}
        {mode === 'browse' && browseLoading && <p role="status" className="font-bold text-text-muted">Đang tải danh sách phòng hiện có…</p>}
        {loading && <p role="status" className="font-bold text-text-muted">Đang tạo embedding truy vấn và tìm trong PostgreSQL…</p>}
        {mode === 'semantic' && !loading && showStatistics && !analysis && !error && <p role="status" className="text-sm font-semibold text-text-muted">Hãy bấm Tìm bằng AI để cập nhật thống kê cho truy vấn và bộ lọc hiện tại.</p>}
        {mode === 'semantic' && !loading && showStatistics && analysis?.statistics && !error && <section aria-label="Thống kê kết quả tìm kiếm" className="rounded-sm border-3 border-line-strong bg-surface p-5 shadow-[4px_4px_0_#141413]">
          <h2 className="text-xl font-black text-text">Thống kê kết quả tìm kiếm</h2>
          <p className="mt-1 text-sm font-semibold text-text-muted">Tính trên toàn bộ phòng còn chỗ qua bộ lọc trong tập ứng viên vector; danh sách bên dưới chỉ hiển thị tối đa {analysis.displayedCount} phòng.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {selectedStatistics.totalRooms && <div className="rounded-sm border-2 border-line-strong bg-primary-light p-4"><h3 className="text-sm font-bold text-text-muted">Tổng số phòng phù hợp</h3><p className="mt-1 text-2xl font-black text-text">{analysis.totalMatches}</p></div>}
            {selectedStatistics.averagePrice && <div className="rounded-sm border-2 border-line-strong bg-primary-light p-4"><h3 className="text-sm font-bold text-text-muted">Giá thuê trung bình</h3><p className="mt-1 text-xl font-black text-text">{analysis.statistics.averagePrice == null ? '—' : money.format(analysis.statistics.averagePrice)}</p></div>}
            {selectedStatistics.priceRange && <div className="rounded-sm border-2 border-line-strong bg-primary-light p-4"><h3 className="text-sm font-bold text-text-muted">Giá thấp nhất · cao nhất</h3><p className="mt-1 text-lg font-black text-text">{analysis.statistics.minPrice == null ? '—' : money.format(analysis.statistics.minPrice)} · {analysis.statistics.maxPrice == null ? '—' : money.format(analysis.statistics.maxPrice)}</p></div>}
            {selectedStatistics.roomsByType && <div className="rounded-sm border-2 border-line-strong bg-primary-light p-4"><h3 className="text-sm font-bold text-text-muted">Theo loại phòng</h3>{Object.entries(analysis.statistics.roomsByType || {}).length === 0 ? <p className="mt-1 font-semibold text-text-muted">Không có phòng</p> : <ul className="mt-2 space-y-1">{Object.entries(analysis.statistics.roomsByType).map(([type, count]) => <li key={type} className="flex justify-between gap-2 text-sm font-semibold text-text"><span>{roomTypes.find(([value]) => value === type)?.[1] || type}</span><span>{count}</span></li>)}</ul>}</div>}
            {selectedStatistics.roomsByBuilding && <div className="rounded-sm border-2 border-line-strong bg-primary-light p-4"><h3 className="text-sm font-bold text-text-muted">Theo tòa nhà</h3>{analysis.statistics.roomsByBuilding?.length ? <ul className="mt-2 space-y-1">{analysis.statistics.roomsByBuilding.map((building) => <li key={building.buildingId} className="flex justify-between gap-2 text-sm font-semibold text-text"><span>{building.buildingName}</span><span>{building.count}</span></li>)}</ul> : <p className="mt-1 font-semibold text-text-muted">Không có phòng</p>}</div>}
          </div>
        </section>}
        {!loading && displayedResults?.length === 0 && !error && <div role="status" className="rounded-sm border-3 border-line-strong bg-surface p-6 text-center font-bold text-text-muted">Không tìm thấy phòng phù hợp với bộ lọc. Hãy điều chỉnh bộ lọc hoặc câu tìm kiếm.</div>}
        {!loading && displayedResults?.length > 0 && <section aria-label="Kết quả tìm phòng" className="space-y-4"><h2 className="text-xl font-black text-text">{displayedResults.length} {mode === 'semantic' ? 'phòng còn chỗ phù hợp' : 'phòng hiện có'}</h2><div className="grid gap-4 md:grid-cols-2">{displayedResults.map(({ room, similarityScore }) => {
          if (!room) return null;
          const typeLabel = roomTypes.find(([value]) => value === room.roomType)?.[1] || room.roomType;
          return <article key={room.id} className="rounded-sm border-3 border-line-strong bg-surface p-5 shadow-[4px_4px_0_#141413]">
            <div className="flex flex-wrap items-start justify-between gap-2"><div><h3 className="text-xl font-black text-text">Phòng {room.roomNumber}</h3><p className="mt-1 flex items-center gap-1 text-sm font-bold text-text-muted"><Building2 size={16} /> {room.buildingName} · Tầng {room.floor}</p></div><span className={`rounded-sm border-2 border-line-strong px-2 py-1 text-xs font-black text-text ${room.isAvailable ? 'bg-success-light' : 'bg-warning'}`}>{room.isAvailable ? 'Còn chỗ' : statusLabels[room.status] || room.status}</span></div>
            <p className="mt-4 text-lg font-black text-text">{money.format(room.pricePerMonth)} <span className="text-sm font-semibold text-text-muted">/ tháng</span></p>
            <p className="mt-2 text-sm font-bold text-text-muted">Loại {typeLabel} · Đang ở {room.currentOccupancy}/{room.capacity} người</p>
            {room.description && <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-text">{room.description}</p>}
            {Number.isFinite(similarityScore) && <p className="mt-4 border-t-2 border-line pt-3 text-xs font-bold text-text-muted">Điểm tương đồng: {Number(similarityScore).toFixed(3)}</p>}
          </article>;
        })}</div></section>}
      </div>
    </StudentLayout>
  );
}
