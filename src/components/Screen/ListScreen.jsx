import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Search,
  Plus,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";
import { motion } from "motion/react";
import { asList } from "../../api/apiClient";
import { resources } from "../../services/resource.service";
import { FIELD_LABELS } from "./constants";
import { formatValue, getNestedValue } from "./formatters";
import { Notice, Loading, Empty, Heading } from "./UIComponents";
import { useLoad } from "./useLoad";
import useDebounce from "../../hooks/useDebounce";
import usePagination from "../../hooks/usePagination";
import { STATUS_LABELS } from "../../constants/status";
import { MaintenanceStatusBadge, StatusBadge } from "../ui";
import { CustomSelect } from "../ui/CustomSelect";

export default function ListScreen({ config }) {
  const location = useLocation();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState("");
  const [success, setSuccess] = useState("");
  const [actionError, setActionError] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);

  const { page, pageSize, nextPage, previousPage, resetPage } = usePagination(
    0,
    10,
  );
  const debouncedSearch = useDebounce(search, 300);

  const { data, error, loading, reload } = useLoad(config.resource, {
    page,
    size: pageSize,
    ...(debouncedSearch ? { [config.searchParam || "search"]: debouncedSearch } : {}),
    ...(status ? { status } : {}),
  });

  const rows = asList(data);

  const createPath = config.create;

  async function doAction(row, action, confirmed = false) {
    if (action.confirm && !confirmed) {
      setConfirmAction({ row, action });
      return;
    }

    setBusy(String(row.id || row.invoiceId || row.contractId || row.assignmentId));
    setActionError("");
    setSuccess("");

    try {
      // Một số DTO dùng invoiceId / contractId / assignmentId thay vì id.
      const rowId = config.idField
        ? row[config.idField]
        : row.id || row.invoiceId || row.contractId || row.assignmentId;
      await resources.action(
        `${config.resource.replace(/\/me$/, "")}/${rowId}${action.suffix}`,
        action.method,
        action.body,
      );

      setConfirmAction(null);
      reload();
    } catch {
      // API client reports request failures globally.
    } finally {
      setBusy("");
    }
  }

  return (
    <div className="space-y-6">
      {/* Heading với nút Tạo mới */}
      <Heading config={config}>
        {createPath && (
          <Link to={createPath}>
            <button className="inline-flex items-center gap-2 px-3 py-2 bg-primary text-[#000000] font-extrabold! text-sm! rounded-sm border-3 border-line-strong shadow-[3px_3px_0_#141413] hover:shadow-[5px_5px_0_#141413] hover:-translate-0.5 active:translate-0.5 active:shadow-none transition-all cursor-pointer">
              <Plus size={18} strokeWidth={2.5} />
              <span>{config.createLabel || "Tạo mới"}</span>
            </button>
          </Link>
        )}
      </Heading>

      {/* Thông báo Lỗi / Thành công */}
      <Notice error={actionError || error} success={success} />

      {/* Panel Bảng dữ liệu Neo-Brutalism */}
      <div className="bg-surface border-4 border-line-strong rounded-sm overflow-hidden shadow-[6px_6px_0_#141413]">
        {/* Toolbar: Tìm kiếm, Lọc trạng thái, Tải lại */}
        <div className="flex flex-wrap items-center gap-3 p-4 border-b-4 border-line-strong bg-surface-2">
          {/* Ô Tìm kiếm */}
          <div className="relative flex-1 min-w-60">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
              size={18}
              strokeWidth={2.5}
            />
            <input
              aria-label="Tìm kiếm"
              placeholder="Tìm theo mã, tên hoặc nội dung..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                resetPage();
              }}
              className="w-full pl-10 pr-4 py-2.5 rounded-sm border-3 border-line-strong bg-surface text-sm font-semibold text-text shadow-[2px_2px_0_#141413] focus:shadow-[4px_4px_0_#141413]  outline-none! transition-all"
            />
          </div>

          {/* Dropdown Filter trạng thái */}
          {config.statusOptions && (
            <div className="w-56 shrink-0">
              <CustomSelect
                value={status}
                placeholder="-- Tất cả trạng thái --"
                options={[
                  { value: "", label: "-- Tất cả trạng thái --" },
                  ...config.statusOptions.map((x) => ({
                    value: x,
                    label: STATUS_LABELS[x] || x,
                  })),
                ]}
                onChange={(val) => {
                  setStatus(val);
                  resetPage();
                }}
              />
            </div>
          )}

          {/* Nút Reload */}
          <button
            className="inline-flex items-center justify-center size-11 bg-surface border-3 border-line-strong rounded-sm shadow-[2px_2px_0_#141413] hover:shadow-[4px_4px_0_#141413] hover:-translate-0.5 active:translate-0.5 active:shadow-none transition-all cursor-pointer"
            onClick={reload}
            aria-label="Tải lại"
            title="Tải lại dữ liệu"
          >
            <RefreshCw
              size={18}
              strokeWidth={2.5}
              className={loading ? "animate-spin" : ""}
            />
          </button>
        </div>

        {/* Khung Bảng Dữ Liệu */}
        {loading ? (
          <Loading />
        ) : rows.length === 0 ? (
          <Empty />
        ) : (
          <div className="overflow-x-auto">
            <motion.table
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full border-collapse text-left"
            >
              {/* Table Header */}
              <thead className="bg-warning border-b-4 border-line-strong text-[#000000]">
                <tr>
                  {config.columns.map((key) => (
                    <th
                      key={key}
                      className="px-4 py-3.5 text-xs font-black uppercase tracking-wider border-r-2 border-line-strong/20 last:border-r-0"
                    >
                      {FIELD_LABELS[key] || key}
                    </th>
                  ))}
                  <th className="px-4 py-3.5 text-xs font-black uppercase tracking-wider text-right">
                    Thao tác
                  </th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody className="divide-y-2 divide-line-strong">
                {rows.map((row, index) => (
                  <motion.tr
                    key={row.id || index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className="hover:bg-primary-light/50 transition-colors"
                  >
                    {/* Cột dữ liệu */}
                    {config.columns.map((key) => (
                      <td
                        key={key}
                        className="px-4 py-3.5 text-sm font-bold text-text whitespace-nowrap"
                      >
                        {key === "status" &&
                        typeof getNestedValue(row, key) === "string" ? (
                          config.resource === "/manager/maintenance" ? (
                            <MaintenanceStatusBadge status={getNestedValue(row, key)} />
                          ) : (
                            <StatusBadge status={getNestedValue(row, key)} />
                          )
                        ) : (
                          formatValue(key, getNestedValue(row, key))
                        )}
                      </td>
                    ))}

                    {/* Cột Thao tác */}
                    <td className="px-4 py-3.5 text-sm text-right whitespace-nowrap">
                      <div className="inline-flex items-center justify-end gap-2">
                        {/* Link Chi tiết */}
                        {config.detail && (() => {
                          const rowId = config.idField
                            ? row[config.idField]
                            : row.id ||
                              row.invoiceId ||
                              row.contractId ||
                              row.assignmentId;
                          return (
                            <Link
                              to={`${config.detail}/${rowId}`}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-surface text-text font-extrabold text-xs rounded-sm border-2 border-line-strong shadow-[2px_2px_0_#141413] hover:bg-primary hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all"
                            >
                              <Eye size={14} strokeWidth={2.5} />
                              <span>Chi tiết</span>
                            </Link>
                          );
                        })()}

                        {/* Action Buttons */}
                        {config.actions?.filter((action) => {
                          const rowStatus = String(row?.status || "").toUpperCase();
                          if (typeof action.visibleWhen === "function") {
                            if (!action.visibleWhen(row)) return false;
                          }
                          if (action.visibleWhen && typeof action.visibleWhen === "object") {
                            const matches = Object.entries(action.visibleWhen).every(
                              ([field, value]) => String(row?.[field] ?? "") === String(value),
                            );
                            if (!matches) return false;
                          }
                          const terminal = [
                            "APPROVED", "REJECTED", "CANCELLED", "COMPLETED",
                            "RESOLVED", "DONE", "PAID", "LOCKED",
                          ].includes(rowStatus);
                          const changesState = Boolean(
                            action.body?.status || action.bodyBuilder ||
                            action.promptField || action.reason || action.room,
                          );
                          return !(terminal && changesState);
                        }).map((action) => (
                          <button
                            key={action.label}
                            disabled={busy === String(row.id || row.invoiceId || row.contractId || row.assignmentId)}
                            onClick={() => doAction(row, action)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-surface text-text font-extrabold text-xs rounded-sm border-2 border-line-strong shadow-[2px_2px_0_#141413] hover:bg-warning hover:-translate-y-0.5 active:translate-y-0 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                          >
                            {action.label}
                          </button>
                        ))}

                        {/* Public Actions for Guest (redirect to login) */}
                        {config.publicActions?.map((action) => {
                          const rowId = row.id || row.invoiceId || row.contractId || row.assignmentId;
                          return (
                            <Link
                              key={action.label}
                              to={`${action.redirect}?redirect=${encodeURIComponent(location.pathname + '/' + rowId)}`}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary text-[#000000] font-extrabold text-xs rounded-sm border-2 border-line-strong shadow-[2px_2px_0_#141413] hover:bg-warning hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all"
                            >
                              {action.label}
                            </Link>
                          );
                        })}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </motion.table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="flex items-center justify-between p-4 border-t-4 border-line-strong bg-surface-2 text-xs font-extrabold text-text">
          <span>
            Trang {page + 1}
            {data?.totalElements != null
              ? ` · Tổng ${data.totalElements} mục`
              : ""}
          </span>

          <div className="flex items-center gap-2">
            <button
              className="inline-flex items-center gap-1 px-3.5 py-2 bg-surface text-text rounded-sm border-2 border-line-strong shadow-[2px_2px_0_#141413] hover:shadow-[4px_4px_0_#141413] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              disabled={page === 0}
              onClick={previousPage}
            >
              <ChevronLeft size={16} strokeWidth={2.5} />
              <span>Trang trước</span>
            </button>

            <button
              className="inline-flex items-center gap-1 px-3.5 py-2 bg-surface text-text rounded-sm border-2 border-line-strong shadow-[2px_2px_0_#141413] hover:shadow-[4px_4px_0_#141413] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              disabled={data?.last === true || rows.length < pageSize}
              onClick={nextPage}
            >
              <span>Trang sau</span>
              <ChevronRight size={16} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>

      {confirmAction && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="box-border w-[480px] max-w-[95vw] bg-surface border-3 border-line-strong rounded-sm p-6 shadow-[6px_6px_0_#141413]">
            <h3 className="w-full block leading-normal text-xl font-black text-text mb-2">Xác nhận thao tác?</h3>
            <p className="w-full block leading-normal text-sm font-bold text-text-muted mb-6">
              {confirmAction.action.label} cho mục #{confirmAction.row.id || confirmAction.row.title || confirmAction.row.invoiceId || confirmAction.row.contractId}?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button type="button" onClick={() => setConfirmAction(null)} className="px-4 h-10 border-2 border-line-strong rounded-sm font-bold bg-surface hover:bg-surface-2 transition-all cursor-pointer outline-none!">Hủy bỏ</button>
              <button type="button" disabled={Boolean(busy)} onClick={() => void doAction(confirmAction.row, confirmAction.action, true)} className="px-4 h-10 border-3 border-line-strong rounded-sm font-black bg-primary text-black shadow-[3px_3px_0_#141413] transition-all cursor-pointer outline-none! disabled:opacity-50">Xác nhận</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
