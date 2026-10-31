// ====================================
// HOOK: useLoad - Load data từ API
// ====================================
// Custom hook để load data từ API với auto-reload
// Mục đích: Tái sử dụng logic load data, tránh lặp code

import { useEffect, useState } from "react";
import { resources } from "../../services/resource.service";
import { errorMessage } from "../../utils/errorHandler";

/**
 * Hook để load data từ API với auto-reload
 * 
 * @param {string} path - API path (vd: '/invoices/me', '/rooms')
 * @param {object} params - Query params (vd: {page: 0, size: 10, search: "A101"})
 * @returns {object} - Object chứa {data, error, loading, reload}
 * 
 * Ví dụ sử dụng:
 * const { data, error, loading, reload } = useLoad('/rooms', { page: 0, size: 10 });
 * 
 * - data: dữ liệu trả về từ API (null nếu chưa load)
 * - error: thông báo lỗi (string, empty nếu không có lỗi)
 * - loading: true khi đang load, false khi xong
 * - reload: function để load lại data (gọi khi cần refresh)
 */
export function useLoad(path, params) {
  // State lưu trữ data từ API
  const [data, setData] = useState(null);
  
  // State lưu trữ error message
  const [error, setError] = useState("");
  
  // State loading: true khi đang fetch, false khi xong
  const [loading, setLoading] = useState(true);
  
  // Version dùng để trigger reload (tăng version -> useEffect chạy lại)
  const [version, setVersion] = useState(0);

  // Function để reload data
  // Cách dùng: gọi reload() khi muốn fetch lại data
  const reload = () => setVersion((v) => v + 1);

  // Convert params thành string để dùng làm dependency của useEffect
  // Vì object mới luôn khác object cũ, nên cần stringify để so sánh giá trị
  const paramsKey = JSON.stringify(params);

  // useEffect: chạy mỗi khi path, paramsKey, hoặc version thay đổi
  useEffect(() => {
    // Flag để tránh update state sau khi component đã unmount
    // (tránh memory leak và warning)
    let isActive = true;

    // Async function bên trong useEffect
    // (không thể dùng async trực tiếp trong useEffect)
    async function fetchData() {
      // Nếu component đã unmount thì dừng luôn
      if (!isActive) return;

      // Bắt đầu loading
      setLoading(true);
      setError("");

      try {
        // Gọi API để lấy data
        const result = await resources.list(path, JSON.parse(paramsKey));
        
        // Chỉ update state nếu component vẫn còn mount
        if (isActive) {
          setData(result);
        }
      } catch (err) {
        // Xử lý lỗi: convert error object thành message string
        if (isActive) {
          setError(errorMessage(err));
        }
      } finally {
        // Kết thúc loading
        if (isActive) {
          setLoading(false);
        }
      }
    }

    // Gọi function fetch data
    fetchData();

    // Cleanup function: chạy khi component unmount hoặc dependencies thay đổi
    return () => {
      isActive = false;
    };
  }, [path, paramsKey, version]); // Dependencies: re-run khi 3 giá trị này thay đổi

  // Return object chứa data và các helper
  return { data, error, loading, reload };
}
