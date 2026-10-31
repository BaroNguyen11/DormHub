# 💡 Ví dụ Code Thực Tế

Các ví dụ copy-paste được ngay.

---

## 1. Tạo trang danh sách đơn giản

```javascript
// src/pages/Student/RoomList.jsx
import { useResource } from '../../hooks/useResource';
import { SimpleLoading } from '../../components/LoadingState';
import { EmptyState } from '../../components/EmptyState';

export default function RoomList() {
  // Load rooms từ API
  const { data, loading, error } = useResource('/rooms');
  
  // Xử lý các trạng thái
  if (loading) return <SimpleLoading />;
  if (error) return <div className="error">{error}</div>;
  if (!data?.length) return <EmptyState type="empty" />;
  
  // Render danh sách
  return (
    <div className="container">
      <h1>Danh sách phòng</h1>
      <div className="grid">
        {data.map(room => (
          <div key={room.id} className="card">
            <h3>Phòng {room.roomNumber}</h3>
            <p>Tòa: {room.buildingName}</p>
            <p>Giá: {room.monthlyPrice.toLocaleString('vi-VN')} đ</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 2. Form với validation

```javascript
import { useState } from 'react';
import { resources } from '../../services/resource.service';
import { useNavigate } from 'react-router-dom';

export default function MaintenanceCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form state
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM'
  });
  
  // Validation
  const validate = () => {
    if (!form.title.trim()) {
      setError('Vui lòng nhập tiêu đề');
      return false;
    }
    if (form.title.length < 5) {
      setError('Tiêu đề phải ít nhất 5 ký tự');
      return false;
    }
    if (!form.description.trim()) {
      setError('Vui lòng nhập mô tả');
      return false;
    }
    return true;
  };
  
  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validate()) return;
    
    try {
      setLoading(true);
      await resources.create('/maintenance', form);
      navigate('/student/maintenance', {
        state: { success: 'Tạo yêu cầu thành công!' }
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="form">
      <h1>Báo hỏng mới</h1>
      
      {error && <div className="error">{error}</div>}
      
      <label>
        Tiêu đề *
        <input 
          type="text"
          value={form.title}
          onChange={(e) => setForm({...form, title: e.target.value})}
          placeholder="VD: Điều hòa không chạy"
        />
      </label>
      
      <label>
        Mô tả *
        <textarea 
          value={form.description}
          onChange={(e) => setForm({...form, description: e.target.value})}
          placeholder="Mô tả chi tiết vấn đề..."
          rows={5}
        />
      </label>
      
      <label>
        Mức độ ưu tiên
        <select 
          value={form.priority}
          onChange={(e) => setForm({...form, priority: e.target.value})}
        >
          <option value="LOW">Thấp</option>
          <option value="MEDIUM">Trung bình</option>
          <option value="HIGH">Cao</option>
          <option value="URGENT">Khẩn cấp</option>
        </select>
      </label>
      
      <div className="form-actions">
        <button 
          type="button" 
          onClick={() => navigate(-1)}
          disabled={loading}
        >
          Hủy
        </button>
        <button 
          type="submit" 
          disabled={loading}
          className="primary"
        >
          {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
        </button>
      </div>
    </form>
  );
}
```

---

## 3. Search với debounce

```javascript
import { useState } from 'react';
import { useDebounce } from '../../hooks/useDebounce';
import { useResource } from '../../hooks/useResource';

export default function StudentSearch() {
  const [search, setSearch] = useState('');
  
  // Debounce 300ms - chỉ gọi API sau khi user ngừng gõ 300ms
  const debouncedSearch = useDebounce(search, 300);
  
  // Load data với search đã debounce
  const { data, loading } = useResource('/students', {
    search: debouncedSearch
  });
  
  return (
    <div>
      <input 
        type="search"
        placeholder="Tìm sinh viên..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      
      {loading && <p>Đang tìm kiếm...</p>}
      
      {data?.map(student => (
        <div key={student.id}>
          {student.fullName} - {student.studentCode}
        </div>
      ))}
    </div>
  );
}
```

---

## 4. Pagination

```javascript
import { useState } from 'react';
import { useResource } from '../../hooks/useResource';

export default function InvoiceList() {
  const [page, setPage] = useState(0);
  const pageSize = 10;
  
  const { data, loading } = useResource('/invoices/me', {
    page,
    size: pageSize
  });
  
  const totalPages = data?.totalPages || 0;
  const items = data?.content || [];
  
  return (
    <div>
      {/* List */}
      {items.map(invoice => (
        <div key={invoice.id}>{invoice.totalAmount}</div>
      ))}
      
      {/* Pagination */}
      <div className="pagination">
        <button 
          onClick={() => setPage(p => Math.max(0, p - 1))}
          disabled={page === 0 || loading}
        >
          ← Trước
        </button>
        
        <span>Trang {page + 1} / {totalPages}</span>
        
        <button 
          onClick={() => setPage(p => p + 1)}
          disabled={page >= totalPages - 1 || loading}
        >
          Sau →
        </button>
      </div>
    </div>
  );
}
```

---

## 5. Protected action với confirm

```javascript
import { useState } from 'react';
import { resources } from '../../services/resource.service';

export default function ApplicationDetail({ applicationId }) {
  const [loading, setLoading] = useState(false);
  
  const handleApprove = async () => {
    // Confirm trước khi thực hiện
    if (!window.confirm('Bạn chắc chắn muốn duyệt đơn này?')) {
      return;
    }
    
    try {
      setLoading(true);
      await resources.action(`/applications/${applicationId}/approve`, 'PATCH');
      alert('Duyệt đơn thành công!');
      window.location.reload();
    } catch (error) {
      alert('Lỗi: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleReject = async () => {
    const reason = prompt('Lý do từ chối:');
    if (!reason) return;
    
    try {
      setLoading(true);
      await resources.action(
        `/applications/${applicationId}/reject`, 
        'PATCH',
        { reason }
      );
      alert('Từ chối đơn thành công!');
      window.location.reload();
    } catch (error) {
      alert('Lỗi: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="actions">
      <button 
        onClick={handleApprove}
        disabled={loading}
        className="success"
      >
        ✅ Duyệt
      </button>
      <button 
        onClick={handleReject}
        disabled={loading}
        className="danger"
      >
        ❌ Từ chối
      </button>
    </div>
  );
}
```

---

## 6. File upload

```javascript
import { useState } from 'react';
import { api } from '../../api/apiClient';

export default function ImageUpload() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    // Validate file type
    if (!selectedFile.type.startsWith('image/')) {
      alert('Vui lòng chọn file ảnh!');
      return;
    }
    
    // Validate file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      alert('File quá lớn! Tối đa 5MB.');
      return;
    }
    
    setFile(selectedFile);
    
    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(selectedFile);
  };
  
  const handleUpload = async () => {
    if (!file) return;
    
    try {
      setUploading(true);
      
      // Tạo FormData
      const formData = new FormData();
      formData.append('image', file);
      formData.append('description', 'Maintenance image');
      
      // Upload
      const result = await api('/upload', {
        method: 'POST',
        body: formData
      });
      
      alert('Upload thành công! URL: ' + result.url);
    } catch (error) {
      alert('Lỗi upload: ' + error.message);
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div>
      <input 
        type="file"
        accept="image/*"
        onChange={handleFileChange}
      />
      
      {preview && (
        <img 
          src={preview} 
          alt="Preview"
          style={{ maxWidth: '200px', marginTop: '10px' }}
        />
      )}
      
      <button 
        onClick={handleUpload}
        disabled={!file || uploading}
      >
        {uploading ? 'Đang upload...' : 'Upload'}
      </button>
    </div>
  );
}
```

---

Copy những ví dụ này và chỉnh sửa cho phù hợp với use case của bạn! 🚀
