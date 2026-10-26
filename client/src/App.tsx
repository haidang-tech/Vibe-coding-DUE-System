import { useState } from "react";
import "./App.css";
import MedicalPortal from "./pages/medical/MedicalPortal";
import OrganizerPortal from "./pages/organizer/OrganizerPortal";

type Tab = "student" | "organizer_login" | "medical_login";
type Status = "Chờ duyệt" | "Đủ điều kiện" | "Không đủ điều kiện";

interface Donor {
  id: number;
  name: string;
  studentId: string;
  bloodType: string;
  weight: number;
  note: string;
  status: Status;
}

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const HEALTH_CONDITIONS = [
  "Đang bị cảm, sốt hoặc ho trong 14 ngày qua",
  "Đã từng mắc viêm gan B, C hoặc HIV",
  "Đã xăm mình / xỏ khuyên trong 6 tháng qua",
  "Đang dùng kháng sinh hoặc thuốc điều trị",
  "Đã tiêm vắc-xin trong 4 tuần qua",
  "Mắc bệnh tim mạch, huyết áp, tiểu đường",
];

const DrawIcon = ({ size = 28 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="#b3122b"
    aria-hidden
  >
    <path d="M12 2.5c-.4 0-.8.2-1 .5C8.2 6.600 5 10.100 5 14a7 7 0 0 0 14 0c0-3.900-3.200-7.400-6-11-.2-.3-.6-.5-1-.5z" />
  </svg>
);

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("student");

  // Đăng nhập giả lập
  const [isOrganizerLoggedIn, setIsOrganizerLoggedIn] = useState(false);
  const [isMedicalLoggedIn, setIsMedicalLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Danh sách người đăng ký (lưu tạm trong bộ nhớ)
  const [donors, setDonors] = useState<Donor[]>([]);

  // Form đăng ký
  const [form, setForm] = useState({
    name: "",
    studentId: "",
    dob: "",
    phone: "",
    bloodType: "O+",
    weight: "",
  });
  const [conditions, setConditions] = useState<boolean[]>(
    HEALTH_CONDITIONS.map(() => false),
  );
  const [otherNote, setOtherNote] = useState("");
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(
    null,
  );

  const handleLogin = (role: "organizer" | "medical") => {
    const correct = role === "organizer" ? "btc123" : "yte123";
    if (password === correct) {
      role === "organizer"
        ? setIsOrganizerLoggedIn(true)
        : setIsMedicalLoggedIn(true);
      setErrorMsg("");
      setPassword("");
    } else {
      setErrorMsg(
        role === "organizer"
          ? "Mật khẩu Ban Tổ Chức không đúng!"
          : "Mật khẩu Nhân viên Y Tế không đúng!",
      );
    }
  };

  const switchTab = (tab: Tab) => {
    setActiveTab(tab);
    setPassword("");
    setErrorMsg("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const weight = Number(form.weight);
    const age =
      (Date.now() - new Date(form.dob).getTime()) / (365.25 * 24 * 3600 * 1000);

    let status: Status = "Đủ điều kiện";
    let msg =
      "Đăng ký thành công! Vui lòng chờ xác nhận lịch hiến máu từ Ban Tổ Chức.";

    if (age < 18 || age > 60) {
      status = "Không đủ điều kiện";
      msg = "Độ tuổi hiến máu phải từ 18 đến 60.";
    } else if (weight < 45) {
      status = "Không đủ điều kiện";
      msg = "Cân nặng tối thiểu để hiến máu là 45 kg.";
    } else if (conditions.some(Boolean) || otherNote.trim()) {
      status = "Chờ duyệt";
      msg =
        "Hồ sơ đã được ghi nhận. Do có tiền sử sức khỏe cần lưu ý, nhân viên y tế sẽ đánh giá trực tiếp.";
    }

    setDonors((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        name: form.name,
        studentId: form.studentId,
        bloodType: form.bloodType,
        weight,
        note: otherNote.trim(),
        status,
      },
    ]);
    setResult({ ok: status !== "Không đủ điều kiện", msg });
    if (status !== "Không đủ điều kiện") {
      setForm({
        name: "",
        studentId: "",
        dob: "",
        phone: "",
        bloodType: "O+",
        weight: "",
      });
      setConditions(HEALTH_CONDITIONS.map(() => false));
      setOtherNote("");
    }
  };

  /* ---------- Các khu vực ---------- */

  const renderRegister = () => (
    <div className="panel">
      <h3>Đăng ký hiến máu tình nguyện</h3>
      <form className="grid" onSubmit={handleSubmit}>
        <div className="section-title">1. Thông tin cá nhân</div>
        <div className="field">
          <label>Họ và tên</label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Nguyễn Văn A"
          />
        </div>
        <div className="field">
          <label>Mã sinh viên</label>
          <input
            required
            value={form.studentId}
            onChange={(e) => setForm({ ...form, studentId: e.target.value })}
            placeholder="VD: 21IT001"
          />
        </div>
        <div className="field">
          <label>Ngày sinh</label>
          <input
            required
            type="date"
            value={form.dob}
            onChange={(e) => setForm({ ...form, dob: e.target.value })}
          />
        </div>
        <div className="field">
          <label>Số điện thoại</label>
          <input
            required
            type="tel"
            pattern="[0-9]{9,11}"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="0901234567"
          />
        </div>
        <div className="field">
          <label>Nhóm máu</label>
          <select
            value={form.bloodType}
            onChange={(e) => setForm({ ...form, bloodType: e.target.value })}
          >
            {BLOOD_TYPES.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Cân nặng (kg)</label>
          <input
            required
            type="number"
            min={30}
            max={200}
            value={form.weight}
            onChange={(e) => setForm({ ...form, weight: e.target.value })}
            placeholder="VD: 55"
          />
        </div>

        <div className="section-title">2. Tiền sử sức khỏe (tick nếu có)</div>
        <div className="checks">
          {HEALTH_CONDITIONS.map((c, i) => (
            <label className="check" key={c}>
              <input
                type="checkbox"
                checked={conditions[i]}
                onChange={() =>
                  setConditions(
                    conditions.map((v, idx) => (idx === i ? !v : v)),
                  )
                }
              />
              <span>{c}</span>
            </label>
          ))}
        </div>
        <div className="field full">
          <label>Ghi chú bệnh nền khác (nếu có)</label>
          <textarea
            rows={3}
            value={otherNote}
            onChange={(e) => setOtherNote(e.target.value)}
            placeholder="VD: hen suyễn, thiếu máu, dị ứng thuốc..."
          />
        </div>

        <div className="field full">
          <button className="btn" type="submit">
            Gửi đăng ký hiến máu
          </button>
        </div>
      </form>
      {result && (
        <div className={`alert ${result.ok ? "ok" : "err"}`}>{result.msg}</div>
      )}
    </div>
  );

  const renderLogin = (role: "organizer" | "medical") => {
    const isOrg = role === "organizer";
    return (
      <div className="panel">
        <div className="login-box">
          <div className="login-icon">{isOrg ? "🛡️" : "🩺"}</div>
          <h3>
            {isOrg ? "Đăng nhập Ban Tổ Chức" : "Đăng nhập Nhân viên Y tế"}
          </h3>
          <div className="field">
            <label>Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin(role)}
              placeholder="Nhập mật khẩu"
            />
          </div>
          <br />
          <button
            className="btn"
            style={{ width: "100%" }}
            onClick={() => handleLogin(role)}
          >
            Đăng nhập
          </button>
          {errorMsg && <div className="alert err">{errorMsg}</div>}
        </div>
      </div>
    );
  };

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <div className="brand-logo">
              <DrawIcon />
            </div>
            <h1>Hệ Thống Quản Lý Hiến Máu</h1>
          </div>
        </div>
      </header>

      <section className="hero">
        <div className="hero-card">
          <h2>Chung tay hiến máu tình nguyện</h2>
          <div className="stats">
            <div className="stat">
              <b>{donors.length}</b>
              <span>Lượt đăng ký</span>
            </div>
            <div className="stat">
              <b>{donors.filter((d) => d.status === "Đủ điều kiện").length}</b>
              <span>Đủ điều kiện</span>
            </div>
            <div className="stat">
              <b>350ml</b>
              <span>Mỗi đơn vị máu</span>
            </div>
          </div>
        </div>
      </section>

      <main className="container">
        <nav className="tabs">
          <button
            className={`tab ${activeTab === "student" ? "active" : ""}`}
            onClick={() => switchTab("student")}
          >
            🩸 Đăng ký hiến máu (Sinh viên)
          </button>
          <button
            className={`tab ${activeTab === "organizer_login" ? "active" : ""}`}
            onClick={() => switchTab("organizer_login")}
          >
            🛡️ Ban Tổ Chức
          </button>
          <button
            className={`tab ${activeTab === "medical_login" ? "active" : ""}`}
            onClick={() => switchTab("medical_login")}
          >
            🩺 Nhân viên Y tế
          </button>
        </nav>

        {activeTab === "student" && renderRegister()}
        {activeTab === "organizer_login" &&
          (isOrganizerLoggedIn ? (
            <OrganizerPortal onLogout={() => setIsOrganizerLoggedIn(false)} />
          ) : (
            renderLogin("organizer")
          ))}
        {activeTab === "medical_login" &&
          (isMedicalLoggedIn ? (
            <MedicalPortal onLogout={() => setIsMedicalLoggedIn(false)} />
          ) : (
            renderLogin("medical")
          ))}
      </main>

      <footer className="footer">
        Hệ thống quản lý quy trình hiến máu trực tuyến © 2026
      </footer>
    </>
  );
}
