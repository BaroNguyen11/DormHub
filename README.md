 NHIỆM VỤ CẦN LÀM NGAY - DORMHUB BACKEND

**Dự án:** DormHub - Hệ thống quản lý ký túc xá sinh viên  
**Ngày tạo:** 01/11/2026  
**Trạng thái hiện tại:** 60% hoàn thiện  
**Ưu tiên:** CRITICAL - Cần fix trước khi tiếp tục phát triển

---

## 📊 TỔNG QUAN HIỆN TRẠNG

### ✅ Đã hoàn thành (90-100%)
- **Module 1**: Auth (JWT, OTP, Login/Register) - 100%
- **Module 1**: Student Profile (CRUD + Search) - 100%
- **Module 1**: Maintenance Request (Workflow đầy đủ) - 100%
- **Module 4**: Invoice & Billing (Auto-generation, Scheduler) - 100%

### ⚠️ Hoàn thành một phần (40-70%)
- **Module 3**: Contract (thiếu lifecycle: activate, terminate, renew) - 60%
- **Module 3**: Check-in/out (thiếu meter reading, room inspection) - 60%
- **Module 4**: Dashboard (thiếu hoàn toàn) - 0%

### ❌ Chưa hoàn thành (0-10%)
- **Module 1**: Notification System (entity rỗng) - 0%
- **Module 2**: ResidenceTerm, Building, Room, DormApplication - 10%
- **Module 4**: Payment System - 0%

---

## 🚨 VẤN ĐỀ NGHIÊM TRỌNG (CRITICAL) - BẮT BUỘC FIX NGAY

### 1. Room Entity - HOÀN TOÀN RỖNG ⚠️⚠️⚠️
**Mức độ:** BLOCKING (Chặn toàn bộ hệ thống)  
**Thời gian:** 4-6 giờ  
**Deadline:** Trong 1 ngày

**Hiện trạng:**
```java
@Entity
@Table(name = "rooms")
public class Room {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    // ❌ KHÔNG CÓ GÌ KHÁC!
}
Hậu quả:
- Contract → Room: Không biết phòng số mấy, giá bao nhiêu
- Invoice → Room: Không biết hóa đơn cho phòng nào
- MeterReading → Room: Không biết đọc điện nước phòng nào
- MaintenanceRequest → Room: Không biết báo hỏng phòng nào
- RoomAssignment → Room: Không biết assign vào phòng gì
Nhiệm vụ:
[ ] 1. Tạo Building entity (building_id, name, code, address, totalFloors)
[ ] 2. Hoàn thiện Room entity với các fields:
    - roomNumber (String, NOT NULL)
    - floor (Integer, NOT NULL)
    - building (ManyToOne → Building, NOT NULL)
    - roomType (Enum: SINGLE, DOUBLE, QUAD, SIX_BED)
    - capacity (Integer, NOT NULL)
    - currentOccupancy (Integer, DEFAULT 0)
    - pricePerMonth (BigDecimal, NOT NULL)
    - status (Enum: AVAILABLE, OCCUPIED, MAINTENANCE, RESERVED)
    - electricMeterNumber (String)
    - waterMeterNumber (String)
    - description (String)
    - createdAt, updatedAt
[ ] 3. Thêm bidirectional relationships:
    - @OneToMany → contracts
    - @OneToMany → roomAssignments
    - @OneToMany → invoices
    - @OneToMany → meterReadings
    - @OneToMany → maintenanceRequests
[ ] 4. Tạo migration script
[ ] 5. Tạo RoomController + RoomService (CRUD + search/filter)
[ ] 6. Tạo BuildingController + BuildingService (CRUD)
[ ] 7. Test với data mẫu
Files cần tạo/sửa:
- entity/Building.java (NEW)
- entity/Room.java (FIX - hiện chỉ có ID)
- entity/enums/RoomType.java (NEW)
- entity/enums/RoomStatus.java (NEW)
- repository/BuildingRepository.java (NEW)
- repository/RoomRepository.java (đã có, cần update)
- service/BuildingService.java (NEW)
- service/RoomService.java (NEW)
- controller/BuildingController.java (NEW)
- controller/RoomController.java (NEW)
- dto/request/BuildingRequest.java (NEW)
- dto/request/RoomRequest.java (NEW)
- dto/response/BuildingResponse.java (NEW)
- dto/response/RoomResponse.java (NEW)
- mapper/BuildingMapper.java (NEW)
- mapper/RoomMapper.java (NEW)
- resources/db/migration/V3__create_buildings_and_complete_rooms.sql (NEW)
2. Invoice Logic - SAI NGHIỆP VỤ ⚠️⚠️
Mức độ: HIGH  
Thời gian: 2-3 giờ  
Deadline: Trong 2 ngày
Vấn đề:
// Invoice.java - dòng 47-53
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "room_id")
private Room room;  // ⚠️ nullable

@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "contract_id")
private Contract contract;  // ⚠️ nullable

// ❌ CẢ HAI đều nullable → Invoice có thể không link tới gì!
Logic đúng:
- DEPOSIT invoice → chỉ cần contract (tiền cọc theo hợp đồng)
- ROOM_FEE invoice → chỉ cần contract (tiền phòng theo hợp đồng)
- UTILITY invoice → cần CẢ HAI room + contract (điện nước)
Nhiệm vụ:
[ ] 1. Thêm validation trong InvoiceService.createInvoice():
    - if (type == DEPOSIT || type == ROOM_FEE) → require contract
    - if (type == UTILITY) → require both room and contract
[ ] 2. Thêm unique constraint cho deposit invoice:
    CREATE UNIQUE INDEX uk_invoices_contract_deposit 
    ON invoices (contract_id) WHERE invoice_type = 'DEPOSIT';
[ ] 3. Thêm audit fields (createdAt, updatedAt) vào Invoice entity
[ ] 4. Thêm indexes:
    - idx_invoices_status_due_date (status, due_date)
    - idx_invoices_contract (contract_id)
[ ] 5. Test validation với unit tests
3. Notification Entity - HOÀN TOÀN RỖNG ⚠️
Mức độ: HIGH  
Thời gian: 1 ngày  
Deadline: Trong 3 ngày
Hiện trạng:
public class Notification {
    // ❌ Empty class - không có fields, không có logic
}
Nhiệm vụ:
[ ] 1. Hoàn thiện Notification entity:
    - id (Long, PRIMARY KEY)
    - user (ManyToOne → User, NOT NULL)
    - title (String, NOT NULL)
    - message (String, NOT NULL)
    - type (Enum: MAINTENANCE, CONTRACT, INVOICE, SYSTEM)
    - isRead (Boolean, DEFAULT false)
    - createdAt (LocalDateTime, NOT NULL)
[ ] 2. Tạo NotificationService:
    - createNotification(userId, title, message, type)
    - getMyNotifications(userId, pageable)
    - markAsRead(notificationId, userId)
    - markAllAsRead(userId)
    - countUnread(userId)
[ ] 3. Tạo NotificationController:
    GET  /api/v1/student/notifications
    GET  /api/v1/student/notifications/unread-count
    PATCH /api/v1/student/notifications/{id}/read
    PATCH /api/v1/student/notifications/read-all
[ ] 4. Integration points:
    - MaintenanceService.updateStatus() → notify student
    - InvoiceService.createInvoice() → notify student
    - ContractService.updateStatus() → notify student
    - DepositService.confirmDepositPaid() → notify student
[ ] 5. Tạo migration script
[ ] 6. Test tích hợp
⚠️ VẤN ĐỀ QUAN TRỌNG (HIGH) - CẦN FIX TRONG TUẦN
4. Contract Lifecycle - Thiếu 40% chức năng
Mức độ: HIGH  
Thời gian: 1-1.5 ngày  
Deadline: Trong 5 ngày
Đã có:
- Create contract (PENDING)
- Update/cancel PENDING contract
- Activate contract khi deposit paid (trong DepositService)
Thiếu:
[ ] 1. Manual activate endpoint:
    PATCH /api/v1/manager/contracts/{id}/activate
    - ContractService.activateContract(contractId)
    - Validate: status = PENDING
    - Change: PENDING → ACTIVE
    - Create RoomAssignment automatically
[ ] 2. Terminate endpoint (chấm dứt sớm):
    PATCH /api/v1/manager/contracts/{id}/terminate
    Body: { "reason": "Student withdrew", "terminationDate": "2026-12-01" }
    - Validate: status = ACTIVE
    - Check: No unpaid invoices or require payment first
    - Change: ACTIVE → TERMINATED
    - Update RoomAssignment: CHECKED_IN → CHECKED_OUT
    - Calculate refund if applicable
[ ] 3. Expire endpoint (hết hạn):
    PATCH /api/v1/manager/contracts/{id}/expire
    - Validate: endDate < now
    - Change: ACTIVE → EXPIRED
    - Notify student
[ ] 4. Renewal workflow:
    POST /api/v1/manager/contracts/{id}/renew
    Body: { "newEndDate": "2027-06-30", "newMonthlyRent": 1500000 }
    - Validate: current contract ACTIVE or EXPIRED
    - Create new Contract linked to old one (previousContractId field)
    - Same room, same student
    - New startDate = old endDate + 1 day
    - Status = PENDING (wait for deposit)
[ ] 5. Auto-expiry scheduler:
    - Cron job chạy daily
    - Find contracts: status = ACTIVE AND endDate < now
    - Change: ACTIVE → EXPIRED
    - Notify students
[ ] 6. Thêm fields vào Contract entity:
    - previousContractId (Long, nullable) - for renewal tracking
    - terminationReason (String, nullable)
    - actualEndDate (LocalDateTime, nullable) - for early termination
[ ] 7. Thêm bidirectional relationship:
    @OneToMany(mappedBy = "contract")
    private List<RoomAssignment> roomAssignments;
    @OneToMany(mappedBy = "contract")
    private List<Invoice> invoices;
5. Check-in/out Enhancement - Thiếu Meter Reading & Inspection
Mức độ: HIGH  
Thời gian: 1 ngày  
Deadline: Trong 5 ngày
Đã có:
- Check-in: ASSIGNED → CHECKED_IN
- Check-out: CHECKED_IN → CHECKED_OUT (kiểm tra unpaid invoices)
Thiếu:
[ ] 1. Enhance check-in request DTO:
    POST /api/v1/manager/contracts/{contractId}/check-in
    Body: {
      "initialElectricReading": 1500,
      "initialWaterReading": 200,
      "roomCondition": "GOOD", // Enum: EXCELLENT, GOOD, FAIR, POOR
      "inspectionNotes": "All facilities working properly",
      "damages": [] // Array of existing damages if any
    }
[ ] 2. Check-in logic:
    - Create MeterReading (electric & water initial readings)
    - Store room inspection data
    - Take photos (optional, future enhancement)
    - Update RoomAssignment: ASSIGNED → CHECKED_IN
    - Update Room.currentOccupancy++
[ ] 3. Enhance check-out request DTO:
    POST /api/v1/manager/contracts/{contractId}/check-out
    Body: {
      "finalElectricReading": 2000,
      "finalWaterReading": 250,
      "roomCondition": "GOOD",
      "inspectionNotes": "Minor wall stains",
      "damages": ["Stained wall near bed"],
      "damagePhotos": [],
      "depositDeduction": 200000,
      "deductionReason": "Wall cleaning required"
    }
[ ] 4. Check-out logic:
    - Create final MeterReading
    - Generate final utility invoice automatically
    - Check all invoices paid
    - Calculate deposit refund = depositAmount - deductionAmount
    - Store inspection report
    - Update RoomAssignment: CHECKED_IN → CHECKED_OUT
    - Update Room.currentOccupancy--
    - Update Contract: ACTIVE → TERMINATED or EXPIRED
[ ] 5. Create entities:
    - RoomInspection (id, roomAssignment, inspectionType (CHECK_IN/CHECK_OUT), condition, notes, damages, photos, inspectedBy, inspectedAt)
[ ] 6. Thêm MeterReadingController + Service:
    POST   /api/v1/manager/meter-readings
    GET    /api/v1/manager/rooms/{roomId}/meter-readings
    PATCH  /api/v1/manager/meter-readings/{id}/confirm
6. Payment System - THIẾU HOÀN TOÀN
Mức độ: HIGH  
Thời gian: 2 ngày  
Deadline: Trong 1 tuần
Hiện trạng:
- DepositService có method confirmDepositPaid() nhưng không có cách gọi
- Không có cách record payment cho invoices
Nhiệm vụ:
[ ] 1. Tạo Payment entity:
    - id (Long, PRIMARY KEY)
    - invoice (ManyToOne → Invoice, NOT NULL)
    - amount (BigDecimal, NOT NULL)
    - paymentMethod (Enum: CASH, BANK_TRANSFER, MOMO, VNPAY)
    - transactionId (String) - mã GD từ ngân hàng
    - status (Enum: PENDING, COMPLETED, FAILED)
    - paidAt (LocalDateTime, NOT NULL)
    - recordedBy (ManyToOne → User)
    - notes (String)
    - createdAt (LocalDateTime)
[ ] 2. Tạo PaymentService:
    - recordPayment(invoiceId, amount, method, transactionId)
    - Validate: amount == invoice.totalAmount (or support partial)
    - Update Invoice.status = PAID
    - If invoice.type == DEPOSIT → call DepositService.confirmDepositPaid()
    - Create Payment record
    - Notify student
[ ] 3. Tạo PaymentController:
    POST /api/v1/manager/payments
    GET  /api/v1/manager/payments/{invoiceId}
    GET  /api/v1/student/payments (own payment history)
[ ] 4. Thêm payment history trong InvoiceResponse
[ ] 5. Tạo DTO:
    - PaymentRecordRequest (invoiceId, amount, method, transactionId, notes)
    - PaymentResponse (id, invoiceId, amount, method, status, paidAt)
[ ] 6. Migration script
[ ] 7. Integration tests
📋 VẤN ĐỀ TRUNG BÌNH (MEDIUM) - CẦN FIX SAU
7. Database Naming Consistency
Mức độ: MEDIUM  
Thời gian: 3-4 giờ  
Deadline: Trong 2 tuần
Vấn đề:
- Không thống nhất tên Primary Key: id vs contractId vs assignmentId
- Không thống nhất tên status field: status vs maintenanceStatus vs readingStatus
- Một số entity thiếu updatedAt
Nhiệm vụ:
[ ] 1. Chuẩn hóa Primary Key (tất cả dùng 'id'):
    - Contract: contractId → id
    - Invoice: invoiceId → id
    - InvoiceDetail: detailId → id
    - RoomAssignment: assignmentId → id
    - MeterReading: readingId → id
    - MaintenanceRequest: ✓ đã dùng id
[ ] 2. Chuẩn hóa status fields:
    - MaintenanceRequest: maintenanceStatus → status
    - MeterReading: readingStatus → status
[ ] 3. Thêm updatedAt cho:
    - Invoice (hiện thiếu audit fields)
    - InvoiceDetail
    - RoomAssignment (hiện chỉ có assignedAt)
    - MeterReading (hiện chỉ có createdAt)
[ ] 4. Tạo migration scripts để rename columns
[ ] 5. Update tất cả references trong code
[ ] 6. Update repositories, services, controllers
8. Missing Database Constraints
Mức độ: MEDIUM  
Thời gian: 2-3 giờ  
Deadline: Trong 2 tuần
Nhiệm vụ:
[ ] 1. Unique Constraints:
    -- Room: 1 building không có 2 phòng cùng số
    ALTER TABLE rooms ADD CONSTRAINT uk_rooms_building_room 
        UNIQUE (building_id, room_number);
    
    -- Contract: 1 student không có 2 contract ACTIVE cùng lúc
    CREATE UNIQUE INDEX uk_contracts_student_active 
        ON contracts (student_id) WHERE status = 'ACTIVE';
    
    -- RoomAssignment: 1 contract không có 2 assignment CHECKED_IN
    CREATE UNIQUE INDEX uk_room_assignments_contract_active 
        ON room_assignments (contract_id) WHERE status = 'CHECKED_IN';

[ ] 2. Check Constraints:
    -- Contract: startDate < endDate
    ALTER TABLE contracts ADD CONSTRAINT chk_contracts_dates 
        CHECK (start_date < end_date);
    
    -- Invoice: totalAmount >= 0
    ALTER TABLE invoices ADD CONSTRAINT chk_invoices_amount 
        CHECK (total_amount >= 0);
    
    -- Room: capacity > 0 AND currentOccupancy >= 0 AND currentOccupancy <= capacity
    ALTER TABLE rooms ADD CONSTRAINT chk_rooms_occupancy 
        CHECK (capacity > 0 AND current_occupancy >= 0 AND current_occupancy <= capacity);
    
    -- MeterReading: electricityNew >= electricityOld
    ALTER TABLE meter_readings ADD CONSTRAINT chk_meter_readings_electricity 
        CHECK (electricity_reading_new >= electricity_reading_old);

[ ] 3. Indexes quan trọng:
    CREATE INDEX idx_contracts_status ON contracts (status);
    CREATE INDEX idx_contracts_student ON contracts (student_id);
    CREATE INDEX idx_invoices_status_due_date ON invoices (status, due_date);
    CREATE INDEX idx_maintenance_status_priority ON maintenance_requests (status, priority);
    CREATE INDEX idx_room_assignments_student ON room_assignments (student_id);
9. Missing Bidirectional Relationships
Mức độ: MEDIUM  
Thời gian: 2 giờ  
Deadline: Trong 2 tuần
Nhiệm vụ:
[ ] 1. Student entity - thêm back-references:
    @OneToMany(mappedBy = "student")
    private List<Contract> contracts;
    
    @OneToMany(mappedBy = "student")
    private List<MaintenanceRequest> maintenanceRequests;
    
    @OneToMany(mappedBy = "student")
    private List<RoomAssignment> roomAssignments;

[ ] 2. User entity - thêm back-references:
    @OneToMany(mappedBy = "user")
    private List<RefreshToken> refreshTokens;
    
    @OneToMany(mappedBy = "user")
    private List<EmailVerification> emailVerifications;

[ ] 3. Contract entity - thêm back-references:
    @OneToMany(mappedBy = "contract")
    private List<RoomAssignment> roomAssignments;
    
    @OneToMany(mappedBy = "contract")
    private List<Invoice> invoices;

[ ] 4. Room entity - thêm back-references (khi Room hoàn thiện):
    @OneToMany(mappedBy = "room")
    private List<Contract> contracts;
    
    @OneToMany(mappedBy = "room")
    private List<RoomAssignment> roomAssignments;
    
    @OneToMany(mappedBy = "room")
    private List<Invoice> invoices;
    
    @OneToMany(mappedBy = "room")
    private List<MeterReading> meterReadings;
    
    @OneToMany(mappedBy = "room")
    private List<MaintenanceRequest> maintenanceRequests;

[ ] 5. Test lazy loading không gây N+1 queries
🔮 MODULE MỚI CẦN IMPLEMENT (LOW) - SAU KHI FIX XON
10. Module 2: ResidenceTerm, DormApplication, RoomAssignment
Mức độ: LOW (chờ team khác)  
Thời gian: 5-7 ngày  
Deadline: Sau khi fix critical issues
Nhiệm vụ:
[ ] 1. ResidenceTerm entity + CRUD:
    - id, termCode, name, startDate, endDate
    - applicationStartDate, applicationEndDate
    - status (UPCOMING, OPEN, CLOSED, ACTIVE, ENDED)
[ ] 2. DormApplication entity + workflow:
    - id, student, residenceTerm, preferredRoomType
    - preferredBuilding, status (DRAFT, SUBMITTED, APPROVED, REJECTED)
    - reviewedBy, reviewedAt, rejectionReason
[ ] 3. ApplicationController:
    POST   /api/v1/student/applications (submit)
    GET    /api/v1/student/applications (own applications)
    GET    /api/v1/manager/applications (all, filterable)
    PATCH  /api/v1/manager/applications/{id}/approve
    PATCH  /api/v1/manager/applications/{id}/reject
[ ] 4. ApplicationService:
    - submitApplication() - validate term is OPEN
    - approveApplication() - check room availability, create Contract DRAFT
    - rejectApplication() - require reason
[ ] 5. RoomAssignmentService:
    - assignRoom(contractId, roomId) - check capacity, pessimistic locking
    - Prevent overbooking with: currentOccupancy < capacity
[ ] 6. Integration:
    - Application APPROVED → create Contract PENDING
    - Contract ACTIVE → create RoomAssignment ASSIGNED
11. Dashboard & Analytics
Mức độ: LOW  
Thời gian: 2-3 ngày  
Deadline: Sau khi fix critical issues
Nhiệm vụ:
[ ] 1. DashboardController:
    GET /api/v1/manager/dashboard/revenue
    GET /api/v1/manager/dashboard/occupancy
    GET /api/v1/manager/dashboard/invoices
    GET /api/v1/manager/dashboard/maintenance
    GET /api/v1/manager/dashboard/contracts
[ ] 2. DashboardService với native queries:
    - getRevenueStats(startDate, endDate)
      * Total revenue
      * Revenue by building
      * Revenue by invoice type
      * Month-over-month comparison
    - getOccupancyStats()
      * Total rooms vs occupied rooms
      * Occupancy rate by building
      * Available rooms by room type
    - getInvoiceStats()
      * Total invoices by status (PAID, UNPAID, OVERDUE)
      * Total unpaid amount
      * Overdue invoices count
    - getMaintenanceStats()
      * Requests by status
      * Requests by priority
      * Average resolution time
    - getContractStats()
      * Active contracts count
      * Expiring soon (within 30 days)
      * Pending contracts awaiting deposit
📊 ĐỘ ƯU TIÊN & TIMELINE
TUẦN 1 (CRITICAL - Không làm không chạy được)
Ngày 1-2: Room & Building entities (6-8 giờ)
Ngày 2-3: Invoice logic fix + Notification entity (8 giờ)
Ngày 4-5: Contract lifecycle enhancement (12 giờ)
TUẦN 2 (HIGH - Cần cho nghiệp vụ đầy đủ)
Ngày 6-7: Check-in/out enhancement (8 giờ)
Ngày 8-9: Payment system (16 giờ)
Ngày 10: Testing & bug fixes (8 giờ)
TUẦN 3-4 (MEDIUM - Code quality & optimization)
Tuần 3: Database naming consistency + constraints (16 giờ)
Tuần 4: Bidirectional relationships + N+1 query fixes (8 giờ)
SAU ĐÓ (LOW - New features)
Sprint 1: Module 2 - ResidenceTerm, DormApplication (40 giờ)
Sprint 2: Dashboard & Analytics (20 giờ)
✅ CHECKLIST TRƯỚC KHI MERGE
Code Quality
[ ] Tất cả entities có đủ fields theo nghiệp vụ
[ ] Tất cả relationships được map đúng (bidirectional)
[ ] Primary keys thống nhất (dùng 'id')
[ ] Status fields thống nhất
[ ] Tất cả entities có createdAt, updatedAt
[ ] Tất cả @ManyToOne dùng LAZY fetch
[ ] Có unique constraints và check constraints cần thiết
[ ] Có indexes trên foreign keys và search fields
Business Logic
[ ] Contract lifecycle đầy đủ (create, activate, terminate, expire, renew)
[ ] Invoice validation theo type (DEPOSIT, ROOM_FEE, UTILITY)
[ ] Check-in/out có meter reading và room inspection
[ ] Payment workflow hoàn chỉnh
[ ] Notification được gửi đúng các events
[ ] Room occupancy được update đúng
Testing
[ ] Unit tests cho services chính
[ ] Integration tests cho workflows
[ ] Test với data mẫu đầy đủ
[ ] Test concurrent operations (pessimistic locking)
[ ] Test validation constraints
Documentation
[ ] API documentation (Swagger/OpenAPI)
[ ] Database schema diagram (ERD)
[ ] README hướng dẫn setup
[ ] Business logic documentation
🎯 METRICS ĐẠT 100%
Module	Current
Auth & Security	100%
Student Profile	100%
Maintenance	100%
Notification	0%
Room & Building	10%
Contract	60%
Check-in/out	60%
Invoice & Billing	100%
Payment	0%
Dashboard	0%
TỔNG	60%
📞 HỖ TRỢ & LIÊN HỆ
Câu hỏi nghiệp vụ:
- Contract-RoomAssignment: 1:1 hay 1:N? (Có cho chuyển phòng giữa kỳ không?)
- Deposit deduction: Có hỗ trợ trừ tiền cọc khi có hư hỏng không?
- Payment: Có hỗ trợ partial payment không hay chỉ full payment?
Cần xác nhận:
- Database migration strategy (Flyway/Liquibase?)
- Naming convention cuối cùng (contractId → id?)
- Audit logging requirements
- Rate limiting strategy
Tài liệu tham khảo:
- DormHub Business Requirements v1.1 (./DormHub_Business_Requirements_v1.1.md)
- Code Review Report (./code_review.md)
Cập nhật cuối: 01/11/2026 14:11 ICT

Tôi sẽ tạo file này vào project:
→Read DormHub_Backend 
Tôi sẽ tạo file markdown về nhiệm vụ cần làm tại thư mục backend:
→Read DormHub_Backend\code_review.md [limit=10]
✱Glob "**/*.md" in DormHub_Backend (3 matches)
Tôi sẽ tạo file markdown chi tiết về nhiệm vụ cần làm hiện tại:
# NHIỆM VỤ CẦN LÀM NGAY - DORMHUB BACKEND

**Dự án:** DormHub - Hệ thống quản lý ký túc xá sinh viên  
**Ngày tạo:** 01/11/2026  
**Trạng thái hiện tại:** 60% hoàn thiện  
**Ưu tiên:** CRITICAL - Cần fix trước khi tiếp tục phát triển

---

## 📊 TỔNG QUAN HIỆN TRẠNG

### ✅ Đã hoàn thành (90-100%)
- **Module 1**: Auth (JWT, OTP, Login/Register) - 100%
- **Module 1**: Student Profile (CRUD + Search) - 100%
- **Module 1**: Maintenance Request (Workflow đầy đủ) - 100%
- **Module 4**: Invoice & Billing (Auto-generation, Scheduler) - 100%

### ⚠️ Hoàn thành một phần (40-70%)
- **Module 3**: Contract (thiếu lifecycle: activate, terminate, renew) - 60%
- **Module 3**: Check-in/out (thiếu meter reading, room inspection) - 60%
- **Module 4**: Dashboard (thiếu hoàn toàn) - 0%

### ❌ Chưa hoàn thành (0-10%)
- **Module 1**: Notification System (entity rỗng) - 0%
- **Module 2**: ResidenceTerm, Building, Room, DormApplication - 10%
- **Module 4**: Payment System - 0%

---

## 🚨 VẤN ĐỀ NGHIÊM TRỌNG (CRITICAL) - BẮT BUỘC FIX NGAY

### 1. Room Entity - HOÀN TOÀN RỖNG ⚠️⚠️⚠️
**Mức độ:** BLOCKING (Chặn toàn bộ hệ thống)  
**Thời gian:** 4-6 giờ  
**Deadline:** Trong 1 ngày

**Hiện trạng:**
```java
@Entity
@Table(name = "rooms")
public class Room {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    // ❌ KHÔNG CÓ GÌ KHÁC!
}
Hậu quả:
- Contract → Room: Không biết phòng số mấy, giá bao nhiêu
- Invoice → Room: Không biết hóa đơn cho phòng nào
- MeterReading → Room: Không biết đọc điện nước phòng nào
- MaintenanceRequest → Room: Không biết báo hỏng phòng nào
- RoomAssignment → Room: Không biết assign vào phòng gì
Nhiệm vụ:
[ ] 1. Tạo Building entity (building_id, name, code, address, totalFloors)
[ ] 2. Hoàn thiện Room entity với các fields:
    - roomNumber (String, NOT NULL)
    - floor (Integer, NOT NULL)
    - building (ManyToOne → Building, NOT NULL)
    - roomType (Enum: SINGLE, DOUBLE, QUAD, SIX_BED)
    - capacity (Integer, NOT NULL)
    - currentOccupancy (Integer, DEFAULT 0)
    - pricePerMonth (BigDecimal, NOT NULL)
    - status (Enum: AVAILABLE, OCCUPIED, MAINTENANCE, RESERVED)
    - electricMeterNumber (String)
    - waterMeterNumber (String)
    - description (String)
    - createdAt, updatedAt
[ ] 3. Thêm bidirectional relationships:
    - @OneToMany → contracts
    - @OneToMany → roomAssignments
    - @OneToMany → invoices
    - @OneToMany → meterReadings
    - @OneToMany → maintenanceRequests
[ ] 4. Tạo migration script
[ ] 5. Tạo RoomController + RoomService (CRUD + search/filter)
[ ] 6. Tạo BuildingController + BuildingService (CRUD)
[ ] 7. Test với data mẫu
Files cần tạo/sửa:
- entity/Building.java (NEW)
- entity/Room.java (FIX - hiện chỉ có ID)
- entity/enums/RoomType.java (NEW)
- entity/enums/RoomStatus.java (NEW)
- repository/BuildingRepository.java (NEW)
- repository/RoomRepository.java (đã có, cần update)
- service/BuildingService.java (NEW)
- service/RoomService.java (NEW)
- controller/BuildingController.java (NEW)
- controller/RoomController.java (NEW)
- dto/request/BuildingRequest.java (NEW)
- dto/request/RoomRequest.java (NEW)
- dto/response/BuildingResponse.java (NEW)
- dto/response/RoomResponse.java (NEW)
- mapper/BuildingMapper.java (NEW)
- mapper/RoomMapper.java (NEW)
- resources/db/migration/V3__create_buildings_and_complete_rooms.sql (NEW)
2. Invoice Logic - SAI NGHIỆP VỤ ⚠️⚠️
Mức độ: HIGH  
Thời gian: 2-3 giờ  
Deadline: Trong 2 ngày
Vấn đề:
// Invoice.java - dòng 47-53
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "room_id")
private Room room;  // ⚠️ nullable

@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "contract_id")
private Contract contract;  // ⚠️ nullable

// ❌ CẢ HAI đều nullable → Invoice có thể không link tới gì!
Logic đúng:
- DEPOSIT invoice → chỉ cần contract (tiền cọc theo hợp đồng)
- ROOM_FEE invoice → chỉ cần contract (tiền phòng theo hợp đồng)
- UTILITY invoice → cần CẢ HAI room + contract (điện nước)
Nhiệm vụ:
[ ] 1. Thêm validation trong InvoiceService.createInvoice():
    - if (type == DEPOSIT || type == ROOM_FEE) → require contract
    - if (type == UTILITY) → require both room and contract
[ ] 2. Thêm unique constraint cho deposit invoice:
    CREATE UNIQUE INDEX uk_invoices_contract_deposit 
    ON invoices (contract_id) WHERE invoice_type = 'DEPOSIT';
[ ] 3. Thêm audit fields (createdAt, updatedAt) vào Invoice entity
[ ] 4. Thêm indexes:
    - idx_invoices_status_due_date (status, due_date)
    - idx_invoices_contract (contract_id)
[ ] 5. Test validation với unit tests
3. Notification Entity - HOÀN TOÀN RỖNG ⚠️
Mức độ: HIGH  
Thời gian: 1 ngày  
Deadline: Trong 3 ngày
Hiện trạng:
public class Notification {
    // ❌ Empty class - không có fields, không có logic
}
Nhiệm vụ:
[ ] 1. Hoàn thiện Notification entity:
    - id (Long, PRIMARY KEY)
    - user (ManyToOne → User, NOT NULL)
    - title (String, NOT NULL)
    - message (String, NOT NULL)
    - type (Enum: MAINTENANCE, CONTRACT, INVOICE, SYSTEM)
    - isRead (Boolean, DEFAULT false)
    - createdAt (LocalDateTime, NOT NULL)
[ ] 2. Tạo NotificationService:
    - createNotification(userId, title, message, type)
    - getMyNotifications(userId, pageable)
    - markAsRead(notificationId, userId)
    - markAllAsRead(userId)
    - countUnread(userId)
[ ] 3. Tạo NotificationController:
    GET  /api/v1/student/notifications
    GET  /api/v1/student/notifications/unread-count
    PATCH /api/v1/student/notifications/{id}/read
    PATCH /api/v1/student/notifications/read-all
[ ] 4. Integration points:
    - MaintenanceService.updateStatus() → notify student
    - InvoiceService.createInvoice() → notify student
    - ContractService.updateStatus() → notify student
    - DepositService.confirmDepositPaid() → notify student
[ ] 5. Tạo migration script
[ ] 6. Test tích hợp
⚠️ VẤN ĐỀ QUAN TRỌNG (HIGH) - CẦN FIX TRONG TUẦN
4. Contract Lifecycle - Thiếu 40% chức năng
Mức độ: HIGH  
Thời gian: 1-1.5 ngày  
Deadline: Trong 5 ngày
Đã có:
- Create contract (PENDING)
- Update/cancel PENDING contract
- Activate contract khi deposit paid (trong DepositService)
Thiếu:
[ ] 1. Manual activate endpoint:
    PATCH /api/v1/manager/contracts/{id}/activate
    - ContractService.activateContract(contractId)
    - Validate: status = PENDING
    - Change: PENDING → ACTIVE
    - Create RoomAssignment automatically
[ ] 2. Terminate endpoint (chấm dứt sớm):
    PATCH /api/v1/manager/contracts/{id}/terminate
    Body: { "reason": "Student withdrew", "terminationDate": "2026-12-01" }
    - Validate: status = ACTIVE
    - Check: No unpaid invoices or require payment first
    - Change: ACTIVE → TERMINATED
    - Update RoomAssignment: CHECKED_IN → CHECKED_OUT
    - Calculate refund if applicable
[ ] 3. Expire endpoint (hết hạn):
    PATCH /api/v1/manager/contracts/{id}/expire
    - Validate: endDate < now
    - Change: ACTIVE → EXPIRED
    - Notify student
[ ] 4. Renewal workflow:
    POST /api/v1/manager/contracts/{id}/renew
    Body: { "newEndDate": "2027-06-30", "newMonthlyRent": 1500000 }
    - Validate: current contract ACTIVE or EXPIRED
    - Create new Contract linked to old one (previousContractId field)
    - Same room, same student
    - New startDate = old endDate + 1 day
    - Status = PENDING (wait for deposit)
[ ] 5. Auto-expiry scheduler:
    - Cron job chạy daily
    - Find contracts: status = ACTIVE AND endDate < now
    - Change: ACTIVE → EXPIRED
    - Notify students
[ ] 6. Thêm fields vào Contract entity:
    - previousContractId (Long, nullable) - for renewal tracking
    - terminationReason (String, nullable)
    - actualEndDate (LocalDateTime, nullable) - for early termination
[ ] 7. Thêm bidirectional relationship:
    @OneToMany(mappedBy = "contract")
    private List<RoomAssignment> roomAssignments;
    @OneToMany(mappedBy = "contract")
    private List<Invoice> invoices;
5. Check-in/out Enhancement - Thiếu Meter Reading & Inspection
Mức độ: HIGH  
Thời gian: 1 ngày  
Deadline: Trong 5 ngày
Đã có:
- Check-in: ASSIGNED → CHECKED_IN
- Check-out: CHECKED_IN → CHECKED_OUT (kiểm tra unpaid invoices)
Thiếu:
[ ] 1. Enhance check-in request DTO:
    POST /api/v1/manager/contracts/{contractId}/check-in
    Body: {
      "initialElectricReading": 1500,
      "initialWaterReading": 200,
      "roomCondition": "GOOD", // Enum: EXCELLENT, GOOD, FAIR, POOR
      "inspectionNotes": "All facilities working properly",
      "damages": [] // Array of existing damages if any
    }
[ ] 2. Check-in logic:
    - Create MeterReading (electric & water initial readings)
    - Store room inspection data
    - Take photos (optional, future enhancement)
    - Update RoomAssignment: ASSIGNED → CHECKED_IN
    - Update Room.currentOccupancy++
[ ] 3. Enhance check-out request DTO:
    POST /api/v1/manager/contracts/{contractId}/check-out
    Body: {
      "finalElectricReading": 2000,
      "finalWaterReading": 250,
      "roomCondition": "GOOD",
      "inspectionNotes": "Minor wall stains",
      "damages": ["Stained wall near bed"],
      "damagePhotos": [],
      "depositDeduction": 200000,
      "deductionReason": "Wall cleaning required"
    }
[ ] 4. Check-out logic:
    - Create final MeterReading
    - Generate final utility invoice automatically
    - Check all invoices paid
    - Calculate deposit refund = depositAmount - deductionAmount
    - Store inspection report
    - Update RoomAssignment: CHECKED_IN → CHECKED_OUT
    - Update Room.currentOccupancy--
    - Update Contract: ACTIVE → TERMINATED or EXPIRED
[ ] 5. Create entities:
    - RoomInspection (id, roomAssignment, inspectionType (CHECK_IN/CHECK_OUT), condition, notes, damages, photos, inspectedBy, inspectedAt)
[ ] 6. Thêm MeterReadingController + Service:
    POST   /api/v1/manager/meter-readings
    GET    /api/v1/manager/rooms/{roomId}/meter-readings
    PATCH  /api/v1/manager/meter-readings/{id}/confirm
6. Payment System - THIẾU HOÀN TOÀN
Mức độ: HIGH  
Thời gian: 2 ngày  
Deadline: Trong 1 tuần
Hiện trạng:
- DepositService có method confirmDepositPaid() nhưng không có cách gọi
- Không có cách record payment cho invoices
Nhiệm vụ:
[ ] 1. Tạo Payment entity:
    - id (Long, PRIMARY KEY)
    - invoice (ManyToOne → Invoice, NOT NULL)
    - amount (BigDecimal, NOT NULL)
    - paymentMethod (Enum: CASH, BANK_TRANSFER, MOMO, VNPAY)
    - transactionId (String) - mã GD từ ngân hàng
    - status (Enum: PENDING, COMPLETED, FAILED)
    - paidAt (LocalDateTime, NOT NULL)
    - recordedBy (ManyToOne → User)
    - notes (String)
    - createdAt (LocalDateTime)
[ ] 2. Tạo PaymentService:
    - recordPayment(invoiceId, amount, method, transactionId)
    - Validate: amount == invoice.totalAmount (or support partial)
    - Update Invoice.status = PAID
    - If invoice.type == DEPOSIT → call DepositService.confirmDepositPaid()
    - Create Payment record
    - Notify student
[ ] 3. Tạo PaymentController:
    POST /api/v1/manager/payments
    GET  /api/v1/manager/payments/{invoiceId}
    GET  /api/v1/student/payments (own payment history)
[ ] 4. Thêm payment history trong InvoiceResponse
[ ] 5. Tạo DTO:
    - PaymentRecordRequest (invoiceId, amount, method, transactionId, notes)
    - PaymentResponse (id, invoiceId, amount, method, status, paidAt)
[ ] 6. Migration script
[ ] 7. Integration tests
📋 VẤN ĐỀ TRUNG BÌNH (MEDIUM) - CẦN FIX SAU
7. Database Naming Consistency
Mức độ: MEDIUM  
Thời gian: 3-4 giờ  
Deadline: Trong 2 tuần
Vấn đề:
- Không thống nhất tên Primary Key: id vs contractId vs assignmentId
- Không thống nhất tên status field: status vs maintenanceStatus vs readingStatus
- Một số entity thiếu updatedAt
Nhiệm vụ:
[ ] 1. Chuẩn hóa Primary Key (tất cả dùng 'id'):
    - Contract: contractId → id
    - Invoice: invoiceId → id
    - InvoiceDetail: detailId → id
    - RoomAssignment: assignmentId → id
    - MeterReading: readingId → id
    - MaintenanceRequest: ✓ đã dùng id
[ ] 2. Chuẩn hóa status fields:
    - MaintenanceRequest: maintenanceStatus → status
    - MeterReading: readingStatus → status
[ ] 3. Thêm updatedAt cho:
    - Invoice (hiện thiếu audit fields)
    - InvoiceDetail
    - RoomAssignment (hiện chỉ có assignedAt)
    - MeterReading (hiện chỉ có createdAt)
[ ] 4. Tạo migration scripts để rename columns
[ ] 5. Update tất cả references trong code
[ ] 6. Update repositories, services, controllers
8. Missing Database Constraints
Mức độ: MEDIUM  
Thời gian: 2-3 giờ  
Deadline: Trong 2 tuần
Nhiệm vụ:
[ ] 1. Unique Constraints:
    -- Room: 1 building không có 2 phòng cùng số
    ALTER TABLE rooms ADD CONSTRAINT uk_rooms_building_room 
        UNIQUE (building_id, room_number);
    
    -- Contract: 1 student không có 2 contract ACTIVE cùng lúc
    CREATE UNIQUE INDEX uk_contracts_student_active 
        ON contracts (student_id) WHERE status = 'ACTIVE';
    
    -- RoomAssignment: 1 contract không có 2 assignment CHECKED_IN
    CREATE UNIQUE INDEX uk_room_assignments_contract_active 
        ON room_assignments (contract_id) WHERE status = 'CHECKED_IN';

[ ] 2. Check Constraints:
    -- Contract: startDate < endDate
    ALTER TABLE contracts ADD CONSTRAINT chk_contracts_dates 
        CHECK (start_date < end_date);
    
    -- Invoice: totalAmount >= 0
    ALTER TABLE invoices ADD CONSTRAINT chk_invoices_amount 
        CHECK (total_amount >= 0);
    
    -- Room: capacity > 0 AND currentOccupancy >= 0 AND currentOccupancy <= capacity
    ALTER TABLE rooms ADD CONSTRAINT chk_rooms_occupancy 
        CHECK (capacity > 0 AND current_occupancy >= 0 AND current_occupancy <= capacity);
    
    -- MeterReading: electricityNew >= electricityOld
    ALTER TABLE meter_readings ADD CONSTRAINT chk_meter_readings_electricity 
        CHECK (electricity_reading_new >= electricity_reading_old);

[ ] 3. Indexes quan trọng:
    CREATE INDEX idx_contracts_status ON contracts (status);
    CREATE INDEX idx_contracts_student ON contracts (student_id);
    CREATE INDEX idx_invoices_status_due_date ON invoices (status, due_date);
    CREATE INDEX idx_maintenance_status_priority ON maintenance_requests (status, priority);
    CREATE INDEX idx_room_assignments_student ON room_assignments (student_id);
9. Missing Bidirectional Relationships
Mức độ: MEDIUM  
Thời gian: 2 giờ  
Deadline: Trong 2 tuần
Nhiệm vụ:
[ ] 1. Student entity - thêm back-references:
    @OneToMany(mappedBy = "student")
    private List<Contract> contracts;
    
    @OneToMany(mappedBy = "student")
    private List<MaintenanceRequest> maintenanceRequests;
    
    @OneToMany(mappedBy = "student")
    private List<RoomAssignment> roomAssignments;

[ ] 2. User entity - thêm back-references:
    @OneToMany(mappedBy = "user")
    private List<RefreshToken> refreshTokens;
    
    @OneToMany(mappedBy = "user")
    private List<EmailVerification> emailVerifications;

[ ] 3. Contract entity - thêm back-references:
    @OneToMany(mappedBy = "contract")
    private List<RoomAssignment> roomAssignments;
    
    @OneToMany(mappedBy = "contract")
    private List<Invoice> invoices;

[ ] 4. Room entity - thêm back-references (khi Room hoàn thiện):
    @OneToMany(mappedBy = "room")
    private List<Contract> contracts;
    
    @OneToMany(mappedBy = "room")
    private List<RoomAssignment> roomAssignments;
    
    @OneToMany(mappedBy = "room")
    private List<Invoice> invoices;
    
    @OneToMany(mappedBy = "room")
    private List<MeterReading> meterReadings;
    
    @OneToMany(mappedBy = "room")
    private List<MaintenanceRequest> maintenanceRequests;

[ ] 5. Test lazy loading không gây N+1 queries
🔮 MODULE MỚI CẦN IMPLEMENT (LOW) - SAU KHI FIX XONG
10. Module 2: ResidenceTerm, DormApplication, RoomAssignment
Mức độ: LOW (chờ team khác)  
Thời gian: 5-7 ngày  
Deadline: Sau khi fix critical issues
Nhiệm vụ:
[ ] 1. ResidenceTerm entity + CRUD:
    - id, termCode, name, startDate, endDate
    - applicationStartDate, applicationEndDate
    - status (UPCOMING, OPEN, CLOSED, ACTIVE, ENDED)
[ ] 2. DormApplication entity + workflow:
    - id, student, residenceTerm, preferredRoomType
    - preferredBuilding, status (DRAFT, SUBMITTED, APPROVED, REJECTED)
    - reviewedBy, reviewedAt, rejectionReason
[ ] 3. ApplicationController:
    POST   /api/v1/student/applications (submit)
    GET    /api/v1/student/applications (own applications)
    GET    /api/v1/manager/applications (all, filterable)
    PATCH  /api/v1/manager/applications/{id}/approve
    PATCH  /api/v1/manager/applications/{id}/reject
[ ] 4. ApplicationService:
    - submitApplication() - validate term is OPEN
    - approveApplication() - check room availability, create Contract DRAFT
    - rejectApplication() - require reason
[ ] 5. RoomAssignmentService:
    - assignRoom(contractId, roomId) - check capacity, pessimistic locking
    - Prevent overbooking with: currentOccupancy < capacity
[ ] 6. Integration:
    - Application APPROVED → create Contract PENDING
    - Contract ACTIVE → create RoomAssignment ASSIGNED
11. Dashboard & Analytics
Mức độ: LOW  
Thời gian: 2-3 ngày  
Deadline: Sau khi fix critical issues
Nhiệm vụ:
[ ] 1. DashboardController:
    GET /api/v1/manager/dashboard/revenue
    GET /api/v1/manager/dashboard/occupancy
    GET /api/v1/manager/dashboard/invoices
    GET /api/v1/manager/dashboard/maintenance
    GET /api/v1/manager/dashboard/contracts
[ ] 2. DashboardService với native queries:
    - getRevenueStats(startDate, endDate)
      * Total revenue
      * Revenue by building
      * Revenue by invoice type
      * Month-over-month comparison
    - getOccupancyStats()
      * Total rooms vs occupied rooms
      * Occupancy rate by building
      * Available rooms by room type
    - getInvoiceStats()
      * Total invoices by status (PAID, UNPAID, OVERDUE)
      * Total unpaid amount
      * Overdue invoices count
    - getMaintenanceStats()
      * Requests by status
      * Requests by priority
      * Average resolution time
    - getContractStats()
      * Active contracts count
      * Expiring soon (within 30 days)
      * Pending contracts awaiting deposit
📊 ĐỘ ƯU TIÊN & TIMELINE
TUẦN 1 (CRITICAL - Không làm không chạy được)
Ngày 1-2: Room & Building entities (6-8 giờ)
Ngày 2-3: Invoice logic fix + Notification entity (8 giờ)
Ngày 4-5: Contract lifecycle enhancement (12 giờ)
TUẦN 2 (HIGH - Cần cho nghiệp vụ đầy đủ)
Ngày 6-7: Check-in/out enhancement (8 giờ)
Ngày 8-9: Payment system (16 giờ)
Ngày 10: Testing & bug fixes (8 giờ)
TUẦN 3-4 (MEDIUM - Code quality & optimization)
Tuần 3: Database naming consistency + constraints (16 giờ)
Tuần 4: Bidirectional relationships + N+1 query fixes (8 giờ)
SAU ĐÓ (LOW - New features)
Sprint 1: Module 2 - ResidenceTerm, DormApplication (40 giờ)
Sprint 2: Dashboard & Analytics (20 giờ)
✅ CHECKLIST TRƯỚC KHI MERGE
Code Quality
[ ] Tất cả entities có đủ fields theo nghiệp vụ
[ ] Tất cả relationships được map đúng (bidirectional)
[ ] Primary keys thống nhất (dùng 'id')
[ ] Status fields thống nhất
[ ] Tất cả entities có createdAt, updatedAt
[ ] Tất cả @ManyToOne dùng LAZY fetch
[ ] Có unique constraints và check constraints cần thiết
[ ] Có indexes trên foreign keys và search fields
Business Logic
[ ] Contract lifecycle đầy đủ (create, activate, terminate, expire, renew)
[ ] Invoice validation theo type (DEPOSIT, ROOM_FEE, UTILITY)
[ ] Check-in/out có meter reading và room inspection
[ ] Payment workflow hoàn chỉnh
[ ] Notification được gửi đúng các events
[ ] Room occupancy được update đúng
Testing
[ ] Unit tests cho services chính
[ ] Integration tests cho workflows
[ ] Test với data mẫu đầy đủ
[ ] Test concurrent operations (pessimistic locking)
[ ] Test validation constraints
Documentation
[ ] API documentation (Swagger/OpenAPI)
[ ] Database schema diagram (ERD)
[ ] README hướng dẫn setup
[ ] Business logic documentation
🎯 METRICS ĐẠT 100%
Module	Current
Auth & Security	100%
Student Profile	100%
Maintenance	100%
Notification	0%
Room & Building	10%
Contract	60%
Check-in/out	60%
Invoice & Billing	100%
Payment	0%
Dashboard	0%
TỔNG	60%
📞 HỖ TRỢ & LIÊN HỆ
Câu hỏi nghiệp vụ cần xác nhận:
- Contract-RoomAssignment: 1:1 hay 1:N? (Có cho chuyển phòng giữa kỳ không?)
- Deposit deduction: Có hỗ trợ trừ tiền cọc khi có hư hỏng không?
- Payment: Có hỗ trợ partial payment không hay chỉ full payment?
Cần xác nhận kỹ thuật:
- Database migration strategy (Flyway/Liquibase?)
- Naming convention cuối cùng (contractId → id?)
- Audit logging requirements
- Rate limiting strategy
Tài liệu tham khảo:
- DormHub Business Requirements v1.1 (./DormHub_Business_Requirements_v1.1.md)
- Code Review Report (./code_review.md)
Cập nhật cuối: 01/11/2026 14:18 ICT

Bây giờ tôi sẽ ghi file này vào thư mục backend. Do hạn chế về file operations, tôi sẽ output nội dung để bạn có thể tạo file thủ công:

---

✅ **File đã được tạo sẵn nội dung ở trên.**

Để tạo file, bạn có thể:

1. **Copy toàn bộ nội dung markdown ở trên**
2. **Tạo file mới:** `E:\Ki_1_Nam_4\WWW\DormHub\DormHub_Backend\TODO_TASKS.md`
3. **Paste nội dung vào và save**

Hoặc nếu muốn tôi output dưới dạng command, bạn có thể chạy:

```powershell
# Trong PowerShell tại thư mục DormHub_Backend
@"
[nội dung markdown ở trên]
"@ | Out-File -FilePath "TODO_TASKS.md" -Encoding UTF8
File này bao gồm:
- ✅ Tổng quan hiện trạng (60% hoàn thiện)
- 🚨 3 vấn đề CRITICAL (Room entity, Invoice logic, Notification)
- ⚠️ 3 vấn đề HIGH priority (Contract lifecycle, Check-in/out, Payment)
- 📋 3 vấn đề MEDIUM (Naming consistency, Constraints, Relationships)
- 🔮 2 module mới cần implement sau (ResidenceTerm, Dashboard)
- 📊 Timeline chi tiết (2 tuần critical, 2 tuần medium, sau đó new features)
- ✅ Checklist hoàn thiện trước merge