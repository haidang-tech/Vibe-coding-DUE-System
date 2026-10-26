import { useEffect, useState } from "react";
import "./App.css";
import RegisterForm from "./pages/student/RegisterForm";
import OrganizerPortal from "./pages/organizer/OrganizerPortal";
import MedicalPortal from "./pages/medical/MedicalPortal";
import { listDonors, type DonorRecord } from "./services/api";

type Tab = "student" | "organizer_login" | "medical_login";
type Role = "organizer" | "medical";

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

  // Số liệu hiển thị ở phần hero, đọc từ "database"
  const [donors, setDonors] = useState<DonorRecord[]>([]);
  const refreshStats = () => listDonors().then(setDonors);
  useEffect(() => {
    refreshStats();
  }, [activeTab]);

  const handleLogin = (role: Role) => {
    const correct = role === "organizer" ? "btc123" : "yte123";
    if (password === correct) {
      if (role === "organizer") setIsOrganizerLoggedIn(true);
      else setIsMedicalLoggedIn(true);
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

  const renderLogin = (role: Role) => {
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
              <b>{donors.filter((d) => d.checkedIn).length}</b>
              <span>Đã check-in</span>
            </div>
            <div className="stat">
              <b>
                {donors.filter((d) => d.donation?.outcome === "success").length}
              </b>
              <span>Đã hiến máu</span>
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

        {activeTab === "student" && (
          <RegisterForm onRegistered={refreshStats} />
        )}
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
