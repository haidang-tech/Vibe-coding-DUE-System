import { useState } from "react";
import CccdCameraScanner, {
  type CccdData,
} from "./CccdCameraScanner";
import IdentityCodeModal from "./IdentityCodeModal";
import { verifyCccd, type DonorRecord } from "../../services/api";

interface Props {
  onCheckedIn?: () => void;
}

type Outcome =
  | { ok: true; donor: DonorRecord; already: boolean }
  | { ok: false; msg: string };

export default function CheckInCamera({ onCheckedIn }: Props) {
  const [cameraOn, setCameraOn] = useState(false);
  const [busy, setBusy] = useState(false);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [modal, setModal] = useState(false);
  const [manual, setManual] = useState({ hoTen: "", soCccd: "" });

  const process = async (data: CccdData) => {
    if (busy) return;
    setBusy(true);
    const res = await verifyCccd(data.hoTen, data.soCccd);
    setBusy(false);
    if (res.ok) {
      setOutcome({ ok: true, donor: res.donor, already: res.alreadyCheckedIn });
      setCameraOn(false); // dừng camera sau khi quét xong
      setModal(true);
      onCheckedIn?.();
    } else {
      setOutcome({ ok: false, msg: res.reason });
    }
  };

  return (
    <div className="checkin">
      <div className="checkin-col">
        <div className="section-title" style={{ marginBottom: 12 }}>
          Quét CCCD
        </div>
        <CccdCameraScanner
          active={cameraOn}
          onScan={process}
          onError={(msg) => {
            setCameraOn(false);
            setOutcome({ ok: false, msg });
          }}
        />
        <div className="actions" style={{ marginTop: 12 }}>
          <button
            className={cameraOn ? "btn ghost" : "btn"}
            onClick={() => {
              setOutcome(null);
              setCameraOn((v) => !v);
            }}
          >
            {cameraOn ? "Tắt camera" : "📷 Bật camera quét CCCD"}
          </button>
        </div>
      </div>

      <div className="checkin-col">
        <div className="section-title" style={{ marginBottom: 12 }}>
          Nhập tay (khi camera lỗi)
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            process(manual);
          }}
          className="field-stack"
        >
          <div className="field">
            <label>Họ tên trên CCCD</label>
            <input
              required
              value={manual.hoTen}
              onChange={(e) => setManual({ ...manual, hoTen: e.target.value })}
              placeholder="Nguyễn Văn An"
            />
          </div>
          <div className="field">
            <label>Số CCCD</label>
            <input
              required
              inputMode="numeric"
              pattern="\d{12}"
              maxLength={12}
              value={manual.soCccd}
              onChange={(e) => setManual({ ...manual, soCccd: e.target.value })}
              placeholder="12 chữ số"
            />
          </div>
          <button className="btn" type="submit" disabled={busy}>
            {busy ? "Đang đối chiếu..." : "Đối chiếu & check-in"}
          </button>
        </form>

        {outcome && (
          <div className={`alert ${outcome.ok ? "ok" : "err"}`}>
            {outcome.ok ? (
              <>
                <b>Check-in thành công - Thông tin hợp lệ.</b>
                <br />
                {outcome.donor.hoTen} · mã định danh{" "}
                <b>{outcome.donor.maDinhDanh}</b>
                {outcome.already && " (đã check-in trước đó, cấp lại mã cũ)"}
                <div style={{ marginTop: 10 }}>
                  <button className="btn ghost" onClick={() => setModal(true)}>
                    Mở lại mã định danh
                  </button>
                </div>
              </>
            ) : (
              <>
                <b>⚠️ {outcome.msg}</b>
              </>
            )}
          </div>
        )}
      </div>

      {modal && outcome?.ok && (
        <IdentityCodeModal
          donor={outcome.donor}
          onClose={() => setModal(false)}
        />
      )}
    </div>
  );
}