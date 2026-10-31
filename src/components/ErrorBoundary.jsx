// Component này bắt lỗi để app không bị crash hoàn toàn
// Giống như try-catch nhưng cho React components
import { Component } from 'react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,  // Có lỗi hay không?
      error: null       // Lỗi là gì?
    };
  }

  // React tự gọi hàm này khi có lỗi xảy ra
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  // Log lỗi ra console để debug
  componentDidCatch(error, info) {
    console.error('❌ Lỗi component:', error);
    console.error('📍 Vị trí lỗi:', info.componentStack);
  }

  render() {
    // Nếu có lỗi, hiển thị màn hình lỗi thay vì crash
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          textAlign: 'center'
        }}>
          <div>
            <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>
              😵 Đã xảy ra lỗi
            </h1>
            <p style={{ color: '#666', marginBottom: '24px' }}>
              {this.state.error?.message || 'Có gì đó không đúng...'}
            </p>
            <button 
              onClick={() => window.location.reload()}
              style={{
                padding: '10px 20px',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              🔄 Tải lại trang
            </button>
          </div>
        </div>
      );
    }

    // Không có lỗi thì render bình thường
    return this.props.children;
  }
}
