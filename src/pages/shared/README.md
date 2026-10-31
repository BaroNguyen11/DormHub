# 📁 Shared Pages

## Mục đích
Thư mục này chứa các pages dùng chung giữa Student và Manager.

Thay vì tạo 2 files giống nhau:
- ❌ `src/pages/Student/Invoices/InvoiceList.jsx`
- ❌ `src/pages/Manager/Invoices/InvoiceList.jsx`

Chúng ta tạo 1 file dùng chung:
- ✅ `src/pages/shared/InvoiceList.jsx`

## Cách hoạt động

Mỗi shared page sẽ:
1. Lấy `role` của user hiện tại (STUDENT hay MANAGER)
2. Chọn config tương ứng từ `screenConfig.js`
3. Render `Screen` component với config đó

### Ví dụ:

```javascript
import useAuth from '../../hooks/useAuth';
import { screens } from '../../constants/screenConfig';
import Screen from '../../components/Screen';

export default function InvoiceList() {
  const { role } = useAuth();
  
  // Student: config có resource="/invoices/me"
  // Manager: config có resource="/invoices"
  const path = role === 'STUDENT' ? '/student/invoices' : '/manager/invoices';
  const config = screens[path];
  
  return <Screen config={config} />;
}
```

## Khi nào dùng Shared Pages?

✅ **Nên dùng khi:**
- Student và Manager có cùng giao diện
- Chỉ khác API endpoint (vd: `/invoices/me` vs `/invoices`)
- Logic giống nhau, chỉ khác quyền truy cập

❌ **Không nên dùng khi:**
- Giao diện khác nhau hoàn toàn
- Logic xử lý khác biệt nhiều
- Có features riêng cho mỗi role

## Các Pages hiện tại

- `InvoiceList.jsx` - Danh sách hóa đơn
- `InvoiceDetail.jsx` - Chi tiết hóa đơn
- `ContractList.jsx` - Danh sách hợp đồng
- `ContractDetail.jsx` - Chi tiết hợp đồng
- `MaintenanceList.jsx` - Danh sách yêu cầu sửa chữa

## Cách thêm Shared Page mới

1. Tạo file trong `src/pages/shared/`
2. Copy template từ các files có sẵn
3. Sửa path mapping cho đúng
4. Update `pageMap.js` để point tới shared page
5. Test với cả Student và Manager account
