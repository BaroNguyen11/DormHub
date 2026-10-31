# 🚀 Hướng dẫn bắt đầu - DormHub Frontend

## Dành cho sinh viên mới vào team

Tài liệu này giúp bạn hiểu cấu trúc project và bắt đầu code nhanh chóng.

---

## 📁 Cấu trúc thư mục

```
src/
├── api/              # Gọi API (fetch, CSRF, refresh token)
├── components/       # Components tái sử dụng
│   ├── Screen/       # 🎯 Quan trọng: Generic screens (List, Detail, Form...)
│   ├── ErrorBoundary.jsx
│   ├── LoadingState.jsx
│   └── EmptyState.jsx
├── constants/        # Hằng số (screenConfig, roles, status...)
├── context/          # React Context (Auth)
├── hooks/            # Custom hooks (useAuth, useResource, useDebounce...)
├── layouts/          # Layout wrappers (Guest, Student, Manager)
├── pages/            # Các trang cụ thể
│   ├── shared/       # 🎯 Pages dùng chung Student/Manager
│   ├── Student/      # Pages riêng cho Student
│   ├── Manager/      # Pages riêng cho Manager
│   └── Auth/         # Login, Register, Forgot Password...
├── routes/           # Cấu hình routing
├── services/         # API services (auth, resource)
└── utils/            # Helper functions (format, validation...)
```

---

## 🎯 Workflow: Tạo trang mới

### Bước 1: Quyết định loại page

**Câu hỏi:** Page này Student và Manager đều dùng được không?

- ✅ **CÓ** → Tạo trong `pages/shared/`
- ❌ **KHÔNG** → Tạo trong `pages/Student/` hoặc `pages/Manager/`

### Bước 2: Chọn template phù hợp

**Loại page bạn cần:**

1. **Danh sách** (List) → Copy `pages/shared/InvoiceList.jsx`
2. **Chi tiết** (Detail) → Copy `pages/shared/InvoiceDetail.jsx`
3. **Form tạo mới** → Tham khảo `components/Screen/FormScreen.jsx`
4. **Dashboard với biểu đồ** → Tham khảo `pages/Student/Dashboard.jsx`

### Bước 3: Cập nhật screenConfig

Mở file `constants/screenConfig.js` và thêm config:

```javascript
export const screens = {
  // ... existing configs
  
  "/student/my-new-page": {
    title: "Trang mới của tôi",
    group: "student",           // guest | student | manager
    type: "list",               // home | list | detail | form | dashboard
    resource: "/api-endpoint",  // API path
    columns: ["id", "name"],    // Cột hiển thị (cho list)
    search: true,               // Có search box không?
    detail: "/student/my-new-page"  // Path tới chi tiết
  },
};
```

### Bước 4: Update pageMap

Mở file `routes/pageMap.js` và thêm:

```javascript
export const pageMap = {
  // ... existing mappings
  '/student/my-new-page': '../pages/Student/MyNewPage.jsx',
};
```

### Bước 5: Tạo file page

```javascript
// src/pages/Student/MyNewPage.jsx
import Screen from '../../components/Screen';
import { screens } from '../../constants/screenConfig';

export default function MyNewPage() {
  const config = screens['/student/my-new-page'];
  return <Screen config={config} />;
}
```

### Bước 6: Test

- Truy cập `http://localhost:5173/student/my-new-page`
- Check xem data hiển thị đúng không
- Test search, pagination (nếu có)

---

## 📖 Các concepts quan trọng

### 1. Screen Component là gì?

`Screen` là **generic component** - 1 component có thể hiển thị nhiều loại màn hình khác nhau.

Thay vì viết code cho từng màn hình (Invoice, Room, Contract...), bạn chỉ cần:
1. Định nghĩa config trong `screenConfig.js`
2. Truyền config vào `<Screen config={config} />`
3. Screen tự động render đúng layout!

**Ví dụ:**
```javascript
const config = {
  type: "list",
  resource: "/invoices/me",
  columns: ["id", "totalAmount", "status"]
};

// Screen sẽ tự động:
// - Gọi API GET /invoices/me
// - Hiển thị table với 3 cột
// - Thêm search box, pagination
// - Format số tiền, status đẹp
return <Screen config={config} />;
```

### 2. Hooks là gì?

Hooks là **functions đặc biệt** giúp bạn sử dụng React features.

**Hooks phổ biến trong project:**

- `useAuth()` - Lấy thông tin user hiện tại
- `useResource(path)` - Load data từ API
- `useDebounce(value, delay)` - Trì hoãn search để giảm API calls
- `usePagination()` - Quản lý phân trang

**Ví dụ useAuth:**
```javascript
import { useAuth } from '../../hooks/useAuth';

function MyComponent() {
  const { user, role } = useAuth();
  
  if (role === 'STUDENT') {
    return <div>Xin chào sinh viên {user.fullName}</div>;
  }
  return <div>Xin chào quản lý</div>;
}
```

**Ví dụ useResource:**
```javascript
import { useResource } from '../../hooks/useResource';

function InvoiceList() {
  const { data, loading, error } = useResource('/invoices/me');
  
  if (loading) return <div>Đang tải...</div>;
  if (error) return <div>Lỗi: {error}</div>;
  
  return (
    <div>
      {data.map(invoice => (
        <div key={invoice.id}>{invoice.totalAmount}</div>
      ))}
    </div>
  );
}
```

### 3. Context là gì?

Context giúp **chia sẻ data** giữa nhiều components mà không cần truyền props.

Trong project có `AuthContext` để chia sẻ thông tin user:

```javascript
// Bất kỳ component nào cũng có thể dùng:
const { user, role, login, logout } = useAuth();

// Không cần truyền props từ trên xuống!
```

---

## 🛠️ Debug khi có lỗi

### Lỗi: "Cannot read property of undefined"

**Nguyên nhân:** Bạn đang truy cập property của object chưa load xong.

**Giải pháp:** Check null trước:
```javascript
// ❌ Sai
<div>{user.fullName}</div>

// ✅ Đúng
<div>{user?.fullName || 'Đang tải...'}</div>
```

### Lỗi: "Too many re-renders"

**Nguyên nhân:** Bạn gọi setState trong render.

```javascript
// ❌ Sai
function MyComponent() {
  const [count, setCount] = useState(0);
  setCount(count + 1); // Infinite loop!
  return <div>{count}</div>;
}

// ✅ Đúng
function MyComponent() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    setCount(count + 1);
  }, []); // Chỉ chạy 1 lần
  
  return <div>{count}</div>;
}
```

### Lỗi: "Module not found"

**Nguyên nhân:** Import path sai.

**Giải pháp:** Check relative path:
```javascript
// Nếu file ở: src/pages/Student/Dashboard.jsx
// Import từ: src/hooks/useAuth.js

// ✅ Đúng
import { useAuth } from '../../hooks/useAuth';

// ❌ Sai
import { useAuth } from '../hooks/useAuth';
```

---

## 💡 Tips cho sinh viên

### 1. Đọc code từ component → hooks → services

**Workflow đọc code:**
1. Bắt đầu từ `pages/` - Xem component render gì
2. Theo dõi hooks được dùng (useAuth, useResource...)
3. Xem hooks gọi services nào (authService, resources...)
4. Đọc services để hiểu API calls

### 2. Console.log là bạn thân

Khi không hiểu data structure:
```javascript
const { data } = useResource('/invoices/me');

// Log ra xem data có gì
console.log('📦 Invoice data:', data);
console.log('📦 First invoice:', data?.[0]);
```

### 3. React DevTools extension

Cài extension này để inspect components, props, state real-time.

### 4. Copy code có sẵn

Đừng viết từ đầu! Copy 1 page tương tự rồi sửa lại:
- Cần list page → Copy `InvoiceList.jsx`
- Cần detail page → Copy `InvoiceDetail.jsx`
- Cần form → Copy `FormScreen.jsx`

### 5. Comment code khó hiểu

Nếu bạn mất 10 phút để hiểu 1 đoạn code, viết comment giải thích!
```javascript
// Tính tổng tiền từ invoiceDetails
// Mỗi detail có quantity * unitPrice
// Cộng tất cả lại để ra totalAmount
const total = details.reduce((sum, d) => sum + (d.quantity * d.unitPrice), 0);
```

---

## ❓ Câu hỏi thường gặp

### Q: Tôi nên bắt đầu từ đâu?

A: Đọc file này → Đọc `src/pages/shared/README.md` → Copy 1 page mẫu và thử sửa.

### Q: Làm sao biết API endpoint nào có sẵn?

A: Mở file backend `*Controller.java` hoặc hỏi backend dev.

### Q: Tôi có thể dùng library khác không?

A: Nên hỏi lead trước. Thường thì nên dùng những gì đã có trong project.

### Q: Code review ở đâu?

A: Tạo Pull Request trên GitHub/GitLab, tag reviewer.

---

## 📚 Tài liệu tham khảo

- [React Docs](https://react.dev) - Official React documentation
- [React Router](https://reactrouter.com) - Client-side routing
- [Vite Guide](https://vitejs.dev/guide/) - Build tool
- [Tailwind CSS](https://tailwindcss.com/docs) - CSS framework

---

Có thắc mắc? Hỏi team lead hoặc senior dev! 🙌
