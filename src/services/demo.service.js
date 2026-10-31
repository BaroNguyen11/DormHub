export const DEMO_ENABLED =
  import.meta.env.DEV || import.meta.env.VITE_ENABLE_DEMO === "true";
export const DEMO_PASSWORD = "DormHub@123";
export const DEMO_ACCOUNTS = [
  {
    id: 1,
    email: "student@demo.dormhub",
    fullName: "Nguyễn Văn Bảo",
    role: "STUDENT",
    label: "Sinh viên",
  },
  {
    id: 2,
    email: "manager@demo.dormhub",
    fullName: "Trần Minh Anh",
    role: "MANAGER",
    label: "Quản lý",
  },
];
const SESSION_KEY = "dormhub_demo_user_v2";
const DATA_KEY = "dormhub_demo_data_v2";
const today = new Date().toISOString().slice(0, 10);
const seed = () => ({
  rooms: [
    {
      id: 1,
      roomNumber: "A203",
      buildingId: 1,
      buildingName: "Tòa A",
      floor: 2,
      capacity: 4,
      availableSlots: 1,
      monthlyPrice: 800000,
      gender: "Nam",
      status: "ACTIVE",
    },
    {
      id: 2,
      roomNumber: "A205",
      buildingId: 1,
      buildingName: "Tòa A",
      floor: 2,
      capacity: 4,
      availableSlots: 2,
      monthlyPrice: 800000,
      gender: "Nam",
      status: "ACTIVE",
    },
    {
      id: 3,
      roomNumber: "B102",
      buildingId: 2,
      buildingName: "Tòa B",
      floor: 1,
      capacity: 4,
      availableSlots: 3,
      monthlyPrice: 850000,
      gender: "Nữ",
      status: "ACTIVE",
    },
    {
      id: 4,
      roomNumber: "C106",
      buildingId: 3,
      buildingName: "Tòa C",
      floor: 1,
      capacity: 4,
      availableSlots: 4,
      monthlyPrice: 950000,
      gender: "Nam",
      status: "ACTIVE",
    },
  ],
  buildings: [
    { id: 1, name: "Tòa A", address: "Khu phía Đông", status: "ACTIVE" },
    { id: 2, name: "Tòa B", address: "Khu phía Tây", status: "ACTIVE" },
    { id: 3, name: "Tòa C", address: "Khu trung tâm", status: "ACTIVE" },
  ],
  "residence-terms": [
    {
      id: 1,
      name: "Năm học 2026–2027",
      startDate: "2026-08-01",
      endDate: "2027-07-31",
      status: "OPEN",
    },
  ],
  students: [
    {
      id: 1,
      fullName: "Nguyễn Văn Bảo",
      studentCode: "23647241",
      email: "student@demo.dormhub",
      phone: "0900000000",
      gender: "Nam",
      address: "TP. Hồ Chí Minh",
      roomNumber: "A203",
    },
    {
      id: 4,
      fullName: "Phạm Hồng Nhung",
      studentCode: "23648127",
      email: "nhung@example.test",
      roomNumber: "B102",
    },
  ],
  applications: [
    {
      id: 1,
      studentId: 1,
      studentName: "Nguyễn Văn Bảo",
      termName: "Năm học 2026–2027",
      roomId: 1,
      roomNumber: "A203",
      status: "APPROVED",
      createdAt: "2026-10-20",
    },
    {
      id: 2,
      studentId: 4,
      studentName: "Phạm Hồng Nhung",
      termName: "Năm học 2026–2027",
      roomId: 3,
      roomNumber: "B102",
      status: "PENDING",
      createdAt: "2026-10-21",
    },
  ],
  contracts: [
    {
      id: 1,
      studentId: 1,
      studentName: "Nguyễn Văn Bảo",
      roomNumber: "A203",
      startDate: "2026-08-01",
      endDate: "2027-07-31",
      status: "ACTIVE",
      monthlyPrice: 800000,
    },
  ],
  "room-assignments": [
    {
      id: 1,
      studentId: 1,
      roomNumber: "A203",
      buildingName: "Tòa A",
      status: "CHECKED_IN",
      checkInDate: "2026-08-01",
    },
  ],
  invoices: [
    {
      id: 1,
      studentId: 1,
      studentName: "Nguyễn Văn Bảo",
      roomNumber: "A203",
      type: "MONTHLY",
      period: "10/2026",
      totalAmount: 925000,
      dueDate: "2026-10-28",
      status: "UNPAID",
    },
    {
      id: 2,
      studentId: 1,
      studentName: "Nguyễn Văn Bảo",
      roomNumber: "A203",
      type: "MONTHLY",
      period: "09/2026",
      totalAmount: 902000,
      dueDate: "2026-09-28",
      status: "PAID",
    },
  ],
  "room-monthly-charges": [
    {
      id: 1,
      roomId: 1,
      roomNumber: "A203",
      month: 10,
      year: 2026,
      electricityAmount: 75000,
      waterAmount: 35000,
      serviceAmount: 15000,
    },
  ],
  payments: [
    {
      id: 1,
      invoiceId: 2,
      amount: 902000,
      method: "BANK_TRANSFER",
      status: "SUCCESS",
      createdAt: "2026-09-27",
    },
  ],
  "maintenance-requests": [
    {
      id: 1,
      studentId: 1,
      studentName: "Nguyễn Văn Bảo",
      roomNumber: "A203",
      title: "Đèn phòng tắm không sáng",
      description: "Đèn chập chờn khi bật công tắc.",
      priority: "MEDIUM",
      status: "PROCESSING",
      createdAt: "2026-10-21",
    },
    {
      id: 2,
      studentId: 4,
      studentName: "Phạm Hồng Nhung",
      roomNumber: "B102",
      title: "Máy lạnh hoạt động yếu",
      status: "PENDING",
      createdAt: "2026-10-20",
    },
  ],
  notifications: [
    {
      id: 1,
      title: "Lịch kiểm tra an toàn PCCC",
      body: "Ban quản lý sẽ kiểm tra vào ngày 30/10.",
      createdAt: "2026-10-22",
      read: false,
    },
    {
      id: 2,
      title: "Hóa đơn tháng 10",
      body: "Hạn thanh toán là 28/10.",
      createdAt: "2026-10-20",
      read: true,
    },
  ],
  conversations: [
    { id: 1, title: "Hỗ trợ nội trú", participantName: "Ban quản lý" },
  ],
  messages: [
    {
      id: 1,
      conversationId: 1,
      senderName: "Ban quản lý",
      content: "Chào bạn, DormHub có thể hỗ trợ gì?",
    },
  ],

});

export function demoUser() {
  if (!DEMO_ENABLED) return null;
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
  } catch {
    return null;
  }
}
export function isDemoSession() {
  return Boolean(demoUser());
}
export function demoLogin({ email, password }) {
  if (!DEMO_ENABLED || !email?.endsWith("@demo.dormhub")) return null;
  const user = DEMO_ACCOUNTS.find((item) => item.email === email.toLowerCase());
  if (!user || password !== DEMO_PASSWORD)
    throw new Error("Tài khoản hoặc mật khẩu demo không đúng.");
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return { user };
}
export function demoLogout() {
  sessionStorage.removeItem(SESSION_KEY);
}
function dataStore() {
  try {
    return JSON.parse(sessionStorage.getItem(DATA_KEY) || "null") || seed();
  } catch {
    return seed();
  }
}
function save(data) {
  sessionStorage.setItem(DATA_KEY, JSON.stringify(data));
}
function list(rows, searchParams) {
  const search = (searchParams.get("search") || "").toLowerCase(),
    status = searchParams.get("status");
  const filtered = rows.filter(
    (row) =>
      (!search || JSON.stringify(row).toLowerCase().includes(search)) &&
      (!status || row.status === status),
  );
  const page = Number(searchParams.get("page") || 0),
    size = Number(searchParams.get("size") || 10);
  return {
    content: filtered.slice(page * size, (page + 1) * size),
    totalElements: filtered.length,
    last: (page + 1) * size >= filtered.length,
  };
}
export function demoRequest(path, { method = "GET", body } = {}) {
  const user = demoUser();
  if (!user) throw new Error("Phiên xem thử đã kết thúc. Hãy đăng nhập lại.");
  const url = new URL(path, "http://demo.local"),
    segments = url.pathname.split("/").filter(Boolean),
    data = dataStore();
  if (url.pathname === "/dashboard/manager/overview")
    return {
      rooms: data.rooms.length,
      activeResidents: data.students.length,
      pendingApplications: data.applications.filter(
        (item) => item.status === "PENDING",
      ).length,
      unpaidInvoices: data.invoices.filter((item) => item.status === "UNPAID")
        .length,
    };
  if (url.pathname === "/students/me")
    return method === "PATCH"
      ? (Object.assign(data.students[0], body), save(data), data.students[0])
      : data.students[0];
  const key = segments[0];
  const rows = data[key];
  if (!Array.isArray(rows))
    throw new Error("Chức năng này chưa có dữ liệu xem thử.");
  const idIndex = 1,
    marker = segments[idIndex],
    id = Number(marker),
    item = rows.find((row) => Number(row.id) === id);
  if (segments[0] === "conversations" && segments[2] === "messages") {
    const messages = data.messages.filter(
      (row) => Number(row.conversationId) === id,
    );
    if (method === "GET") return list(messages, url.searchParams);
    const next = {
      id: Date.now(),
      conversationId: id,
      senderName: user.fullName,
      content: body?.content,
    };
    data.messages.push(next);
    save(data);
    return next;
  }
  if (method === "GET") {
    if (marker === "me") {
      const mine =
        key === "notifications"
          ? rows
          : rows.filter((row) => row.studentId === user.id);
      if (key === "room-assignments") return mine[0] || null;
      const result = list(mine, url.searchParams);
      return key === "applications"
        ? {
            ...result,
            activeContract: 1,
            unpaidInvoices: data.invoices.filter(
              (row) => row.studentId === user.id && row.status === "UNPAID",
            ).length,
          }
        : result;
    }
    if (item) return item;
    return list(rows, url.searchParams);
  }
  if (method === "POST" && key === "payments") {
    const invoice = data.invoices.find(
      (row) => Number(row.id) === Number(body?.invoiceId),
    );
    if (!invoice) throw new Error("Không tìm thấy hóa đơn demo.");
    if (invoice.status === "PAID")
      throw new Error("Hóa đơn đã được thanh toán.");
    invoice.status = "PAID";
    const payment = {
      id: Date.now(),
      invoiceId: invoice.id,
      amount: invoice.totalAmount,
      method: body?.method,
      status: "SUCCESS",
      createdAt: today,
    };
    rows.push(payment);
    save(data);
    return payment;
  }
  if (method === "POST" && !marker) {
    const next = {
      ...body,
      id: Date.now(),
      createdAt: today,
      status: body?.status || "PENDING",
      studentId:
        key === "applications" || key === "maintenance-requests"
          ? user.id
          : body?.studentId,
      ...(key === "applications" || key === "maintenance-requests"
        ? { studentName: user.fullName }
        : {}),
      ...(key === "applications"
        ? { termName: data["residence-terms"][0]?.name }
        : {}),
    };
    rows.unshift(next);
    save(data);
    return next;
  }
  if (!item) throw new Error("Không tìm thấy dữ liệu xem thử.");
  const action = segments[idIndex + 1];
  if (action === "approve") item.status = "APPROVED";
  else if (action === "reject") {
    item.status = "REJECTED";
    item.reason = body?.reason;
  } else if (action === "cancel") item.status = "CANCELLED";
  else if (action === "assign-room") {
    item.roomId = body?.roomId;
    item.status = "ASSIGNED";
  } else if (action === "activate") item.status = "ACTIVE";
  else if (action === "read") item.read = true;
  else if (action === "lock") item.status = "LOCKED";
  else if (action === "unlock") item.status = "ACTIVE";
  else if (action === "status") item.status = body?.status;
  else Object.assign(item, body);
  save(data);
  return item;
}
