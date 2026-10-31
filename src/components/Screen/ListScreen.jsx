// ====================================
// LIST SCREEN - Màn hình hiển thị danh sách
// ====================================
// Dùng cho: danh sách phòng, hóa đơn, sinh viên, hợp đồng...
// Mục đích: Hiển thị table với search, filter, pagination

import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, Plus, RefreshCw, Filter, ArrowUp, ArrowDown } from "lucide-react";
import { motion } from "motion/react";
import { asList } from "../../api/apiClient";
import { resources } from "../../services/resource.service";
import { errorMessage } from "../../utils/errorHandler";
import { FIELD_LABELS } from "./constants";
import { formatValue, getNestedValue } from "./formatters";
import { Notice, Loading, Empty, Heading } from "./UIComponents";
import { useLoad } from "./useLoad";
import useDebounce from "../../hooks/useDebounce";
import usePagination from "../../hooks/usePagination";
import { STATUS_LABELS, FILTERABLE_STATUSES } from "../../constants/status";
import { Button, Card, StatusBadge } from "../ui";

/**
 * Component ListScreen - Hiển thị danh sách dữ liệu dạng bảng
 * @param {object} props
 * @param {object} props.config - Cấu hình màn hình (resource, columns, actions...)
 * 
 * Config structure:
 * {
 *   resource: "/invoices/me",  // API endpoint
 *   columns: ["id", "name", "status"],  // Các cột hiển thị
 *   detail: "/student/invoices",  // Link chi tiết
 *   create: "/student/applications/new",  // Link tạo mới
 *   actions: [{ label: "Duyệt", method: "POST", suffix: "/approve" }]  // Actions
 * }
 */
export default function ListScreen({ config }) {
  const location = useLocation();
  
  // State cho search box
  const [search, setSearch] = useState("");
  
  // State cho filter status (dropdown)
  const [status, setStatus] = useState("");
  
  // State cho loading của action buttons
  const [busy, setBusy] = useState("");
  
  // State cho thông báo thành công
  const [success, setSuccess] = useState("");
  
  // State cho lỗi khi thực hiện action
  const [actionError, setActionError] = useState("");
  
  // Hook pagination: quản lý trang hiện tại
  const { page, pageSize, nextPage, previousPage, resetPage } = usePagination(0, 10);
  
  // Debounce search: chỉ search sau khi user ngừng gõ 300ms
  // Tránh gọi API liên tục khi user đang gõ
  const debouncedSearch = useDebounce(search, 300);
  
  // Load data từ API
  const { data, error, loading, reload } = useLoad(config.resource, {
    page,
    size: pageSize,
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    ...(status ? { status } : {}),
  });
  
  // Convert data sang array (data có thể là object hoặc array)
  const rows = asList(data);
  
  // Xác định đường dẫn tạo mới
  // Logic phức tạp này sẽ được cải thiện sau
  const createPath =
    config.create ||
    (config.group === "student" && config.resource.includes("applications")
      ? "/student/applications/new"
      : config.group === "student" && config.resource.includes("maintenance")
        ? "/student/maintenance/new"
        : config.group === "manager" &&
          ["/rooms", "/invoices"].includes(config.resource)
          ? `${location.pathname}/new`
          : null);
  
  /**
   * Thực hiện action trên 1 row (duyệt, từ chối, xóa...)
   * @param {object} row - Dữ liệu của row
   * @param {object} action - Config của action
   */
  async function doAction(row, action) {
    // Nếu action yêu cầu confirm, hiển thị dialog xác nhận
    if (
      action.confirm &&
      !window.confirm(`${action.label} cho mục ${row.id || row.title}?`)
    ) {
      return;
    }
    
    // Set busy state (disable button của row đang xử lý)
    setBusy(String(row.id));
    setActionError("");
    setSuccess("");
    
    try {
      // Gọi API action
      await resources.action(
        `${config.resource.replace(/\/me$/, "")}/${row.id}${action.suffix}`,
        action.method,
        action.body,
      );
      
      // Thành công -> hiển thị thông báo và reload data
      setSuccess("Thao tác đã được lưu trên máy chủ.");
      reload();
    } catch (e) {
      // Lỗi -> hiển thị thông báo lỗi
      setActionError(errorMessage(e));
    } finally {
      // Clear busy state
      setBusy("");
    }
  }
  
  return (
    <>
      {/* Heading với breadcrumb và nút tạo mới */}
      <Heading config={config}>
        {createPath && (
          <Link to={createPath}>
            <Button variant="primary" size="md">
              <Plus size={16} /> Tạo mới
            </Button>
          </Link>
        )}
      </Heading>
      
      {/* Thông báo lỗi hoặc thành công */}
      <Notice error={actionError || error} success={success} />
      
      {/* Panel chứa toolbar và table */}
      <div className="bg-white border-2 border-[var(--color-line)] rounded-[var(--radius-lg)] overflow-hidden">
        {/* Toolbar: search box, filter dropdown, reload button */}
        <div className="flex flex-wrap gap-3 p-4 border-b-2 border-[var(--color-line)] bg-[var(--color-surface)]">
          {/* Search box */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={18} />
            <input
              aria-label="Tìm kiếm"
              placeholder="Tìm theo mã, tên hoặc nội dung…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                resetPage(); // Reset về trang 1 khi search
              }}
              className="w-full pl-10 pr-4 py-2.5 rounded-[var(--radius-md)] border-2 border-[var(--color-line)] bg-white text-sm focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all outline-none"
            />
          </div>
          
          {/* Filter dropdown cho status */}
          <select
            aria-label="Lọc trạng thái"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              resetPage(); // Reset về trang 1 khi filter
            }}
            className="border-2 border-[var(--color-line)] rounded-[var(--radius-md)] px-3 py-2.5 text-sm bg-white outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all"
          >
            <option value="">Mọi trạng thái</option>
            {FILTERABLE_STATUSES.map((x) => (
              <option key={x} value={x}>
                {STATUS_LABELS[x]}
              </option>
            ))}
          </select>
          
          {/* Nút reload */}
          <button
            className="inline-flex items-center gap-2 px-3 py-2.5 border-2 border-[var(--color-line)] rounded-[var(--radius-md)] text-sm font-[family-name:var(--font-family-display)] font-semibold text-[var(--color-text)] hover:bg-[var(--color-surface-2)] hover:border-[var(--color-line-strong)] transition-all"
            onClick={reload}
            aria-label="Tải lại"
          >
            <RefreshCw size={16} />
          </button>
        </div>
        
        {/* Hiển thị loading, empty, hoặc table */}
        {loading ? (
          <Loading />
        ) : rows.length === 0 ? (
          <Empty />
        ) : (
          <div className="overflow-x-auto">
            <motion.table
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full border-collapse"
            >
              {/* Table header */}
              <thead className="bg-[var(--color-surface-2)] border-b border-[var(--color-line)]">
                <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {/* Hiển thị header cho từng column */}
                  {config.columns.map((key) => (
                    <th key={key} className="text-left px-4 py-3 text-xs font-[family-name:var(--font-family-display)] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">{FIELD_LABELS[key] || key}</th>
                  ))}
                  <th className="text-left px-4 py-3 text-xs font-[family-name:var(--font-family-display)] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">Thao tác</th>
                </motion.tr>
              </thead>
              
              {/* Table body */}
              <tbody>
                {rows.map((row, index) => (
                  <motion.tr
                    key={row.id || index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                     whileHover={{ backgroundColor: "var(--color-surface)" }}
                    className="border-b border-[var(--color-line)] transition-colors"
                  >
                    {/* Hiển thị data cho từng column */}
                    {config.columns.map((key) => (
                      <td key={key} className="px-4 py-3 text-sm text-[var(--color-text)]">
                        {key === 'status' && typeof getNestedValue(row, key) === 'string' ? (
                          <StatusBadge status={getNestedValue(row, key)} />
                        ) : (
                          formatValue(key, getNestedValue(row, key))
                        )}
                      </td>
                    ))}
                    
                    {/* Cột thao tác: link chi tiết và action buttons */}
                    <td className="px-4 py-3 text-sm">
                      <div className="flex flex-wrap gap-2">
                        {/* Link chi tiết */}
                        {config.detail && (
                          <Link
                            to={`${config.detail}/${row.id}`}
                            className="text-[var(--color-primary)] font-[family-name:var(--font-family-display)] font-semibold hover:underline transition-colors"
                          >
                            Chi tiết
                          </Link>
                        )}
                        
                        {/* Action buttons */}
                        {config.actions?.map((action) => (
                          <button
                            key={action.label}
                            disabled={busy === String(row.id)}
                            onClick={() => doAction(row, action)}
                            className="text-[var(--color-primary)] font-[family-name:var(--font-family-display)] font-semibold hover:underline disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </motion.table>
          </div>
        )}
        
        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t-2 border-[var(--color-line)] text-sm text-[var(--color-text-muted)]">
          <span className="font-[family-name:var(--font-family-body)]">
            Trang {page + 1}
            {data?.totalElements != null ? ` · ${data.totalElements} mục` : ""}
          </span>
          <div className="flex gap-2">
            <button
              className="inline-flex items-center gap-2 px-4 py-2 border-2 border-[var(--color-line)] rounded-[var(--radius-md)] text-sm font-[family-name:var(--font-family-display)] font-semibold text-[var(--color-text)] hover:bg-[var(--color-surface-2)] hover:border-[var(--color-line-strong)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={page === 0}
              onClick={previousPage}
            >
              Trước
            </button>
            <button
              className="inline-flex items-center gap-2 px-4 py-2 border-2 border-[var(--color-line)] rounded-[var(--radius-md)] text-sm font-[family-name:var(--font-family-display)] font-semibold text-[var(--color-text)] hover:bg-[var(--color-surface-2)] hover:border-[var(--color-line-strong)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={data?.last === true || rows.length < 10}
              onClick={nextPage}
            >
              Sau
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
