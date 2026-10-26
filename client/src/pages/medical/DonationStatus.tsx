import { useState } from "react";
import {
  notifyStudent,
  saveDonation,
  type DonationOutcome,
  type DonorRecord,
} from "../../services/api";
import { DonorSummary } from "./HealthCalculator";

interface Props {
  donor: DonorRecord;
  onFinish: () => void;
}

const FAIL_REASONS = [
  "Choáng / ngất khi lấy máu",
  "Tĩnh mạch khó lấy, không đủ lượng máu",
  "Phản ứng bất thường cần sơ cứu",
  "Khác",
];

export default function DonationStatus({ donor, onFinish }: Props) {
  const [volume, setVolume] = useState("350");
  const [failReason, setFailReason] = useState(FAIL_REASONS[0]);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState<DonationOutcome | null>(
    donor.donation?.outcome ?? null,
  );

  const finalize = async (outcome: DonationOutcome) => {
    setSaving(true);
    const updated = await saveDonation(donor.maDinhDanh, {
      outcome,
      volumeMl: outcome === "success" ? Number(volume) : undefined,
      failReason: outcome === "failed" ? failReason : undefined,
      at: new Date().toISOString(),
    });
    await notifyStudent(
      updated,
      outcome === "success" ? "donation_done" : "donation_failed",
    );
    setDone(outcome);
    setSaving(false);
  };

  if (done) {
    const ok = done === "success";
    return (
      <div>
        <DonorSummary donor={donor} />
        <div className={`alert ${ok ? "ok" : "err"}`}>
          {ok
            ? "Hoàn thành hiến máu. Đã gửi thông báo để sinh viên đến nhận tiền và quà."
            : "Hiến máu không thành công. Đã ghi nhận để sơ cứu tại chỗ và gửi thông báo cho sinh viên."}
        </div>
        <div className="actions" style={{ marginTop: 16 }}>
          <button className="btn" onClick={onFinish}>
            Tiếp nhận người kế tiếp
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <DonorSummary donor={donor} />
      <div className="alert ok" style={{ marginTop: 0, marginBottom: 18 }}>
        Sức khỏe đạt – được phép lấy máu.
      </div>

      <div className="grid">
        <div className="section-title">Kết quả lấy máu</div>

        <div className="outcome success">
          <h4>✅ Hoàn thành hiến máu</h4>
          <div className="field">
            <label>Lượng máu thu được (ml)</label>
            <select value={volume} onChange={(e) => setVolume(e.target.value)}>
              <option value="250">250 ml</option>
              <option value="350">350 ml</option>
              <option value="450">450 ml</option>
            </select>
          </div>
          <button
            className="btn"
            style={{ marginTop: 12, width: "100%" }}
            disabled={saving}
            onClick={() => finalize("success")}
          >
            Xác nhận thành công
          </button>
        </div>

        <div className="outcome fail">
          <h4>⚠️ Hiến máu không thành công</h4>
          <div className="field">
            <label>Lý do</label>
            <select
              value={failReason}
              onChange={(e) => setFailReason(e.target.value)}
            >
              {FAIL_REASONS.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>
          <button
            className="btn ghost"
            style={{ marginTop: 12, width: "100%" }}
            disabled={saving}
            onClick={() => finalize("failed")}
          >
            Ghi nhận thất bại
          </button>
        </div>
      </div>
    </div>
  );
}
