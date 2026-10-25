# 🩸 Vibe-coding-DUE-System (Hệ Thống Quản Lý Quy Trình Hiến Máu Sinh Viên DUE)

Dự án số hóa và tối ưu hóa quy trình tổ chức hiến máu nhân đạo tại **Trường Đại học Kinh tế - Đại học Đà Nẵng (DUE)**. Hệ thống được phát triển phục vụ học phần **Quản lý quy trình kinh doanh (BPM)**, giúp kết nối minh bạch và đồng bộ giữa **Sinh viên**, **Ban tổ chức (BTC)** và **Đội ngũ Y tế**.

---

## 🎯 Mục Tiêu Dự Án

- **Số hóa thủ tục:** Thay thế quy trình điền phiếu giấy truyền thống bằng hệ thống đăng ký trực tuyến.
- **Tăng tốc check-in:** Hỗ trợ quét mã QR / CCCD trực tiếp qua camera tại bàn đón tiếp của Ban tổ chức.
- **Đồng bộ y tế thời gian thực:** Giúp nhân viên y tế tra cứu hồ sơ qua mã định danh, sàng lọc sức khỏe và cập nhật trạng thái hiến máu nhanh chóng[cite: 1, 4].

---

## ✨ Tính Năng & Phân Quyền

### 1. 👨‍🎓 Phân hệ Sinh viên (`Student`)

- **Đăng ký hiến máu (`RegisterForm`):** Khai báo thông tin cá nhân, khoa/lớp và bảng câu hỏi sàng lọc y tế ban đầu[cite: 1, 4].
- **Theo dõi lịch sử:** Kiểm tra trạng thái duyệt và lịch trình tham gia sự kiện.

### 2. 📋 Phân hệ Ban Tổ Chức (`Organizer`)

- **Check-in tự động (`CheckInCamera`):** Quét thông tin sinh viên nhanh chóng tại cổng đón tiếp[cite: 1, 4].
- **Quản lý danh sách (`StudentList`):** Theo dõi danh sách đăng ký, trạng thái check-in và điều phối luồng người tham gia[cite: 1, 4].

### 3. ⚕️ Phân hệ Y Tế (`Medical`)

- **Cổng xác thực (`CodeEntryGate`):** Tra cứu hồ sơ sinh viên bằng mã định danh bảo mật trong quá trình khám sàng lọc[cite: 1, 4].
- **Cập nhật trạng thái:** Ghi nhận các chỉ số và xác nhận hoàn tất quy trình hiến máu.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

- **Frontend (`client`):**
  - [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)[cite: 1, 4]
  - [Vite](https://vitejs.dev/) (Bundler tốc độ cao hỗ trợ HMR)[cite: 1, 4]
  - Tailwind CSS / CSS tùy chỉnh giao diện hiện đại[cite: 1, 4]
  - Oxlint / ESLint kiểm tra chất lượng mã nguồn[cite: 1, 4]
- **Backend (`server`):**
  - Node.js / Express.js[cite: 1, 4]
  - RESTful API đồng bộ dữ liệu thời gian thực[cite: 1, 4]

---

## 📂 Cấu Trúc Thư Mục Dự Án

```text
Vibe-coding-DUE-System/
├── client/                          # Mã nguồn Frontend (React + Vite + TS)[cite: 1, 4]
│   ├── public/                      # Tài nguyên tĩnh (favicon, icons)[cite: 1, 4]
│   ├── src/
│   │   ├── assets/                  # Hình ảnh, biểu tượng (hero.png, svg)[cite: 1, 4]
│   │   ├── components/              # Các UI Component tái sử dụng[cite: 1, 4]
│   │   ├── pages/                   # Các trang giao diện theo phân quyền[cite: 1, 4]
│   │   │   ├── medical/             # Giao diện dành cho Nhân viên Y tế (CodeEntryGate)[cite: 1, 4]
│   │   │   ├── organizer/           # Giao diện Ban Tổ Chức (CheckInCamera, StudentList)[cite: 1, 4]
│   │   │   └── student/             # Giao diện Sinh viên (RegisterForm)[cite: 1, 4]
│   │   ├── App.tsx                  # Luồng điều hướng chính[cite: 1, 4]
│   │   ├── App.css                  # CSS tổng thể[cite: 1, 4]
│   │   └── main.tsx                 # Điểm khởi chạy React DOM[cite: 1, 4]
│   ├── package.json                 # Cấu hình dependencies Client[cite: 1, 4]
│   ├── tsconfig.json                # Cấu hình TypeScript[cite: 1, 4]
│   └── vite.config.ts               # Cấu hình Vite[cite: 1, 4]
├── server/                          # Mã nguồn Backend (API & Xử lý dữ liệu)[cite: 1, 4]
│   └── package.json                 # Cấu hình dependencies Server[cite: 1, 4]
├── .gitignore                       # Cấu hình loại trừ file rác (node_modules, .env, dist)[cite: 1, 4]
└── README.md                        # Tài liệu hướng dẫn dự án[cite: 1, 4]
```

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
