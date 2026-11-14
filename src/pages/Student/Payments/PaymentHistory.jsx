import { Link, useParams } from "react-router-dom";
import { asList } from "../../../api/apiClient";
import { money } from "../../../utils/format";
import { StatusBadge } from "../../../components/ui";
import { CustomSelect } from "../../../components/ui/CustomSelect";
import { Empty, Heading, Loading, Notice } from "../../../components/Screen/UIComponents";
import { useLoad } from "../../../components/Screen/useLoad";
import usePagination from "../../../hooks/usePagination";
import useDebounce from "../../../hooks/useDebounce";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Eye, RefreshCw, Search } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "SUCCESS", label: "Thành công" },
  { value: "PENDING", label: "Đang chờ" },
  { value: "EXPIRED", label: "Hết hạn" },
  { value: "CANCELLED", label: "Đã hủy" },
];

const dateTime = (value) =>
  value ? new Date(value).toLocaleString("vi-VN") : "—";

export function PaymentHistory({ config }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const { page, pageSize, nextPage, previousPage, resetPage } = usePagination(0, 10);
  const debouncedSearch = useDebounce(search, 300);
  const { data, error, loading, reload } = useLoad("/student/payments", {
    page,
    size: pageSize,
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    ...(status ? { status } : {}),
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
            <input aria-label="Tìm kiếm" placeholder="Tìm mã giao dịch hoặc hóa đơn..." value={search}
              onChange={(event) => { setSearch(event.target.value); resetPage(); }}
              className="w-full pl-10 pr-4 py-2.5 rounded-sm border-3 border-line-strong bg-surface text-sm font-semibold text-text shadow-[2px_2px_0_#141413] focus:shadow-[4px_4px_0_#141413] outline-none! transition-all" />
          </div>
          <div className="w-56 shrink-0"><CustomSelect value={status} options={STATUS_OPTIONS}
            onChange={(value) => { setStatus(value); resetPage(); }} /></div>
          <button type="button" onClick={reload} aria-label="Tải lại" title="Tải lại dữ liệu"
            className="inline-flex items-center justify-center size-11 bg-surface border-3 border-line-strong rounded-sm shadow-[2px_2px_0_#141413] hover:shadow-[4px_4px_0_#141413] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all cursor-pointer">
            <RefreshCw size={18} strokeWidth={2.5} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
        {loading ? <Loading /> : error ? null : rows.length === 0 ? (
          <Empty text="Không tìm thấy lần thanh toán nào." />
        ) : (
          <div className="overflow-x-auto"><table className="w-full border-collapse text-left">
            <thead className="bg-warning border-b-4 border-line-strong text-[#000000]"><tr>
              {["Mã giao dịch", "Hóa đơn", "Số tiền", "Thời gian tạo", "Trạng thái Payment", "Thao tác"].map((label) =>
                <th key={label} className="px-4 py-3.5 text-xs font-black uppercase tracking-wider border-r-2 border-line-strong/20 last:border-r-0">{label}</th>)}
            </tr></thead><tbody className="divide-y-2 divide-line-strong">
            {rows.map((payment) => (
              <tr key={payment.paymentId} className="bg-surface hover:bg-primary-light/50 transition-colors">
                <td className="px-4 py-3.5 text-sm font-bold text-text whitespace-nowrap">
                  <div>{payment.paymentReference}</div>
                  <div className="text-xs text-text-muted">#{payment.paymentId}</div>
                </td>
                <td className="px-4 py-3.5 text-sm font-bold text-text whitespace-nowrap">
                  <Link className="underline" to={`/student/invoices/${payment.invoiceId}`}>#{payment.invoiceId}</Link>
                  <div className="text-xs text-text-muted">{payment.invoiceType}</div>
                </td>
                <td className="px-4 py-3.5 text-sm font-bold text-text whitespace-nowrap">{money(payment.expectedAmount)}</td>
                <td className="px-4 py-3.5 text-sm font-bold text-text whitespace-nowrap">{dateTime(payment.createdAt)}</td>
                <td className="px-4 py-3.5 text-sm font-bold text-text whitespace-nowrap">
                  <StatusBadge status={payment.paymentStatus} />
                  {payment.paymentStatus === "PENDING" && payment.expired && (
                    <span className="block text-xs text-text-muted mt-1">Đã hết hiệu lực</span>
                  )}
                </td>
                <td className="px-4 py-3.5 text-sm text-right whitespace-nowrap">
                  <Link to={`/student/payments/${payment.paymentId}`} className="inline-flex items-center gap-1 px-3 py-1.5 bg-surface text-text font-extrabold text-xs rounded-sm border-2 border-line-strong shadow-[2px_2px_0_#141413] hover:bg-primary hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all"><Eye size={14} strokeWidth={2.5} />Chi tiết</Link>
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

export function PaymentHistoryDetail({ config }) {
  const { id } = useParams();
  const paymentPath = id ? `/student/payments/${encodeURIComponent(id)}` : "";
  const { data: payment, error, loading } = useLoad(paymentPath, {});
  const fields = payment ? [
    ["Mã giao dịch", payment.paymentReference],
    ["Mã lần thử", `#${payment.paymentId}`],
    ["Hóa đơn", <Link className="underline" to={`/student/invoices/${payment.invoiceId}`}>#{payment.invoiceId}</Link>],
    ["Loại hóa đơn", payment.invoiceType],
    ["Số tiền", money(payment.expectedAmount)],
    ["Tạo lúc", dateTime(payment.createdAt)],
    ["Hết hiệu lực lúc", dateTime(payment.expiresAt)],
    ["Ghi nhận tiền lúc", dateTime(payment.paidAt)],
  ] : [];

  return (
    <div className="space-y-6">
      <Heading config={config} />
      <Notice error={error} />
      {loading ? <Loading /> : payment ? (
        <div className="bg-surface border-4 border-line-strong rounded-sm p-6 shadow-[6px_6px_0_#141413] space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-black">Lần thanh toán:</span>
            <StatusBadge status={payment.paymentStatus} />
            {payment.paymentStatus === "PENDING" && payment.expired && <span className="text-xs font-bold">Đã hết hiệu lực</span>}
            <span className="text-sm font-black">Hóa đơn:</span>
            <StatusBadge status={payment.invoiceStatus} />
          </div>
          {payment.invoiceStatus === "PAID" && payment.paymentStatus !== "SUCCESS" && (
            <Notice type="warning" message="Hóa đơn đã được thanh toán bằng lần thử khác."
              description="Trạng thái lần thanh toán này vẫn được giữ riêng để đối soát." />
          )}
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map(([label, value]) => (
              <div key={label} className="border-b-2 border-line-strong/20 pb-3">
                <dt className="text-xs font-bold text-text-muted">{label}</dt>
                <dd className="text-sm font-black mt-1 break-all">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="flex flex-wrap gap-3">
            <Link to="/student/payments" className="px-4 py-2 border-3 border-line-strong rounded-sm font-bold text-sm">Về lịch sử thanh toán</Link>
            {payment.paymentStatus === "PENDING" && !payment.expired && payment.invoiceStatus === "UNPAID" && (
              <Link to={`/student/payment-result?paymentId=${payment.paymentId}&invoiceId=${payment.invoiceId}`}
                className="px-4 py-2 border-3 border-line-strong rounded-sm bg-primary font-bold text-sm">Xem QR thanh toán</Link>
            )}
          </div>
        </div>
      ) : !error ? <Empty text="Không tìm thấy lần thanh toán." /> : null}
    </div>
  );
}
