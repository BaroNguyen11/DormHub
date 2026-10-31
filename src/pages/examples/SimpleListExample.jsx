// ====================================
// VÍ DỤ: Trang hiển thị danh sách đơn giản
// ====================================
// Đây là template cơ bản để tạo 1 trang list
// Copy file này và sửa lại theo nhu cầu

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useResource } from '../../hooks/useResource';
import { SimpleLoading } from '../../components/LoadingState';
import { EmptyState } from '../../components/EmptyState';

export default function SimpleListExample() {
  // ===== 1. STATE & DATA =====
  // State để lưu giá trị tìm kiếm
  const [searchText, setSearchText] = useState('');
  
  // Load data từ API
  const { data, loading, error, refetch } = useResource('/invoices/me', {
    search: searchText  // Tham số tìm kiếm
  });

  // ===== 2. XỬ LÝ HIỂN THỊ =====
  // Nếu đang loading -> hiện skeleton
  if (loading) {
    return <SimpleLoading />;
  }

  // Nếu có lỗi -> hiện thông báo lỗi
  if (error) {
    return (
      <EmptyState 
        type="error" 
        message={error}
        action={
          <button onClick={refetch}>
            Thử lại
          </button>
        }
      />
    );
  }

  // Chuyển data thành array (API có thể trả về object hoặc array)
  const items = Array.isArray(data) ? data : data?.content || [];

  // ===== 3. RENDER GIAO DIỆN =====
  return (
    <div style={{ padding: '20px' }}>
      {/* Header */}
      <h1>Danh sách hóa đơn</h1>
      
      {/* Search box */}
      <input 
        type="text"
        placeholder="Tìm kiếm..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{
          padding: '8px 12px',
          border: '1px solid #ddd',
          borderRadius: '6px',
          marginBottom: '20px',
          width: '300px'
        }}
      />

      {/* Danh sách */}
      {items.length === 0 ? (
        <EmptyState type="empty" />
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f3f4f6' }}>
              <th style={{ padding: '12px', textAlign: 'left' }}>Mã</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Loại</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Số tiền</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '12px' }}>
                  <Link to={`/student/invoices/${item.id}`}>
                    #{item.id}
                  </Link>
                </td>
                <td style={{ padding: '12px' }}>{item.type}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>
                  {item.totalAmount?.toLocaleString('vi-VN')} đ
                </td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '12px',
                    background: item.status === 'PAID' ? '#dcfce7' : '#fee2e2',
                    color: item.status === 'PAID' ? '#166534' : '#991b1b',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}>
                    {item.status === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
