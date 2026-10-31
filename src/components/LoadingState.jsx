// Hiển thị skeleton loading - giả lập layout khi đang tải data
import { RefreshCw } from 'lucide-react';

// Loading đơn giản - chỉ hiện spinner
export function SimpleLoading() {
  return (
    <div style={{ 
      padding: '60px 20px', 
      textAlign: 'center',
      color: '#666'
    }}>
      <RefreshCw 
        size={32} 
        style={{ 
          animation: 'spin 1s linear infinite',
          marginBottom: '12px'
        }} 
      />
      <p>Đang tải dữ liệu...</p>
    </div>
  );
}

// Loading cho bảng dữ liệu (ví dụ: danh sách phòng)
export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div style={{ padding: '20px' }}>
      {/* Header của bảng */}
      <div style={{
        height: '40px',
        background: '#e5e7eb',
        borderRadius: '6px',
        marginBottom: '16px',
        animation: 'pulse 1.5s ease-in-out infinite'
      }} />
      
      {/* Các dòng dữ liệu giả */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div 
          key={rowIndex} 
          style={{ 
            display: 'flex', 
            gap: '12px', 
            marginBottom: '12px' 
          }}
        >
          {Array.from({ length: cols }).map((_, colIndex) => (
            <div
              key={colIndex}
              style={{
                height: '32px',
                flex: 1,
                background: '#f3f4f6',
                borderRadius: '4px',
                animation: 'pulse 1.5s ease-in-out infinite'
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// Loading cho form (ví dụ: chi tiết hợp đồng)
export function FormSkeleton() {
  return (
    <div style={{ padding: '20px', maxWidth: '600px' }}>
      {/* Giả lập 5 input fields */}
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} style={{ marginBottom: '20px' }}>
          {/* Label */}
          <div style={{
            width: '120px',
            height: '16px',
            background: '#e5e7eb',
            borderRadius: '4px',
            marginBottom: '8px',
            animation: 'pulse 1.5s ease-in-out infinite'
          }} />
          {/* Input */}
          <div style={{
            height: '40px',
            background: '#f3f4f6',
            borderRadius: '6px',
            animation: 'pulse 1.5s ease-in-out infinite'
          }} />
        </div>
      ))}
    </div>
  );
}

// CSS animation cho pulse effect
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}
