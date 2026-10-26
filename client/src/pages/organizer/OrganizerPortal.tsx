import "./organizer.css";
import { useState } from "react";
import CheckInCamera from "./CheckInCamera";
import StudentList from "./StudentList";

type View = "list" | "checkin";

interface Props {
  onLogout: () => void;
}

export default function OrganizerPortal({ onLogout }: Props) {
  const [view, setView] = useState<View>("checkin");
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="panel">
      <div className="dash-head">
        <h3>Bảng điều khiển Ban Tổ Chức</h3>
        <button className="btn ghost" onClick={onLogout}>
          Đăng xuất
        </button>
      </div>

      <div className="subtabs">
        <button
          className={view === "checkin" ? "active" : ""}
          onClick={() => setView("checkin")}
        >
          📷 Check-in CCCD
        </button>
        <button
          className={view === "list" ? "active" : ""}
          onClick={() => setView("list")}
        >
          📋 Danh sách sinh viên
        </button>
      </div>

      {view === "checkin" ? (
        <CheckInCamera onCheckedIn={() => setRefreshKey((k) => k + 1)} />
      ) : (
        <StudentList refreshKey={refreshKey} />
      )}
    </div>
  );
}
