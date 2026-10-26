import { useState } from "react";
import {
  registerDonor,
  type DonorRecord,
  type Gender,
} from "../../services/api";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const HEALTH_CONDITIONS = [
  "Đang bị cảm, sốt hoặc ho trong 14 ngày qua",
  "Đã từng mắc viêm gan B, C hoặc HIV",
  "Đã xăm mình / xỏ khuyên trong 6 tháng qua",
  "Đang dùng kháng sinh hoặc thuốc điều trị",
  "Đã tiêm vắc-xin trong 4 tuần qua",
  "Mắc bệnh tim mạch, huyết áp, tiểu đường",
];

const EMPTY = {
  hoTen: "",
  mssv: "",
  soCccd: "",
  email: "",
  sdt: "",
  ngaySinh: "",
  gioiTinh: "Nam" as Gender,
  nhomMau: "O+",
  canNang: "",
};

interface Props {
  onRegistered?: () => void;
}

export default function RegisterForm({ onRegistered }: Props) {
  const [form, setForm] = useState(EMPTY);
  const [conditions, setConditions] = useState<boolean[]>(
    HEALTH_CONDITIONS.map(() => false),
  );
  const [ghiChu, setGhiChu] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{
    ok: boolean;
    msg: string;
    donor?: DonorRecord;
  } | null>(null);

  const set = <K extends keyof typeof EMPTY>(k: K, v: (typeof EMPTY)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setResult(null);
    const res = await registerDonor({
      ...form,
      canNang: Number(form.canNang),
      conditions: HEALTH_CONDITIONS.filter((_, i) => conditions[i]),
      ghiChu,
    });
    setBusy(false);

    if (res.ok) {
      setResult({
        ok: true,
        donor: res.donor,
        msg: `Đăng ký thành công! Lịch hẹn của bạn: ${res.donor.lichHen}. Email xác nhận đã được gửi tới ${res.donor.email}.`,
      });
      setForm(EMPTY);
      setConditions(HEALTH_CONDITIONS.map(() => false));
      setGhiChu("");
      onRegistered?.();
    } else {
      setResult({
        ok: false,
        msg: `Hồ sơ không hợp lệ: ${res.reason} Thông báo từ chối đã được gửi qua email.`,
      });
    }
  };

  return (
    <div className="panel">
      <h3>Đăng ký hiến máu tình nguyện</h3>
      <p className="sub">
        Hệ thống kiểm tra điều kiện sức khỏe và tự động xếp lịch hẹn cho bạn.
      </p>

      <form className="grid" onSubmit={submit}>
        <div className="section-title">1. Thông tin cá nhân</div>
        <div className="field">
          <label>Họ và tên</label>
          <input
            required
            value={form.hoTen}
            onChange={(e) => set("hoTen", e.target.value)}
            placeholder="Nguyễn Văn A"
          />
        </div>
        <div className="field">
          <label>Mã sinh viên</label>
          <input
            required
            value={form.mssv}
            onChange={(e) => set("mssv", e.target.value)}
            placeholder="VD: 21IT001"
          />
        </div>
        <div className="field">
          <label>Số CCCD</label>
          <input
            required
            inputMode="numeric"
            pattern="\d{12}"
            maxLength={12}
            title="CCCD gồm đúng 12 chữ số"
            value={form.soCccd}
            onChange={(e) => set("soCccd", e.target.value)}
            placeholder="12 chữ số"
          />
        </div>
        <div className="field">
          <label>Email nhận thông báo</label>
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="ban@gmail.com"
          />
        </div>
        <div className="field">
          <label>Số điện thoại</label>
          <input
            required
            type="tel"
            pattern="[0-9]{9,11}"
            value={form.sdt}
            onChange={(e) => set("sdt", e.target.value)}
            placeholder="0901234567"
          />
        </div>
        <div className="field">
          <label>Ngày sinh</label>
          <input
            required
            type="date"
            value={form.ngaySinh}
            onChange={(e) => set("ngaySinh", e.target.value)}
          />
        </div>
        <div className="field">
          <label>Giới tính</label>
          <select
            value={form.gioiTinh}
            onChange={(e) => set("gioiTinh", e.target.value as Gender)}
          >
            <option>Nam</option>
            <option>Nữ</option>
          </select>
        </div>
        <div className="field">
          <label>Nhóm máu</label>
          <select
            value={form.nhomMau}
            onChange={(e) => set("nhomMau", e.target.value)}
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
            value={form.canNang}
            onChange={(e) => set("canNang", e.target.value)}
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
            value={ghiChu}
            onChange={(e) => setGhiChu(e.target.value)}
            placeholder="VD: hen suyễn, thiếu máu, dị ứng thuốc..."
          />
        </div>

        <div className="field full">
          <button className="btn" type="submit" disabled={busy}>
            {busy ? "Hệ thống đang kiểm tra hồ sơ..." : "Gửi đăng ký hiến máu"}
          </button>
        </div>
      </form>

      {result && (
        <div className={`alert ${result.ok ? "ok" : "err"}`}>{result.msg}</div>
      )}
    </div>
  );
}
