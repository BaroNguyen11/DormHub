# 📡 Hướng dẫn gọi API

## Cách gọi API trong project

Project sử dụng **resource service pattern** - 1 cách đơn giản để gọi API.

---

## 🎯 Resource Service

File: `src/services/resource.service.js`

Có 5 methods cơ bản:

### 1. list() - Lấy danh sách
```javascript
import { resources } from '../services/resource.service';

// Lấy tất cả
const invoices = await resources.list('/invoices/me');

// Với query params
const filtered = await resources.list('/invoices/me', {
  page: 0,
  size: 10,
  search: 'keyword',
  status: 'UNPAID'
});
// → GET /api/v1/invoices/me?page=0&size=10&search=keyword&status=UNPAID
```

### 2. get() - Lấy 1 item
```javascript
// Lấy invoice #123
const invoice = await resources.get('/invoices', 123);
// → GET /api/v1/invoices/123
```

### 3. create() - Tạo mới
```javascript
const newInvoice = await resources.create('/invoices', {
  roomId: 101,
  billingMonth: '2024-11',
  totalAmount: 500000
});
// → POST /api/v1/invoices
// Body: { roomId: 101, ... }
```

### 4. update() - Cập nhật
```javascript
const updated = await resources.update('/invoices', 123, {
  status: 'PAID'
});
// → PATCH /api/v1/invoices/123
// Body: { status: 'PAID' }
```

### 5. action() - Custom action
```javascript
// Approve đơn đăng ký
await resources.action('/applications/123/approve', 'PATCH');
// → PATCH /api/v1/applications/123/approve

// Thanh toán hóa đơn
await resources.action('/invoices/123/pay', 'POST', {
  method: 'VNPAY'
});
// → POST /api/v1/invoices/123/pay
// Body: { method: 'VNPAY' }
```

---

## 🪝 Dùng với Hook

Thay vì gọi trực tiếp, nên dùng **useResource hook**:

```javascript
import { useResource } from '../hooks/useResource';

function InvoiceList() {
  // Hook tự động gọi API khi component mount
  const { data, loading, error, refetch } = useResource('/invoices/me', {
    page: 0,
    size: 10
  });
  
  if (loading) return <div>Đang tải...</div>;
  if (error) return <div>Lỗi: {error}</div>;
  
  return (
    <div>
      {data.map(item => <div key={item.id}>{item.totalAmount}</div>)}
      <button onClick={refetch}>Tải lại</button>
    </div>
  );
}
```

**Lợi ích:**
- ✅ Tự động handle loading state
- ✅ Tự động handle error
- ✅ Có function refetch để reload
- ✅ Cleanup khi component unmount

---

## 🔐 Authentication

API client tự động xử lý:
- ✅ JWT token (cookie-based)
- ✅ CSRF token
- ✅ Auto refresh khi 401
- ✅ Include credentials

Bạn không cần lo về auth khi gọi API!

---

## ⚠️ Error Handling

```javascript
try {
  const result = await resources.create('/invoices', data);
  console.log('✅ Success:', result);
} catch (error) {
  // error.message: Human-readable message
  // error.status: HTTP status code (400, 404, 500...)
  // error.details: Chi tiết lỗi từ backend
  
  console.error('❌ Error:', error.message);
  
  if (error.status === 400) {
    alert('Dữ liệu không hợp lệ!');
  } else if (error.status === 404) {
    alert('Không tìm thấy!');
  } else {
    alert('Lỗi server!');
  }
}
```

---

## 📝 Best Practices

### ✅ DO:

1. **Dùng useResource cho GET requests**
```javascript
const { data } = useResource('/rooms');
```

2. **Dùng resources.create/update cho mutations**
```javascript
const handleSubmit = async (formData) => {
  await resources.create('/maintenance', formData);
};
```

3. **Check loading/error states**
```javascript
if (loading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
```

4. **Debounce search inputs**
```javascript
const [search, setSearch] = useState('');
const debouncedSearch = useDebounce(search, 300);

const { data } = useResource('/rooms', { 
  search: debouncedSearch 
});
```

### ❌ DON'T:

1. **Không gọi API trong render**
```javascript
// ❌ BAD
function MyComponent() {
  const data = resources.list('/rooms'); // Infinite loop!
  return <div>{data}</div>;
}

// ✅ GOOD
function MyComponent() {
  const { data } = useResource('/rooms');
  return <div>{data}</div>;
}
```

2. **Không forget await**
```javascript
// ❌ BAD
const result = resources.create('/rooms', data); // Promise object!

// ✅ GOOD
const result = await resources.create('/rooms', data);
```

3. **Không hardcode base URL**
```javascript
// ❌ BAD
fetch('http://localhost:8080/api/v1/rooms')

// ✅ GOOD
resources.list('/rooms')
```

---

## 🧪 Testing API với Console

Trong browser console:
```javascript
// Import trong console
const { resources } = await import('/src/services/resource.service.js');

// Test API
const data = await resources.list('/invoices/me');
console.table(data);
```

---

Có câu hỏi về API? Hỏi backend dev hoặc check backend docs! 📚
