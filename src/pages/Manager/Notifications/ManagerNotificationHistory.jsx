import { useState } from "react";
import { ChevronLeft, ChevronRight, Eye, RefreshCw, Search } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { asList } from "../../../api/apiClient";
import useDebounce from "../../../hooks/useDebounce";
import usePagination from "../../../hooks/usePagination";
import { CustomSelect } from "../../../components/ui/CustomSelect";
import { StatusBadge } from "../../../components/ui";
import { Empty, Heading, Loading, Notice } from "../../../components/Screen/UIComponents";
import { useLoad } from "../../../components/Screen/useLoad";

const targetOptions = [
  { value: "", label: "Tất cả đối tượng" },
  { value: "ALL", label: "Sinh viên đang cư trú" },
  { value: "BUILDING", label: "Theo tòa nhà" },
  { value: "LEGACY", label: "Theo danh sách người nhận" },
];

const targetLabel = (item) => item.target === "BUILDING"
  ? item.buildingName || "Theo tòa nhà"
  : item.target === "ALL" ? "Sinh viên đang cư trú" : "Theo danh sách người nhận";

const dateTime = (value) => value ? new Date(value).toLocaleString("vi-VN") : "—";
const summary = (value) => value?.length > 120 ? `${value.slice(0, 120)}…` : value || "—";

export function ManagerNotificationHistory({ config }) {
  const [search, setSearch] = useState("");
  const [target, setTarget] = useState("");
  const { page, pageSize, resetPage, previousPage, nextPage } = usePagination(0, 10);
  const debouncedSearch = useDebounce(search, 300);
  const { data, error, loading, reload } = useLoad("/notifications/manager-history", {
    page, size: pageSize,
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    ...(target ? { target } : {}),
  });
  const rows = asList(data);

  return (
    <div className="space-y-6">
      <Heading config={config} />
      <Notice error={error} />
      <div className="bg-surface border-4 border-line-strong rounded-sm overflow-hidden shadow-[6px_6px_0_#141413]">
        <div className="flex flex-wrap items-center gap-3 p-4 border-b-4 border-line-strong bg-surface-2">
          <div className="relative flex-1 min-w-60">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" size={18} strokeWidth={2.5} />
            <input aria-label="Tìm kiếm" placeholder="Tìm tiêu đề hoặc nội dung..." value={search}
              onChange={(event) => { setSearch(event.target.value); resetPage(); }}
              className="w-full pl-10 pr-4 py-2.5 rounded-sm border-3 border-line-strong bg-surface text-sm font-semibold text-text shadow-[2px_2px_0_#141413] focus:shadow-[4px_4px_0_#141413] outline-none! transition-all" />
          </div>
          <div className="w-56 shrink-0"><CustomSelect value={target} options={targetOptions}
            onChange={(value) => { setTarget(value); resetPage(); }} /></div>
          <button type="button" onClick={reload} aria-label="Tải lại" title="Tải lại dữ liệu"
            className="inline-flex items-center justify-center size-11 bg-surface border-3 border-line-strong rounded-sm shadow-[2px_2px_0_#141413] hover:shadow-[4px_4px_0_#141413] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all cursor-pointer">
            <RefreshCw size={18} strokeWidth={2.5} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
        {loading ? <Loading /> : error ? null : rows.length === 0 ? (
          <Empty text="Chưa có thông báo đã gửi phù hợp." />
        ) : (
          <div className="overflow-x-auto"><table className="w-full border-collapse text-left">
            <thead className="bg-warning border-b-4 border-line-strong text-[#000000]"><tr>
              {["Tiêu đề", "Nội dung tóm tắt", "Đối tượng nhận", "Số người nhận", "Thời gian gửi", "Thao tác"].map((label) =>
                <th key={label} className="px-4 py-3.5 text-xs font-black uppercase tracking-wider border-r-2 border-line-strong/20 last:border-r-0">{label}</th>)}
            </tr></thead><tbody className="divide-y-2 divide-line-strong">
            {rows.map((item) => (
              <tr key={item.id} className="bg-surface hover:bg-primary-light/50 transition-colors">
                <td className="px-4 py-3.5 text-sm font-bold text-text whitespace-nowrap">{item.title}</td>
                <td className="px-4 py-3.5 text-sm font-bold text-text min-w-64 max-w-96 whitespace-normal break-words">{summary(item.body)}</td>
                <td className="px-4 py-3.5 text-sm font-bold text-text whitespace-nowrap">{targetLabel(item)}</td>
                <td className="px-4 py-3.5 text-sm font-bold text-text whitespace-nowrap">{item.recipientCount}</td>
                <td className="px-4 py-3.5 text-sm font-bold text-text whitespace-nowrap">{dateTime(item.createdAt)}</td>
                <td className="px-4 py-3.5 text-sm text-right whitespace-nowrap">
                  <Link to={`/manager/notifications/history/${item.id}`} className="inline-flex items-center gap-1 px-3 py-1.5 bg-surface text-text font-extrabold text-xs rounded-sm border-2 border-line-strong shadow-[2px_2px_0_#141413] hover:bg-primary hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all"><Eye size={14} strokeWidth={2.5} />Chi tiết</Link>
                </td>
              </tr>
            ))}
            </tbody></table></div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-t-4 border-line-strong bg-surface-2 text-xs font-extrabold text-text">
          <span>Trang {page + 1}{data?.totalElements != null ? ` · Tổng ${data.totalElements} mục` : ""}</span>
          <div className="flex items-center gap-2">
            <button type="button" disabled={page === 0} onClick={previousPage} className="inline-flex items-center gap-1 px-3.5 py-2 bg-surface text-text rounded-sm border-2 border-line-strong shadow-[2px_2px_0_#141413] hover:shadow-[4px_4px_0_#141413] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"><ChevronLeft size={16} strokeWidth={2.5} />Trang trước</button>
            <button type="button" disabled={data?.last === true || (data?.totalElements != null ? (page + 1) * pageSize >= data.totalElements : rows.length < pageSize)} onClick={nextPage} className="inline-flex items-center gap-1 px-3.5 py-2 bg-surface text-text rounded-sm border-2 border-line-strong shadow-[2px_2px_0_#141413] hover:shadow-[4px_4px_0_#141413] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">Trang sau<ChevronRight size={16} strokeWidth={2.5} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ManagerNotificationDetail({ config }) {
  const { id } = useParams();
  const path = id ? `/notifications/manager-history/${encodeURIComponent(id)}` : "";
  const { data, error, loading } = useLoad(path, {});

  return (
    <div className="space-y-6">
      <Heading config={config}>
        <Link to="/manager/notifications/history" className="inline-flex items-center px-3 py-2 bg-primary border-3 border-line-strong rounded-sm font-extrabold text-sm shadow-[3px_3px_0_#141413]">Quay lại lịch sử</Link>
      </Heading>
      <Notice error={error} />
      {loading ? <Loading /> : data ? (
        <>
          <div className="bg-surface border-4 border-line-strong rounded-sm p-6 shadow-[6px_6px_0_#141413] space-y-4">
            <h2 className="text-xl font-black text-text">{data.title}</h2>
            <div className="flex flex-wrap gap-4 text-sm font-bold text-text-muted">
              <span>Đối tượng: {targetLabel(data)}</span>
              <span>Người nhận: {data.recipientCount}</span>
              <span>Gửi lúc: {dateTime(data.createdAt)}</span>
            </div>
            <p className="whitespace-pre-wrap break-words text-sm text-text">{data.body}</p>
          </div>
          <div className="bg-surface border-4 border-line-strong rounded-sm overflow-hidden shadow-[6px_6px_0_#141413]">
            {data.recipients?.length ? (
              <div className="overflow-x-auto"><table className="w-full border-collapse text-left">
                <thead className="bg-warning border-b-4 border-line-strong text-[#000000]"><tr>
                  {["Họ tên", "Mã sinh viên", "Trạng thái", "Thời gian đọc"].map((label) =>
                    <th key={label} className="px-4 py-3.5 text-xs font-black uppercase tracking-wider border-r-2 border-line-strong/20 last:border-r-0">{label}</th>)}
                </tr></thead><tbody className="divide-y-2 divide-line-strong">
                {data.recipients.map((recipient) => (
                  <tr key={recipient.userId} className="bg-surface hover:bg-primary-light/50 transition-colors">
                    <td className="px-4 py-3.5 text-sm font-bold text-text whitespace-nowrap">{recipient.fullName}</td>
                    <td className="px-4 py-3.5 text-sm font-bold text-text whitespace-nowrap">{recipient.studentCode || "—"}</td>
                    <td className="px-4 py-3.5 text-sm font-bold text-text whitespace-nowrap"><StatusBadge status={recipient.isRead ? "READ" : "UNREAD"} /></td>
                    <td className="px-4 py-3.5 text-sm font-bold text-text whitespace-nowrap">{dateTime(recipient.readAt)}</td>
                  </tr>
                ))}
                </tbody></table></div>
            ) : <Empty text="Không có người nhận." />}
          </div>
        </>
      ) : !error ? <Empty text="Không tìm thấy thông báo." /> : null}
    </div>
  );
}
