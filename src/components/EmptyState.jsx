// Hiển thị khi không có dữ liệu (ví dụ: chưa có hóa đơn)
import { Search, Inbox, AlertCircle } from 'lucide-react';

export function EmptyState({ 
  type = 'default',  // Loại empty state
  message,           // Thông báo tùy chỉnh
  action             // Button action (optional)
}) {
  // Chọn icon và text tùy theo loại
  const configs = {
    search: {
      icon: Search,
      title: 'Không tìm thấy kết quả',
      description: 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc'
    },
    empty: {
      icon: Inbox,
      title: 'Chưa có dữ liệu',
      description: 'Dữ liệu sẽ xuất hiện khi có thông tin mới'
    },
    error: {
      icon: AlertCircle,
      title: 'Có lỗi xảy ra',
      description: 'Vui lòng thử lại sau'
    }
  };

  const config = configs[type] || configs.empty;
  const Icon = config.icon;

  return (
    <div style={{
      padding: '80px 20px',
      textAlign: 'center',
      color: '#6b7280'
    }}>
      <Icon size={48} style={{ 
        marginBottom: '16px',
        color: '#9ca3af'
      }} />
      <h3 style={{ 
        fontSize: '18px',
        fontWeight: '600',
        marginBottom: '8px',
        color: '#374151'
      }}>
        {message || config.title}
      </h3>
      <p style={{ marginBottom: '24px' }}>
        {config.description}
      </p>
      {action && action}
    </div>
  );
}
