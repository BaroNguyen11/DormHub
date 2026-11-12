// ====================================
// PAYMENT RESULT - Kết quả thanh toán
// ====================================
// Hiển thị sau khi sinh viên bấm "Thanh toán" ở chi tiết hóa đơn.
// Trang tải payment từ GET /student/payments/{paymentId} và:
//   - Hiển thị QR VietQR + số tiền + mã tham chiếu + tài khoản nhận
//   - Tự động kiểm tra lại mỗi 5s khi còn PENDING; cứ ~30s gọi thêm
//     POST /student/payments/sync để KÉO giao dịch SePay về (phòng khi webhook lỡ)
//   - SUCCESS -> tự động chuyển tới "Phòng của tôi" (/student) sau 3 giây
//     (với hóa đơn cọc, hợp đồng đã ACTIVE + đã được phân phòng tự động)
//   - EXPIRED -> hướng dẫn tạo lại thanh toán từ trang hóa đơn
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  Copy,
  RefreshCw,
  QrCode,
  Wallet,
  Hash,
} from "lucide-react";
import { api } from "../../api/apiClient";
import { errorMessage } from "../../utils/errorHandler";
import { money } from "../../utils/format";
import { StatusBadge } from "../ui";

const POLL_INTERVAL_MS = 5000;
const SYNC_EVERY_N_TICKS = 6; // 6 tick x 5s ≈ 30s gọi đối soát SePay một lần
const REDIRECT_COUNTDOWN_SECONDS = 3;

function InfoRow({ icon: Icon, label, children, actions }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b-2 border-line-strong/30 last:border-b-0">
      <div className="size-9 rounded-sm bg-surface-2 border-2 border-line-strong flex items-center justify-center shadow-[2px_2px_0_#141413] shrink-0">
        <Icon size={16} strokeWidth={2.5} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-bold text-text-muted uppercase tracking-wide">
          {label}
        </p>
        <div className="text-sm font-extrabold text-text break-all">
          {children}
        </div>
      </div>
      {actions}
    </div>
  );
}

export default function PaymentResult() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const paymentId = searchParams.get("paymentId");
  const invoiceId = searchParams.get("invoiceId");

  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(Boolean(paymentId));
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const tickCount = useRef(0);

  const load = useCallback(async () => {
    if (!paymentId) return;
    try {
      const data = await api(`/student/payments/${encodeURIComponent(paymentId)}`);
      setPayment(data);
      setError("");
      return data;
    } catch (e) {
      setError(errorMessage(e));
      return null;
    }
  }, [paymentId]);

  // Đối soát bù với SePay: kéo giao dịch gần nhất về và ghép vào phiên PENDING.
  // Lỗi chỉ được bỏ qua — đây là cơ chế dự phòng của webhook, không được làm vỡ trang.
  const runSync = useCallback(async (force) => {
    try {
      await api(`/student/payments/sync${force ? "?force=true" : ""}`, { method: "POST" });
    } catch {
      /* webhook là cơ chế chính; sync lỗi thì poll kế tiếp sẽ thử lại */
    }
  }, []);

  // Tải lần đầu + poll liên tục khi chưa có kết quả cuối (SUCCESS/EXPIRED).
  // Lỗi mạng chỉ được bỏ qua và poll tiếp; dừng hẳn khi trạng thái đã chốt.
  useEffect(() => {
    let active = true;
    let timer = null;

    async function tick() {
      tickCount.current += 1;
      // Từ lượt thứ 2, cứ ~30s đối soát SePay một lần trước khi đọc trạng thái
      if (tickCount.current > 1 && tickCount.current % SYNC_EVERY_N_TICKS === 1) {
        await runSync(false);
      }
      const data = await load();
      if (!active) return;
      if (data) {
        const resolved =
          String(data.paymentStatus || "").toUpperCase() !== "PENDING" ||
          String(data.invoiceStatus || "").toUpperCase() === "PAID" ||
          Boolean(data.expired);
        if (resolved) return;
      }
      timer = setTimeout(tick, POLL_INTERVAL_MS);
    }
    tick();

    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, [load, runSync]);

  // Derived states from payment data
  const paymentSuccess = payment &&
    String(payment.paymentStatus || "").toUpperCase() === "SUCCESS";

  useEffect(() => {
    if (payment) {
      setLoading(false);
      if (paymentSuccess) {
        setCountdown(REDIRECT_COUNTDOWN_SECONDS);
      }
    }
  }, [payment, paymentSuccess]);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown <= 0) {
      navigate("/student", { replace: true });
      return;
    }
    const timer = setTimeout(() => setCountdown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, navigate]);

  function copy(text, key) {
    if (!text) return;
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(key);
    setTimeout(() => setCopied(""), 1500);
  }

  // Nút "Kiểm tra lại": đối soát SePay (force, không throttle) rồi đọc lại trạng thái
  async function checkNow() {
    setSyncing(true);
    await runSync(true);
    await load();
    setSyncing(false);
  }

  // Không có paymentId trong URL
  if (!paymentId) {
    return (
      <div className="w-full space-y-4">
        <div className="bg-surface border-4 border-line-strong rounded-sm p-8 text-center space-y-4 shadow-[6px_6px_0_#141413]">
          <div className="size-14 mx-auto rounded-sm bg-warning border-3 border-line-strong flex items-center justify-center shadow-[3px_3px_0_#141413]">
            <AlertCircle size={28} strokeWidth={2.5} />
          </div>
          <h1 className="text-xl font-black text-text">
            Không tìm thấy thông tin thanh toán
          </h1>
          <p className="text-sm font-semibold text-text-muted">
            Hãy mở hóa đơn của bạn và bấm "Thanh toán" để tạo lượt thanh toán
            mới.
          </p>
          <Link
            to="/student/invoices"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary border-3 border-line-strong rounded-sm font-extrabold text-sm text-text shadow-[3px_3px_0_#141413] hover:shadow-[5px_5px_0_#141413] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all"
          >
            <Wallet size={16} strokeWidth={2.5} />
            Đến danh sách hóa đơn
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="page-status">Đang tải thông tin thanh toán…</div>
    );
  }

  if (error && !payment) {
    return (
      <div className="w-full space-y-4">
        <div className="bg-error-light border-4 border-line-strong rounded-sm p-6 text-sm font-bold text-text shadow-[6px_6px_0_#141413]">
          {error}
        </div>
        <Link
          to="/student/invoices"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary border-3 border-line-strong rounded-sm font-extrabold text-sm text-text shadow-[3px_3px_0_#141413] hover:shadow-[5px_5px_0_#141413] hover:-translate-y-0.5 transition-all"
        >
          Quay lại hóa đơn
        </Link>
      </div>
    );
  }

  if (!payment) return null;

  const status = String(payment.paymentStatus || "").toUpperCase();
  const invoiceStatus = String(payment.invoiceStatus || "").toUpperCase();
  const invoicePaidElsewhere = invoiceStatus === "PAID" && status !== "SUCCESS";
  const isPending = status === "PENDING" && !payment.expired && invoiceStatus === "UNPAID";
  const isExpired = status === "EXPIRED" || payment.expired;
  const isSuccess = status === "SUCCESS";
  const isDeposit = String(payment.invoiceType || "") === "DEPOSIT";

  return (
    <div className="mx-auto space-y-6">
      {/* Dải trạng thái */}
      <div className="bg-surface border-4 border-line-strong rounded-sm p-6 sm:p-8 text-center space-y-4 shadow-[6px_6px_0_#141413]">
        <div
          className={`size-16 mx-auto rounded-sm border-3 border-line-strong flex items-center justify-center shadow-[3px_3px_0_#141413] ${
            isSuccess ? "bg-success" : invoicePaidElsewhere ? "bg-warning" : isExpired ? "bg-error" : "bg-warning"
          }`}
        >
          {isSuccess ? (
            <CheckCircle2 size={32} strokeWidth={2.5} />
          ) : invoicePaidElsewhere || isExpired ? (
            <AlertCircle size={32} strokeWidth={2.5} />
          ) : (
            <Clock size={32} strokeWidth={2.5} />
          )}
        </div>

        <h1 className="text-xl font-black text-text">
          {isSuccess
            ? "Thanh toán thành công!"
            : invoicePaidElsewhere
              ? "Hóa đơn đã được thanh toán bằng lượt khác"
            : isExpired
              ? "Lượt thanh toán đã hết hạn"
              : "Chờ bạn chuyển khoản"}
        </h1>
        <p className="text-sm font-semibold text-text-muted">
          {isSuccess
            ? "Hệ thống đã ghi nhận tiền. Nếu đây là tiền cọc giữ chỗ, bạn đã được phân phòng tự động."
            : invoicePaidElsewhere
              ? "Lượt thanh toán này không được ghi nhận thành công. Hóa đơn đã PAID bằng một lượt khác; nếu bạn đã chuyển khoản theo mã của lượt này, hãy liên hệ quản lý để rà soát."
            : isExpired
              ? "Lượt thanh toán này đã hết hiệu lực. Hãy bấm 'Thanh toán' lại ở trang hóa đơn để tạo lượt mới."
              : "Trang sẽ tự cập nhật khi tiền vào tài khoản (không cần tải lại). Giữ nguyên mã tham chiếu khi chuyển khoản."}
        </p>

        {isSuccess && countdown !== null && countdown > 0 && (
          <p className="text-xs font-black text-primary uppercase tracking-wide">
            Tự động vào “Phòng của tôi” sau {countdown}s…
          </p>
        )}

        <div className="flex items-center justify-center gap-2 flex-wrap">
          <span className="text-xs font-semibold">Lượt thanh toán:</span>
          <StatusBadge status={payment.paymentStatus} />
          <span className="text-xs font-semibold">Hóa đơn:</span>
          <StatusBadge status={payment.invoiceStatus} />
          {isDeposit && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-sm text-[11px] font-extrabold uppercase tracking-wider bg-primary-light border-2 border-line-strong">
              Hóa đơn đặt cọc
            </span>
          )}
        </div>
      </div>

      {/* QR + thông tin chuyển khoản */}
      {isPending && (
        <div className="bg-surface border-4 border-line-strong rounded-sm p-6 space-y-4 shadow-[6px_6px_0_#141413]">
          <h2 className="flex items-center gap-2 text-base font-black text-text">
            <QrCode size={18} strokeWidth={2.5} />
            Quét mã để chuyển khoản
          </h2>

          {payment.vietQrUrl ? (
            <div className="flex justify-center py-2">
              <img
                src={payment.vietQrUrl}
                alt="Mã QR VietQR"
                className="w-56 h-56 object-contain bg-white border-3 border-line-strong rounded-sm shadow-[4px_4px_0_#141413]"
              />
            </div>
          ) : (
            <p className="text-xs font-semibold text-text-muted text-center">
              Không tạo được ảnh QR — bạn vẫn có thể chuyển khoản thủ công bằng
              thông tin bên dưới.
            </p>
          )}

          <div>
            <InfoRow
              icon={Wallet}
              label="Số tiền cần chuyển"
              actions={
                <button
                  type="button"
                  onClick={() => copy(String(payment.expectedAmount || ""), "amount")}
                  className="shrink-0 self-center inline-flex items-center gap-1 px-2 py-1 bg-surface-2 border-2 border-line-strong rounded-sm text-[11px] font-extrabold! shadow-[2px_2px_0_#141413] active:translate-y-0.5 active:shadow-none transition-all"
                >
                  <Copy size={12} strokeWidth={2.5} />
                  {copied === "amount" ? "Đã chép" : "Chép"}
                </button>
              }
            >
              {money(payment.expectedAmount)}
            </InfoRow>

            <InfoRow
              icon={Hash}
              label="Mã tham chiếu (bắt buộc)"
              actions={
                <button
                  type="button"
                  onClick={() => copy(payment.paymentReference, "ref")}
                  className="shrink-0 self-center inline-flex items-center gap-1 px-2 py-1 bg-surface-2 border-2 border-line-strong rounded-sm text-[11px] font-extrabold! shadow-[2px_2px_0_#141413] active:translate-y-0.5 active:shadow-none transition-all"
                >
                  <Copy size={12} strokeWidth={2.5} />
                  {copied === "ref" ? "Đã chép" : "Chép"}
                </button>
              }
            >
              {payment.paymentReference}
            </InfoRow>

            <InfoRow
              icon={CreditCard}
              label="Tài khoản nhận"
            >
              {payment.receivingAccountNumber} ({payment.receivingBankCode})
            </InfoRow>

            {payment.expiresAt && (
              <InfoRow icon={Clock} label="Hiệu lực đến">
                {new Date(payment.expiresAt).toLocaleString("vi-VN")}
              </InfoRow>
            )}
          </div>

          <p className="text-[11px] font-semibold text-text-muted leading-relaxed">
            Lưu ý: nội dung chuyển khoản phải chứa đúng mã tham chiếu phía trên
            để hệ thống tự đối soát. Sau khi tiền vào, hóa đơn và phân phòng
            (với hóa đơn cọc) sẽ được cập nhật tự động.
          </p>
        </div>
      )}

      {/* Liên kết tiếp theo */}
      <div className="flex gap-3 flex-wrap">
        {isSuccess ? (
          <Link
            to="/student"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary border-3 border-line-strong rounded-sm font-extrabold text-sm text-text shadow-[3px_3px_0_#141413] hover:shadow-[5px_5px_0_#141413] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all"
          >
            Vào phòng của tôi
          </Link>
        ) : (
          <Link
            to={`/student/invoices${invoiceId ? `/${invoiceId}` : ""}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary border-3 border-line-strong rounded-sm font-extrabold text-sm text-text shadow-[3px_3px_0_#141413] hover:shadow-[5px_5px_0_#141413] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all"
          >
            Xem hóa đơn
          </Link>
        )}
        <button
          type="button"
          onClick={checkNow}
          disabled={syncing}
          className="inline-flex items-center gap-2 px-6 py-2 bg-surface border-3 border-line-strong rounded-sm font-extrabold! text-sm! text-text shadow-[3px_3px_0_#141413] hover:shadow-[5px_5px_0_#141413] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw size={16} strokeWidth={2.5} className={syncing ? "animate-spin" : ""} />
          {syncing ? "Đang kiểm tra…" : "Kiểm tra lại"}
        </button>
      </div>
    </div>
  );
}
