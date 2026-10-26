import { useState } from "react";
import { lookupByCode, type DonorRecord } from "../../services/api";

interface Props {
  onUnlock: (donor: DonorRecord) => void;
}

/**
 * Cổng nhập mã định danh – giao diện Y tế CHỈ có một ô nhập,
 * không hiển thị danh sách sinh viên, không dùng camera.
 */
export default function CodeEntryGate({ onUnlock }: Props) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    const value = code.trim().toUpperCase();
    if (!/^HM-\d{4}$/.test(value)) {
      setError("Mã định danh không đúng định dạng (VD: HM-8392).");
      return;
    }
    setLoading(true);
    setError("");
    const donor = await lookupByCode(value);
    setLoading(false);
    if (!donor) {
      setError("Không tìm thấy hồ sơ với mã định danh này.");
      return;
    }
    onUnlock(donor);
  };

  return (
    <div className="login-box">
      <div className="login-icon">🔑</div>
      <h3>Nhập mã định danh</h3>
      <p className="sub">
        Nhập chính xác mã do Ban Tổ Chức cấp để mở hồ sơ khám của sinh viên.
      </p>

      <div className="field">
        <label>Mã định danh</label>
        <input
          className="code-input"
          autoFocus
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="HM-0000"
          maxLength={7}
          autoComplete="off"
        />
      </div>
      <br />
      <button
        className="btn"
        style={{ width: "100%" }}
        onClick={submit}
        disabled={loading || !code}
      >
        {loading ? "Đang tra cứu..." : "Mở hồ sơ khám"}
      </button>
      {error && <div className="alert err">{error}</div>}
      <p className="hint">Dữ liệu demo: thử mã HM-8392 hoặc HM-1457.</p>
    </div>
  );
}
