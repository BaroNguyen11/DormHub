// Hook để fetch data từ API - dễ dùng hơn viết fetch thủ công
import { useEffect, useState } from 'react';
import { resources } from '../services/resource.service';

/**
 * Hook để load data từ API
 * 
 * Ví dụ sử dụng:
 * const { data, loading, error, refetch } = useResource('/invoices/me');
 * 
 * if (loading) return <div>Đang tải...</div>;
 * if (error) return <div>Lỗi: {error}</div>;
 * return <div>{data.length} hóa đơn</div>;
 */
export function useResource(path, params = {}) {
  // State để lưu data, loading, error
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Hàm load data
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Gọi API
      const result = await resources.list(path, params);
      
      // Lưu kết quả vào state
      setData(result);
    } catch (err) {
      // Có lỗi thì lưu error message
      setError(err.message || 'Đã xảy ra lỗi');
      setData(null);
    } finally {
      // Dù thành công hay lỗi cũng tắt loading
      setLoading(false);
    }
  };

  // Tự động load khi component mount hoặc path/params thay đổi
  useEffect(() => {
    let cancelled = false; // Flag để tránh update state khi component đã unmount

    loadData();

    // Cleanup function
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, JSON.stringify(params)]);

  // Hàm để reload data (gọi lại API)
  const refetch = () => {
    loadData();
  };

  return { 
    data,      // Dữ liệu từ API
    loading,   // Đang load hay không
    error,     // Thông báo lỗi (nếu có)
    refetch    // Hàm để load lại data
  };
}
