# TourPro – Hệ thống quản lý tour du lịch

## Kiến trúc hệ thống

```
tourpro/
├── backend/          ← Spring Boot 3.2 + MySQL
│   └── src/main/java/com/tourpro/
│       ├── entity/       ← 15 JPA entities
│       ├── repository/   ← 15 Spring Data JPA repositories
│       ├── dto/          ← Request/Response DTOs
│       ├── service/      ← Business logic (8 services)
│       ├── controller/   ← 12 REST controllers
│       └── config/       ← Security (JWT) + CORS
└── frontend/         ← React 18 + Vite + Ant Design
    └── src/
        ├── layouts/      ← Admin / Staff / Customer layouts
        ├── pages/
        │   ├── admin/    ← Dashboard, Users, Tours, Reports
        │   ├── staff/    ← HR, Warehouse, Sales pages
        │   └── customer/ ← Home, Tours, Booking, Profile
        ├── services/     ← Axios API layer
        └── stores/       ← Zustand auth store
```

---

## Cài đặt & Chạy

### 1. Database

```sql
-- Tạo DB
CREATE DATABASE tourpro_db CHARACTER SET utf8mb4;
```

Cập nhật `backend/src/main/resources/application.yml`:
```yaml
spring.datasource.username: root
spring.datasource.password: your_password
```

### 2. Backend (Spring Boot)

```bash
cd backend
mvn spring-boot:run
# Server chạy tại http://localhost:8080
```

### 3. Frontend (React)

```bash
cd frontend
npm install
npm run dev
# Chạy tại http://localhost:5173
```

---

## Tài khoản demo

| Role | Username | Password | Cổng |
|------|----------|----------|------|
| Admin | admin | Admin@123 | /admin |
| Quản lý nhân sự | hr_manager | Admin@123 | /staff/hr/* |
| Quản lý kho | warehouse1 | Admin@123 | /staff/warehouse/* |
| Kinh doanh | sales1 | Admin@123 | /staff/sales/* |
| Khách hàng | cust001 | Admin@123 | /portal |

---

## API Endpoints

### Auth
| Method | URL | Mô tả |
|--------|-----|-------|
| POST | /api/auth/login | Đăng nhập, nhận JWT |
| POST | /api/auth/register | Đăng ký tài khoản |
| POST | /api/auth/change-password | Đổi mật khẩu |

### Admin
| Method | URL | Quyền |
|--------|-----|-------|
| GET | /api/admin/dashboard | ADMIN |
| GET | /api/admin/reports/revenue | ADMIN |
| GET | /api/admin/reports/hr | ADMIN |
| GET | /api/admin/reports/warehouse | ADMIN |
| GET/POST/PUT/DELETE | /api/admin/users | ADMIN |

### Nhân sự (HR)
| Method | URL | Quyền |
|--------|-----|-------|
| GET/POST/PUT/DELETE | /api/hr/employees | ADMIN, HR_MANAGER |
| POST | /api/hr/employees/{id}/change-position | ADMIN, HR_MANAGER |
| GET/POST | /api/hr/salary | ADMIN, HR_MANAGER |
| POST | /api/hr/salary/{empId}/calculate | ADMIN, HR_MANAGER |
| POST | /api/hr/salary/{id}/approve | ADMIN, HR_MANAGER |
| GET | /api/hr/leaves/pending | ADMIN, HR_MANAGER |
| POST | /api/hr/leaves/employee/{id} | HR, EMPLOYEE |
| POST | /api/hr/leaves/{id}/approve | ADMIN, HR_MANAGER |

### Kho hàng
| Method | URL | Quyền |
|--------|-----|-------|
| GET/POST/PUT | /api/warehouse/suppliers | ADMIN, WAREHOUSE_MANAGER |
| GET/POST/PUT | /api/warehouse/products | ADMIN, WAREHOUSE_MANAGER |

### Tour & Đặt tour
| Method | URL | Quyền |
|--------|-----|-------|
| GET | /api/tours | Public |
| GET | /api/tours/{id} | Public |
| POST | /api/tours | ADMIN, SALES |
| POST | /api/tours/{id}/schedules | ADMIN, SALES |
| GET/POST | /api/bookings | ADMIN, SALES, CUSTOMER |
| PATCH | /api/bookings/{id}/status | ADMIN, SALES |

### Khách hàng & Đánh giá
| Method | URL | Quyền |
|--------|-----|-------|
| GET/POST/PUT | /api/customers | ADMIN, SALES |
| GET | /api/reviews/tour/{id} | Public |
| POST | /api/reviews | CUSTOMER |
| PUT | /api/reviews/{id}/reply | ADMIN, SALES |

---

## Thiết kế CSDL – 15 bảng

```
users              – Tài khoản hệ thống (mọi role)
customers          – Khách hàng (liên kết users)
departments        – Phòng ban
positions          – Chức vụ
employees          – Nhân viên
position_history   – Lịch sử thay đổi chức vụ
salary_records     – Bảng lương hàng tháng
leave_requests     – Đơn xin nghỉ
suppliers          – Nhà cung cấp
products           – Dịch vụ / sản phẩm kho
import_vouchers    – Phiếu nhập hàng
import_details     – Chi tiết phiếu nhập
tours              – Tour du lịch
tour_schedules     – Lịch khởi hành
bookings           – Đơn đặt tour
export_vouchers    – Phiếu xuất (thực hiện tour)
export_details     – Chi tiết phiếu xuất
customer_reviews   – Đánh giá khách hàng
backup_logs        – Log sao lưu CSDL
```

---

## Sao lưu & Phục hồi CSDL

### Sao lưu tự động (cron job)
```bash
# Thêm vào crontab: crontab -e
0 2 * * * /opt/tourpro/backup.sh backup >> /var/log/tourpro_backup.log 2>&1
```

### Lệnh thủ công
```bash
# Sao lưu
./backup.sh backup

# Xem danh sách backup
./backup.sh list

# Phục hồi
./backup.sh restore /var/backups/tourpro/tourpro_20260315_020000.sql.gz
```

### Chiến lược 3-2-1
- **3 bản sao**: production DB, local backup, offsite backup
- **2 phương tiện**: server NVMe + external NAS
- **1 offsite**: AWS S3 / Google Cloud Storage (tự động upload trong script)

---

## Tính năng nổi bật

### Module Admin
- Dashboard tổng quan với biểu đồ doanh thu
- Quản lý user & phân quyền (ADMIN / HR / Warehouse / Sales / Customer)
- Báo cáo doanh thu, nhân sự, kho theo tháng/quý/năm
- Quản lý tour, nhà cung cấp, khách hàng

### Module Nhân sự (HR)
- Thêm/sửa/xóa nhân viên, đổi chức vụ có timestamp
- Tính lương theo công thức: BHXH (8%), BHYT (1.5%), BHTN (1%), Thuế TNCN (7 bậc)
- Duyệt đơn xin nghỉ (nghỉ phép, ốm, thai sản, nghỉ việc)
- In phiếu lương PDF theo tháng/năm

### Module Kho hàng
- Quản lý dịch vụ/sản phẩm (khách sạn, vé bay, ăn uống...)
- Lập phiếu nhập từ nhà cung cấp
- Cảnh báo tồn kho thấp
- Báo cáo giá trị kho

### Module Kinh doanh
- Đặt tour cho khách, tính giá tự động
- Giảm giá VIP tự động (5%)
- Tích điểm loyalty (1 điểm / 10,000 ₫)
- Thống kê doanh thu, lợi nhuận theo tháng/quý/năm

### Customer Portal
- Trang chủ cá nhân hóa, tìm kiếm tour
- Đặt tour online (4 bước), thanh toán nhiều hình thức
- Xem lịch sử, in vé, đánh giá sau tour
- Điểm thưởng và hạng thành viên (VIP/Thân thiết/Thường/Mới)
