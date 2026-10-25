# DUE BLOOD DONATION SYSTEM

=============================================

## Description

**Mục tiêu dự án:** Tự động hóa và tối ưu hóa toàn bộ vòng đời của chiến dịch hiến máu tình nguyện—từ khâu đăng ký trực tuyến, sàng lọc hồ sơ, check-in bằng CCCD tại sự kiện, khám sàng lọc y tế cho đến quy trình lấy máu và trao quà. Dự án giải quyết các vấn đề thủ công, giảm thiểu thời gian chờ đợi của sinh viên và đảm bảo đồng bộ hóa dữ liệu tập trung thông qua cơ sở dữ liệu ( _Danh sách sinh viên_ ).

Hệ thống vận hành dựa trên sự kết hợp giữa các phân quyền nghiệp vụ và các dịch vụ tự động ngầm:

- **Hệ thống đăng ký hiến máu (Automation Engine):** Đảm nhiệm việc kiểm tra thông tin bằng AI/Quy tắc, phân bổ lịch hẹn tự động, gửi email thông báo và xử lý tính toán dữ liệu y tế^^.
- **Ban Tổ Chức (Organizer):** Quản lý danh sách sinh viên đăng ký, thực hiện check-in bằng cách quét thẻ CCCD, đối chiếu thông tin và cấp phiếu định danh^^.
- **Nhân viên Y tế (Medical Staff):** Tra cứu hồ sơ thông qua mã định danh duy nhất, thực hiện khám sức khỏe tổng quát, nhập chỉ số để hệ thống đánh giá sàng lọc và cập nhật trạng thái kết quả lấy máu.

### Giai đoạn 1: Đăng ký trực tuyến và Sàng lọc hồ sơ tự động

- Sinh viên truy cập biểu mẫu trực tuyến, điền thông tin cá nhân và khai báo tiền sử bệnh lý.
- Hệ thống tự động thực hiện tác vụ _Kiểm tra thông tin sinh viên_ thông qua AI hoặc Business Rules để đánh giá điều kiện hiến máu:
  - **Trường hợp Không hợp lệ:** Hệ thống tự động _Gửi mail thông báo thông tin không hợp lệ_ kèm lý do cụ thể đến sinh viên.
  - **Trường hợp Hợp lệ:** Hệ thống tự động thực hiện song song việc _Thêm vào danh sách sinh viên_ (lưu trữ vào Database) và _Phân lịch hiến máu_ (sử dụng AI để sắp xếp khung giờ nhằm giảm thời gian chờ)^^. Sau đó, hệ thống _Gửi mail thông báo xác nhận đi hiến máu_ kèm lịch hẹn chi tiết cho sinh viên.

### Giai đoạn 2: Check-in và Định danh tại điểm tổ chức

- Vào ngày diễn ra sự kiện, sinh viên di chuyển đến địa điểm hiến máu và xuất trình thẻ CCCD.
- Ban tổ chức tiến hành quét thẻ CCCD, trích xuất dữ liệu tự động để đối chiếu trực tiếp với cơ sở dữ liệu _Danh sách sinh viên_.
- Hệ thống thực hiện đối chiếu gương mặt với CCCD:
  - Nếu không trùng khớp hoặc chưa đăng ký, hệ thống từ chối check-in.
  - Nếu hợp lệ, hệ thống tự động in hoặc hiển thị phiếu khám kèm mã số định danh duy nhất để giảm tải thao tác giấy tờ ở các bước sau.

### Giai đoạn 3: Khám sàng lọc y tế

- Nhân viên y tế sử dụng mã định danh trên phiếu khám để mở hồ sơ, tiến hành kiểm tra sức khỏe tổng quát và lưu kết quả khám.
- Hệ thống tự động _Tính toán các chỉ số sức khỏe_ dựa trên dữ liệu y tế vừa nhập:
  - **Không đạt:** Hệ thống lưu kết quả sàng lọc thất bại vào Database, hiển thị trạng thái không đạt và kích hoạt _Thông báo sức khỏe không đạt_ cho sinh viên.
  - **Đạt:** Hệ thống lưu kết quả sàng lọc thành công vào Database và chuyển tiếp trạng thái để sinh viên sang khu vực lấy mẫu máu.

### Giai đoạn 4: Lấy máu và Hoàn tất quy trình

- Nhân viên y tế thực hiện quy trình lấy máu đối với sinh viên đạt tiêu chuẩn sức khỏe.
- Xử lý kết quả lấy mẫu máu:
  - **Lấy máu thất bại (Sự cố sức khỏe):** Nhân viên y tế tiến hành sơ cứu/cấp cứu tại chỗ, cập nhật trạng thái hiến máu không thành công vào Database và gửi _Thông báo lấy máu thất bại_.
  - **Lấy máu thành công:** Thu thập và bảo quản mẫu máu theo tiêu chuẩn, cập nhật thông tin hoàn thành vào Database và gửi _Thông báo lấy máu thành công_.
- Sinh viên nhận thông báo hoàn tất, di chuyển nhận tiền và quà bồi dưỡng để kết thúc quy trình.

## Các tính năng tự động hóa cốt lõi (Backend Automation Capabilities)

- **AI-driven Info Screening:** Tự động phân tích tiền sử bệnh lý và thông tin đăng ký của sinh viên để đưa ra quyết định hợp lệ hay từ chối.
- **Automated Scheduling Algorithm:** Thuật toán phân bổ khung giờ hiến máu tự động giúp điều tiết lưu lượng người tham gia và giảm thiểu thời gian chờ đợi.
- **Email Automation Service:** Tự động hóa hoàn toàn việc soạn và gửi các mẫu email xác nhận lịch hẹn hoặc email thông báo từ chối.
- **CCCD OCR & Verification Integration:** Tự động nhận diện và trích xuất dữ liệu từ thẻ CCCD để đối chiếu thời gian thực với cơ sở dữ liệu.
- **Health Metrics Calculation Engine:** Tự động xử lý các chỉ số sinh tồn đầu vào để phân loại kết quả khám sàng lọc (Đạt / Không đạt) một cách khách quan.

=============================================

## Structure

#### a. FE

client/
├── src/
│ ├── components/
│ │ ├── ui/ # Button, Input, Alert (Hiện thông báo đối chiếu), Modal
│ │ └── organizer/
│ │ ├── CccdCameraScanner.tsx # Component bật Camera quét CCCD trích xuất Tên & Số CCCD
│ │ └── IdentityCodeModal.tsx # Component cho phép chọn "In phiếu" hoặc "Hiện mã định danh"
│ ├── pages/
│ │ ├── student/ # PHÂN QUYỀN 1: SINH VIÊN
│ │ │ └── RegisterForm.tsx # Form đăng ký hiến máu & khai báo y tế
│ │ ├── organizer/ # PHÂN QUYỀN 2: BAN TỔ CHỨC
│ │ │ ├── StudentList.tsx # Xem danh sách sinh viên trong Database
│ │ │ └── CheckInCamera.tsx # Màn hình quét Camera CCCD -> Hiện thông báo -> Nút In/Hiện mã
│ │ └── medical/ # PHÂN QUYỀN 3: NHÂN VIÊN Y TẾ
│ │ ├── CodeEntryGate.tsx # Màn hình CHỈ cho phép nhập Mã định danh để mở hồ sơ
│ │ ├── HealthCalculator.tsx # Điền chỉ số khám -> Hệ thống tự tính Đạt/Không đạt
│ │ └── DonationStatus.tsx # Cập nhật trạng thái: Thành công / Thất bại
│ ├── services/
│ │ └── api.ts # Gọi API kết nối Backend
│ └── App.tsx # Quản lý điều hướng 3 phân quyền
└── package.json

#### b. BE

server/
├── prisma/
│ └── schema.prisma # Model SinhVien (id, hoTen, soCccd, maDinhDanh, trangThai...)
├── src/
│ ├── controllers/
│ │ ├── student.controller.ts # Xử lý đăng ký, gọi AI duyệt & phân lịch
│ │ ├── organizer.controller.ts # API đối chiếu (hoTen + soCccd) với DB & sinh maDinhDanh
│ │ └── medical.controller.ts # API tra cứu bằng maDinhDanh, tính chỉ số & chốt trạng thái
│ ├── services/
│ │ ├── aiScreening.service.ts # AI kiểm tra bệnh lý & phân lịch hiến máu
│ │ ├── cccdVerify.service.ts # Logic so khớp Họ tên + Số CCCD từ Camera với Database
│ │ ├── healthCalc.service.ts # Công thức tính toán chỉ số sức khỏe tự động
│ │ └── email.service.ts # Gửi Gmail thông báo tự động ở các bước
│ ├── routes/
│ │ ├── student.routes.ts # POST /api/student/register
│ │ ├── organizer.routes.ts # GET /api/organizer/students, POST /api/organizer/verify-cccd
│ │ └── medical.routes.ts # GET /api/medical/lookup/:code, POST /api/medical/evaluate
│ └── index.ts
└── package.json

=============================================
