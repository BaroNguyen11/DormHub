import { Link, useParams } from "react-router-dom";
import { Eye, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { asList } from "../../api/apiClient";
import { money } from "../../utils/format";
import { StatusBadge } from "../ui";
import { CustomSelect } from "../ui/CustomSelect";
import { Empty, Heading, Loading, Notice } from "./UIComponents";
import { useLoad } from "./useLoad";
import usePagination from "../../hooks/usePagination";
import { useState } from "react";

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
  const [status, setStatus] = useState("");
  const { page, pageSize, nextPage, previousPage, resetPage } = usePagination(0, 10);
  const { data, error, loading, reload } = useLoad("/student/payments", {
    page,
    size: pageSize,
    ...(status ? { status } : {}),
  });
  const rows = asList(data);
  const totalPages = data?.totalPages ?? 0;

  return (
    <div className="space-y-6">
      <Heading config={config} />
      <Notice error={error} />
      <div className="bg-surface border-4 border-line-strong rounded-sm shadow-[6px_6px_0_#141413] overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 p-4 bg-surface-2 border-b-4 border-line-strong">
          <div className="w-56">
            <CustomSelect
              value={status}
              options={STATUS_OPTIONS}
              onChange={(value) => {
                setStatus(value);
                resetPage();
              }}
            />
          </div>
          <button type="button" onClick={reload} aria-label="Tải lại lịch sử thanh toán"
            className="inline-flex items-center gap-2 px-4 py-2.5 border-3 border-line-strong bg-surface rounded-sm text-sm font-bold">
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Tải lại
          </button>
        </div>
        {loading ? <Loading /> : error ? null : rows.length === 0 ? (
          <Empty text={status ? "Không có lần thanh toán ở trạng thái này." : "Bạn chưa có lần thanh toán nào."} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead className="bg-warning border-b-4 border-line-strong text-xs uppercase">
                <tr>
                  {["Mã giao dịch", "Hóa đơn", "Số tiền", "Thời gian tạo", "Trạng thái Payment", "Chi tiết"].map((label) => (
                    <th key={label} className="px-4 py-3 font-black whitespace-nowrap">{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-line-strong">
                {rows.map((payment) => (
                  <tr key={payment.paymentId} className="hover:bg-primary-light/50">
                    <td className="px-4 py-3 text-sm font-bold">
                      <div>{payment.paymentReference}</div>
                      <div className="text-xs text-text-muted">#{payment.paymentId}</div>
                    </td>
                    <td className="px-4 py-3 text-sm font-bold">
                      <Link className="underline" to={`/student/invoices/${payment.invoiceId}`}>#{payment.invoiceId}</Link>
                      <div className="text-xs text-text-muted">{payment.invoiceType}</div>
                    </td>
                    <td className="px-4 py-3 text-sm font-bold whitespace-nowrap">{money(payment.expectedAmount)}</td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">{dateTime(payment.createdAt)}</td>
                    <td className="px-4 py-3 text-sm">
                      <StatusBadge status={payment.paymentStatus} />
                      {payment.paymentStatus === "PENDING" && payment.expired && (
                        <span className="block text-xs text-text-muted mt-1">Đã hết hiệu lực</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Link to={`/student/payments/${payment.paymentId}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-surface border-2 border-line-strong rounded-sm text-xs font-bold">
                        <Eye size={14} /> Xem
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between gap-3 p-4 border-t-3 border-line-strong">
            <button type="button" onClick={previousPage} disabled={page === 0}
              className="inline-flex items-center gap-1 text-sm font-bold disabled:opacity-40">
              <ChevronLeft size={16} /> Trước
            </button>
            <span className="text-sm font-bold">Trang {page + 1}/{totalPages}</span>
            <button type="button" onClick={nextPage} disabled={page + 1 >= totalPages}
              className="inline-flex items-center gap-1 text-sm font-bold disabled:opacity-40">
              Sau <ChevronRight size={16} />
            </button>
          </div>
        )}
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
